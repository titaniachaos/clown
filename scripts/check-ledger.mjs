#!/usr/bin/env node
// Checks the source ledger for the drift that hides in it.
//
// Every entry is written once and rendered into all three languages, which is
// the point of the loader -- but nothing stops one language from being edited
// and the others left behind. That is exactly what happened to the German
// `flop` gloss, which sat at 0.64x the English for a day, carrying one of the
// two definitions the English and Bulgarian had gained.
//
// Four localised structures live in that one file, and all four are checked:
// `entries` (phrase and gloss), `facets` (statement and paradox), `own` (where
// and claim) and `reading` (the note on each seat). Every leaf must carry all
// three languages. A gap is a failure rather than a note, because nothing
// downstream reports one: HeroSlider.vue ends its card list with
// `.filter(c => c.text)`, so a missing Bulgarian paradox is not an error but
// one fewer hero card, in one language, silently.
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

/**
 * The body of a `const name ... = {` or `= [` literal, its brackets included.
 * A type annotation can carry a bracket of its own (`SourceEntry[]`), so this
 * anchors on the assignment rather than on the first bracket after the name.
 */
function literal(name, open) {
  const assignment = source.match(new RegExp(`const ${name}\\b[^=]*=\\s*\\${open}`))
  if (!assignment) return null
  const start = assignment.index + assignment[0].length - 1
  const end = matchBracket(source, start)
  return end === -1 ? null : source.slice(start, end + 1)
}

/** `'key': {...}` pairs directly inside an object literal, in written order. */
function keyedObjectsIn(objectBody) {
  const out = []
  let key = null
  for (let i = 1; i < objectBody.length; i++) {
    const c = objectBody[i]
    if (c === "'" || c === '"') {
      const quote = c
      let j = i + 1
      let value = ''
      while (j < objectBody.length && objectBody[j] !== quote) {
        if (objectBody[j] === '\\') { value += objectBody[j + 1]; j += 2 } else value += objectBody[j++]
      }
      let after = j + 1
      while (after < objectBody.length && /\s/.test(objectBody[after])) after++
      if (objectBody[after] === ':') key = value
      i = j
      continue
    }
    if (c === '{') {
      const end = matchBracket(objectBody, i)
      if (end === -1) break
      out.push([key ?? `(key ${out.length + 1})`, objectBody.slice(i, end + 1)])
      key = null
      i = end
    }
  }
  return out
}

/**
 * Require a complete {en,bg,de} triple in the `key:` block of this chunk.
 * Returns the number of complete triples found, for the tally at the end.
 */
function requireTriple(chunk, key, where, { optional = false } = {}) {
  const block = blockField(chunk, key)
  if (!block) {
    if (!optional) add(`${where}: no ${key}`)
    return 0
  }
  let complete = true
  for (const lang of LANGS) {
    if (!stringField(block, lang)) {
      add(`${where}: ${key} has no ${lang}`)
      complete = false
    }
  }
  return complete ? 1 : 0
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

// ---- facets --------------------------------------------------------------

// A record may carry a statement, a paradox, both or neither: the type marks
// both optional. What is not optional is the language triple on a facet that
// does exist -- see the note at the top about the hero.

let facetLeaves = 0
const facetsBody = literal('facets', '{')
if (!facetsBody) {
  add('could not find the `facets` object')
} else {
  for (const [id, facet] of keyedObjectsIn(facetsBody)) {
    for (const field of ['statement', 'paradox']) {
      if (!blockField(facet, field)) continue
      facetLeaves += requireTriple(facet, field, `facets.${id}`, { optional: true })
    }
  }
}

// ---- the paradoxes the project owns --------------------------------------

const ownBody = literal('own', '[')
const ownParadoxes = ownBody ? objectsIn(ownBody.slice(1, -1)) : []
if (!ownBody) add('could not find the `own` array')
ownParadoxes.forEach((paradox, i) => {
  const where = `own[${i + 1}]`
  requireTriple(paradox, 'where', where)
  requireTriple(paradox, 'claim', where)
})

// ---- the reading order ---------------------------------------------------

const readingBody = literal('reading', '[')
const seats = readingBody ? objectsIn(readingBody.slice(1, -1)) : []
if (!readingBody) add('could not find the `reading` array')
seats.forEach((seat, i) => {
  requireTriple(seat, 'note', `reading seat ${i + 1}`)
})

// ---- report --------------------------------------------------------------

if (problems.length) {
  console.error(`check-ledger: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
console.log(
  `check-ledger: ${entries.length} entries, ${facetLeaves} facets, ` +
    `${ownParadoxes.length} own paradoxes, ${seats.length} reading seats, ` +
    `${LANGS.length} languages -- each one complete, statuses known, glosses in step`
)
