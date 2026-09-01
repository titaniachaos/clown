#!/usr/bin/env node
// The citations have to be one thing, said one way.
//
// There are two of them. `sources.data.ts` and `bibliography.ts` hold the
// records structured, and `sources.md` writes the same ledger out again in
// prose, with its own APA references. Two copies of a citation drift, and
// these had:
//
//   Three DOIs existed only in the prose — Arendt's Ideology and terror,
//   Lecoq's Le corps poétique, Laughery's L'écoute et la chute. The
//   bibliography, which is what the Atom feed and the receipt are built from,
//   had no locator for any of them. So the same source was a link on one page
//   and bare text on another, which is what "some have links and some do not"
//   turned out to mean.
//
//   The ledger carried its own `ref` field holding a DOI the bibliography
//   already had, rendered as plain text while the bibliography rendered a
//   link. One identifier, two spellings, one of them not clickable.
//
// So this checks that the two agree, and that a locator has one shape.
//
// Usage: node scripts/check-citations.mjs

import { readFile } from 'node:fs/promises'
import { WORKS } from '../docs/.vitepress/bibliography.ts'

const problems = []
const notes = []
const add = (message) => problems.push(message)

const prose = await readFile('docs/sources.md', 'utf8')

// ---- one shape per locator -------------------------------------------------

for (const work of WORKS) {
  if (work.doi) {
    if (/^https?:/i.test(work.doi)) {
      add(`${work.id}: doi is a URL — store the bare identifier, the renderer adds https://doi.org/`)
    }
    if (!/^10\.\d{4,9}\//.test(work.doi)) add(`${work.id}: "${work.doi}" is not a DOI`)
  }
  if (work.url && !/^https:\/\//.test(work.url)) {
    add(`${work.id}: url is not an absolute https address`)
  }
  if (work.doi && work.url) {
    notes.push(`${work.id} carries both a DOI and a URL; APA prefers the DOI`)
  }
  if (!work.records.length) add(`${work.id}: cited by no ledger record`)
}

// ---- the two copies must agree ---------------------------------------------

// Take everything up to whitespace, then trim the sentence punctuation. A
// lazy match with a lookahead on `.` stops inside `10.1017`, which is how this
// first reported that sources.md cites a work called "10".
const proseDois = new Set(
  [...prose.matchAll(/https:\/\/doi\.org\/(\S+)/g)].map((m) => m[1].replace(/[.,;)\]]+$/, ''))
)
const knownDois = new Set(WORKS.filter((w) => w.doi).map((w) => w.doi))

for (const doi of proseDois) {
  if (!knownDois.has(doi)) {
    add(`sources.md cites ${doi}, which no work in the bibliography carries`)
  }
}

// There is no reverse check any more, and that is the point of the change that
// removed it. The prose used to print its own references, so a DOI the
// bibliography had and the prose lacked was a link a reader could not follow;
// now the ledger renders from the data and every locator reaches the page by
// construction. What remains worth checking is the direction above: a
// reference written by hand in Markdown must still exist in the bibliography.

// ---- what a type promises --------------------------------------------------

const REQUIRED = {
  chapter: ['container'],
  article: ['container'],
  thesis: ['institution', 'descriptor'],
  web: ['url'],
  book: []
}

for (const work of WORKS) {
  for (const field of REQUIRED[work.type] ?? []) {
    if (!work[field]) add(`${work.id}: a ${work.type} needs ${field}`)
  }
}

// ---- reading and reachability ----------------------------------------------
//
// A note rather than a failure, and deliberately so. The honest options for a
// work read at first hand with no locator are a link, or a sentence saying
// which copy was read -- and only the person who read it can write that. A
// check cannot close this gap, so it names it and leaves it open.
const unreachable = WORKS.filter((w) => w.read === 'full-text' && !w.doi && !w.url)
for (const work of unreachable) {
  notes.push(`${work.id}: read at first hand, and nothing on the page says where`)
}

if (problems.length) {
  console.error(`check-citations: ${problems.length} problem(s)\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

const withLocator = WORKS.filter((w) => w.doi || w.url).length
console.log(
  `check-citations: ${WORKS.length} works — ${withLocator} reachable, ` +
    `every DOI bare, every URL absolute, every type complete, prose and bibliography agree`
)
if (notes.length) {
  console.log(`  ${notes.length} note(s):`)
  for (const note of notes.slice(0, 8)) console.log(`    ${note}`)
  if (notes.length > 8) console.log(`    … and ${notes.length - 8} more`)
}
