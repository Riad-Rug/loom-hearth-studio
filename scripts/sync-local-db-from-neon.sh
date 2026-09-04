#!/usr/bin/env bash
# Sync the local dev database's content tables from the production (Neon) database.
#
# Production (Neon) is READ-ONLY in this flow: every connection to it is made
# under PGOPTIONS='-c default_transaction_read_only=on', and the only commands
# ever run against it are `pg_dump` and read-only `SELECT` queries.
#
# Customer, auth, and order tables are NEVER copied (see EXCLUDE_TABLES below):
# they hold PII, password hashes, and Stripe ids. This script only mirrors
# content tables (catalog, blog, homepage, SEO, promos).
#
# The only database this script may write to is the LOCAL one, and only after
# verifying its connection host is localhost/127.0.0.1.
#
# Usage:
#   bash ./scripts/sync-local-db-from-neon.sh [--dry-run]
#
#   --dry-run   Print every step that would run, including the exact pg_dump /
#               pg_restore / prisma commands, without touching either database.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: $0 [--dry-run]" >&2
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Tables that must NEVER be copied from production to local.
# PII / secrets / payment data, plus the stray non-Prisma table.
# ---------------------------------------------------------------------------
EXCLUDE_TABLES=(
  "User"
  "Session"
  "Account"
  "VerificationToken"
  "PasswordResetToken"
  "LoginRateLimitAttempt"
  "OrderRecord"
  "OrderLineItemRecord"
  "FulfillmentExecutionRecord"
  "NewsletterSubscriberRecord"
  "PromoRedemptionRecord"
  "playing_with_neon"
)

# Tables whose row counts are compared and printed at the end.
VERIFY_TABLES=(
  "CatalogProduct"
  "BlogPostEntry"
  "BlogAuthorRecord"
  "HomepageContentRecord"
  "SeoSetting"
  "PromoRecord"
)

DUMP_DIR=".local"
DUMP_FILE="${DUMP_DIR}/neon-$(date +%Y%m%d-%H%M%S).dump"

log() {
  printf '[sync-local-db] %s\n' "$1"
}

die() {
  printf '[sync-local-db] ERROR: %s\n' "$1" >&2
  exit 1
}

# Mask the credentials in a postgres URL for display/logging purposes only.
# postgresql://user:password@host:port/db -> postgresql://user:***@host:port/db
redact_url() {
  printf '%s' "$1" | sed -E 's#(://[^:/@]*):[^@/]*@#\1:***@#'
}

# Read a single KEY=value line out of an env file WITHOUT sourcing/evaluating
# it as shell code. Connection strings routinely contain unescaped shell
# metacharacters (Neon URLs end in "...require&channel_binding=require") that
# a naive `source ./file` mis-parses (the "&" backgrounds the assignment and
# it never reaches the shell) — this reads the raw text instead.
read_env_var() {
  local key="$1"
  local file="$2"
  local line
  line=$(grep -m1 -E "^${key}=" "$file" || true)
  [ -n "$line" ] || { printf ''; return 0; }
  local value="${line#*=}"
  value="${value%$'\r'}"
  value=$(printf '%s' "$value" | sed 's/^"//; s/"$//')
  printf '%s' "$value"
}

# ---------------------------------------------------------------------------
# Require a PostgreSQL 17 client. Local pg_dump/pg_restore (v16) cannot dump
# a PostgreSQL 17 server (Neon). Prefer the PGDG package's binaries, but
# accept anything on PATH that reports major version 17.
# ---------------------------------------------------------------------------
PG17_BIN_DIR="${PG17_BIN_DIR:-/usr/lib/postgresql/17/bin}"
# No-sudo alternative: the PGDG postgresql-client-17 and libpq5 .debs unpacked
# with `dpkg-deb -x` into ~/pg17 (see docs/local-db-sync.md). The unpacked
# pg_dump needs the unpacked libpq, hence the LD_LIBRARY_PATH export.
PG17_USER_DIR="${PG17_USER_DIR:-$HOME/pg17}"
PG_DUMP17=""
PG_RESTORE17=""

find_pg17_binary() {
  local name="$1"
  if [ -x "${PG17_BIN_DIR}/${name}" ]; then
    printf '%s' "${PG17_BIN_DIR}/${name}"
    return 0
  fi
  if [ -x "${PG17_USER_DIR}/usr/lib/postgresql/17/bin/${name}" ]; then
    export LD_LIBRARY_PATH="${PG17_USER_DIR}/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
    printf '%s' "${PG17_USER_DIR}/usr/lib/postgresql/17/bin/${name}"
    return 0
  fi
  if command -v "$name" >/dev/null 2>&1; then
    local candidate
    candidate=$(command -v "$name")
    local ver
    ver=$("$candidate" --version 2>/dev/null | grep -oE '[0-9]+' | head -n1 || true)
    if [ "$ver" = "17" ]; then
      printf '%s' "$candidate"
      return 0
    fi
  fi
  return 1
}

PG17_MISSING_MSG="postgresql-client-17 not found (need pg_dump/pg_restore v17 to dump/restore a Postgres 17 server).
One-time install (needs sudo, requires a password to be entered interactively):
  sudo apt-get install -y postgresql-common
  sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
  sudo apt-get update
  sudo apt-get install -y postgresql-client-17
