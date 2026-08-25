#!/usr/bin/env node
import { readFile } from 'node:fs/promises'

const [config, fairPay, css, en, bg, de, studio, bgConcept, deConcept, bgStudio, deStudio, bgSources, deSources] = await Promise.all([
  readFile('docs/.vitepress/config.mts', 'utf8'),
  readFile('docs/.vitepress/theme/FairPay.vue', 'utf8'),
  readFile('docs/.vitepress/theme/custom.css', 'utf8'),
  readFile('docs/production.md', 'utf8'),
  readFile('docs/bg/production.md', 'utf8'),
  readFile('docs/de/production.md', 'utf8'),
  readFile('docs/studio-process.md', 'utf8'),
  readFile('docs/bg/concept.md', 'utf8'),
  readFile('docs/de/concept.md', 'utf8'),
  readFile('docs/bg/studio-process.md', 'utf8'),
  readFile('docs/de/studio-process.md', 'utf8'),
  readFile('docs/bg/sources.md', 'utf8'),
  readFile('docs/de/sources.md', 'utf8')
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

requireText(en, 'outline: [2, 3]', 'English Production outline must expose H2 sections and H3 groups')
for (const page of [bg, de]) requireText(page, 'outline: [2, 2]', 'Translated Production outlines must remain H2-only')

for (const heading of ['### The world', '### Presence & absence', "### The clown's language", '### Material & form']) {
  requireText(en, heading, `English Production group missing: ${heading}`)
}
const disclosures = (en.match(/<QuestionDisclosure title=/g) ?? []).length
if (disclosures !== 12) problems.push(`English Production must contain 12 individual disclosures, found ${disclosures}`)
for (const removed of ['## About the project', '### Purpose', '### Working areas']) {
  if (en.includes(removed)) problems.push(`English Production retains removed meta section: ${removed}`)
}

for (const heading of [
  '## The process',
  '## Working principles',
  '## Studio tools',
  '## What this process does not decide',
  '## What survives the studio'
]) requireText(studio, heading, `English Studio section missing: ${heading}`)

for (const phrase of [
  'Twelve-week studio process',
  'Seven-movement',
  'The discrimination run',
  'npm run flop:score',
  'The flop scale',
  'Two and two make five'
]) {
  if (studio.toLowerCase().includes(phrase.toLowerCase())) {
    problems.push(`English Studio retains archived method: ${phrase}`)
  }
}
if (/Weeks?\s+\d/i.test(studio)) problems.push('English Studio retains a fixed week assignment')
requireText(studio, 'outline: [2, 2]', 'English Studio outline must expose major H2 sections only')

for (const [name, source, required] of [
  ['Bulgarian Work', bgConcept, 'Все още нямам отговор, на който вярвам.'],
  ['German Work', deConcept, 'Ich habe noch keine Antwort, der ich vertraue.'],
  ['Bulgarian Studio', bgStudio, 'Създай условието, вместо да караш Титания да го представя.'],
  ['German Studio', deStudio, 'Erzeuge die Bedingung, statt Titania aufzufordern, sie darzustellen.'],
  ['Bulgarian Sources', bgSources, 'Изследването изостря наблюдението. Студиото решава какво става играемо.'],
  ['German Sources', deSources, 'Forschung schärft die Beobachtung. Das Studio entscheidet, was spielbar wird.']
]) requireText(source, required, `${name} lost an approved uncertainty or method statement`)

for (const [name, source, required] of [
  ['Bulgarian Sources', bgSources, ['Карта на изследването', 'Въпроси и противоречия', 'Регистър на източниците', 'Граници и корекции', 'Основни източници', 'Накъде оттук', 'изпълнителката лично е прочела цялото произведение']],
  ['German Sources', deSources, ['Eine Karte der Forschung', 'Fragen und Widersprüche', 'Das Quellenverzeichnis', 'Grenzen und Korrekturen', 'Wichtige Referenzen', 'Wie es weitergeht', 'bedeutet **nicht**, dass die Performerin das gesamte Werk persönlich gelesen hat']]
]) {
  for (const phrase of required) requireText(source, phrase, `${name} lost provenance structure: ${phrase}`)
}

for (const [name, source, forbidden] of [
  ['Bulgarian Sources', bgSources, ['Седем движения', 'Девет режима', 'Скалата на флоповете', 'Две и две правят пет']],
  ['German Sources', deSources, ['Sieben Bewegungen', 'Neun Spielarten', 'Flop-Skala', 'Zwei und zwei macht fünf']]
]) {
  for (const phrase of forbidden) if (source.includes(phrase)) problems.push(`${name} retains archived research: ${phrase}`)
}

for (const [name, source, forbidden] of [
  ['Bulgarian Studio', bgStudio, ['Скалата на флоповете', 'Две и две правят пет', 'дванадесетседмичен']],
  ['German Studio', deStudio, ['Flop-Skala', 'Zwei und zwei macht fünf', 'Zwölfwöchiger']],
  ['Bulgarian Work', bgConcept, ['Седем движения', 'Девет режима']],
  ['German Work', deConcept, ['Sieben Bewegungen', 'Neun Spielarten']]
]) {
  for (const phrase of forbidden) if (source.includes(phrase)) problems.push(`${name} retains archived structure: ${phrase}`)
}

for (const token of [
  '--vp-font-family-base: Inter, ui-sans-serif, system-ui, sans-serif',
  '.vp-doc { font-size: 16px; line-height: 1.75; }',
  'max-width: 70ch',
  'text-wrap: balance',
  'hyphens: auto'
]) requireText(css, token, `typography contract missing: ${token}`)

for (const token of [
  '.question-disclosure summary',
  '.question-disclosure summary:focus-visible',
  '.question-disclosure__answer'
]) requireText(css, token, `Production disclosure styling missing: ${token}`)

if (problems.length) {
  console.error(`check-ecosystem: ${problems.length} problem(s)\n`)
  problems.forEach((p) => console.error(`  ${p}`))
  process.exit(1)
}

console.log('check-ecosystem: reciprocal links, translated Production copy, Fair Pay and typography are aligned')
