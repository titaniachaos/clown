#!/usr/bin/env node
// Holds the published citations feed to the bibliography it claims to carry.
//
// Every other check in this repository compares two things inside the build.
// The feed is different: it leaves. A reference manager fetches citations.atom,
// a reader saves it, and from that moment nothing connects those bytes to the
// ledger that produced them.
//
// So the feed carries an order-invariant receipt over the works, and this
// recomputes it by two routes that must agree:
//
//   1. from the bibliography module, the way the build computed it, and
//   2. from the built feed alone, by parsing the entries back out.
//
// Route 2 is the one that earns the check. It never reads the ledger, so it
// catches the feed drifting from its source in the ways nothing else here
// would: a work dropped by a filter, an author list mangled by escaping, a
// `read` status that renders differently from how it is stored. If the two
// routes agree, the feed is a faithful rendering of the set it names.
//
// It also fails when the receipt in the feed does not match either -- a feed
// edited after the build, or a stale artefact left in the output directory.
//
// Usage: node scripts/check-receipt.mjs [distDir]

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { WORKS } from '../docs/.vitepress/bibliography.ts'
import { fold, workLeaf, RECEIPT_SCHEME } from '../docs/.vitepress/receipt.ts'

const dist = process.argv[2] ?? 'docs/.vitepress/dist'
const problems = []

const unescape = (t) =>
  t
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')

let feed
try {
  feed = await readFile(join(dist, 'citations.atom'), 'utf-8')
} catch {
  console.error(`check-receipt: no citations.atom in ${dist} -- build first`)
  process.exit(1)
}

// --- route 1: the bibliography, as the build folded it ----------------------
const fromSource = fold(WORKS.map(workLeaf))

// --- route 2: the feed, read as a stranger would ----------------------------
const entries = [...feed.matchAll(/ {2}<entry>\n([\s\S]*?)\n {2}<\/entry>/g)].map((m) => m[1])

const oneOf = (block, re) => {
  const m = block.match(re)
  return m ? unescape(m[1]) : ''
}
const allOf = (block, re) => [...block.matchAll(re)].map((m) => unescape(m[1]))

const rebuilt = entries.map((block) => {
  const categories = [...block.matchAll(/<category term="([^"]*)"(?: label="([^"]*)")?\/>/g)].map(
    (m) => ({ term: unescape(m[1]), label: m[2] ? unescape(m[2]) : '' })
  )
  const byLabel = (label) => categories.filter((c) => c.label === label).map((c) => c.term)
  return workLeaf({
    id: oneOf(block, /<id>tag:[^<]*\/work\/([^<]*)<\/id>/),
    title: oneOf(block, /<title>([^<]*)<\/title>/),
    authors: allOf(block, /<author><name>([^<]*)<\/name><\/author>/g),
    type: byLabel('work type')[0] ?? '',
    read: byLabel('how far this project read it')[0] ?? '',
    records: byLabel('ledger record')
  })
})
const fromFeed = fold(rebuilt)

// --- route 3: what the feed says its receipt is -----------------------------
const declared = feed.match(
  new RegExp(`<category term="([^"]*)" scheme="${RECEIPT_SCHEME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`)
)?.[1]

if (entries.length !== WORKS.length) {
  problems.push(`feed carries ${entries.length} entries against ${WORKS.length} works`)
}
if (fromFeed.value !== fromSource.value) {
  problems.push(
    `the feed does not fold to the bibliography -- feed ${fromFeed.term}, source ${fromSource.term}`
  )
  const sourceLeaves = new Set(WORKS.map(workLeaf))
  for (const leaf of rebuilt) {
    if (!sourceLeaves.has(leaf)) {
      problems.push(`  entry not in the bibliography as published: ${leaf.split(String.fromCharCode(31))[0] || '(no id)'}`)
    }
  }
}
if (!declared) {
  problems.push('the feed declares no receipt')
} else if (declared !== fromSource.term) {
  problems.push(`the feed declares ${declared} but folds to ${fromSource.term}`)
}

// The receipt must not depend on the order WORKS happens to be written in.
const reversed = fold([...WORKS].reverse().map(workLeaf))
if (reversed.value !== fromSource.value) {
  problems.push('the receipt is order-dependent -- reversing WORKS moved it')
}

// A receipt over nothing would pass every comparison above.
if (fromSource.leaves === 0) problems.push('the receipt covers no works')

if (problems.length) {
  console.error(`check-receipt: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `check-receipt: ${fromSource.leaves} works fold to ${fromSource.term.slice(0, 14)}… ` +
    `-- feed, bibliography and declared receipt agree, order-invariantly`
)
