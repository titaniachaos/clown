#!/usr/bin/env node
// Emits the deadlines worth acting on, as a GitHub issue body.
//
// The pipeline is data and `npm run funding` reads it, which means it gets read
// when someone remembers to read it. Deadlines are exactly the thing you forget
// on the week you are busy. This runs on a schedule and puts the near ones
// where they will be seen.
//
// Prints nothing when nothing is due, so the workflow can close the issue
// rather than leave a stale one open.
//
// Usage: node scripts/funding-watch.mjs [--within 30] [pipeline.json]

import { readFile } from 'node:fs/promises'

const args = process.argv.slice(2)
const withinIdx = args.indexOf('--within')
const WITHIN = withinIdx >= 0 ? Number(args[withinIdx + 1]) : 30
const file = args.find((a) => a.endsWith('.json')) ?? 'funding/pipeline.json'

const DAY = 86_400_000
const today = new Date(new Date().toISOString().slice(0, 10))
const days = (iso) => Math.round((new Date(iso) - today) / DAY)

const data = JSON.parse(await readFile(file, 'utf8'))
const ACTIONABLE = new Set(['strong', 'reach', 'verify-eligibility'])

const due = data.leads
  .filter(
    (l) =>
      ACTIONABLE.has(l.fit) &&
      l.deadline &&
      l.precision === 'exact' &&
      days(l.deadline) >= 0 &&
      days(l.deadline) <= WITHIN
  )
  .sort((a, b) => days(a.deadline) - days(b.deadline))

if (!due.length) process.exit(0)

const age = -days(data.verified)
const lines = [
  `_${due.length} funding deadline${due.length > 1 ? 's' : ''} within ${WITHIN} days._`,
  ''
]

for (const l of due) {
  const d = days(l.deadline)
  const unsure = l.fit === 'verify-eligibility'
  lines.push(`### ${d} day${d === 1 ? '' : 's'} — ${l.name}`)
  lines.push('')
  lines.push(`**${l.deadline}** · ${l.body} · ${l.kind}${unsure ? ' · **eligibility unconfirmed**' : ''}`)
  lines.push('')
  lines.push(l.note)
  lines.push('')
  lines.push(l.url)
  lines.push('')
}

const unsure = due.filter((l) => l.fit === 'verify-eligibility')
if (unsure.length) {
  lines.push('---')
  lines.push('')
  lines.push(
    `⚠️ ${unsure.length} of these has eligibility unconfirmed. Settle that before drafting — a deadline spent on an ineligible application is spent.`
  )
  lines.push('')
}

lines.push('---')
lines.push('')
lines.push(
  `Checked ${age} day${age === 1 ? '' : 's'} ago${age > 90 ? ' — **stale, re-verify before writing**' : ''}. ` +
    'Run `npm run funding` for the full pipeline, `npm run budget` to cost it.'
)
lines.push('')
lines.push('<sub>Opened automatically from `funding/pipeline.json`. Closes itself when nothing is due.</sub>')

console.log(lines.join('\n'))
