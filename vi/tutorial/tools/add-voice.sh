#!/bin/sh
# Puts a voice line onto a shot clip before it is uploaded to AID ("Tạo video" step).
# Why: in AID v2.2.4 a voice uploaded at the "Đồng bộ hình tiếng" step is not used by the final
# export, but the export keeps each clip's own audio track. Every clip should carry an audio track
# (silent if there is no line) so the exported film has continuous sound.
#
# Usage:
#   add-voice.sh <clip.mp4> <out.mp4>                          # silent track only
#   add-voice.sh <clip.mp4> <out.mp4> <voice> [start-seconds]  # start defaults to 0.6; use a dot
# <voice> can be mp3, m4a, aiff or wav.
set -eu
if [ $# -lt 2 ]; then
  echo "Usage: $0 <clip.mp4> <out.mp4> [voice-file [start-seconds]]" >&2
  exit 2
fi
. "$(dirname "$0")/ffmpeg-env.sh"
clip=$1
out=$2
voice=${3:-}
start=${4:-0.6}
case $start in
  *,*) echo "start-seconds must use a dot, e.g. 0.6 (not 0,6)" >&2; exit 2 ;;
esac

dur=$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 "$clip")

if [ -z "$voice" ]; then
  "$FFMPEG" -loglevel error -y -i "$clip" -f lavfi -t "$dur" -i anullsrc=r=44100:cl=stereo \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -t "$dur" "$out"
else
  vdur=$("$FFPROBE" -v error -show_entries format=duration -of csv=p=0 "$voice")
  if awk "BEGIN { exit !($start + $vdur > $dur) }"; then
    echo "Warning: voice ($vdur s) starting at $start s runs past the clip ($dur s) and will be cut." >&2
  fi
  ms=$(awk "BEGIN { printf \"%d\", $start * 1000 }")
  "$FFMPEG" -loglevel error -y -i "$clip" -f lavfi -t "$dur" -i anullsrc=r=44100:cl=stereo -i "$voice" \
    -filter_complex "[2:a]aresample=44100,adelay=$ms|$ms,aformat=channel_layouts=stereo[v];[1:a][v]amix=inputs=2:duration=first:normalize=0[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -t "$dur" "$out"
fi
echo "Saved $out"
