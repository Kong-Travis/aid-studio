// Loads the Vietnamese dictionary and manual deny list from vi/dict/.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const DICT_DIR = process.env.VI_DICT_DIR ? path.resolve(process.env.VI_DICT_DIR) : path.join(REPO, 'vi/dict')

// Every vi/dict/*.vi.json file is merged; later files win on duplicate keys.
export function readDict() {
  const out = {}
  if (!fs.existsSync(DICT_DIR)) return out
  for (const f of fs.readdirSync(DICT_DIR).filter((n) => n.endsWith('.vi.json')).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(DICT_DIR, f), 'utf8'))
    for (const [k, v] of Object.entries(data)) if (typeof v === 'string' && v.length) out[k] = v
  }
  return out
}

// { "<app>/<path inside the app>": { "<Chinese>": "<Vietnamese>" } }, applied before the shared dictionary.
export function readOverrides() {
  const f = path.join(DICT_DIR, 'overrides.json')
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}
}

export function readDeny() {
  const f = path.join(DICT_DIR, 'deny.json')
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []
}

const PH = /\{(\d+)\}/g

// A translation must use exactly the placeholders {0}..{n-1} of its source key.
export function placeholderProblem(key, value) {
  const want = [...key.matchAll(PH)].map((m) => m[1]).sort().join(',')
  const got = [...value.matchAll(PH)].map((m) => m[1]).sort().join(',')
  return want === got ? null : `placeholders differ (${want || 'none'} vs ${got || 'none'})`
}

// JSON.stringify that writes non-ASCII symbols and punctuation as \uXXXX escapes. Keys copy
// upstream text verbatim (multiplication signs, ellipses, middle dots...); escaping keeps the
// committed files plain while letters, digits, Han and CJK punctuation stay readable.
export function stringifyClean(value) {
  const keep = (ch) => {
    const cp = ch.codePointAt(0)
    return cp < 0x80 || /[\p{L}\p{M}\p{N}]/u.test(ch) || (cp > 0x3000 && cp <= 0x303f) || (cp >= 0xff01 && cp <= 0xffef)
  }
  return [...JSON.stringify(value, null, 1)]
    .map((ch) => (keep(ch) ? ch : ch.split('').map((u) => '\\u' + u.charCodeAt(0).toString(16).padStart(4, '0')).join('')))
    .join('')
}