No sudo? Unpack the PGDG postgresql-client-17 and libpq5 .debs into ~/pg17 with
dpkg-deb -x instead (or set PG17_USER_DIR / PG17_BIN_DIR).
See docs/local-db-sync.md for details."

PG17_AVAILABLE=1
if ! PG_DUMP17=$(find_pg17_binary pg_dump); then
  PG17_AVAILABLE=0
  PG_DUMP17="${PG17_BIN_DIR}/pg_dump (NOT INSTALLED)"
fi
if ! PG_RESTORE17=$(find_pg17_binary pg_restore); then
  PG17_AVAILABLE=0
  PG_RESTORE17="${PG17_BIN_DIR}/pg_restore (NOT INSTALLED)"
fi

if [ "$PG17_AVAILABLE" -eq 1 ]; then
  log "Using pg_dump:    ${PG_DUMP17}"
  log "Using pg_restore: ${PG_RESTORE17}"
elif [ "$DRY_RUN" -eq 1 ]; then
  log "WARNING: ${PG17_MISSING_MSG}"
  log "(continuing in --dry-run mode; the real run would stop here)"
else
  die "$PG17_MISSING_MSG"
fi

# ---------------------------------------------------------------------------
# Load the local DATABASE_URL from .env and guard that it points at localhost.
# This is the only database that may ever be reset or written by this script.
# ---------------------------------------------------------------------------
[ -f .env ] || die ".env not found in $(pwd) — cannot determine local DATABASE_URL."

LOCAL_URL_RAW=$(read_env_var DATABASE_URL .env)

[ -n "$LOCAL_URL_RAW" ] || die "DATABASE_URL is not set in .env."

# Strip a trailing ?schema=... (or any other) query string — psql/pg_restore
# don't understand Prisma's ?schema= param.
LOCAL_URL="${LOCAL_URL_RAW%%\?*}"

# Extract the host from the URL: postgresql://user:pass@host:port/db
LOCAL_HOST=$(printf '%s' "$LOCAL_URL" | sed -E 's#^[a-zA-Z]+://[^@]*@##; s#[:/].*$##')

if [ "$LOCAL_HOST" != "localhost" ] && [ "$LOCAL_HOST" != "127.0.0.1" ]; then
  die "Refusing to run: local DATABASE_URL host is '${LOCAL_HOST}', not localhost/127.0.0.1.
This script only ever writes to a local database. Fix DATABASE_URL in .env before retrying."
fi

log "Local DATABASE_URL host verified as '${LOCAL_HOST}'. Safe to write."

# ---------------------------------------------------------------------------
# Load the Neon (production) URL from .env.backup.shared-neon into NEON_URL
# only. DATABASE_URL itself is never exported from that file, so nothing in
# this script can accidentally point a write command at Neon.
# ---------------------------------------------------------------------------
[ -f .env.backup.shared-neon ] || die ".env.backup.shared-neon not found — cannot load the production (Neon) connection string."

NEON_URL_RAW=$(read_env_var DATABASE_URL .env.backup.shared-neon)

[ -n "$NEON_URL_RAW" ] || die "DATABASE_URL is empty in .env.backup.shared-neon."

# Neon's pooled endpoint (host contains "-pooler") is a PgBouncer transaction
# pooler that REJECTS the PGOPTIONS startup parameter outright ("unsupported
# startup parameter in options"), which would silently defeat the read-only
# safety net below. Always connect via the direct (unpooled) endpoint instead
# by stripping "-pooler" from the host — a no-op if the URL is already direct.
NEON_URL=$(printf '%s' "$NEON_URL_RAW" | sed -E 's/-pooler\./\./')

NEON_HOST=$(printf '%s' "$NEON_URL" | sed -E 's#^[a-zA-Z]+://[^@]*@##; s#[:/].*$##')
log "Neon DATABASE_URL loaded (direct/unpooled host: ${NEON_HOST}). Never printed in full."

# Every connection to Neon in this script runs under a read-only transaction
# default. Only pg_dump and SELECT statements ever run against Neon.
export PGOPTIONS='-c default_transaction_read_only=on'

cleanup() {
  unset NEON_URL
  unset PGOPTIONS
}
trap cleanup EXIT

# Build the pg_dump exclusion flags once.
#
# _prisma_migrations is excluded here too (at dump time, via pg_dump
# --exclude-table), NOT via a pg_restore flag: pg_restore has no
# --exclude-table option in PG16/PG17 (its -T/--trigger flag is unrelated —
# it disables named triggers, it doesn't exclude a table). The local copy of
# _prisma_migrations already gets fresh rows from `prisma migrate reset`
# below, so it must never be overwritten by the dump anyway.
EXCLUDE_ARGS=()
for t in "${EXCLUDE_TABLES[@]}"; do
  EXCLUDE_ARGS+=(--exclude-table="public.\"${t}\"")
