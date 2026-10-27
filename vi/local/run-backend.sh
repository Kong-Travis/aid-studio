#!/bin/sh
# Runs the AID backend on this Mac against the dev middleware
# (deploy/docker/docker-compose.middleware.yml + vi/local/docker-compose.mac.yml).
#   vi/local/run-backend.sh build   # mvn package, then start
#   vi/local/run-backend.sh         # start the last built jar
# Data and logs live in $AID_LOCAL_HOME (default ~/aid-local).
set -eu
repo=$(git rev-parse --show-toplevel)
cd "$repo"

: "${AID_LOCAL_HOME:=$HOME/aid-local}"
: "${JAVA_HOME:=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
export JAVA_HOME
mkdir -p "$AID_LOCAL_HOME/uploadPath" "$AID_LOCAL_HOME/logs"

if [ "${1:-}" = "build" ]; then
  mvn -B -q package -DskipTests
fi

jar=$(ls aid-admin/target/aid-admin*.jar 2>/dev/null | head -1)
[ -n "$jar" ] || { echo "No jar in aid-admin/target. Run: $0 build" >&2; exit 1; }

# A per-machine JWT secret, created once and kept out of the repo.
secret_file="$AID_LOCAL_HOME/token-secret"
[ -f "$secret_file" ] || (umask 077 && openssl rand -hex 32 > "$secret_file")

export DB_HOST=127.0.0.1 DB_PORT=3306 DB_NAME=aid_test DB_USERNAME=root DB_PASSWORD=123456
export REDIS_HOST=127.0.0.1 REDIS_PORT=6379
export AID_PROFILE="$AID_LOCAL_HOME/uploadPath"
export LOG_PATH="$AID_LOCAL_HOME/logs"
# application.yml sets `logging.level.com.aid: error`, which hides provider and task logs.
export LOGGING_LEVEL_COM_AID="${LOGGING_LEVEL_COM_AID:-INFO}"
export TOKEN_SECRET="$(cat "$secret_file")"
# Subtitle burn-in needs drawtext (libfreetype): prefer Homebrew's keg-only ffmpeg-full.
ffbin=/opt/homebrew/opt/ffmpeg-full/bin
[ -x "$ffbin/ffmpeg" ] || ffbin=$(dirname "$(command -v ffmpeg || echo /usr/bin/ffmpeg)")
export AID_FFMPEG_PATH="${AID_FFMPEG_PATH:-$ffbin/ffmpeg}"
export AID_FFPROBE_PATH="${AID_FFPROBE_PATH:-$ffbin/ffprobe}"

exec "$JAVA_HOME/bin/java" -Xms512m -Xmx2g -Dfile.encoding=UTF-8 -jar "$jar"
