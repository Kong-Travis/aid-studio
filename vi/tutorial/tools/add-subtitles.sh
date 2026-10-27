#!/bin/sh
# Burns Vietnamese subtitles (.srt) into the film exported from AID.
# Why: AID's own subtitle splitter (SubtitleScreenSplitter) cuts every screen at 7-12 characters,
# which is right for Chinese but breaks Vietnamese words in half. Leave AID's subtitle track empty
# and burn an .srt here instead.
# Needs an FFmpeg with libass: on macOS `brew install ffmpeg-full`.
# Usage: vi/tutorial/tools/add-subtitles.sh <film.mp4> <subtitles.srt> <out.mp4>
set -eu
if [ $# -lt 3 ]; then
  echo "Usage: $0 <film.mp4> <subtitles.srt> <out.mp4>" >&2
  exit 2
fi
. "$(dirname "$0")/ffmpeg-env.sh"
film=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
out=$(cd "$(dirname "$3")" && pwd)/$(basename "$3")

# The subtitles filter parses its argument, so work next to a plain-named copy of the .srt.
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp "$2" "$tmp/subs.srt"
cd "$tmp"

"$FFMPEG" -loglevel error -y -i "$film" \
  -vf "subtitles=subs.srt:force_style='FontName=Arial,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,BorderStyle=1,Outline=2,Shadow=0,MarginV=40'" \
  -c:v libx264 -preset medium -crf 20 -c:a copy -movflags +faststart "$out"
echo "Saved $out"
