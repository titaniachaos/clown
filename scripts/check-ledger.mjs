#!/usr/bin/env node
// Checks the source ledger for the drift that hides in it.
//
// Every entry is written once and rendered into all three languages, which is
// the point of the loader -- but nothing stops one language from being edited
// and the others left behind. That is exactly what happened to the German
// `flop` gloss, which sat at 0.64x the English for a day, carrying one of the
// two definitions the English and Bulgarian had gained.
//
// The file is TypeScript with module-private consts, so it is read as text by
// a small brace-matching scanner rather than imported.
//
// Usage: node scripts/check-ledger.mjs [file]

import { readFile } from 'node:fs/promises'

const file = process.argv[2] ?? 'docs/.vitepress/sources.data.ts'
const LANGS = ['en', 'bg', 'de']
const STATUSES = ['verified', 'chosen', 'probable', 'open']
const MIN_RATIO = 0.6
const MAX_RATIO = 1.8

const source = await readFile(file, 'utf8')
const problems = []
const add = (m) => problems.push(m)

/** Walk from an opening bracket to its match, skipping string contents. */
function matchBracket(text, start) {
  const open = text[start]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (c === "'" || c === '"' || c === '`') {
      const quote = c
      i++
      while (i < text.length && text[i] !== quote) i += text[i] === '\\' ? 2 : 1
      continue
    }
    if (c === open) depth++
    else if (c === close && --depth === 0) return i
  }
  return -1
}

/** Top-level `{...}` chunks directly inside an array literal. */
function objectsIn(arrayBody) {
  const out = []
  for (let i = 0; i < arrayBody.length; i++) {
    if (arrayBody[i] === '{') {
      const end = matchBracket(arrayBody, i)
      if (end === -1) break
      out.push(arrayBody.slice(i, end + 1))
      i = end
    } else if (arrayBody[i] === "'" || arrayBody[i] === '"') {
      const quote = arrayBody[i++]
      while (i < arrayBody.length && arrayBody[i] !== quote) i += arrayBody[i] === '\\' ? 2 : 1
    }
  }
  return out
}

/** `key: '...'` at any depth of this chunk, single-quoted as the file writes them. */
function stringField(chunk, key) {
  const at = chunk.search(new RegExp(`(^|[\\s{,])${key}\\s*:\\s*'`))
  if (at === -1) return null
  let i = chunk.indexOf("'", at) + 1
  let value = ''
  while (i < chunk.length && chunk[i] !== "'") {
    if (chunk[i] === '\\') { value += chunk[i + 1]; i += 2 } else value += chunk[i++]
  }
  return value
}

/** The `{...}` block that follows `key:`. */
function blockField(chunk, key) {
  const at = chunk.search(new RegExp(`(^|[\\s{,])${key}\\s*:\\s*\\{`))
  if (at === -1) return null
  const open = chunk.indexOf('{', at)
  const end = matchBracket(chunk, open)
  return end === -1 ? null : chunk.slice(open, end + 1)
}

// ---- entries -------------------------------------------------------------

// `const entries: SourceEntry[] = [` -- the type annotation carries a `[` of
// its own, so anchor on the assignment rather than on the first bracket.
const entriesAssignment = source.match(/const entries\b[^=]*=\s*\[/)
const arrayStart = entriesAssignment ? entriesAssignment.index + entriesAssignment[0].length - 1 : -1
const arrayEnd = arrayStart === -1 ? -1 : matchBracket(source, arrayStart)
if (arrayStart === -1 || arrayEnd === -1) {
  console.error('check-ledger: could not find the `entries` array -- has the file been restructured?')
  process.exit(1)
}

const entries = objectsIn(source.slice(arrayStart + 1, arrayEnd))
const ids = new Set()

for (const entry of entries) {
  const id = stringField(entry, 'id') ?? '(no id)'
  const where = `entry ${id}`

  if (ids.has(id)) add(`${where}: duplicate id`)
  ids.add(id)

  const status = stringField(entry, 'status')
  if (!status) add(`${where}: no status`)
  else if (!STATUSES.includes(status)) add(`${where}: unknown status "${status}"`)

  if (!stringField(entry, 'locus')) add(`${where}: no locus`)
  if (!stringField(entry, 'work')) add(`${where}: no work`)

  const ref = stringField(entry, 'ref')
  if (ref && !/^10\.\d{4,9}\/\S+$/.test(ref)) add(`${where}: ref "${ref}" is not a DOI`)

  for (const field of ['phrase', 'gloss']) {
    const block = blockField(entry, field)
    if (!block) {
      add(`${where}: no ${field}`)
      continue
    }
    const values = {}
    for (const lang of LANGS) {
      const value = stringField(block, lang)
      if (!value) add(`${where}: ${field} has no ${lang}`)
      else values[lang] = value
    }
    if (field === 'gloss' && values.en) {
      for (const lang of ['bg', 'de']) {
        if (!values[lang]) continue
        const ratio = values[lang].length / values.en.length
        if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
          add(
            `${where}: ${lang} gloss is ${ratio.toFixed(2)}x the English ` +
              `(${values[lang].length} against ${values.en.length} characters) -- likely stale`
          )
        }
      }
    }
  }
}

// ---- interface strings ---------------------------------------------------

const uiAssignment = source.match(/const ui\b[^=]*=\s*\{/)
const uiOpen = uiAssignment ? uiAssignment.index + uiAssignment[0].length - 1 : -1
const uiEnd = uiOpen === -1 ? -1 : matchBracket(source, uiOpen)
if (uiOpen === -1 || uiEnd === -1) {
  add('could not find the `ui` object')
} else {
  const ui = source.slice(uiOpen, uiEnd + 1)
  for (const lang of LANGS) {
    const block = blockField(ui, lang)
    if (!block) {
      add(`ui: no ${lang}`)
      continue
    }
    for (const field of ['phrase', 'source']) {
      if (!stringField(block, field)) add(`ui.${lang}: no ${field}`)
    }
    const status = blockField(block, 'status')
    const counts = blockField(block, 'counts')
    for (const s of STATUSES) {
      if (!status || !stringField(status, s)) add(`ui.${lang}.status: no ${s}`)
      const one = counts && blockField(counts, s)
      // counts carry a singular and a plural: the tally prints a bare integer,
      // and "1 избрано" was wrong in Bulgarian.
      if (!one) add(`ui.${lang}.counts.${s}: expected { one, many }`)
      else for (const form of ['one', 'many']) {
        if (!stringField(one, form)) add(`ui.${lang}.counts.${s}: no ${form}`)
      }
    }
  }
}

if (problems.length) {
  console.error(`check-ledger: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
console.log(
  `check-ledger: ${entries.length} entries, ${LANGS.length} languages -- ` +
    `each one complete, statuses known, glosses in step`
)
