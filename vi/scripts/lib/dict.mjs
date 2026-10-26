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
