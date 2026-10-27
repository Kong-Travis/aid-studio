#!/bin/sh
# Opens a Cloudflare quick tunnel to the media-only origin (nginx port 8099, /profile/ only) and
# stores the public URL as the OSS resource access domain, so model providers can download the
# reference images and first frames that AID sends them by URL.
#
# Run it BEFORE vi/local/run-backend.sh: the backend reads OSS settings once at startup.
# The quick-tunnel URL changes every time this script runs.
set -eu
: "${AID_LOCAL_HOME:=$HOME/aid-local}"
log="$AID_LOCAL_HOME/logs/tunnel.log"
mkdir -p "$AID_LOCAL_HOME/logs"

pkill -f "cloudflared tunnel --url http://localhost:8099" 2>/dev/null || true
nohup cloudflared tunnel --no-autoupdate --url http://localhost:8099 > "$log" 2>&1 &

url=""
for _ in $(seq 1 60); do
  url=$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$log" | head -1 || true)
  [ -n "$url" ] && break
  sleep 1
done
[ -n "$url" ] || { echo "Tunnel did not start, see $log" >&2; exit 1; }

docker exec aid-dev-mysql mysql -uroot -p123456 aid_test -e \
  "UPDATE aid_config SET config_value='$url', update_by='vi-local', update_time=NOW()
   WHERE category='oss' AND config_name='resourceAccessDomain';" 2>/dev/null

echo "Public media URL: $url"
echo "Saved as oss.resourceAccessDomain. Start (or restart) the backend now."
