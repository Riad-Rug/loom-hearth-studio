# Local DB Sync (Neon → Local)

Local content data mirrors production via one script:

```bash
npm run db:sync-from-prod
# or, to see the plan without touching either database:
npm run db:sync-from-prod -- --dry-run
```

This replaces the local dev database's **content** with a fresh copy from
production (Neon): catalog products, blog posts/authors, homepage content,
SEO settings, and promos. See [`scripts/sync-local-db-from-neon.sh`](../scripts/sync-local-db-from-neon.sh)
for the full implementation.

## What is never copied

Customer and auth data never leaves production. The script hard-excludes:

- `User`
- `Session`
- `Account`
- `VerificationToken`
- `PasswordResetToken`
- `LoginRateLimitAttempt`
- `OrderRecord`
- `OrderLineItemRecord`
- `FulfillmentExecutionRecord`
- `NewsletterSubscriberRecord`
- `PromoRedemptionRecord` (holds the redeeming customer's email)
- `playing_with_neon` (a stray non-Prisma table on the Neon database)

These tables hold PII, password hashes, and Stripe ids and are excluded from
the dump itself — they are never fetched from Neon in the first place, not
just filtered out afterward.

## Production access is read-only

Every connection this script makes to Neon runs with:

```
PGOPTIONS='-c default_transaction_read_only=on'
```

The only commands ever run against Neon in this flow are `pg_dump` and
read-only `SELECT` queries (for the post-sync row-count comparison). The
script connects to Neon's **direct (unpooled)** endpoint — Neon's pooled
`-pooler` endpoint rejects the `PGOPTIONS` startup parameter outright, which
would silently defeat this safeguard, so the script strips `-pooler` from the
host before connecting.

The only database this script ever writes to or resets is the **local** one,
and only after the script has verified the local `DATABASE_URL`'s host is
`localhost` or `127.0.0.1`.

## One-time setup: PostgreSQL 17 client

Neon runs PostgreSQL 17. The local `pg_dump`/`pg_restore` (v16, from the
default Ubuntu repos) cannot dump a v17 server, so a matching PG17 client is
required once per machine, from the official PGDG apt repository:

```bash
sudo apt-get install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
sudo apt-get update
sudo apt-get install -y postgresql-client-17
```

The script looks for these binaries at `/usr/lib/postgresql/17/bin/pg_dump`
and `pg_restore` (falling back to any `pg_dump`/`pg_restore` on `PATH` that
reports major version 17). Without them, the script prints these same
instructions and refuses to run for real, but `--dry-run` still works.

## What the script does, in order

1. Verifies the local `DATABASE_URL` (from `.env`) points at `localhost` /
   `127.0.0.1`. Refuses to continue otherwise.
2. Loads the Neon connection string from `.env.backup.shared-neon` into a
   local shell variable only — it is never exported as `DATABASE_URL`, so no
   other command in the script (or a mistake later) can accidentally point a
   write at Neon.
3. Dumps the content tables (data only, excluding the list above) from
   Neon, read-only, into `.local/neon-<timestamp>.dump` (custom format).
4. Rebuilds the local database from scratch with `prisma migrate reset
   --force --skip-seed` — this applies every committed migration, including
   any not yet deployed to production.
5. Restores just the data from the dump into the freshly-migrated local
   database (`pg_restore --data-only --exit-on-error`). `_prisma_migrations`
   is excluded from the *dump itself* (via `pg_dump --exclude-table`, step 3)
   rather than at restore time — `pg_restore` has no `--exclude-table` option
   in PG16/PG17, so this can't be done at the restore step. Local's own
   `_prisma_migrations` rows already come from `prisma migrate reset` in step
   4 and must not be overwritten. `--disable-triggers` is deliberately not
   used: it requires a superuser (which the local role is not) to disable
   internally generated FK constraint triggers, and isn't needed anyway.
   The dump is taken with `--data-only` (the schema always comes from the
   migrations, never from the dump), and only in data-only mode does
   `pg_dump` order table data by foreign-key dependency; a schema+data dump
   orders it by table name, which would only work by luck.
6. Prints a Neon-vs-local row-count table for the content tables, and runs
   `prisma migrate status` to confirm the local schema is fully up to date
   (a non-clean status fails the script).

Dumps are written to `.local/`, which (along with any `*.dump` file) is
gitignored — never commit a dump.

## After a sync: re-creating a local admin

A `prisma migrate reset` wipes local users along with everything else. To get
back into `/admin` locally:

1. Register a new account at `/account/register`.
2. Promote it: `npm run admin:promote-user -- --email "you@example.com" --role admin`
   (see [`admin-promotion-runbook.md`](./admin-promotion-runbook.md)).

## Never run against Neon

The following must never be run with `DATABASE_URL` pointing at Neon, in any
form:

- `prisma migrate reset`
- `prisma migrate diff` with a `--shadow-database-url` (against Neon *or* any
  other real database — this is exactly what wiped the local database once
  before)
- `prisma db push`
- `prisma migrate dev`
- `prisma migrate deploy` (outside the normal, intentional deploy pipeline)
- `pg_restore`
- `psql -f`
- `psql -c` with anything other than a `SELECT`
- any script in `scripts/` with `DATABASE_URL` pointing at Neon

The only database that may ever be reset or written by tooling in this repo
is the local one, and only after confirming its host is `localhost` or
`127.0.0.1`.
