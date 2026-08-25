#!/usr/bin/env node
// Watches the literature the ledger is built on, for anything new.
//
// The ledger is only honest while it is current: a paradox marked `open` may
// have been settled by someone else last month, and a `probable` attribution
// may now have a better source. Crossref indexes the journals this
// documentation cites, so ask it rather than remembering to look.
//
// Two passes, because a loose keyword search is worthless here -- "training"
// and "failure" belong to cardiology as much as to clowning:
//
//   1. everything published recently in a named set of theatre and humour
//      journals, filtered locally on the project's own vocabulary;
//   2. a search on the words that are distinctive enough to search on their
//      own -- clown, auguste, bouffon, Gaulier, Lecoq, Decroux.
//
// Reports; never fails. A build should not go red because an article exists.
//
// Usage: node scripts/watch-research.mjs [days]   (default 90)

import { appendFile } from 'node:fs/promises'

const days = Number(process.argv[2] ?? 90)
const MAILTO = 'agent@tatianapetkova.com' // Crossref asks callers to identify themselves
const UA = `titaniachaos-research-watch (mailto:${MAILTO})`

/** Journals the documentation cites, or would cite. ISSNs checked at Crossref. */
const JOURNALS = [
  { issn: '1944-3927', name: 'Theatre, Dance and Performance Training', cited: true },
  { issn: '1048-6801', name: 'Contemporary Theatre Review', cited: true },
  { issn: '1352-8165', name: 'Performance Research' },
  { issn: '0307-8833', name: 'Theatre Research International' },
  { issn: '0266-464X', name: 'New Theatre Quarterly' },
  { issn: '2040-610X', name: 'Comedy Studies' },
  { issn: '2307-700X', name: 'The European Journal of Humour Research' },
  { issn: '1468-2761', name: 'Studies in Theatre and Performance' }
]

/** The project's vocabulary. A journal article has to touch one of these. */
const TERMS =
  /\b(clown|clowning|auguste|whiteface|bouffon|buffoon|Gaulier|Lecoq|Decroux|Grock|flop|slapstick|red nose|solitude|loneliness|solo performance|complicit|physical comed|mime)/i

/** A second signal, for hits outside the named journals: "clown" alone also
 *  names a fish, a therapy programme and a Shakespearean role. */
const CONTEXT = /\b(performance|performing|theatre|theater|stage|staged|audience|spectator|circus|comedy|comic|actor|actress|drama|training)/i

/** Distinctive enough to search on across every journal Crossref indexes. */
const SEARCHES = ['clown', 'clowning auguste', 'Gaulier clown', 'Lecoq clown', 'bouffon performance']

const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10)

async function crossref(params) {
  const url = `https://api.crossref.org/works?${params}&mailto=${encodeURIComponent(MAILTO)}`
  try {
    const response = await fetch(url, { headers: { 'user-agent': UA } })
    if (!response.ok) return { error: `Crossref returned ${response.status}` }
    return { items: (await response.json()).message.items ?? [] }
  } catch (error) {
    return { error: String(error.cause?.code ?? error.message) }
  }
}

const seen = new Set()
const hits = []
const notes = []

const record = (item, why) => {
  const doi = item.DOI?.toLowerCase()
  if (!doi || seen.has(doi)) return
  const title = (item.title?.[0] ?? '').replace(/\s+/g, ' ').trim()
  if (!title) return
  seen.add(doi)
  hits.push({
    doi,
    title,
    why,
    journal: item['container-title']?.[0] ?? 'unknown venue',
    year: item.issued?.['date-parts']?.[0]?.[0] ?? '',
    authors: (item.author ?? [])
      .map((a) => [a.given, a.family].filter(Boolean).join(' '))
      .slice(0, 3)
      .join(', ')
  })
}

// Pass 1 -- the named journals, everything recent, filtered on our vocabulary.
for (const journal of JOURNALS) {
  const result = await crossref(
    `filter=issn:${journal.issn},from-created-date:${since},type:journal-article` +
      '&sort=created&order=desc&rows=60&select=title,author,container-title,issued,DOI,abstract'
  )
  if (result.error) {
    notes.push(`${journal.name}: could not be checked (${result.error})`)
    continue
  }
  for (const item of result.items) {
    const text = `${item.title?.[0] ?? ''} ${item.abstract ?? ''}`
    if (TERMS.test(text)) record(item, journal.cited ? 'a journal the ledger already cites' : journal.name)
  }
}

// Pass 2 -- the distinctive words, anywhere.
for (const query of SEARCHES) {
  const result = await crossref(
    `query.bibliographic=${encodeURIComponent(query)}` +
      `&filter=from-created-date:${since},type:journal-article` +
      '&sort=created&order=desc&rows=40&select=title,author,container-title,issued,DOI,abstract'
  )
  if (result.error) {
    notes.push(`search "${query}": could not be run (${result.error})`)
    continue
  }
  // Crossref scores loosely, so the term still has to appear in the title, and
  // the piece has to be about performance rather than about aquaculture.
  for (const item of result.items) {
    const title = item.title?.[0] ?? ''
    const text = `${title} ${item.abstract ?? ''}`
    if (TERMS.test(title) && CONTEXT.test(text)) record(item, `matched "${query}"`)
  }
}

const lines = [`## Clown scholarship since ${since}`, '']

if (hits.length === 0) {
  lines.push('_Nothing new in the watched journals or searches._')
} else {
  const cited = hits.filter((h) => h.why === 'a journal the ledger already cites')
  const rest = hits.filter((h) => h.why !== 'a journal the ledger already cites')

  const render = (h) =>
    `- [${h.title}](https://doi.org/${h.doi}) — ${h.authors || 'no author listed'}, *${h.journal}* ${h.year}`

  if (cited.length) {
    lines.push('### In journals the ledger already cites', '', ...cited.map(render), '')
  }
  if (rest.length) {
    const shown = rest.slice(0, 12)
    lines.push('### Elsewhere', '', ...shown.map((h) => `${render(h)}  \n  <sub>${h.why}</sub>`), '')
    if (rest.length > shown.length) {
      lines.push(`_and ${rest.length - shown.length} more outside the named journals, not listed._`, '')
    }
  }
  lines.push(
    `_${hits.length} item(s). Read what is relevant, then record it in the ledger with a status —` +
      ' an unread source is not a citation._'
  )
}

if (notes.length) lines.push('', '### Not checked', '', ...notes.map((n) => `- ${n}`))

const report = lines.join('\n')
console.log(report)

// In Actions this becomes the job summary, which is where it is actually read.
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${report}\n`)
