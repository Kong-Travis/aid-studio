#!/bin/sh
# Snapshot or restore the AID database between recording takes, so a failed or repeated take
# starts from the same state. Usage: ./db.sh save <name> | ./db.sh restore <name>
set -eu
dir="$HOME/aid-local/backups"
file="$dir/rec-$2.sql"
case "$1" in
  save)
    mkdir -p "$dir"
    docker exec aid-dev-mysql sh -c 'mysqldump -uroot -p123456 --default-character-set=utf8mb4 aid_test 2>/dev/null' > "$file"
    echo "saved $file ($(wc -c < "$file") bytes)" ;;
  restore)
    [ -s "$file" ] || { echo "no snapshot $file" >&2; exit 1; }
    docker exec -i aid-dev-mysql sh -c 'mysql -uroot -p123456 --default-character-set=utf8mb4 aid_test 2>/dev/null' < "$file"
    echo "restored $file" ;;
  *) echo "usage: $0 save|restore <name>" >&2; exit 2 ;;
esac
