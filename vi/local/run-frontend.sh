#!/bin/sh
# Serves the Vietnamese builds (vi/scripts/build.sh output) with nginx in Docker.
#   Web app:       http://localhost:3000
#   Admin console: http://localhost:8090
# The backend must run on the host at port 8080 (vi/local/run-backend.sh).
set -eu
repo=$(git rev-parse --show-toplevel)
web="$repo/vi/build/web/dist/public"
admin="$repo/vi/build/admin/dist"
[ -f "$web/index.html" ] && [ -f "$admin/index.html" ] || { echo "Run vi/scripts/build.sh first" >&2; exit 1; }

docker rm -f aid-local-nginx >/dev/null 2>&1 || true
docker run -d --name aid-local-nginx \
  -p 3000:80 -p 8090:8090 -p 127.0.0.1:8099:8099 \
  --add-host host.docker.internal:host-gateway \
  -v "$repo/vi/local/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$web:/usr/share/nginx/aid/web:ro" \
  -v "$admin:/usr/share/nginx/aid/admin:ro" \
  nginx:1.27-alpine
