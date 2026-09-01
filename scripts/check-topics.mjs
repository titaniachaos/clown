#!/usr/bin/env node
// Checks that the tags mean the same thing in all three languages.
//
// Every post carried a `tags:` list, and for a long time nothing read it. That
// is how `twenty-solitudes` came to be an `exercise` about the `audience` in
// English and a `field-note` about `Performance` in German: nothing compared
// them, so nothing could notice. Now the tags build the topic pages, and a
// disagreement is not a private inconsistency -- it is a page that appears
// under one heading for German readers and another for everybody else.
//
// The written pages carry them too, so a topic collects the standing account
// of something as well as the diary entries about it.
//
// Four things are checked:
//   1. every tag is in the closed vocabulary (a typo is a dead link, not a
//      new topic);
//   2. the three languages of one file carry identical tags;
//   3. every post and page has at least one, so it is reachable from a topic;
//   4. `<PageTopics />` is written on the home pages and nowhere else -- the
//      layout renders it for every page that has a doc-after slot, and the
//      home layout has none.
//
// Usage: node scripts/check-topics.mjs

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LANGS = ['en', 'bg', 'de']

/** The blog, then the written pages. `topic/` is generated, not written. */
const SOURCES = [
  { kind: 'post', dir: (lang) => join(ROOT, 'docs', lang === 'en' ? 'blog' : `${lang}/blog`), skip: ['index.md'] },
  { kind: 'page', dir: (lang) => join(ROOT, 'docs', lang === 'en' ? '' : lang), skip: [] }
]

// Read the vocabulary out of the module rather than restating it here; a check
// with its own copy of the list is a check that can be wrong.
const topicsSource = await readFile(join(ROOT, 'docs/.vitepress/topics.ts'), 'utf8')
const block = /export const TOPICS = \[([\s\S]*?)\] as const/.exec(topicsSource)?.[1] ?? ''
const VOCABULARY = [...block.matchAll(/'([a-z-]+)'/g)].map((m) => m[1])
if (VOCABULARY.length === 0) {
  console.error('check-topics: could not read TOPICS out of docs/.vitepress/topics.ts')
  process.exit(1)
}

const problems = []
const add = (m) => problems.push(m)

/** `${kind}/${slug}` -> lang -> tags */
const byFile = new Map()

/** lang -> whether its home page writes <PageTopics /> itself. */
/**
 * Pages that are an instrument rather than a piece of writing.
 *
 * `filing` arranges every tagged page and post in the workspace, one to each
 * topic, using each exactly once. Tag it and it becomes a twelfth piece and
 * files itself: the count went from 1482 filings to 8238, and "eleven pieces
 * of writing" stopped being true on the page that says it.
 *
 * So it carries no tags on purpose, and the rule that every page carries some
 * says so here rather than being quietly weakened for everything.
 */
const INSTRUMENTS = ['filing']

const homes = {}

for (const { kind, dir: dirOf, skip } of SOURCES) {
  for (const lang of LANGS) {
    const dir = dirOf(lang)
    const names = (await readdir(dir).catch(() => []))
      .filter((n) => n.endsWith('.md') && !skip.includes(n) && !n.startsWith('['))
    for (const name of names.sort()) {
      const slug = name.replace(/\.md$/, '')
      const where = `${lang}/${kind === 'post' ? 'blog/' : ''}${slug}`
      const source = await readFile(join(dir, name), 'utf8')

      // The chips come from the doc-after slot everywhere but the home page,
      // whose layout has none. Written anywhere else they would appear twice.
      const writesChips = /<PageTopics\s*\/>/.test(source)
      if (kind === 'page' && slug === 'index') homes[lang] = writesChips
      else if (writesChips) {
        add(`${where}: writes <PageTopics /> and the layout renders it too -- the chips would appear twice`)
      }

      const line = /^tags: \[(.*)\]$/m.exec(source)
      if (!line) {
        if (!(kind === 'page' && INSTRUMENTS.includes(slug))) add(`${where}: no tags`)
        continue
      }
      if (kind === 'page' && INSTRUMENTS.includes(slug)) {
        add(`${where}: an instrument may not carry tags — it would file itself`)
        continue
      }
      const tags = [...line[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      if (tags.length === 0) add(`${where}: tags list is empty -- it appears on no topic page`)

      for (const tag of tags) {
        if (!VOCABULARY.includes(tag)) {
          add(`${where}: "${tag}" is not in the vocabulary -- its chip links to a page that is not built`)
        }
      }
      const key = `${kind}/${slug}`
      if (!byFile.has(key)) byFile.set(key, {})
      byFile.get(key)[lang] = tags
    }
  }
}

for (const lang of LANGS) {
  if (homes[lang] === false) {
    add(`${lang}/index: no <PageTopics /> -- the home layout has no slot for it, so this page has no chips`)
  }
}

for (const [key, langs] of byFile) {
  // `post/twenty-solitudes` -> `blog/twenty-solitudes`, `page/sources` -> `sources`:
  // the path a reader would recognise, not the bookkeeping key.
  const name = key.startsWith('post/') ? `blog/${key.slice(5)}` : key.slice(5)
  const reference = langs.en
  if (!reference) {
    add(`${name}: no English file to compare the translations against`)
    continue
  }
  for (const lang of LANGS.slice(1)) {
    const tags = langs[lang]
    if (!tags) continue // check-locales reports the missing translation itself
    const missing = reference.filter((t) => !tags.includes(t))
    const extra = tags.filter((t) => !reference.includes(t))
    if (missing.length || extra.length) {
      add(
        `${lang}/${name}: tags differ from English` +
          (missing.length ? ` -- missing ${missing.join(', ')}` : '') +
          (extra.length ? ` -- has ${extra.join(', ')}` : '')
      )
    }
  }
}

// A vocabulary word nobody uses builds a page with nothing on it. Not an
// error -- the word may be waiting for the post that needs it -- but it should
// be said out loud rather than discovered by a reader.
const used = new Set([...byFile.values()].flatMap((l) => l.en ?? []))
const unused = VOCABULARY.filter((t) => !used.has(t))

if (problems.length) {
  console.error(`check-topics: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

const posts = [...byFile.keys()].filter((k) => k.startsWith('post/')).length
console.log(
  `check-topics: ${posts} posts and ${byFile.size - posts} pages x ${LANGS.length} languages -- ` +
    `same tags, all ${VOCABULARY.length} in the vocabulary`
)
if (unused.length) console.log(`  no posts yet: ${unused.join(', ')}`)
