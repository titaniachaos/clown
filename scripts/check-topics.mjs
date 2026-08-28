#!/usr/bin/env node
// Checks that the blog's tags mean the same thing in all three languages.
//
// Every post carries a `tags:` list, and for a long time nothing read it. That
// is how `twenty-solitudes` came to be an `exercise` about the `audience` in
// English and a `field-note` about `Performance` in German: nothing compared
// them, so nothing could notice. Now the tags build the topic pages, and a
// disagreement is not a private inconsistency -- it is a post that appears
// under one heading for German readers and another for everybody else.
//
// Three things are checked:
//   1. every tag is in the closed vocabulary (a typo is a dead link, not a
//      new topic);
//   2. the three languages of one post carry identical tags;
//   3. every post has at least one, so it is reachable from a topic page.
//
// Usage: node scripts/check-topics.mjs

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LANGS = ['en', 'bg', 'de']
const dirFor = (lang) => join(ROOT, 'docs', lang === 'en' ? 'blog' : `${lang}/blog`)

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

/** slug -> lang -> tags */
const byPost = new Map()

for (const lang of LANGS) {
  const dir = dirFor(lang)
  const names = (await readdir(dir).catch(() => [])).filter((n) => n.endsWith('.md') && n !== 'index.md')
  for (const name of names.sort()) {
    const slug = name.replace(/\.md$/, '')
    const source = await readFile(join(dir, name), 'utf8')
    const line = /^tags: \[(.*)\]$/m.exec(source)

    if (!line) {
      add(`${lang}/${slug}: no tags`)
      continue
    }
    const tags = [...line[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
    if (tags.length === 0) add(`${lang}/${slug}: tags list is empty -- it appears on no topic page`)

    for (const tag of tags) {
      if (!VOCABULARY.includes(tag)) {
        add(`${lang}/${slug}: "${tag}" is not in the vocabulary -- its chip links to a page that is not built`)
      }
    }
    if (!byPost.has(slug)) byPost.set(slug, {})
    byPost.get(slug)[lang] = tags
  }
}

for (const [slug, langs] of byPost) {
  const reference = langs.en
  if (!reference) {
    add(`${slug}: no English post to compare the translations against`)
    continue
  }
  for (const lang of LANGS.slice(1)) {
    const tags = langs[lang]
    if (!tags) continue // check-locales reports the missing translation itself
    const missing = reference.filter((t) => !tags.includes(t))
    const extra = tags.filter((t) => !reference.includes(t))
    if (missing.length || extra.length) {
      add(
        `${lang}/${slug}: tags differ from English` +
          (missing.length ? ` -- missing ${missing.join(', ')}` : '') +
          (extra.length ? ` -- has ${extra.join(', ')}` : '')
      )
    }
  }
}

// A vocabulary word nobody uses builds a page with nothing on it. Not an
// error -- the word may be waiting for the post that needs it -- but it should
// be said out loud rather than discovered by a reader.
const used = new Set([...byPost.values()].flatMap((l) => l.en ?? []))
const unused = VOCABULARY.filter((t) => !used.has(t))

if (problems.length) {
  console.error(`check-topics: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `check-topics: ${byPost.size} posts x ${LANGS.length} languages -- same tags, all ${VOCABULARY.length} in the vocabulary`
)
if (unused.length) console.log(`  no posts yet: ${unused.join(', ')}`)
