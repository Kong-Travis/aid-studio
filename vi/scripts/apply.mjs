#!/usr/bin/env node
// Produces a Vietnamese copy of a frontend app by rewriting Chinese UI strings through the
// dictionary in vi/dict/. Upstream files in the checkout stay untouched unless --in-place is given.
//
//   node vi/scripts/apply.mjs web                  copy to vi/build/web and rewrite there
//   node vi/scripts/apply.mjs all --out /tmp/x     choose the output root
//   node vi/scripts/apply.mjs all --in-place       rewrite the checkout itself (CI and release builds only)
import fs from 'node:fs'
import path from 'node:path'
import { APPS, loadTypeScript, scanApp } from './lib/scan.mjs'
import { REPO, readDict, readDeny, placeholderProblem } from './lib/dict.mjs'
import { PATCHES } from '../patches.mjs'

const args = process.argv.slice(2)
const which = args[0] && !args[0].startsWith('--') ? args[0] : 'all'
const inPlace = args.includes('--in-place')
const outRoot = path.resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : path.join(REPO, 'vi/build'))
const names = which === 'all' ? Object.keys(APPS) : [which]
for (const n of names) if (!APPS[n]) throw new Error(`unknown app "${n}", expected ${Object.keys(APPS).join('|')}|all`)

const ts = loadTypeScript(REPO)
const dict = readDict()
const deny = readDeny()
const COPY_SKIP = new Set(['node_modules', '.next', 'out', 'dist', '.turbo'])

function copyApp(src, dst) {
  fs.rmSync(dst, { recursive: true, force: true })
  fs.mkdirSync(dst, { recursive: true })
  for (const name of fs.readdirSync(src)) {
    if (COPY_SKIP.has(name)) continue
    fs.cpSync(path.join(src, name), path.join(dst, name), { recursive: true })
  }
  // Clone (copy-on-write where the filesystem supports it) rather than symlink: bundlers
  // refuse a node_modules link that points outside the project root.
  const nm = path.join(src, 'node_modules')
  if (fs.existsSync(nm)) {
    fs.cpSync(nm, path.join(dst, 'node_modules'), { recursive: true, mode: fs.constants.COPYFILE_FICLONE, verbatimSymlinks: true })
  }
}

const escTpl = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
const HTML_ENTITY = /&(#\d+|#x[0-9a-f]+|[a-z]+);/i

function lookup(o) {
  if (o.skip) return null
  const v = dict[o.key]
  if (v == null || placeholderProblem(o.key, v)) return null
  return v
}

// Rewrites text[start, end) given the occurrences inside it; nested occurrences (strings inside
// ${...} of a template) are rewritten recursively so they translate even when the outer one does not.
function rewrite(text, occs, start, end) {
  let out = ''
  let cursor = start
  for (let i = 0; i < occs.length; i++) {
    const o = occs[i]
    if (o.start < cursor || o.end > end) continue
    const inner = []
    while (i + 1 < occs.length && occs[i + 1].start < o.end) inner.push(occs[++i])
    out += text.slice(cursor, o.start) + render(text, o, inner)
    cursor = o.end
  }
  return out + text.slice(cursor, end)
}

function render(text, o, inner) {
  const vi = lookup(o)
  if (o.kind === 'tpl') {
    const exprs = o.exprs.map(([s, e]) => rewrite(text, inner.filter((x) => x.start >= s && x.end <= e), s, e))
    if (vi == null) {
      if (!o.skip) stats.miss++
      return rewrite(text, inner, o.start, o.end)
    }
    stats.hit++
    return '`' + vi.split(/(\{\d+\})/).map((part) => {
      const m = /^\{(\d+)\}$/.exec(part)
      return m ? '${' + exprs[Number(m[1])] + '}' : escTpl(part)
    }).join('') + '`'
  }
  if (vi == null) {
    if (!o.skip) stats.miss++
    return text.slice(o.start, o.end)
  }
  stats.hit++
  if (o.kind === 'jsx') {
    // Keep raw JSX text when the source relies on HTML entities and the translation is safe as JSX text.
    if (HTML_ENTITY.test(o.key) && !/[{}<>]/.test(vi)) return vi
    return '{' + JSON.stringify(vi) + '}'
  }
  return o.jsxAttr ? '{' + JSON.stringify(vi) + '}' : JSON.stringify(vi)
}

const stats = { files: 0, hit: 0, miss: 0 }

for (const name of names) {
  const app = APPS[name]
  const src = path.join(REPO, app.dir)
  const dst = inPlace ? src : path.join(outRoot, name)
  if (!inPlace) copyApp(src, dst)
  Object.assign(stats, { files: 0, hit: 0, miss: 0 })

  const { byFile } = scanApp(ts, dst, app.roots, { extraDeny: deny })
  for (const [file, occs] of byFile) {
    if (!occs.some((o) => lookup(o) != null)) continue
    const text = fs.readFileSync(file, 'utf8')
    occs.sort((a, b) => a.start - b.start || b.end - a.end)
    const next = rewrite(text, occs, 0, text.length)
    if (next !== text) {
      fs.writeFileSync(file, next)
      stats.files++
    }
  }

  let patchMiss = 0
  for (const p of PATCHES[name] ?? []) {
    const file = path.join(dst, p.file)
    const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
    if (text == null || !text.includes(p.find)) {
      patchMiss++
      console.warn(`[warn] ${name}: patch "${p.why}" did not match ${p.file}`)
      continue
    }
    fs.writeFileSync(file, text.split(p.find).join(p.replace))
  }
  console.log(`${name}: rewrote ${stats.files} files, ${stats.hit} strings translated, ${stats.miss} left in Chinese, ` +
    `${(PATCHES[name] ?? []).length - patchMiss} patches applied -> ${path.relative(REPO, dst) || '.'}`)
}
