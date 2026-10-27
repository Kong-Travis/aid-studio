#!/bin/sh
# Turns still storyboard images into short "camera move" clips with FFmpeg (free, offline).
# Usage: vi/tutorial/tools/make-clips.sh <image-dir> <out-dir> [seconds]
# Reads shot-1.png, shot-2.png, ... (or .jpg) in <image-dir>, any count, stops at the first gap, and
# writes shot-N.mp4 (1280x720, 25 fps, default 5 s). Images of another aspect ratio are cropped to
# 16:9 from the centre. Moves cycle through MOVES; edit it to taste.
set -eu
if [ $# -lt 2 ]; then
  echo "Usage: $0 <image-dir> <out-dir> [seconds]" >&2
  exit 2
fi
. "$(dirname "$0")/ffmpeg-env.sh"
in_dir=$1
out_dir=$2
seconds=${3:-5}
mkdir -p "$out_dir"

# in = slow zoom in, pan = left-to-right pan, push = zoom toward the left third, out = zoom out
MOVES="in pan in push out out"
fps=25
frames=$((seconds * fps))
count=$(echo $MOVES | wc -w | tr -d ' ')

n=1
while :; do
  src="$in_dir/shot-$n.png"
  [ -f "$src" ] || src="$in_dir/shot-$n.jpg"
  [ -f "$src" ] || break
  idx=$(( (n - 1) % count + 1 ))
  move=$(echo $MOVES | cut -d' ' -f$idx)
  case $move in
    in)   z="min(zoom+0.0012,1.15)"; x="iw/2-(iw/zoom/2)"; y="ih/2-(ih/zoom/2)" ;;
    pan)  z="1.12"; x="(iw-iw/zoom)*on/$frames"; y="ih/2-(ih/zoom/2)" ;;
    push) z="min(zoom+0.0015,1.2)"; x="iw*0.35-(iw/zoom/2)"; y="ih*0.45-(ih/zoom/2)" ;;
    out)  z="if(eq(on,0),1.18,max(zoom-0.0014,1.0))"; x="iw/2-(iw/zoom/2)"; y="ih/2-(ih/zoom/2)" ;;
  esac
  # Fill a large 16:9 canvas first so the zoom is smooth, then zoom/crop down to 1280x720.
  "$FFMPEG" -loglevel error -y -loop 1 -i "$src" \
    -vf "scale=5504:3072:force_original_aspect_ratio=increase,crop=5504:3072,zoompan=z='$z':x='$x':y='$y':d=$frames:s=1280x720:fps=$fps,format=yuv420p" \
    -frames:v $frames -c:v libx264 -preset medium -crf 20 -movflags +faststart "$out_dir/shot-$n.mp4"
  echo "shot-$n.mp4 ($move)"
  n=$((n + 1))
done
[ "$n" -gt 1 ] || { echo "No shot-1.png or shot-1.jpg in $in_dir" >&2; exit 1; }
