// Shared recorder for the Vietnamese tutorial video. Each chapter script records one webm through a
// fresh Playwright context; build.sh joins the chapters into a single video.
// The overlay draws captions, a visible cursor, a ring around the next target, title cards, still
// images (pages that cannot be recorded live) and a typed terminal. FAST=1 skips the video and most
// waits so selectors can be debugged quickly.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FAST = process.env.FAST === '1';
export const W = 1600;
export const H = 900;
export const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(ROOT, '../../..');
export const OUT = path.join(ROOT, 'out');
export const STATE = path.join(OUT, 'state.json');
export const WEB = process.env.AID_WEB || 'http://localhost:3000';
export const ADMIN = process.env.AID_ADMIN || 'http://localhost:8090';
const K = FAST ? 0.05 : 1;

// Narration: the local Piper service from ImmortalReader (backend/tts), male voice Quang Huy.
export const TTS_URL = process.env.TTS_URL || 'http://127.0.0.1:8001/synthesize';
export const TTS_VOICE = process.env.TTS_VOICE || 'piper-vi-quang-huy';
const TTS_DIR = path.join(OUT, 'tts');

// How the narrator says words the Vietnamese voice would otherwise spell out oddly.
const SAY_AS = [
  [/AID Studio/g, 'ây ai đi xờ-tiu-đi-ô'],
  [/\bAID\b/g, 'ây ai đi'],
  [/Google AI Studio/g, 'Gu-gồ ây ai xờ-tiu-đi-ô'],
  [/Google/g, 'Gu-gồ'],
  [/Gemini/g, 'Giê-mi-nai'],
  [/FFmpeg/g, 'ép ép em peg'],
  [/API key/gi, 'a pi ai ki'],
  [/\bAPI\b/g, 'a pi ai'],
  [/\bkey\b/g, 'ki'],
  [/YouTube/g, 'Diu-túp'],
  [/TikTok/g, 'Tíc-tóc'],
  [/Terminal/gi, 'tơ-mi-nồ'],
  [/Docker/g, 'Đốc-cơ'],
  [/\bFlash\b/g, 'Flát'],
  [/Flash-Lite/g, 'Flát Lai'],
  [/\bLite\b/g, 'Lai'],
  [/\bclip\b/g, 'clíp'],
  [/\bLinh\b/g, 'Linh'],
  [/Ken Burns/g, 'Ken Bơn'],
  [/\bsrt\b/g, 'ét a tê'],
  [/\bmp4\b/g, 'em pê bốn'],
  [/\bpng\b/g, 'pê en gờ'],
  [/16:9/g, 'mười sáu chín'],
  [/9:16/g, 'chín mười sáu'],
  [/\bOK\b/g, 'ô kê'],
  [/\bAI\b/g, 'ây ai'],
  [/(\d+)x(\d+)/g, '$1 nhân $2'],
  [/"/g, ''],
];
export function sayAs(text) {
  let s = String(text);
  for (const [re, to] of SAY_AS) s = s.replace(re, to);
  if (/[\u3400-\u9fff]/.test(s)) throw new Error('narration has Chinese text, pass { say } explicitly: ' + text);
  return s;
}

// Synthesize once per sentence and cache by content; returns { file, ms }.
export async function voice(text) {
  const spoken = sayAs(text);
  fs.mkdirSync(TTS_DIR, { recursive: true });
  const id = crypto.createHash('sha1').update(TTS_VOICE + '|' + spoken).digest('hex').slice(0, 16);
  const file = path.join(TTS_DIR, id + '.wav');
  if (!fs.existsSync(file)) {
    const r = await fetch(TTS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: spoken, language: 'vi-VN', voice: TTS_VOICE }) });
    if (!r.ok) throw new Error(`TTS ${r.status} for: ${spoken}`);
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  }
  const ms = Math.round(1000 * parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' })));
  return { file, ms };
}

