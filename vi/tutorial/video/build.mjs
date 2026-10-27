// Joins the recorded chapters into one narrated video.
// For each chapter: the webm from out/<name>.json, plus every narration clip at its mark, becomes
// out/parts/<name>.mp4. Film inserts are normalised to the same format. Then everything is joined
// into out/aid-studio-huong-dan.mp4, with YouTube chapter times in out/chapters.txt.
// Usage: node build.mjs            (all parts in SEQUENCE)
//        node build.mjs 02-du-an   (re-encode one chapter only, no join)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { OUT, ROOT, W, H } from './lib.mjs';

const FILM = path.resolve(ROOT, '../assets/film/chiec-o-vang.mp4');
export const SEQUENCE = [
  { name: '00-mo-dau', title: 'Mở đầu' },
  { film: FILM, name: 'film-1' },
  { name: '00-gioi-thieu', title: 'Giới thiệu' },
  { name: '01-cai-dat', title: '1. Cài AID và bật Gemini miễn phí' },
  { name: '02-du-an', title: '2. Tạo dự án và kịch bản' },
  { name: '03a-trich-xuat', title: '3. Để AI tách nhân vật và bối cảnh' },
  { name: '03b-tao-hinh' },
  { name: '03c-boi-canh' },
  { name: '04-nhan-vat', title: '4. Giữ nhân vật nhất quán' },
  { name: '05-phan-canh', title: '5. Phân cảnh' },
  { name: '06-video', title: '6. Video và giọng nói' },
  { name: '07-xuat-phim', title: '7. Xuất phim và phụ đề' },
  { film: path.join(OUT, 'final-film.mp4'), fallback: FILM, name: 'film-2' },
  { name: '99-ket', title: 'Tổng kết' },
];

const PARTS = path.join(OUT, 'parts');
fs.mkdirSync(PARTS, { recursive: true });
const FPS = 25;
const VCODEC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS)];
const ACODEC = ['-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2'];

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const duration = (f) => parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }));

// Waiting on AI is fast-forwarded: each { ff: [start, end] } mark plays SPEED times faster, and
// narration after it moves earlier by the time saved.
const SPEED = 8;

function chapter(name) {
  const meta = JSON.parse(fs.readFileSync(path.join(OUT, `${name}.json`), 'utf8'));
  if (!meta.webm) throw new Error(`${name} was recorded in FAST mode, record it again`);
  const total = Math.min(duration(meta.webm), meta.end ?? Infinity);
  const ffs = meta.marks.filter((m) => m.ff).map((m) => m.ff).sort((a, b) => a[0] - b[0]);
  const saved = (t) => ffs.reduce((acc, [a, b]) => acc + (t >= b ? (b - a) * (1 - 1 / SPEED) : 0), 0);
  const voices = meta.marks.filter((m) => m.voice);
  const out = path.join(PARTS, `${name}.mp4`);
  const args = ['-i', meta.webm];
  voices.forEach((v) => args.push('-i', v.voice));
  const chains = voices.map((v, i) => `[${i + 1}:a]aresample=44100,adelay=${Math.round((v.at - saved(v.at)) * 1000)}:all=1[a${i}]`);
  const mix = voices.length
    ? `${voices.map((_, i) => `[a${i}]`).join('')}amix=inputs=${voices.length}:normalize=0:dropout_transition=0,apad[aout]`
    : 'anullsrc=r=44100:cl=stereo[aout]';
  const base = `fps=${FPS},scale=${W}:${H}:flags=lanczos,format=yuv420p`;
  let vf;
  if (!ffs.length) {
    vf = [`[0:v]${base}[vout]`];
  } else {
    const cuts = [];
    let t = 0;
    for (const [a, b] of ffs) { cuts.push([t, a, 1]); cuts.push([a, b, SPEED]); t = b; }
    cuts.push([t, total, 1]);
    vf = [`[0:v]${base},split=${cuts.length}${cuts.map((_, i) => `[s${i}]`).join('')}`,
      ...cuts.map(([a, b, k], i) => `[s${i}]trim=start=${a}:end=${b},setpts=(PTS-STARTPTS)/${k}[c${i}]`),
      `${cuts.map((_, i) => `[c${i}]`).join('')}concat=n=${cuts.length}:v=1:a=0,fps=${FPS}[vout]`];
  }
  ff([...args, '-filter_complex', [...vf, ...chains, mix].join(';'), '-map', '[vout]', '-map', '[aout]',
    '-t', String(total - saved(total)), ...VCODEC, ...ACODEC, '-movflags', '+faststart', out]);
  return out;
}

function film(item) {
  const src = fs.existsSync(item.film) ? item.film : item.fallback;
  const out = path.join(PARTS, `${item.name}.mp4`);
  const vf = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x141414,fps=${FPS},format=yuv420p`;
  ff(['-i', src, '-vf', vf, '-af', 'aresample=44100', ...VCODEC, ...ACODEC, '-movflags', '+faststart', out]);
  return out;
}

const stamp = (s) => { s = Math.floor(s); const m = Math.floor(s / 60); return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

const only = process.argv[2];
if (only) {
  console.log(chapter(only));
} else {
  const files = [];
  const chapters = [];
  let t = 0;
  for (const item of SEQUENCE) {
    const f = item.film ? film(item) : chapter(item.name);
    if (item.title) chapters.push(`${stamp(t)} ${item.title}`);
    if (item.film) chapters.push(`${stamp(t)} Phim thành phẩm`);
    files.push(f);
    t += duration(f);
  }
  const list = path.join(OUT, 'concat.txt');
  fs.writeFileSync(list, files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const final = path.join(OUT, 'aid-studio-huong-dan.mp4');
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', final]);
  fs.writeFileSync(path.join(OUT, 'chapters.txt'), chapters.join('\n') + '\n');
  console.log(final, stamp(duration(final)));
  console.log(chapters.join('\n'));
}
