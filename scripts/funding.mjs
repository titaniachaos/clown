#!/usr/bin/env node
// Reports the funding pipeline against today's date.
//
// A table of deadlines in a document is wrong the moment it is written: the
// dates do not move but the distance to them does, and the one that matters is
// always the nearest. So the pipeline is data and the ordering is computed.
//
// It also tracks its own decay. Call dates shift and aggregator sites lag, so
// every lead carries the date it was checked, and the report says how stale
// that is rather than presenting it as current fact.
//
// Leads that are ruled out are kept, not deleted -- knowing a programme is
// discontinued is worth as much as knowing one is open, and both cost the same
// afternoon to rediscover.
//
// Nothing here is published: funding/ sits outside docs/, so it is not part of
// the site build.
//
// Usage: node scripts/funding.mjs [--all] [pipeline.json]

import { readFile } from 'node:fs/promises'

const args = process.argv.slice(2)
const showAll = args.includes('--all')
const file = args.find((a) => !a.startsWith('--')) ?? 'funding/pipeline.json'

const DAY = 86_400_000
const today = new Date(new Date().toISOString().slice(0, 10))

const data = JSON.parse(await readFile(file, 'utf8'))

/** Ruled out, but kept on the record so it is not researched twice. */
const CLOSED = new Set(['discontinued', 'not-applicable'])

const days = (iso) => Math.round((new Date(iso) - today) / DAY)

function when(lead) {
  if (lead.precision === 'rolling') return { label: 'rolling', sort: 9e5 }
  if (lead.precision === 'discontinued') return { label: 'discontinued', sort: 9e6 }
  if (!lead.deadline) return { label: 'date unknown', sort: 8e5 }
  const d = days(lead.deadline)
  const approx = lead.precision === 'expected' ? '~' : ''
  if (d < 0) return { label: `${approx}closed ${-d}d ago`, sort: 9e5 + 1 }
  return { label: `${approx}${d}d — ${lead.deadline}`, sort: d }
}

const rows = data.leads
  .filter((l) => showAll || !CLOSED.has(l.fit))
  .map((l) => ({ ...l, w: when(l) }))
  .sort((a, b) => a.w.sort - b.w.sort)

const pad = (s, n) => {
  const t = String(s)
  return (t.length > n ? `${t.slice(0, n - 2)}\u2026 ` : t).padEnd(n)
}
console.log()
console.log(`  ${pad('when', 22)}${pad('lead', 46)}${pad('kind', 12)}fit`)
console.log(`  ${'-'.repeat(22)}${'-'.repeat(46)}${'-'.repeat(12)}${'-'.repeat(18)}`)

let urgent = 0
for (const l of rows) {
  const d = l.precision === 'exact' && l.deadline ? days(l.deadline) : null
  const soon = d !== null && d >= 0 && d <= 45
  if (soon && ['strong', 'reach'].includes(l.fit)) urgent++
  const mark = soon ? '!' : ' '
  console.log(`${mark} ${pad(l.w.label, 22)}${pad(l.name, 46)}${pad(l.kind, 12)}${l.fit}`)
}

console.log()
for (const l of rows) {
  const d = l.precision === 'exact' && l.deadline ? days(l.deadline) : null
  if (d !== null && d >= 0 && d <= 45 && ['strong', 'reach'].includes(l.fit)) {
    console.log(`  ! ${l.name} — ${d} days`)
    console.log(`      ${l.note}`)
    console.log(`      ${l.url}`)
    console.log()
  }
}

const age = days(data.verified) * -1
const stale = age > 90
console.log(
  `  ${rows.length} live leads · ${urgent} inside 45 days · checked ${age}d ago` +
    (stale ? ' — STALE, re-verify before writing' : '')
)
if (!showAll) {
  const hidden = data.leads.length - rows.length
  if (hidden) console.log(`  ${hidden} ruled out and kept on record (--all to show)`)
}
console.log()