// Runs in the page: idempotent, survives SPA route changes and full reloads.
function install() {
  if (window.__demo) { window.__demo.ensure(); return; }
  const css = `
  #__cap{position:fixed;left:50%;bottom:34px;transform:translateX(-50%);max-width:1240px;background:rgba(17,17,17,.94);color:#fff;font:500 27px/1.45 -apple-system,"Helvetica Neue",Arial,sans-serif;padding:16px 30px 16px 26px;border-radius:14px;border-left:7px solid #F5B700;z-index:2147483647;opacity:0;transition:opacity .35s;pointer-events:none;box-shadow:0 14px 36px rgba(0,0,0,.35);text-align:left}
  #__cap.on{opacity:1}
  #__cap.top{bottom:auto;top:28px}
  #__cur{position:fixed;left:800px;top:450px;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:rgba(245,183,0,.35);border:3px solid #F5B700;z-index:2147483646;pointer-events:none;transition:left .8s cubic-bezier(.4,0,.2,1),top .8s cubic-bezier(.4,0,.2,1),transform .18s,background .18s}
  #__cur.down{transform:scale(.6);background:rgba(245,183,0,.9)}
  #__ring{position:fixed;border:4px solid #F5B700;border-radius:10px;z-index:2147483645;pointer-events:none;opacity:0;transition:opacity .3s;box-shadow:0 0 0 9999px rgba(0,0,0,.18)}
  #__ring.on{opacity:1;animation:__pulse 1.1s ease-in-out infinite}
  @keyframes __pulse{50%{border-color:#fff3b0}}
  #__card{position:fixed;inset:0;background:#141414;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;z-index:2147483644;opacity:0;transition:opacity .5s;pointer-events:none;font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;text-align:center;padding:0 120px}
  #__card.on{opacity:1}
  #__card .k{color:#F5B700;font-weight:600;letter-spacing:.14em;font-size:22px;text-transform:uppercase}
  #__card .t{font-weight:700;font-size:60px;line-height:1.2;max-width:1300px}
  #__card .bar{width:130px;height:7px;border-radius:4px;background:#F5B700}
  #__card .s{font-size:28px;opacity:.85;max-width:1200px;line-height:1.5;white-space:pre-line}
  #__still{position:fixed;inset:0;background:#141414;z-index:2147483643;opacity:0;transition:opacity .5s;pointer-events:none;overflow:hidden}
  #__still.on{opacity:1}
  #__still img{position:absolute;left:50%;top:50%;max-width:94%;max-height:88%;transform-origin:center center;transition:transform 1.6s cubic-bezier(.4,0,.2,1);box-shadow:0 16px 48px rgba(0,0,0,.5);border-radius:6px}
  #__still .lbl{position:absolute;left:40px;top:28px;color:#F5B700;font:600 22px -apple-system,"Helvetica Neue",Arial,sans-serif;letter-spacing:.06em}
  #__term{position:fixed;inset:0;background:#141414;z-index:2147483642;opacity:0;transition:opacity .5s;pointer-events:none;display:flex;align-items:flex-start;justify-content:center;padding-top:36px}
  #__term.on{opacity:1}
  #__term .win{width:1400px;height:640px;background:#1e1e1e;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.6);overflow:hidden;display:flex;flex-direction:column}
  #__term .bar{height:38px;background:#2d2d2d;display:flex;align-items:center;gap:9px;padding:0 16px;color:#aaa;font:500 16px -apple-system,Arial,sans-serif}
  #__term .dot{width:13px;height:13px;border-radius:50%}
  #__term pre{flex:1;margin:0;padding:22px 26px;color:#e6e6e6;font:400 21px/1.5 Menlo,Monaco,monospace;white-space:pre-wrap;word-break:break-all;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end}
  #__term .p{color:#F5B700}
  #__term .c{color:#8bd5ff}
  #__term .o{color:#cfcfcf}
  #__term .cm{color:#7f9f7f}
  #__slide{position:fixed;inset:0;background:#141414;color:#eee;z-index:2147483643;opacity:0;transition:opacity .5s;pointer-events:none;font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;padding:40px 56px 150px;box-sizing:border-box}
  #__slide.on{opacity:1}
  #__slide .lbl{color:#F5B700;font-weight:600;font-size:22px;letter-spacing:.06em;margin-bottom:18px}
  #__slide .two{display:grid;grid-template-columns:1fr 1.15fr;gap:40px;align-items:center;height:calc(100% - 50px)}
  #__slide .prompt{background:#1f1f1f;border:1px solid #333;border-radius:14px;padding:22px 26px;font-size:21px;line-height:1.55;white-space:pre-wrap;color:#d8d8d8}
  #__slide table{color:inherit;font-size:inherit;line-height:inherit}
  #__slide tr.hl td{background:rgba(245,183,0,.28);color:#fff}
  #__slide .prompt.hl{border-color:#F5B700;box-shadow:0 0 0 3px rgba(245,183,0,.45)}
  #__slide .prompt .hl{background:rgba(245,183,0,.28);color:#fff;border-radius:4px;box-shadow:0 0 0 3px rgba(245,183,0,.28)}
  #__slide img{max-width:100%;max-height:100%;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.5);display:block;margin:auto}
  #__slide .grid{display:grid;gap:18px;height:calc(100% - 50px);grid-auto-rows:minmax(0,1fr)}
  #__slide .grid img{width:100%;flex:1 1 0;min-height:0;object-fit:contain}
  #__slide .cell{display:flex;flex-direction:column;gap:8px;min-height:0;height:100%;align-items:center;overflow:hidden}
  #__slide .cell .t{font-size:20px;color:#F5B700;font-weight:600}
  #__slide .cell.bad .t{color:#ff6b6b}
  #__slide ol{font-size:30px;line-height:1.6;margin:10px 0 0 10px;padding-left:34px}
  #__slide ol li{opacity:.35;transition:opacity .4s}
  #__slide ol li.hl{opacity:1}
  #__ff{position:fixed;right:28px;top:24px;background:rgba(17,17,17,.9);color:#F5B700;font:600 22px -apple-system,"Helvetica Neue",Arial,sans-serif;padding:10px 18px;border-radius:10px;z-index:2147483647;opacity:0;transition:opacity .3s;pointer-events:none}
  #__ff.on{opacity:1}
  .__blur{filter:blur(9px) !important}
  body.__covered #__cur,body.__covered #__ring{opacity:0 !important}`;
  const el = (id) => document.getElementById(id);
  const ensure = () => {
    if (!document.body || el('__cap')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    for (const id of ['__term', '__still', '__slide', '__card', '__ring', '__cur', '__cap', '__ff']) {
      const d = document.createElement('div'); d.id = id; document.body.appendChild(d);
    }
    el('__still').innerHTML = '<div class="lbl"></div><img alt="">';
    el('__term').innerHTML = '<div class="win"><div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span><span style="margin-left:12px">Terminal</span></div><pre></pre></div>';
  };
  const cover = () => document.body.classList.toggle('__covered', ['__card', '__still', '__term', '__slide'].some((id) => el(id)?.classList.contains('on')));
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  window.__demo = {
    ensure,
    caption(text, top) { ensure(); const c = el('__cap'); if (!text) { c.classList.remove('on'); return; } c.textContent = text; c.classList.toggle('top', !!top); c.classList.add('on'); },
    move(x, y) { ensure(); const c = el('__cur'); c.style.left = x + 'px'; c.style.top = y + 'px'; },
    down(on) { ensure(); el('__cur').classList.toggle('down', on); },
    ring(r) { ensure(); const g = el('__ring'); if (!r) { g.classList.remove('on'); return; } const p = 6; Object.assign(g.style, { left: r.x - p + 'px', top: r.y - p + 'px', width: r.width + 2 * p + 'px', height: r.height + 2 * p + 'px' }); g.classList.add('on'); },
    card(k, t, s) { ensure(); const c = el('__card'); if (!t) { c.classList.remove('on'); cover(); return; } c.innerHTML = `<div class="k">${esc(k)}</div><div class="t">${esc(t)}</div><div class="bar"></div><div class="s">${esc(s || '')}</div>`; c.classList.add('on'); cover(); },
    still(src, label) { ensure(); const s = el('__still'); if (!src) { s.classList.remove('on'); cover(); return; } const img = s.querySelector('img'); img.style.transition = 'none'; img.style.transform = 'translate(-50%,-50%) scale(1)'; img.src = src; s.querySelector('.lbl').textContent = label || ''; s.classList.add('on'); cover(); void img.offsetWidth; img.style.transition = ''; },
    // Zoom so that the fractional rect (0..1 of the image) fills most of the screen.
    zoom(r) { const img = el('__still').querySelector('img'); if (!r) { img.style.transform = 'translate(-50%,-50%) scale(1)'; return; }
      const w = img.clientWidth, h = img.clientHeight; const sc = Math.min(3.2, 0.9 * Math.min(innerWidth / (r.w * w), innerHeight / (r.h * h)));
      const cx = (r.x + r.w / 2 - 0.5) * w, cy = (r.y + r.h / 2 - 0.5) * h;
      img.style.transform = `translate(-50%,-50%) scale(${sc}) translate(${-cx}px,${-cy}px)`; },
    term(on) { ensure(); const t = el('__term'); if (!on) { t.classList.remove('on'); cover(); return; } t.querySelector('pre').innerHTML = ''; t.classList.add('on'); cover(); },
    termAdd(html) { const pre = el('__term').querySelector('pre'); let line = pre.lastElementChild; if (!line || html === '\n') { line = document.createElement('div'); pre.appendChild(line); if (html === '\n') return; } line.insertAdjacentHTML('beforeend', html); while (pre.children.length > 40) pre.firstElementChild.remove(); },
    slide(html) { ensure(); const s = el('__slide'); if (!html) { s.classList.remove('on'); cover(); return; } s.innerHTML = html; s.classList.add('on'); cover(); },
    slideMark(sel) { el('__slide').querySelectorAll('.hl').forEach((n) => n.classList.remove('hl')); if (sel) el('__slide').querySelectorAll(sel).forEach((n) => n.classList.add('hl')); },
    ffBadge(on) { ensure(); const f = el('__ff'); f.textContent = 'Đang chờ AI, video tua nhanh x8'; f.classList.toggle('on', !!on); },
    blur(sel, on) { document.querySelectorAll(sel).forEach((n) => n.classList.toggle('__blur', on)); },
  };
  const keep = () => { try { ensure(); } catch {} };
  document.addEventListener('DOMContentLoaded', keep);
  try { new MutationObserver(keep).observe(document.documentElement, { childList: true, subtree: true }); } catch {}
  keep();
}

const html = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

// Reading time for a caption: about 13 characters per second, never under 3.2 s.
export const readMs = (text) => Math.max(3200, Math.round(String(text).length * 77));

export async function start(name, { login = false } = {}) {
  fs.mkdirSync(OUT, { recursive: true });
  const rawDir = path.join(OUT, 'raw', name);
  fs.rmSync(rawDir, { recursive: true, force: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    locale: 'vi-VN',
    acceptDownloads: true,
    ...(login && fs.existsSync(STATE) ? { storageState: STATE } : {}),
    ...(FAST ? {} : { recordVideo: { dir: rawDir, size: { width: W, height: H } } }),
  });
  await context.addInitScript(install);
  const t0 = Date.now();
  const page = await context.newPage();
  await page.setContent('<html><body style="margin:0;background:#141414"></body></html>');
  await page.evaluate(install);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const marks = [];
  const h = new Helper(page, marks, t0);
  async function finish() {
    const total = (Date.now() - t0) / 1000;
    if (login) await context.storageState({ path: STATE });
    const video = page.video();
    await context.close();
    await browser.close();
    if (fs.existsSync(STATE)) fs.chmodSync(STATE, 0o600);
    const webm = video && !FAST ? await video.path() : null;
    fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify({ name, total, webm, marks, errors }, null, 2));
    console.log(JSON.stringify({ name, total, webm, errors }, null, 2));
  }
  return { browser, context, page, h, finish };
}

