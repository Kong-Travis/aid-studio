#!/usr/bin/env node
// Scans the frontend apps, writes the string catalog and reports what still lacks a translation.
//
//   node vi/scripts/extract.mjs                 catalog + summary for both apps
//   node vi/scripts/extract.mjs --missing out.json   also dump untranslated keys with context
//   node vi/scripts/extract.mjs --strict        exit 1 when anything is untranslated
import fs from 'node:fs'
import path from 'node:path'
import { APPS, loadTypeScript, scanApp } from './lib/scan.mjs'
import { REPO, readDict, readDeny, placeholderProblem, stringifyClean } from './lib/dict.mjs'

const args = process.argv.slice(2)
const missingOut = args.includes('--missing') ? args[args.indexOf('--missing') + 1] : null
const strict = args.includes('--strict')

const ts = loadTypeScript(REPO)
const dict = readDict()
const deny = readDeny()
const missing = {}
let bad = 0

for (const [name, app] of Object.entries(APPS)) {
  const appRoot = path.join(REPO, app.dir)
  const { byFile, deny: denied } = scanApp(ts, appRoot, app.roots, { extraDeny: deny })
  const catalog = {}
  const skipped = {}
  for (const [file, occ] of byFile) {
    const rel = path.relative(appRoot, file)
    for (const o of occ) {
      if (o.skip) {
        skipped[o.key] ??= o.skip
        continue
      }
      const e = (catalog[o.key] ??= { kind: o.kind, n: 0, files: [] })
      e.n++
      if (e.files.length < 3 && !e.files.includes(rel)) e.files.push(rel)
    }
  }
  const keys = Object.keys(catalog).sort()
  const sorted = Object.fromEntries(keys.map((k) => [k, catalog[k]]))
  fs.mkdirSync(path.join(REPO, 'vi/catalog'), { recursive: true })
  fs.writeFileSync(path.join(REPO, `vi/catalog/${name}.json`), stringifyClean(sorted) + '\n')
  fs.writeFileSync(path.join(REPO, `vi/catalog/${name}.skipped.json`),
    stringifyClean(Object.fromEntries(Object.keys(skipped).sort().map((k) => [k, skipped[k]]))) + '\n')

  const todo = keys.filter((k) => !(k in dict))
  for (const k of keys) {
    if (k in dict) {
      const p = placeholderProblem(k, dict[k])
      if (p) { bad++; console.error(`[x] ${name}: ${p}: ${JSON.stringify(k)}`) }
    }
  }
  for (const k of todo) missing[k] ??= { app: name, ...catalog[k] }
  const occTotal = keys.reduce((s, k) => s + catalog[k].n, 0)
  console.log(`${name}: ${keys.length} unique strings (${occTotal} occurrences), ` +
    `${keys.length - todo.length} translated, ${todo.length} missing, ${Object.keys(skipped).length} kept as-is (logic)`)
}

if (missingOut) {
  fs.writeFileSync(missingOut, JSON.stringify(missing, null, 1) + '\n')
  console.log(`missing keys written to ${missingOut}`)
}
if (bad) process.exit(2)
if (strict && Object.keys(missing).length) process.exit(1)
