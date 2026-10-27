// Texts pasted in the video, read from prompt-pack.md so the video and the docs never differ.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const md = fs.readFileSync(path.resolve(ROOT, '../prompt-pack.md'), 'utf8');
const blocks = [...md.matchAll(/```text\n([\s\S]*?)\n```/g)].map((m) => m[1]);
if (blocks.length !== 23) throw new Error(`prompt-pack.md: expected 23 text blocks, found ${blocks.length}`);

export const SCRIPT = blocks[0];
export const SCRIPT_REQUEST = blocks[1];
export const CHARACTER = { mai: blocks[2], ongTu: blocks[3], maiWet: blocks[4], fix: blocks[5] };
export const SCENES = blocks.slice(6, 10);
export const SHOT_SCRIPTS = blocks.slice(10, 16);
export const SHOT_PROMPTS = blocks.slice(16, 22);
export const SRT = blocks[22];