export class Helper {
  constructor(page, marks, t0) { this.page = page; this.marks = marks; this.t0 = t0; }

  wait(ms) { return this.page.waitForTimeout(Math.round(ms * K)); }
  mark(name) { this.marks.push({ name, at: (Date.now() - this.t0) / 1000 }); }
  now() { return (Date.now() - this.t0) / 1000; }
  // A silent wait the build plays fast; the badge tells the viewer.
  async fastForward(fn) {
    await this.ev(() => window.__demo.ffBadge(true));
    const a = this.now();
    try { return await fn(); } finally {
      const b = this.now();
      await this.ev(() => window.__demo.ffBadge(false)).catch(() => {});
      if (b - a > 3) this.marks.push({ ff: [a + 0.3, b - 0.3] });
    }
  }
  ev(fn, arg) { return this.page.evaluate(fn, arg); }

  // Show a caption and read it aloud; hold it until the voice ends (or for ms when longer).
  // opts.say replaces the spoken text (needed when the caption quotes Chinese UI labels).
  // opts.top keeps the caption clear of UI at the bottom of the screen.
  async cap(text, ms, top, opts = {}) {
    if (typeof ms === 'object' && ms) { opts = ms; ms = opts.ms; top = opts.top; }
    const v = await voice(opts.say ?? text);
    await this.ev(([t, tp]) => window.__demo.caption(t, tp), [text, !!top]);
    this.marks.push({ voice: v.file, at: (Date.now() - this.t0) / 1000 });
    await this.wait(Math.max(ms ?? 0, v.ms + 650, 2200));
  }
  async capTop(text, opts = {}) { return this.cap(text, { ...opts, top: true }); }
  async nocap() { await this.ev(() => window.__demo.caption('')); }

