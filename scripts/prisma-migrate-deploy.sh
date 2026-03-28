#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    line=${line%$'\r'}

    case "$line" in
      ""|\#*)
        continue
        ;;
    esac

    key=${line%%=*}
    value=${line#*=}
    value=$(printf '%s' "$value" | sed 's/^"//; s/"$//')
    export "$key=$value"
  done < .env
fi

if [ -n "${DATABASE_URL_UNPOOLED:-}" ]; then
  export DATABASE_URL="$DATABASE_URL_UNPOOLED"
fi

prisma migrate deploy