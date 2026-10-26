// Finds Chinese UI strings in a frontend app and classifies each occurrence as
// translatable or not. Shared by extract.mjs (catalog + missing report) and
// apply.mjs (build-time rewrite). Upstream source files are never edited.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

export const HAN = /\p{Script=Han}/u
const HAN_RUN = /\p{Script=Han}+/gu

export const APPS = {
  web: { dir: 'frontend/web', roots: ['app', 'components', 'config', 'hooks', 'server', 'stores', 'types', 'utils', 'proxy.ts'] },
  admin: { dir: 'frontend/admin', roots: ['src'] }
}

export function loadTypeScript(repoRoot) {
  for (const app of Object.values(APPS)) {
    const pkg = path.join(repoRoot, app.dir, 'package.json')
    try {
      return createRequire(pkg)('typescript')
    } catch {}
  }
  throw new Error('typescript not found: run npm ci in frontend/web or frontend/admin first')
}

const SKIP_DIRS = new Set(['node_modules', '.next', 'out', 'dist', '__tests__', 'tests', 'test', '__mocks__'])
const SKIP_FILE = /\.(test|spec|stories)\.[cm]?[jt]sx?$|\.d\.ts$/

export function listSourceFiles(appRoot, roots) {
  const out = []
  const walk = (p) => {
    const st = fs.statSync(p, { throwIfNoEntry: false })
    if (!st) return
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(path.basename(p))) return
      for (const name of fs.readdirSync(p).sort()) walk(path.join(p, name))
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(p) && !SKIP_FILE.test(p)) {
      out.push(p)
    }
  }
  for (const r of roots) walk(path.join(appRoot, r))
  return out
}

// Methods whose string arguments drive logic (matching, lookup, storage keys).
const LOGIC_METHODS = new Set([
  'includes', 'indexOf', 'lastIndexOf', 'startsWith', 'endsWith', 'split', 'replace', 'replaceAll',
  'match', 'matchAll', 'search', 'has', 'get', 'set', 'delete', 'add', 'test', 'exec', 'localeCompare',
  'getItem', 'setItem', 'removeItem', 'querySelector', 'querySelectorAll', 'addEventListener',
  'removeEventListener', 'emit', 'on', 'off', 'getAttribute', 'setAttribute', 'padStart', 'padEnd',
  'find', 'findIndex', 'some', 'every', 'filter'
])
// Object properties whose values are identifiers or protocol values, not display text.
const LOGIC_PROPS = new Set([
  'value', 'key', 'code', 'id', 'type', 'status', 'mode', 'role', 'kind', 'field', 'dataIndex',
  'rowKey', 'path', 'url', 'href', 'src', 'icon', 'component', 'permission', 'perms'
])
const LOGIC_JSX_ATTRS = new Set([
  'key', 'value', 'className', 'id', 'name', 'type', 'htmlFor', 'rel', 'href', 'src', 'rowKey',
  'dataIndex', 'defaultValue', 'role', 'lang', 'accept', 'pattern', 'mode'
])
// A binding whose name matches LOGIC_NAME holds machine-facing text (AI prompt content, regex
// source), unless the name ends like a display slot (DISPLAY_NAME). Object properties named like
// a prompt are often just form labels ("negativePrompt: label"), so they only count when long.
const LOGIC_NAME = /prompt|regex|pattern|separator|delimiter|sentinel/i
const DISPLAY_NAME = /(placeholder|options|hint|tips?|title|label)s?$/i
const LONG_PROMPT = 15
const SILENT_CALLEES = /^(console\.\w+|logger\.\w+|debug|log)$/