  // A title card; `say` is read aloud while it shows (defaults to the title and subtitle).
  async card(kicker, title, sub = '', { say, ms } = {}) {
    await this.nocap();
    const v = await voice(say ?? [title, sub].filter(Boolean).join('. '));
    await this.ev(([k, t, s]) => window.__demo.card(k, t, s), [kicker, title, sub]);
    this.marks.push({ voice: v.file, at: (Date.now() - this.t0) / 1000 + 0.4 });
    await this.wait(Math.max(ms ?? 0, v.ms + 1300, 3500));
    await this.ev(() => window.__demo.card('', ''));
    await this.wait(600);
  }

  async box(loc) {
    loc = loc.first();
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    const b = await loc.boundingBox();
    if (!b) throw new Error('no bounding box for ' + loc);
    return b;
  }

  // Move the visible cursor to the target and ring it, optionally with a caption.
  async point(loc, text, ms) {
    const opts = typeof ms === 'object' && ms ? ms : { ms };
    const b = await this.box(loc);
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await this.ev(([x, y]) => window.__demo.move(x, y), [x, y]);
    await this.page.mouse.move(x, y, { steps: 10 });
    await this.ev((r) => window.__demo.ring(r), b);
    if (text) await this.cap(text, { ...opts, top: opts.top ?? y > H * 0.6 });
    else await this.wait(1000);
    return b;
  }

