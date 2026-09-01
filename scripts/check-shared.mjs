#!/usr/bin/env node
// Checks the files this site keeps a copy of against the site they came from.
//
// Three files are vendored from titaniachaos.github.io rather than imported,
// because two static sites cannot share a module across repositories. Two of
// them say so in their own first lines — locale.ts, "byte-identical in both
// sites: the callers differ, the answer must not" — and nothing has ever
// checked it. A rule written in a comment is a rule until somebody edits one
// copy.
//
// Drift here is not cosmetic. locale.ts decides which prefix belongs to which
// language on both sites; useLang.ts answers "which language am I in?" for
// every component; LocalePreference.vue is what sends a first-time visitor to
// their own language. A site whose answer to any of those differs from its
// sibling's sends readers to the wrong place, and both sites are served from
// one domain, so a reader crosses between them without noticing.
//
// It needs the sibling checkout. Without one it says so and passes, exactly as
// media-sync does: CI clones one repository, and a check that fails for being
// alone would fail every build.
//
// Usage: node scripts/check-shared.mjs

import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = resolve(ROOT, '..', 'titaniachaos.github.io')

/** Vendored, and required to be identical. Not the same as merely present in both. */
const SHARED = [
  'docs/.vitepress/locale.ts',
  'docs/.vitepress/theme/useLang.ts',
  'docs/.vitepress/theme/LocalePreference.vue'
]

const digest = async (path) => createHash('sha256').update(await readFile(path)).digest('hex')

const problems = []
let compared = 0

for (const rel of SHARED) {
  let mine
  try {
    mine = await digest(join(ROOT, rel))
  } catch {
    problems.push(`${rel}: this site does not have it, and it is meant to`)
    continue
  }

  let theirs
  try {
    theirs = await digest(join(ORIGIN, rel))
  } catch {
    // No sibling checkout, or that site dropped the file. Either way there is
    // nothing to compare against and saying so is more use than guessing.
    continue
  }

  compared++
  if (mine !== theirs) {
    problems.push(
      `${rel}: differs from titaniachaos.github.io\n` +
        `      here  sha256:${mine.slice(0, 12)}\n` +
        `      there sha256:${theirs.slice(0, 12)}\n` +
        '      One of the two was edited alone. Decide which is right and copy it across;\n' +
        '      if they are meant to differ now, take the file out of SHARED in this script.'
    )
  }
}

if (problems.length) {
  console.error(`check-shared: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

if (compared === 0) {
  console.log(
    `check-shared: no titaniachaos.github.io checkout beside this one — ` +
      `${SHARED.length} vendored file(s) not compared`
  )
} else {
  console.log(`check-shared: ${compared} vendored file(s) byte-identical to titaniachaos.github.io`)
}
