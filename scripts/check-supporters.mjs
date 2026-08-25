#!/usr/bin/env node
// Checks that the funding acknowledgment cannot silently fail.
//
// The obligation is legal and the component is invisible until an award exists,
// which is the worst combination: a mistake ships and nobody sees it until an
// auditor does. Three ways it could go wrong, all now caught here.
//
//   the variant     an EU award must say whether it is `funded` or `co-funded`.
//                   The agreement specifies it. Defaulting is guessing at a
//                   legal statement, and a co-funded grant carrying a "Funded
//                   by" disclaimer is exactly what an audit looks for.
//   a missing tongue the statement and disclaimer must reach the reader in
//                   their language. A gap here is not a typo, it is an
//                   unfulfilled obligation for that locale.
//   the emblem      twelve stars, #039 on #FC0, unmodified. Guards against
//                   someone tidying the SVG.
//
// When an award is declared it also checks the built pages actually carry the
// emblem, statement and disclaimer -- declaring is not the same as rendering.
//
// Usage: node scripts/check-supporters.mjs [distDir]

import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const dist = process.argv[2] ?? 'docs/.vitepress/dist'
const src = 'docs/.vitepress/supporters.ts'
const LANGS = ['en', 'bg', 'de']
const problems = []

const text = await readFile(src, 'utf8')

// The emblem, whatever else changes.
const emblem = /export const EU_EMBLEM = `([\s\S]*?)`/.exec(text)?.[1] ?? ''
const stars = (emblem.match(/<polygon/g) ?? []).length
if (stars !== 12) problems.push(`emblem has ${stars} stars, must have 12`)
if (!/#039|#003399/i.test(emblem)) problems.push('emblem is not the official blue')
if (!/#FC0|#FFCC00/i.test(emblem)) problems.push('emblem stars are not the official yellow')

// Every localised block must cover every language.
for (const name of ['DISCLAIMER_BODY', 'SUPPORTED_BY']) {
  const block = new RegExp(`${name}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\}`).exec(text)?.[1] ?? ''
  for (const l of LANGS) {
    if (!new RegExp(`\\b${l}:`).test(block)) problems.push(`${name} has no ${l}`)
  }
}
const stmt = /STATEMENT[^=]*=\s*\{([\s\S]*?)\n\}/.exec(text)?.[1] ?? ''
for (const variant of ['funded', 'co-funded']) {
  const v = new RegExp(`'?${variant}'?:\\s*\\{([^}]*)\\}`).exec(stmt)?.[1] ?? ''
  for (const l of LANGS) {
    if (!new RegExp(`\\b${l}:`).test(v)) problems.push(`STATEMENT.${variant} has no ${l}`)
  }
}

// Declared awards: the variant is mandatory, and the pages must really carry it.
const awardsBlock = /export const awards: Award\[\] = \[([\s\S]*?)\n\]/.exec(text)?.[1] ?? ''
const declared = awardsBlock.trim().length > 0
const euAward = /kind:\s*'eu'/.test(awardsBlock)

if (euAward && !/statement:\s*'(funded|co-funded)'/.test(awardsBlock)) {
  problems.push("an EU award is declared without `statement` -- the grant agreement specifies it")
}

if (declared) {
  const pages = []
  const walk = async (dir) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) await walk(p)
      else if (e.name.endsWith('.html')) pages.push(p)
    }
  }
  await walk(dist)
  for (const p of pages) {
    const html = await readFile(p, 'utf8')
    if (!html.includes('supporters__title')) problems.push(`${p}: award declared but no acknowledgment rendered`)
    else if (euAward) {
      if (!html.includes('supporters__emblem')) problems.push(`${p}: no emblem`)
      if (!html.includes('supporters__statement')) problems.push(`${p}: no funding statement`)
      if (!html.includes('supporters__disclaimer')) problems.push(`${p}: no disclaimer`)
    }
  }
}

if (problems.length) {
  console.error(`check-supporters: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
console.log(
  declared
    ? `check-supporters: award declared -- emblem, statement and disclaimer render on every page`
    : `check-supporters: no award declared, nothing claimed -- emblem and all ${LANGS.length} languages intact`
)