  async click(loc, text, { after = 1700, ms, say, top, force = false } = {}) {
    loc = loc.first();
    await this.point(loc, text, { ms, say, top });
    await this.ev(() => window.__demo.down(true));
    await this.wait(220);
    await this.ev(() => window.__demo.ring(null));
    await loc.click({ force });
    await this.ev(() => window.__demo.down(false));
    await this.wait(after);
  }

  async type(loc, text, caption, { delay = 110, clear = true, say } = {}) {
    loc = loc.first();
    await this.click(loc, caption, { after: 300, say });
    if (clear) await loc.press('ControlOrMeta+a');
    await loc.pressSequentially(text, { delay: FAST ? 0 : delay });
    await this.wait(1200);
  }

  // Long text is pasted, like a real user would: the caption says so.
  async paste(loc, text, caption, { say } = {}) {
    loc = loc.first();
    await this.click(loc, caption, { after: 400, say });
    await loc.fill(text);
    await this.wait(1800);
  }

  async upload(input, file, caption) {
    if (caption) await this.cap(caption);
    await input.first().setInputFiles(file);
    await this.wait(1500);
  }

  async scroll(px, steps = 10) {
    for (let i = 0; i < steps; i++) { await this.page.mouse.wheel(0, px / steps); await this.wait(90); }
    await this.wait(900);
  }

  // A still image shown full screen. shots: [{ text, zoom: {x,y,w,h} as fractions, ms }].
  async still(file, shots, label = '') {
    const data = 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
    await this.nocap();
    await this.ev(([s, l]) => window.__demo.still(s, l), [data, label]);
    await this.page.waitForFunction(() => document.querySelector('#__still img').complete);
    await this.wait(900);
    for (const s of shots) {
      await this.ev((z) => window.__demo.zoom(z), s.zoom || null);
      if (s.zoom !== undefined) await this.wait(1700);
      if (s.text) await this.cap(s.text, { ms: s.ms, say: s.say });
      else await this.wait(s.ms ?? 2500);
    }
    await this.nocap();
    await this.ev(() => window.__demo.still(''));
    await this.wait(700);
  }

