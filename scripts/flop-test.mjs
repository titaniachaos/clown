#!/usr/bin/env node
// Scores the observer test for the flop, and says what the result means.
//
// The question is Davison's: can a room tell a flop played from genuine
// not-knowing from one played as rehearsed craft? He says no -- what an
// audience reads as spontaneity is a learnable technique. The material
// research stakes the comedy on the conviction being real, so the two claims
// cannot both be load-bearing.
//
// The test is a forced choice. Each observer sees paired flops, one genuine
// and one crafted, order randomised, and names the genuine one. Chance is 50%.
//
// Input: a CSV with a header and one row per judgement.
//
//   observer,pair,correct
//   A,1,1
//   A,2,0
//
// `correct` is 1 when the observer named the genuine flop, 0 when they did
// not. Nothing else is needed, and nothing else should be recorded during the
// session -- impressions are what this test exists to replace.
//
// Usage: node scripts/flop-test.mjs results.csv

import { readFile } from 'node:fs/promises'

const path = process.argv[2]
if (!path) {
  console.error('usage: node scripts/flop-test.mjs <results.csv>')
  process.exit(2)
}

// ---- exact binomial, no dependencies ------------------------------------

/** log n! by lgamma, so 120 trials do not overflow a float. */
function logFactorial(n) {
  let total = 0
  for (let i = 2; i <= n; i++) total += Math.log(i)
  return total
}
const logChoose = (n, k) => logFactorial(n) - logFactorial(k) - logFactorial(n - k)

/** P(X >= k) for X ~ Binomial(n, p). */
function upperTail(k, n, p) {
  if (k <= 0) return 1
  let total = 0
  for (let i = k; i <= n; i++) total += Math.exp(logChoose(n, i) + i * Math.log(p) + (n - i) * Math.log(1 - p))
  return Math.min(1, total)
}
const lowerTail = (k, n, p) => (k >= n ? 1 : 1 - upperTail(k + 1, n, p))

/** One-sided 95% upper bound on the true rate, given k of n. */
function upperBound(k, n, confidence = 0.95) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (lowerTail(k, n, mid) > 1 - confidence) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ---- read ----------------------------------------------------------------

const text = await readFile(path, 'utf8')
const rows = text
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))

const header = rows.shift()?.split(',').map((h) => h.trim().toLowerCase()) ?? []
for (const required of ['observer', 'correct']) {
  if (!header.includes(required)) {
    console.error(`flop-test: the CSV needs an "${required}" column; found ${header.join(', ')}`)
    process.exit(2)
  }
}
const iObserver = header.indexOf('observer')
const iCorrect = header.indexOf('correct')

const byObserver = new Map()
let n = 0
let k = 0

for (const row of rows) {
  const cells = row.split(',').map((c) => c.trim())
  const who = cells[iObserver]
  const value = cells[iCorrect]
  if (value !== '0' && value !== '1') {
    console.error(`flop-test: "correct" must be 0 or 1, found "${value}" in: ${row}`)
    process.exit(2)
  }
  const hit = value === '1'
  if (!byObserver.has(who)) byObserver.set(who, { n: 0, k: 0 })
  const record = byObserver.get(who)
  record.n++
  n++
  if (hit) {
    record.k++
    k++
  }
}

if (n === 0) {
  console.error('flop-test: no judgements in the file')
  process.exit(2)
}

// ---- score ---------------------------------------------------------------

const rate = k / n
const p = upperTail(k, n, 0.5)
const pct = (x) => `${(x * 100).toFixed(0)}%`

console.log(`\nObserver test — the flop, genuine against crafted`)
console.log(`${'-'.repeat(52)}`)
console.log(`observers        ${byObserver.size}`)
console.log(`judgements       ${n}`)
console.log(`named correctly  ${k}  (${pct(rate)}, chance is 50%)`)
console.log(`one-sided p      ${p < 0.0001 ? '< 0.0001' : p.toFixed(4)}`)

console.log(`\nper observer`)
const perObserver = [...byObserver.entries()].sort((a, b) => b[1].k / b[1].n - a[1].k / a[1].n)
for (const [who, r] of perObserver) {
  const bar = '#'.repeat(r.k) + '.'.repeat(r.n - r.k)
  console.log(`  ${who.padEnd(10)} ${String(r.k).padStart(2)}/${r.n}  ${bar}`)
}

// One or two sharp-eyed observers should not carry the whole result: the
// judgements are not independent -- same room, same laughter, same material.
const trimmed = perObserver.slice(2).reduce((acc, [, r]) => ({ n: acc.n + r.n, k: acc.k + r.k }), { n: 0, k: 0 })
if (trimmed.n > 0 && byObserver.size > 3) {
  const pTrimmed = upperTail(trimmed.k, trimmed.n, 0.5)
  console.log(
    `\nwithout the two strongest observers: ${trimmed.k}/${trimmed.n} (${pct(trimmed.k / trimmed.n)}), ` +
      `p ${pTrimmed < 0.0001 ? '< 0.0001' : pTrimmed.toFixed(4)}`
  )
}

console.log(`\nverdict`)
if (p <= 0.01) {
  console.log(`  The room can tell. Discrimination is above chance at p <= 0.01.`)
  console.log(`  Davison's claim does not hold for this performer and this material:`)
  console.log(`  genuine not-knowing reads differently, and the strict division of`)
  console.log(`  knowledge between performer and clown is doing real work.`)
} else if (p <= 0.05) {
  console.log(`  Suggestive, not settled. Above chance at p <= 0.05, but these`)
  console.log(`  judgements share a room, a laugh and the same material, so they are`)
  console.log(`  not independent and this threshold is generous. Run it again with`)
  console.log(`  fresh material before recording anything in the ledger.`)
} else {
  const bound = upperBound(k, n, 0.95)
  console.log(`  No detectable difference. This does not prove there is none -- it`)
  console.log(`  bounds it: on this evidence any true discriminability is below`)
  console.log(`  ${pct(bound)}. If the room cannot tell, then "the conviction is real"`)
  console.log(`  is a rehearsal instruction rather than a claim about the audience,`)
  console.log(`  and the material research should say so.`)
}
console.log()
