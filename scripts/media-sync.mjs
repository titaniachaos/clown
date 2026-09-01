#!/usr/bin/env node
// Refreshes the borrowed media index from the main site.
//
// the blog's photographs live on titaniachaos.github.io. This repository
// stores no image files at all -- only `docs/.vitepress/media-index.json`, a
// copy of what that site publishes at `/media.json`: ids, tags, dimensions,
// alt text and captions in three languages, and the absolute URLs the pages
// point at.
//
// It is committed rather than fetched at build time so this repository builds
// with no network and no sibling checkout, which is what CI and a fresh clone
// both need. The cost of that is drift, and this is what pays it: run it when
// the main site publishes or re-captions a frame.
//
// Prefers the sibling checkout, because that is the version about to be
// deployed rather than the one currently live; falls back to the network.
//
// Usage:  node scripts/media-sync.mjs [--from <path-or-url>]

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEST = join(ROOT, 'docs/.vitepress/media-index.json')
const SIBLING = resolve(ROOT, '..', 'titaniachaos.github.io/docs/public/media.json')
const LIVE = 'https://titaniachaos.com/media.json'

const from = process.argv.includes('--from') ? process.argv[process.argv.indexOf('--from') + 1] : null

async function fetchIndex() {
  if (from) {
    return /^https?:/i.test(from)
      ? { text: await (await fetch(from)).text(), where: from }
      : { text: await readFile(from, 'utf8'), where: from }
  }
  try {
    return { text: await readFile(SIBLING, 'utf8'), where: 'the sibling checkout' }
  } catch {
    const res = await fetch(LIVE)
    if (!res.ok) throw new Error(`${LIVE} returned ${res.status}`)
    return { text: await res.text(), where: LIVE }
  }
}

const { text, where } = await fetchIndex()
const index = JSON.parse(text)
if (!Array.isArray(index.media)) throw new Error('that is not a media index — no `media` array')

const before = await readFile(DEST, 'utf8').catch(() => '')
const after = JSON.stringify(index, null, 2) + '\n'

// Which frames the journal actually points at, so a sync says whether it broke
// anything rather than only that it changed something.
const used = new Set()
for (const locale of ['docs/blog', 'docs/bg/blog', 'docs/de/blog']) {
  const { readdir } = await import('node:fs/promises')
  for (const name of await readdir(join(ROOT, locale)).catch(() => [])) {
    if (!name.endsWith('.md')) continue
    const post = await readFile(join(ROOT, locale, name), 'utf8')
    for (const m of post.matchAll(/<MediaFigure[^>]*\bid="([^"]+)"/g)) used.add(m[1])
  }
}
const have = new Set(index.media.map((f) => f.id))
const missing = [...used].filter((id) => !have.has(id))

if (before === after) {
  console.log(`media-sync: already current (${index.media.length} frames, from ${where})`)
} else {
  await writeFile(DEST, after)
  console.log(`media-sync: ${index.media.length} frames from ${where}`)
}

if (missing.length) {
  console.error(
    `\nmedia-sync: the journal names ${missing.length} frame(s) the index does not have:\n  ` +
      missing.join(', ') +
      '\n\nThey were probably unpublished or renamed on the main site. Those figures\n' +
      'will render as nothing until the posts are updated or the frames return.'
  )
  process.exit(1)
}
