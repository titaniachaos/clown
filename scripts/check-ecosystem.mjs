#!/usr/bin/env node
import { readFile } from 'node:fs/promises'

const [config, fairPay, css, en, bg, de] = await Promise.all([
  readFile('docs/.vitepress/config.mts', 'utf8'),
  readFile('docs/.vitepress/theme/FairPay.vue', 'utf8'),
  readFile('docs/.vitepress/theme/custom.css', 'utf8'),
  readFile('docs/production.md', 'utf8'),
  readFile('docs/bg/production.md', 'utf8'),
  readFile('docs/de/production.md', 'utf8')
])

const problems = []
const requireText = (source, text, message) => {
  if (!source.includes(text)) problems.push(message)
}

for (const prefix of ["MAIN_SITE('')", "MAIN_SITE('/bg')", "MAIN_SITE('/de')"]) {
  requireText(config, prefix, `missing locale-aware main-site navigation: ${prefix}`)
}

for (const label of ['Inside the making', 'В процеса на създаване', 'Einblick in die Entstehung']) {
  requireText(config, label, `Production sidebar label is stale: ${label}`)
}
for (const label of ['Fair pay', 'Справедливо заплащане', 'Faire Bezahlung']) {
  requireText(config, label, `Fair Pay is missing from the Production sidebar: ${label}`)
}

const legacy = [
  ['English', en, ['the flop scale', 'goes straight into studio time']],
  ['Bulgarian', bg, ['скалата на флоповете', 'отива директно в студийно време']],
  ['German', de, ['Flop-Skala', 'geht unmittelbar in Studiozeit']]
]
for (const [name, source, phrases] of legacy) {
  for (const phrase of phrases) if (source.includes(phrase)) problems.push(`${name} Production retains legacy copy: ${phrase}`)
}

for (const amount of ['€227', '€268', '48 rehearsal', '48 Probentage', '48 репетиционни']) {
  if (fairPay.includes(amount)) problems.push(`Fair Pay exposes a legacy rate or calculation: ${amount}`)
}
for (const text of ['Honoraruntergrenze', 'Fair Pay recommendation', 'IG Freie Theaterarbeit']) {
  requireText(fairPay, text, `Fair Pay source contract missing: ${text}`)
}

for (const page of [en, bg, de]) requireText(page, 'outline: [2, 2]', 'Production outline must remain H2-only')

for (const token of [
  '--vp-font-family-base: Inter, ui-sans-serif, system-ui, sans-serif',
  '.vp-doc { font-size: 16px; line-height: 1.75; }',
  'max-width: 70ch',
  'text-wrap: balance',
  'hyphens: auto'
]) requireText(css, token, `typography contract missing: ${token}`)

for (const token of [
  '.vp-doc._clown_production > div > p:has(> strong:only-child)',
  'font-size: 1.75rem',
  '.vp-doc._clown_production > div > p:has(> strong:only-child) + h3',
  'font-size: 1.25rem'
]) requireText(css, token, `Production heading hierarchy missing: ${token}`)

if (problems.length) {
  console.error(`check-ecosystem: ${problems.length} problem(s)\n`)
  problems.forEach((p) => console.error(`  ${p}`))
  process.exit(1)
}

console.log('check-ecosystem: reciprocal links, translated Production copy, Fair Pay and typography are aligned')
