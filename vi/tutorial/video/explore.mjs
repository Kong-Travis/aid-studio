// Debug helper (not part of the video): opens a page, runs optional steps, saves a screenshot and an
// aria snapshot. Usage: node explore.mjs <outdir> <url> [steps.mjs]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const [out, url, steps] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const state = path.join(path.dirname(new URL(import.meta.url).pathname), 'out/explore-state.json');
const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, locale: 'vi-VN', ...(fs.existsSync(state) ? { storageState: state } : {}) });
const page = await context.newPage();
await page.goto(url);
await page.waitForTimeout(2500);
let i = 0;
const snap = async (tag) => {
  i++;
  await page.screenshot({ path: `${out}/${i}-${tag}.png` });
  fs.writeFileSync(`${out}/${i}-${tag}.yml`, await page.locator('body').ariaSnapshot());
};
if (steps) {
  try { await (await import(path.resolve(steps))).default(page, snap); }
  catch (e) { console.log('STEP ERROR', e.message.slice(0, 1500)); await snap('error'); }
}
console.log('URL', page.url());
await snap('end');
fs.mkdirSync(path.dirname(state), { recursive: true });
await context.storageState({ path: state }); fs.chmodSync(state, 0o600);
await browser.close();