done
EXCLUDE_ARGS+=(--exclude-table="public._prisma_migrations")
# Excluding a table does not exclude its sequence, and a data-only dump still
# emits setval() for it. The stray Neon sample table has a serial id, so match
# the table and its sequence together. (Prisma tables use cuid ids: no sequences.)
EXCLUDE_ARGS+=(--exclude-table="public.playing_with_neon*")

# --data-only on the DUMP (not just the restore) matters: the schema always
# comes from `prisma migrate reset`, never from the dump, and pg_dump only
# orders TABLE DATA entries by foreign-key dependency in data-only mode. A
# schema+data dump orders them by table name, which works today only because
# the one intra-copied FK (PromoRecord <- PromoRedemptionRecord, now excluded)
# happened to sort correctly.
DUMP_CMD=("$PG_DUMP17" "$NEON_URL" --format=custom --data-only --no-owner --no-privileges --file="$DUMP_FILE" "${EXCLUDE_ARGS[@]}")

RESET_CMD=(npx prisma migrate reset --force --skip-seed)

# --disable-triggers is intentionally NOT used: it emits
# `ALTER TABLE ... DISABLE TRIGGER ALL`, which requires superuser to disable
# internally generated FK constraint triggers, and the local role is not a
# superuser. It isn't needed: the data-only dump above is FK-ordered, and no
# copied table references an excluded one.
# --exit-on-error ensures a partial restore fails the script loudly instead
# of being mistaken for success.
# The restore goes through psql rather than straight into the database:
# pg_restore 17 emits `SET transaction_timeout = 0;`, a parameter that only
# exists from Postgres 17, and the local server is 16, so that one line is
# dropped from the SQL stream. psql runs the rest as a single transaction with
# ON_ERROR_STOP, so a partial restore rolls back instead of looking like success.
RESTORE_EMIT_CMD=("$PG_RESTORE17" --data-only --no-owner -f - "$DUMP_FILE")
RESTORE_LOAD_CMD=(psql -v ON_ERROR_STOP=1 --single-transaction -q -d "$LOCAL_URL")

# Display-only copies with credentials masked. Never log $NEON_URL / $LOCAL_URL
# in full — only these redacted forms.
DUMP_CMD_DISPLAY=("$PG_DUMP17" "$(redact_url "$NEON_URL")" --format=custom --data-only --no-owner --no-privileges --file="$DUMP_FILE" "${EXCLUDE_ARGS[@]}")
RESTORE_CMD_DISPLAY=("${RESTORE_EMIT_CMD[@]}" "|" "grep -v ^SET.transaction_timeout" "|" psql -v ON_ERROR_STOP=1 --single-transaction -q -d "$(redact_url "$LOCAL_URL")")

if [ "$DRY_RUN" -eq 1 ]; then
  log "--dry-run: no database will be touched. Steps that would run:"
  log "1. mkdir -p ${DUMP_DIR}"
  log "2. (Neon, read-only) ${DUMP_CMD_DISPLAY[*]}"
  log "   excluded tables: ${EXCLUDE_TABLES[*]} _prisma_migrations"
  log "3. (local, destructive) ${RESET_CMD[*]}"
  log "4. (local, write) ${RESTORE_CMD_DISPLAY[*]}"
  log "5. Compare row counts for: ${VERIFY_TABLES[*]}"
  log "6. npx prisma migrate status"
  log "Dry run complete. No connection was made to Neon or to the local database."
  exit 0
fi

mkdir -p "$DUMP_DIR"

log "Dumping content tables from Neon (read-only) to ${DUMP_FILE} ..."
"${DUMP_CMD[@]}"
log "Dump complete: $(du -h "$DUMP_FILE" | cut -f1) at ${DUMP_FILE}"

log "Resetting local database and applying all migrations ..."
DATABASE_URL="$LOCAL_URL_RAW" "${RESET_CMD[@]}"

log "Restoring dumped data into local database ..."
unset PGOPTIONS
"${RESTORE_EMIT_CMD[@]}" | grep -v '^SET transaction_timeout' | "${RESTORE_LOAD_CMD[@]}"

log "Comparing row counts (Neon vs local) ..."

count_query() {
  local table="$1"
  printf 'SELECT count(*) FROM public."%s";' "$table"
}

printf '\n%-24s %10s %10s\n' "table" "neon" "local"
printf '%-24s %10s %10s\n' "------------------------" "----------" "----------"

for t in "${VERIFY_TABLES[@]}"; do
  export PGOPTIONS='-c default_transaction_read_only=on'
  neon_count=$(psql "$NEON_URL" -tAc "$(count_query "$t")" | tr -d '[:space:]')
  unset PGOPTIONS
  local_count=$(psql "$LOCAL_URL" -tAc "$(count_query "$t")" | tr -d '[:space:]')
  printf '%-24s %10s %10s\n' "$t" "$neon_count" "$local_count"
done

echo
log "Migration status:"
DATABASE_URL="$LOCAL_URL_RAW" npx prisma migrate status \
  || die "prisma migrate status reported a problem (pending/failed migration?) — see output above."

log "Done. Reminder: no local admin user exists after a reset."
log "Register at /account/register, then run:"
log '  npm run admin:promote-user -- --email "user@example.com" --role admin'
