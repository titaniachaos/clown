#!/usr/bin/env node
// Costs the project against the Honoraruntergrenze, and against the ceiling.
//
// Two things a spreadsheet will not tell you.
//
// Vienna's Kuratorium has weighed fee floors in its assessment of applications
// since 2020, and IG Freie Theaterarbeit recommends calculating Einzelförderung
// with them to avoid Sozialdumping. So a rate below the floor is not a saving.
// It is a mark against the application, and this fails on it.
//
// And the individual ceiling is 30,000 EUR. A budget that quietly exceeds it is
// not a bigger ask, it is the wrong form.
//
// The artistic lines are computed from published rates. The rest -- studio,
// design, documentation -- are left null on purpose: they vary too much in
// Vienna to estimate honestly, and a fabricated number in a funding budget is
// worse than a blank one.
//
// Usage: node scripts/budget.mjs [budget.json]

import { readFile } from 'node:fs/promises'

const file = process.argv[2] ?? 'funding/budget.json'
const b = JSON.parse(await readFile(file, 'utf8'))
const { rates, plan, other_lines: other } = b
const eur = (n) => `${n.toLocaleString('de-AT')} €`

const problems = []
const lines = []

const rehearsalDays = plan.rehearsal_weeks * plan.rehearsal_days_per_week
const performerFee = rehearsalDays * plan.performer_day_rate
lines.push([`Performer, rehearsal — ${rehearsalDays} days × ${eur(plan.performer_day_rate)}`, performerFee])

if (plan.performer_day_rate < rates.probe_beginner_day) {
  problems.push(`performer day rate ${eur(plan.performer_day_rate)} is below even the beginner floor of ${eur(rates.probe_beginner_day)}`)
}

let shows = 0
for (let i = 1; i <= plan.performances; i++) {
  shows += i <= 2 ? rates.performance_first_two : rates.performance_from_third
}
lines.push([`Performances — ${plan.performances} (${eur(rates.performance_first_two)} ×2, then ${eur(rates.performance_from_third)})`, shows])

const outsideEye = plan.outside_eye_days * plan.outside_eye_day_rate
lines.push([`Outside eye / dramaturg — ${plan.outside_eye_days} days × ${eur(plan.outside_eye_day_rate)}`, outsideEye])
if (plan.outside_eye_day_rate < rates.probe_beginner_day) {
  problems.push(`outside eye rate ${eur(plan.outside_eye_day_rate)} is below the beginner floor`)
}

const artistic = performerFee + shows + outsideEye

const missing = Object.entries(other).filter(([k, v]) => !k.startsWith('_') && v === null).map(([k]) => k)
const filled = Object.entries(other).filter(([k, v]) => !k.startsWith('_') && typeof v === 'number')
for (const [k, v] of filled) lines.push([k.replace(/_/g, ' '), v])
const rest = filled.reduce((s, [, v]) => s + v, 0)

const total = artistic + rest
const ceiling = b.ceiling.wien_einzelfoerderung_individual

console.log()
for (const [label, amount] of lines) console.log(`  ${label.padEnd(56)}${eur(amount).padStart(12)}`)
console.log(`  ${'-'.repeat(68)}`)
console.log(`  ${'artistic fees, at or above the floor'.padEnd(56)}${eur(artistic).padStart(12)}`)
if (rest) console.log(`  ${'other costs'.padEnd(56)}${eur(rest).padStart(12)}`)
console.log(`  ${'TOTAL so far'.padEnd(56)}${eur(total).padStart(12)}`)
console.log(`  ${`ceiling (Wien Einzelförderung, individual)`.padEnd(56)}${eur(ceiling).padStart(12)}`)
console.log(`  ${'headroom for the unfilled lines'.padEnd(56)}${eur(ceiling - total).padStart(12)}`)
console.log()

// What the same plan would cost at the Fair Pay level rather than the floor.
const fair = rehearsalDays * rates.fairpay_day + shows + plan.outside_eye_days * rates.fairpay_day
console.log(`  At Fair Pay (${eur(rates.fairpay_day)}/day) the artistic fees would be ${eur(fair)}, ${eur(fair - artistic)} more.`)
console.log()

if (missing.length) {
  console.log(`  ${missing.length} line(s) still to quote: ${missing.join(', ')}`)
  console.log(`  These are left blank deliberately. Fill them from real quotes.`)
  console.log()
}

if (total > ceiling) problems.push(`total ${eur(total)} exceeds the individual ceiling of ${eur(ceiling)}`)

if (problems.length) {
  console.error(`budget: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
console.log(`  budget: every artistic rate is at or above the Honoraruntergrenze, total within the ceiling`)
console.log()
