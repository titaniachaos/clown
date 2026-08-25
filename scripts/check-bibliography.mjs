#!/usr/bin/env node
// Holds the structured bibliography to the ledger it claims to cite.
//
// Every work declares the ledger records that cite it, and the Atom feed turns
// each of those into a link at /sources#<record>. A record id that does not
// exist produces a feed entry pointing at an anchor that is not there -- which
// is exactly what happened when the bibliography was first written from the
// ledger's prose `work` strings: two works referred to `bergson-echo` and
// `davison`, neither of which was ever a record.
//
// Nothing in the build catches that. The dead link is inside a generated XML
// file, so the link checker never sees it and the page renders fine.
//
// This fails, rather than reporting. A citation pointing nowhere is the one
// failure the ledger exists to prevent.
//
// Usage: node scripts/check-bibliography.mjs [bibliographyFile] [ledgerFile]

import { readFile } from 'node:fs/promises'

const bibFile = process.argv[2] ?? 'docs/.vitepress/bibliography.ts'
const ledgerFile = process.argv[3] ?? 'docs/.vitepress/sources.data.ts'

const [bib, ledger] = await Promise.all([
  readFile(bibFile, 'utf-8'),
  readFile(ledgerFile, 'utf-8')
])

const records = new Set([...ledger.matchAll(/^ {4}id: '([a-z0-9-]+)',/gm)].map((m) => m[1]))

const works = [...bib.matchAll(/ {4}id: '([a-z0-9-]+)',[\s\S]*?records: \[([^\]]*)\]/g)].map((m) => ({
  id: m[1],
  refs: [...m[2].matchAll(/'([a-z0-9-]+)'/g)].map((r) => r[1])
}))

const dangling = works
  .map((w) => ({ ...w, missing: w.refs.filter((r) => !records.has(r)) }))
  .filter((w) => w.missing.length)

// The other direction is a report, not a failure: a record with no structured
// work is a gap in the bibliography, and some records cite nothing citable.
const cited = new Set(works.flatMap((w) => w.refs))
const uncited = [...records].filter((r) => !cited.has(r))

if (dangling.length) {
  console.error(`check-bibliography: ${dangling.length} work(s) cite a record that does not exist`)
  for (const w of dangling) console.error(`  ${w.id} -> ${w.missing.join(', ')}`)
  console.error(`\n  known records: ${[...records].sort().join(', ')}`)
  process.exit(1)
}

const read = [...bib.matchAll(/read: '([a-z-]+)'/g)].map((m) => m[1])
const tally = read.reduce((a, r) => ({ ...a, [r]: (a[r] ?? 0) + 1 }), {})

console.log(
  `check-bibliography: ${works.length} works, ${records.size} records -- every citation resolves`
)
console.log(
  `  read: ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(', ')}`
)
if (uncited.length) {
  console.log(`  note  ${uncited.length} record(s) carry no structured work yet: ${uncited.join(', ')}`)
}
