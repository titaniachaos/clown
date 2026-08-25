#!/usr/bin/env node
// Finds authorities the pages lean on that the ledger does not carry.
//
// This is the scan that turned up Purcell Gates, Laughery, Grock and Orwell:
// four names doing real work in the argument, none of them a record. It was
// run once, by hand, and a scan run once only tells you about the day it ran.
//
// It reports and never fails. A new name on a page is not an error -- it is a
// prompt to decide whether the project is citing someone, and to give them a
// record with a status if it is.
//
// Only the English pages are scanned: the other two transliterate the names
// (Пърсел Гейтс, Бергсон), and check-locales already guarantees the three
// languages carry the same structure.
//
// Usage: node scripts/check-claims.mjs [docsDir] [ledgerFile]

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const docs = process.argv[2] ?? 'docs'
const ledgerFile = process.argv[3] ?? 'docs/.vitepress/sources.data.ts'

/**
 * Capitalised words that are not authorities: the project's own vocabulary,
 * its places, and the ordinary furniture of English sentences. Anything not
 * here and not in a citation gets reported -- so this list stays short on
 * purpose, and a name arriving in it should be a deliberate decision.
 */
const NOT_AUTHORITIES = new Set([
  // the project
  'Titania', 'Chaos', 'Solo', 'Clown', 'Clowns', 'Auguste', 'Bouffon', 'Whiteface',
  'Movement', 'Movements', 'Mode', 'Modes', 'Phase', 'Week', 'Weeks', 'Studio',
  'Project', 'Concept', 'Dramaturgy', 'Production', 'Sources', 'Home', 'Work',
  // places, institutions and languages already inside citations
  'Vienna', 'Austria', 'Bulgaria', 'France', 'French', 'English', 'German', 'Bulgarian',
  'BnF', 'CNAC', 'Glasgow', 'Cape', 'Town', 'Palgrave', 'Heinemann', 'Fabula', 'Crossref',
  // sentence furniture that survives the filter
  'The', 'This', 'That', 'These', 'Those', 'There', 'Their', 'They', 'Then', 'Than',
  'What', 'When', 'Where', 'Which', 'Who', 'Whose', 'Why', 'How', 'Every', 'Each',
  'Any', 'All', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'It', 'Its', 'If', 'In', 'On', 'At', 'To', 'A', 'An', 'And', 'But', 'Or',
  'For', 'From', 'With', 'Without', 'Before', 'After', 'Because', 'Both', 'Not', 'No',
  'Nothing', 'Nobody', 'Something', 'Someone', 'Several', 'Some', 'Many', 'Most',
  'Read', 'Keep', 'Build', 'Test', 'Run', 'Use', 'Let', 'Take', 'Give', 'Make', 'Do',
  'Repeat', 'Record', 'Compare', 'Rehearse', 'Observe', 'Generate', 'Cut', 'Place',
  'Send', 'Decide', 'Settle', 'Bring', 'Contact', 'Support', 'Co', 'Direct', 'Sound',
  'Light', 'Silence', 'Laughter', 'Failure', 'Solitude', 'Loneliness', 'Isolation',
  'Language', 'Wordlessness', 'Absence', 'Complicity', 'Presence', 'Audience'
])

const ledger = await readFile(ledgerFile, 'utf8')
const cited = [...ledger.matchAll(/work: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]).join(' | ')

async function englishPages(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    // bg/ and de/ transliterate; the English pages are the reference
    if (entry.isDirectory()) continue
    if (entry.name.endsWith('.md')) out.push(join(dir, entry.name))
  }
  return out
}

const mentions = new Map() // name -> Set of files

/**
 * A capitalised word is not evidence of anything: the pages are full of list
 * items and headings that begin with one. What identifies a cited person is
 * the shape around the name, and there are only three that matter here:
 *
 *   Orwell's hands                 a possessive
 *   Vincent Laughery, « ... »      a given name before it
 *   Grock, *Life's a Lark*         a title or a year after it
 */
const POSSESSIVE = /\b([A-Z][a-z]{2,})['’]s\b/g
const GIVEN_NAME = /\b[A-Z][a-z]{2,}\s+([A-Z][a-z]{2,})\b/g
const BEFORE_TITLE = /\b([A-Z][a-z]{2,}),\s*(?:[*“„«]|\(\d{4}\)|\d{4})/g

for (const file of await englishPages(docs)) {
  const text = (await readFile(file, 'utf8')).replace(/^---\n[\s\S]*?\n---\n/, '')

  // Two capitalised words inside a work's own title -- *The End of the Tunnel*
  // -- are the title, not a person. The other two shapes need the emphasis
  // markers left alone, since a title is exactly what follows the name.
  const outsideTitles = text.replace(/\*{1,2}[^*\n]+\*{1,2}/g, ' ')

  const found = (shape, where) => {
    for (const m of where.matchAll(shape)) {
      const name = m[1]
      if (NOT_AUTHORITIES.has(name)) continue
      if (cited.includes(name)) continue
      if (!mentions.has(name)) mentions.set(name, new Set())
      mentions.get(name).add(file.replace(`${docs}/`, ''))
    }
  }

  found(POSSESSIVE, text)
  found(GIVEN_NAME, outsideTitles)
  found(BEFORE_TITLE, text)
}

const leaned = [...mentions.entries()]
  .map(([name, files]) => ({ name, files: [...files] }))
  .sort((a, b) => b.files.length - a.files.length)

const total = [...ledger.matchAll(/id: '[\w-]+'/g)].length
console.log(`\ncheck-claims: ${total} records in the ledger`)

if (leaned.length === 0) {
  console.log('  every authority the English pages name is carried by a record')
} else {
  console.log(`  ${leaned.length} name(s) on the pages that no record cites:\n`)
  for (const { name, files } of leaned) {
    console.log(`  ${name.padEnd(18)} ${files.join(', ')}`)
  }
  console.log('\n  Each is either a source that needs a record and a status, or a word')
  console.log('  for the list in this script. Neither is an error; both are a decision.')
}
console.log()