function nameText(ts, n) {
  if (!n) return ''
  if (ts.isIdentifier(n) || ts.isPrivateIdentifier(n)) return n.text
  if (ts.isStringLiteral(n) || ts.isNumericLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text
  return ''
}

function unwrap(ts, node) {
  let p = node.parent
  let child = node
  while (p && (ts.isParenthesizedExpression(p) || ts.isAsExpression(p) || ts.isTypeAssertionExpression(p) ||
    ts.isNonNullExpression(p) || ts.isSatisfiesExpression?.(p))) {
    child = p
    p = p.parent
  }
  return { parent: p, child }
}

// Returns null when the occurrence is display text, else { reason, global }.
// A global reason marks the text as unsafe to translate anywhere in the app.
function classify(ts, node) {
  const { parent, child } = unwrap(ts, node)
  if (!parent) return { reason: 'orphan' }
  const K = ts.SyntaxKind

  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isExternalModuleReference(parent)) return { reason: 'module' }
  if (ts.isLiteralTypeNode(parent)) return { reason: 'type', global: true }
  if (ts.isEnumMember(parent)) return { reason: 'enum', global: true }
  if (ts.isTaggedTemplateExpression(parent)) return { reason: 'tagged' }
  if (ts.isCaseClause(parent)) return { reason: 'case', global: true }
  if (ts.isElementAccessExpression(parent) && parent.argumentExpression === child) return { reason: 'index', global: true }
  if (ts.isComputedPropertyName(parent)) return { reason: 'computed-key', global: true }
  if ((ts.isPropertyAssignment(parent) || ts.isPropertyDeclaration(parent) || ts.isPropertySignature(parent) ||
    ts.isMethodDeclaration(parent)) && parent.name === child) return { reason: 'key', global: true }
  if (ts.isBinaryExpression(parent)) {
    const op = parent.operatorToken.kind
    if ([K.EqualsEqualsEqualsToken, K.ExclamationEqualsEqualsToken, K.EqualsEqualsToken, K.ExclamationEqualsToken].includes(op)) {
      return { reason: 'compare', global: true }
    }
    if (op === K.InKeyword && parent.left === child) return { reason: 'in', global: true }
  }

  if (ts.isCallExpression(parent) || ts.isNewExpression(parent)) {
    const callee = parent.expression
    if (SILENT_CALLEES.test(callee.getText())) return { reason: 'log' }
    if (callee.kind === K.ImportKeyword || (ts.isIdentifier(callee) && callee.text === 'require')) return { reason: 'module' }
    if (ts.isPropertyAccessExpression(callee) && LOGIC_METHODS.has(callee.name.text) && parent.arguments?.includes(child)) {
      return { reason: 'method:' + callee.name.text, global: true }
    }
    if (ts.isIdentifier(callee) && /^(RegExp|Set|Map|WeakMap)$/.test(callee.text)) {
      return { reason: 'ctor:' + callee.text, global: true }
    }
  }

  // Candidates matched against data: ['a', 'b'].includes(x), new Set([...]).
  if (ts.isArrayLiteralExpression(parent)) {
    const { parent: gp, child: arr } = unwrap(ts, parent)
    if (gp && ts.isPropertyAccessExpression(gp) && gp.expression === arr && LOGIC_METHODS.has(gp.name.text)) {
      return { reason: 'array-match', global: true }
    }
    if (gp && ts.isNewExpression(gp) && ts.isIdentifier(gp.expression) && /^(Set|Map)$/.test(gp.expression.text)) {
      return { reason: 'array-set', global: true }
    }
  }

  if (ts.isPropertyAssignment(parent) && parent.initializer === child) {
    const prop = nameText(ts, parent.name)
    // Local only: the value itself is data, but the same text elsewhere is free to be a label.
    if (LOGIC_PROPS.has(prop)) return { reason: 'prop:' + prop }
  }
  const attrNode = ts.isJsxAttribute(parent) ? parent
    : (ts.isJsxExpression(parent) && parent.parent && ts.isJsxAttribute(parent.parent) ? parent.parent : null)
  if (attrNode) {
    const attr = attrNode.name.getText()
    if (LOGIC_JSX_ATTRS.has(attr) || attr.startsWith('data-')) return { reason: 'attr:' + attr }
  }

  // Anything held by a prompt/regex-like binding, up to the nearest function boundary.
  const len = (node.text ?? node.getText()).length
  for (let p = parent; p && !ts.isSourceFile(p); p = p.parent) {
    if (ts.isFunctionLike(p)) break
    let n = ''
    if (ts.isVariableDeclaration(p) || ts.isPropertyDeclaration(p) || ts.isParameter(p)) n = nameText(ts, p.name)
    else if (ts.isPropertyAssignment(p) && len >= LONG_PROMPT) n = nameText(ts, p.name)
    if (n && LOGIC_NAME.test(n) && !DISPLAY_NAME.test(n)) return { reason: 'name:' + n }
  }
  return null
}

// `a${x}b${y}c` -> "a{0}b{1}c"
function templateKey(node) {
  let key = node.head.text
  node.templateSpans.forEach((s, i) => { key += `{${i}}` + s.literal.text })
  return key
}

// Mirrors how JSX collapses multi-line text: trim each line, drop empty lines, join with a space.
function jsxKey(raw) {
  return raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(' ')
}

