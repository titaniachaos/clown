#!/usr/bin/env node
// Every question the collection can answer must exist in the built site.
//
// These are dynamic routes, and a dynamic route that fails to load is a
// WARNING in VitePress, not an error: it prints `Failed to load …paths.ts`,
// drops every page that route would have made, and exits 0. The main site lost
// all thirteen of its one-word listings that way and stayed green, so the
// count is checked against the collection rather than trusted.
//
// Usage: node scripts/check-collection.mjs [distDir]

import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { items, paths, reserved, unreachable, ENOUGH } from './lib/collection.mjs'

const dist = process.argv[2] ?? 'docs/.vitepress/dist'
const LOCALES = ['', 'bg', 'de']

const all = await items('docs')
const taken = await reserved('docs')
const wanted = paths(all, ENOUGH, taken)
const problems = []

for (const found of wanted) {
  for (const locale of LOCALES) {
    const file = join(dist, locale, `${found.path.replace(/^\//, '')}.html`)
    try {
      await access(file)
    } catch {
      problems.push(`${locale ? '/' + locale : ''}${found.path} was not built`)
    }
  }
}

// A question with nothing in it is not a page, and a question with everything
// in it is not a question. Both ends are worth stating.
for (const found of wanted) {
  if (found.items.length < ENOUGH) problems.push(`${found.path} has only ${found.items.length}`)
}

// The point of the surface: nothing the workspace holds may be unreachable.
const orphaned = unreachable(all, ENOUGH, taken)
if (orphaned.length) {
  problems.push(`${orphaned.length} item(s) are on no topic path: ${orphaned.slice(0, 6).join(', ')}`)
}

// A combined page must be reachable by a reader, not only by the build. The
// single-topic pages carry the narrower links, so if those stop rendering the
// combinations become the pool with extra steps.
const single = wanted.filter((p) => p.want.length === 1)
for (const locale of LOCALES) {
  const one = single[0]
  if (!one) break
  const file = join(dist, locale, `${one.path.replace(/^\//, '')}.html`)
  const html = await readFile(file, 'utf8').catch(() => '')
  if (html && !/topic__siblings/.test(html)) {
    problems.push(`${locale || 'root'}${one.path} offers no way into the combined questions`)
  }
}

if (problems.length) {
  console.error(`check-collection: ${problems.length} problem(s)\n`)
  for (const p of problems.slice(0, 20)) console.error(`  ${p}`)
  if (problems.length > 20) console.error(`  … and ${problems.length - 20} more`)
  process.exit(1)
}

const byDepth = [1, 2, 3].map((n) => wanted.filter((p) => p.want.length === n).length)
console.log(
  `check-collection: ${wanted.length} questions x ${LOCALES.length} languages — ` +
    `${byDepth[0]} single, ${byDepth[1]} pairs, ${byDepth[2]} triples, ` +
    `every one of the ${all.length} items reachable`
)
