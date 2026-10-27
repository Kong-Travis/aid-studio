# Sourced by the other scripts in this folder. Sets FFMPEG and FFPROBE.
# Prefers Homebrew's keg-only ffmpeg-full (has libfreetype and libass, needed for subtitles),
# then any ffmpeg on PATH.
ff_dir=""
if command -v brew >/dev/null 2>&1; then
  prefix=$(brew --prefix ffmpeg-full 2>/dev/null || true)
  [ -n "$prefix" ] && [ -x "$prefix/bin/ffmpeg" ] && ff_dir="$prefix/bin"
fi
if [ -z "$ff_dir" ] && command -v ffmpeg >/dev/null 2>&1; then
  ff_dir=$(dirname "$(command -v ffmpeg)")
fi
[ -n "$ff_dir" ] || { echo "FFmpeg not found. macOS: brew install ffmpeg-full" >&2; exit 1; }
FFMPEG="$ff_dir/ffmpeg"
FFPROBE="$ff_dir/ffprobe"