// Leading literal run of a regex literal, e.g. /^@图片\d+\[/ -> "@图片". Text that starts with it
// is a token the code parses back, so it must keep its Chinese form.
function regexPrefix(literal) {
  const body = literal.slice(1, literal.lastIndexOf('/')).replace(/^\^/, '')
  let out = ''
  let i = 0
  for (; i < body.length; i++) {
    const c = body[i]
    if (c === '\\') {
      const n = body[i + 1]
      if (n && !/[a-zA-Z0-9]/.test(n)) { out += n; i++; continue }
      break
    }
    if ('.*+?()[]{}|$'.includes(c)) break
    out += c
  }
  // A quantifier binds to the last char, so it is not part of the fixed prefix.
  if (/^[*+?{]/.test(body.slice(i))) out = out.slice(0, -1)
  return HAN.test(out) && [...out].length >= 2 ? out : null
}

function exclusion(c) {
  return c ? { skip: c.reason, global: !!c.global } : { skip: null }
}

// Scans one file. Returns occurrences with exact source ranges.
export function scanFile(ts, file, text = fs.readFileSync(file, 'utf8')) {
  if (!HAN.test(text)) return []
  const kind = file.endsWith('x') ? ts.ScriptKind.TSX : (file.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS)
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind)
  const out = []
  const regexWords = new Set()
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (HAN.test(node.text)) {
        out.push({
          kind: 'str', key: node.text, start: node.getStart(sf), end: node.end,
          jsxAttr: ts.isJsxAttribute(node.parent), ...exclusion(classify(ts, node))
        })
      }
      return
    }
    if (ts.isTemplateExpression(node)) {
      const key = templateKey(node)
      if (HAN.test(key)) {
        out.push({
          kind: 'tpl', key, start: node.getStart(sf), end: node.end,
          exprs: node.templateSpans.map((s) => [s.expression.getStart(sf), s.expression.end]),
          ...exclusion(classify(ts, node))
        })
      }
      node.templateSpans.forEach((s) => visit(s.expression))
      return
    }
    if (node.kind === ts.SyntaxKind.RegularExpressionLiteral) {
      const prefix = regexPrefix(node.text)
      if (prefix) out.push({ kind: 'regex', key: prefix, start: node.getStart(sf), end: node.end, skip: 'regex' })
      for (const w of node.text.match(HAN_RUN) ?? []) if ([...w].length >= 2) regexWords.add(w)
      return
    }
    if (ts.isJsxText(node)) {
      const raw = node.text
      if (HAN.test(raw)) {
        const lead = raw.length - raw.trimStart().length
        const trail = raw.length - raw.trimEnd().length
        const start = node.pos // JsxText owns its whitespace; getStart() would skip it
        out.push({ kind: 'jsx', key: jsxKey(raw), start: start + lead, end: node.end - trail, skip: null })
      }
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  // A regex in this file may test UI text built in this file (e.g. /预计|耗时/ on an ETA label),
  // so keep any local string containing one of its words untranslated.
  if (regexWords.size) {
    for (const o of out) {
      if (o.skip) continue
      const w = [...regexWords].find((x) => o.key.includes(x))
      if (w) o.skip = 'regex-word:' + w
    }
  }
  return out
}

// Scans a whole app. A text excluded with a global reason anywhere is excluded everywhere.
const TOKEN_DELIM = /\p{Script=Han}[-_:\[(#@]$/u

export function scanApp(ts, appRoot, roots, { extraDeny = [] } = {}) {
  const files = listSourceFiles(appRoot, roots)
  const byFile = new Map()
  const deny = new Map(extraDeny.map((k) => [k, 'manual']))
  for (const f of files) {
    const occ = scanFile(ts, f)
    if (!occ.length) continue
    byFile.set(f, occ)
    for (const o of occ) if (o.skip && o.global && !deny.has(o.key)) deny.set(o.key, o.skip)
  }
  // Prefixes the code matches on (startsWith args, regex literals): text built from them is a token.
  const prefixes = new Set()
  for (const occ of byFile.values()) {
    for (const o of occ) {
      // startsWith('删除') is usually a message check; startsWith('音频-') marks a built token.
      if (o.kind === 'regex' || (o.skip === 'method:startsWith' && TOKEN_DELIM.test(o.key))) prefixes.add(o.key)
    }
  }
  const tokenReason = (key) => {
    if (/^@\p{Script=Han}/u.test(key)) return 'mention'
    // Only text built as prefix + value ("分镜{0}", "音频-{0}") is a token; "分镜脚本已保存" is a message.
    for (const p of prefixes) {
      if (key.startsWith(p) && (TOKEN_DELIM.test(p) || /^(\{\d+\}|[-_:\[(#])/.test(key.slice(p.length)))) return 'prefix:' + p
    }
    return null
  }
  for (const occ of byFile.values()) {
    for (const o of occ) {
      if (o.skip) continue
      if (deny.has(o.key)) o.skip = 'deny:' + deny.get(o.key)
      else {
        const r = tokenReason(o.key)
        if (r) o.skip = r
      }
    }
  }
  return { files, byFile, deny, prefixes }
}
