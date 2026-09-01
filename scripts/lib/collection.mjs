// A path is a question, and the answer is a collection.
//
//   /solitude                            5 things
//   /audience/solitude                   4
//   /audience/solitude/studio-practice   3
//
// Split the path on `/` and every segment is a topic this workspace knows;
// what comes back is everything carrying all of them. `collection.where(tags:
// path.split('/'))`, with the path doing the asking.
//
// ---- the one word that is also a page --------------------------------------
//
// `sources` is both a topic and a written page. The page wins -- a static file
// beats a dynamic route, and /clown/sources should be the account of the
// sources rather than a list of things tagged with them -- so the topic gets
// no one-word address. It is still reachable from every pair it belongs to,
// and `reserved()` names the collision rather than leaving it to whichever
// router happened to answer.
//
// ---- the two rules that keep it bounded ------------------------------------
//
//   AND, not OR. `/audience/failure` is the things carrying both. Or
//   would make almost every path return almost everything, and a hundred pages
//   that all say the same thing is what search engines demote and readers
//   resent.
//
//   One order, alphabetical. `/a/b` and `/b/a` are one question,
//   so only one of them is a page. Skipping this invents a factorial of
//   duplicates.

import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

/** Below this a path is a page with one thing on it, which is not a page. */
export const ENOUGH = 2

/** How deep a question may go. Three topics already answers with two things. */
export const DEEPEST = 3

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---/

/**
 * Everything in the workspace that carries topics, read from the English
 * sources.
 *
 * One language is enough to enumerate the paths: check-topics already proves
 * every post and page carries the same tags in all three, so the shape of the
 * collection does not depend on which one you read it in. Only the words on
 * the page do.
 */
export async function items(root = 'docs') {
  const found = []
  for (const dir of [root, join(root, 'blog')]) {
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name.includes('[')) continue
      const path = join(dir, entry.name)
      const source = await readFile(path, 'utf8')
      const front = FRONT_MATTER.exec(source)?.[1] ?? ''
      const declared = /^tags: \[(.*)\]$/m.exec(front)?.[1]
      if (!declared) continue
      const topics = [...declared.matchAll(/"([a-z-]+)"/g)].map((m) => m[1])
      if (topics.length) found.push({ path, topics })
    }
  }
  return found
}

/**
 * The slugs that already belong to a written page.
 *
 * A one-word question cannot live at an address a page holds, so these are
 * excluded from the single-word paths -- and named, because "there is no
 * /clown/sources listing" should be a decision on the record and not a
 * surprise in the build log.
 */
export async function reserved(root = 'docs') {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => [])
  return entries
    .filter((e) => (e.isFile() && e.name.endsWith('.md') && !e.name.includes('[')) || e.isDirectory())
    .map((e) => (e.isDirectory() ? e.name : e.name.replace(/\.md$/, '')))
    .filter((slug) => slug !== 'index')
}

/** The vocabulary, as the collection actually uses it. */
export function vocabulary(all) {
  return [...new Set(all.flatMap((item) => item.topics))].sort()
}

/**
 * The canonical form of a question, or null if it is not one.
 *
 * An unknown word makes it null rather than being dropped: `/solitude/porcelain`
 * should be a miss, not a silent `/solitude`.
 */
export function canonical(segments, words) {
  const asked = segments.map((s) => String(s).toLowerCase().trim()).filter(Boolean)
  if (!asked.length || asked.length > DEEPEST) return null
  if (asked.some((s) => !words.includes(s))) return null
  return [...new Set(asked)].sort()
}

/** Everything carrying every topic asked for. */
export function where(segments, all, words = vocabulary(all)) {
  const want = canonical(segments, words)
  if (!want) return null
  return { want, path: `/${want.join('/')}`, items: all.filter((i) => want.every((w) => i.topics.includes(w))) }
}

/**
 * Every question worth answering, richest first.
 *
 * Walks the subsets rather than a list, so a topic added to the vocabulary
 * opens its paths on the next build and one nothing carries opens none.
 */
export function paths(all, min = ENOUGH, taken = []) {
  const words = vocabulary(all)
  const out = []
  for (let mask = 1; mask < 1 << words.length; mask++) {
    const want = words.filter((_, i) => mask & (1 << i))
    if (want.length > DEEPEST) continue
    const found = where(want, all, words)
    if (!found || found.items.length < min) continue
    // A single word that a page already answers to is that page's address.
    if (found.want.length === 1 && taken.includes(found.want[0])) continue
    out.push(found)
  }
  return out.sort((a, b) => b.items.length - a.items.length || a.path.localeCompare(b.path))
}

/** Which items no path of this size would reach. The number that matters. */
export function unreachable(all, min = ENOUGH, taken = []) {
  const reached = new Set(paths(all, min, taken).flatMap((p) => p.items.map((i) => i.path)))
  return all.filter((i) => !reached.has(i.path)).map((i) => i.path)
}
