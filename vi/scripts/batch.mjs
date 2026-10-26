#!/usr/bin/env node
// Splits untranslated strings into id-keyed batches for translators, and merges the results back.
//
//   node vi/scripts/batch.mjs split <dir> [--size 1400]   writes <dir>/batch-N.in.tsv
//   node vi/scripts/batch.mjs merge <dir>                 reads <dir>/batch-N*.out.json into vi/dict/ui.vi.json
//
// Input lines: id<TAB>zh<TAB>file (newlines and tabs in zh are written as \n and \t). Translators
// answer { "<id>": "<Vietnamese>" } in one or more part files (batch-N.part-K.out.json), so source
// text never has to be copied back by hand.
import fs from 'node:fs'
import path from 'node:path'
import { REPO, readDict, placeholderProblem, stringifyClean } from './lib/dict.mjs'

const args = process.argv.slice(2)
const [cmd, dirArg] = args
const size = args.includes('--size') ? Number(args[args.indexOf('--size') + 1]) : 1400
if (!['split', 'merge'].includes(cmd) || !dirArg) {
  console.error('usage: batch.mjs split|merge <dir> [--size N]')
  process.exit(64)
}
const dir = path.resolve(dirArg)
const DICT_FILE = path.join(REPO, 'vi/dict/ui.vi.json')
const HAN = /\p{Script=Han}/u

// Punctuation the project's text rules ban in generated text (fancy dashes, quotes, ellipsis,
// exotic spaces, arrows, math signs, bullets, marks, box drawing). Built from code points so this
// source file itself stays plain ASCII.
const BANNED_RANGES = [
  [0x2013, 0x2014], [0x2018, 0x2019], [0x201c, 0x201d], [0x2026, 0x2026], [0x00a0, 0x00a0],
  [0x202f, 0x202f], [0x2009, 0x2009], [0x200b, 0x200d], [0xfeff, 0xfeff], [0x2190, 0x21ff],
  [0x2260, 0x2260], [0x2264, 0x2265], [0x00d7, 0x00d7], [0x2022, 0x2022], [0x00b7, 0x00b7],
  [0x2713, 0x2713], [0x2717, 0x2717], [0x2500, 0x257f]
]
const isBanned = (ch) => {
  const cp = ch.codePointAt(0)
  return BANNED_RANGES.some(([a, b]) => cp >= a && cp <= b)
}
const hasBanned = (s) => [...s].some(isBanned)

function catalogs() {
  const out = []
  for (const app of ['web', 'admin', 'sql']) {
    const f = path.join(REPO, `vi/catalog/${app}.json`)
    if (!fs.existsSync(f)) continue
    for (const [zh, e] of Object.entries(JSON.parse(fs.readFileSync(f, 'utf8')))) {
      out.push({ zh, kind: e.kind, file: app === 'sql' ? `db:${e.files.join(',')}` : `${app}/${e.files[0]}` })
    }
  }
  return out
}

if (cmd === 'split') {
  const dict = readDict()
  const seen = new Set()
  const todo = catalogs()
    .filter((e) => !(e.zh in dict) && !seen.has(e.zh) && seen.add(e.zh))
    .sort((a, b) => a.file.localeCompare(b.file))
  fs.mkdirSync(dir, { recursive: true })
  const ids = {}
  let n = 0
  for (let i = 0; i < todo.length; i += size) {
    n++
    const lines = todo.slice(i, i + size).map((e, j) => {
      const id = `${n}-${j}`
      ids[id] = e.zh
      return [id, e.zh.replace(/\n/g, '\\n').replace(/\t/g, '\\t'), e.file].join('\t')
    })
    fs.writeFileSync(path.join(dir, `batch-${n}.in.tsv`), lines.join('\n') + '\n')
  }
  fs.writeFileSync(path.join(dir, 'ids.json'), JSON.stringify(ids) + '\n')
  console.log(`${todo.length} strings in ${n} batches under ${dir}`)
} else {
  const ids = JSON.parse(fs.readFileSync(path.join(dir, 'ids.json'), 'utf8'))
  const dict = fs.existsSync(DICT_FILE) ? JSON.parse(fs.readFileSync(DICT_FILE, 'utf8')) : {}
  const problems = []
  let added = 0
  for (const f of fs.readdirSync(dir).filter((n) => /^batch-\d+(\.part-\d+)?\.out\.json$/.test(n)).sort()) {
    const out = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    for (const [id, vi] of Object.entries(out)) {
      const zh = ids[id]
      if (zh == null) { problems.push(`${f}: unknown id ${id}`); continue }
      // Translators may drop edge spaces; restore the source's own (" 积分" after a number).
      // Full-width CJK punctuation carries its own spacing; an ASCII colon or comma needs a real
      // space before whatever the code appends ("型号：" + name -> "Mô hình: " + name).
      const core = typeof vi === 'string' ? vi.trim() : ''
      const gap = /[：，；]$/u.test(zh.trimEnd()) && /[:,;]$/.test(core) && !/\s$/.test(zh) ? ' ' : ''
      const v = core && zh.match(/^\s*/)[0] + core + gap + zh.match(/\s*$/)[0]
      const why = !v ? 'empty'
        : placeholderProblem(zh, v) ?? (HAN.test(v) ? 'still has Chinese' : null) ?? (hasBanned(v) ? 'banned punctuation' : null)
      if (why) { problems.push(`${f} ${id}: ${why}: ${JSON.stringify(zh)} -> ${JSON.stringify(v)}`); continue }
      if (dict[zh] !== v) added++
      dict[zh] = v
    }
  }
  const missingIds = Object.keys(ids).filter((id) => !(ids[id] in dict))
  const sorted = Object.fromEntries(Object.keys(dict).sort().map((k) => [k, dict[k]]))
  fs.mkdirSync(path.dirname(DICT_FILE), { recursive: true })
  fs.writeFileSync(DICT_FILE, stringifyClean(sorted) + '\n')
  console.log(`merged ${added} translations into ${path.relative(REPO, DICT_FILE)} (${Object.keys(sorted).length} total)`)
  if (missingIds.length) console.log(`${missingIds.length} ids still untranslated: ${missingIds.slice(0, 10).join(', ')}${missingIds.length > 10 ? ', ...' : ''}`)
  for (const p of problems) console.log('[x] ' + p)
  if (problems.length) process.exitCode = 1
}
