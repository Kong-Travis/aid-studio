#!/bin/sh
# Builds the Vietnamese admin and web frontends from a translated copy under vi/build/.
#   vi/build/admin/dist        admin console (same as npm run build)
#   vi/build/web/dist/public   web app static export (same as npm run generate)
set -eu
repo=$(git rev-parse --show-toplevel)
cd "$repo"

for app in web admin; do
  [ -d "frontend/$app/node_modules" ] || npm ci --no-audit --no-fund --prefix "frontend/$app"
done

node vi/scripts/apply.mjs all --strict --out vi/build
(cd vi/build/admin && npm run build)
(cd vi/build/web && npm run generate && test -f dist/public/index.html)
node vi/scripts/sql.mjs build

echo "Admin: $repo/vi/build/admin/dist"
echo "Web:   $repo/vi/build/web/dist/public"
echo "SQL:   $repo/vi/sql/vi-labels.sql"