  // Play a sound file (a voice sample made in the video) with a caption, and wait for it.
  async playAudio(file, text) {
    const ms = Math.round(1000 * parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' })));
    if (text) await this.ev(([t]) => window.__demo.caption(t, false), [text]);
    this.marks.push({ voice: file, at: (Date.now() - this.t0) / 1000 + 0.3 });
    await this.wait(ms + 1200);
  }

  // A full-screen slide of HTML (prompt next to its result, image grids, lists). steps:
  // [{ text, say, mark: css selector to highlight }].
  async slide(html, steps = []) {
    await this.nocap();
    await this.ev((x) => window.__demo.slide(x), html);
    await this.page.waitForFunction(() => [...document.querySelectorAll('#__slide img')].every((i) => i.complete));
    await this.wait(900);
    for (const s of steps) {
      await this.ev((m) => window.__demo.slideMark(m || null), s.mark);
      if (s.text) await this.cap(s.text, { say: s.say, ms: s.ms });
      else await this.wait(s.ms ?? 2500);
    }
    await this.nocap();
    await this.ev(() => window.__demo.slide(''));
    await this.wait(700);
  }

  // A terminal: each step types `cmd`, then shows `out`, or the output of `run` (a function that
  // executes the real command and returns its text). Comments start with '#'.
  async term(steps, intro) {
    await this.nocap();
    await this.ev(() => window.__demo.term(true));
    await this.wait(800);
    if (intro) await this.cap(intro);
    for (const s of steps) {
      if (s.text) await this.cap(s.text, { say: s.say });
      if (s.cmd) {
        await this.ev((h) => window.__demo.termAdd(h), '<span class="p">$ </span>');
        const cls = s.cmd.startsWith('#') ? 'cm' : 'c';
        for (const ch of s.cmd) {
          await this.ev(([c, k]) => window.__demo.termAdd(`<span class="${k}">${c}</span>`), [html(ch), cls]);
          await this.page.waitForTimeout(FAST ? 0 : 38);
        }
        await this.wait(500);
        await this.ev((h) => window.__demo.termAdd(h), '\n');
      }
      let out = s.out ?? (s.run ? await s.run() : '');
      out = String(out).replace(/\s+$/, '');
      for (const line of out ? out.split('\n') : []) {
        await this.ev((h) => window.__demo.termAdd(h), `<span class="o">${html(line)}</span>`);
        await this.ev((h) => window.__demo.termAdd(h), '\n');
        await this.page.waitForTimeout(FAST ? 0 : 60);
      }
      await this.wait(s.hold ?? 1400);
    }
    await this.nocap();
    if (steps.at(-1)?.end !== false) {
      await this.wait(800);
      await this.ev(() => window.__demo.term(false));
      await this.wait(700);
    }
  }
}

// Run a real command and return stdout+stderr, with home paths shown as ~ in the video.
export function sh(cmd, args, opts = {}) {
  let out;
  try {
    out = execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
    if (!opts.allowFail) throw new Error(`${cmd} failed: ${out}`);
  }
  return out.split(os.homedir()).join('~');
}

export function readSecretFile(file) {
  return fs.readFileSync(file.replace(/^~/, os.homedir()), 'utf8').trim();
}

// Debug aid for FAST runs: screenshot plus aria snapshot into out/debug.
export async function snap(page, tag) {
  const dir = path.join(OUT, 'debug');
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${tag}.png`) });
  fs.writeFileSync(path.join(dir, `${tag}.yml`), await page.locator('body').ariaSnapshot());
}

// Paste like a user would (Cmd+V), into a rich text editor.
export async function pasteText(loc, text) {
  await loc.evaluate((el, t) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', t);
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, text);
}

// A downscaled JPEG data URL of an image, cached in out/thumbs, for slides.
export function thumb(file, width = 1400) {
  const dir = path.join(OUT, 'thumbs');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${path.basename(file, path.extname(file))}-${width}.jpg`);
  if (!fs.existsSync(out)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-vf', `scale=${width}:-2`, '-q:v', '3', out]);
  return 'data:image/jpeg;base64,' + fs.readFileSync(out).toString('base64');
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Prompt text with the given parts wrapped in <span class="p1">, <span class="p2"> ...
export function markParts(text, parts) {
  let html = esc(text);
  parts.forEach((part, i) => {
    const e = esc(part);
    if (!html.includes(e)) throw new Error('part not in prompt: ' + part);
    html = html.replace(e, `<span class="p${i + 1}">${e}</span>`);
  });
  return html;
}
