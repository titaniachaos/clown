/**
 * The board, as small as it can be sent.
 *
 * collection.mjs reads the Markdown to find what carries what, which needs a
 * filesystem. What a reader needs is much less: the eleven questions, and for
 * each the pieces that may answer it. The words themselves are already in the
 * browser — media.data.ts ships every post and page with its title and summary
 * in three languages, so nothing here repeats them.
 *
 * The filings are not shipped. There are 1482 and the browser enumerates them
 * in a few milliseconds from these lists; sending them would be forty kilobytes
 * to save a depth-first walk over eleven levels.
 *
 * The order of the keys is the contract. An ordinal is an index into an
 * enumeration that walks these lists in the order they are given, so a list
 * that reordered would point every shared address at a different filing.
 * `items()` reads the directory and `vocabulary()` sorts, so both are stable.
 */

import { defineLoader } from 'vitepress'
import { items, vocabulary } from '../../scripts/lib/collection.mjs'

export interface FilingPosition {
  /** The topic this position asks about. */
  topic: string
  /** `blog/twenty-solitudes` or `production` — how the browser finds the words. */
  keys: string[]
}

export interface FilingData {
  positions: FilingPosition[]
  /** How many pieces of writing the workspace holds. */
  pieces: number
}

declare const data: FilingData
export { data }

/** `docs/blog/twenty-solitudes.md` -> `blog/twenty-solitudes`, `docs/concept.md` -> `concept`. */
const keyOf = (path: string) =>
  path
    .replace(/\\/g, '/')
    .replace(/^docs\//, '')
    .replace(/\.md$/, '')

export default defineLoader({
  async load(): Promise<FilingData> {
    const all = await items('docs')
    const words = vocabulary(all)

    return {
      positions: words.map((topic: string) => ({
        topic,
        keys: all
          .filter((item: { topics: string[] }) => item.topics.includes(topic))
          .map((item: { path: string }) => keyOf(item.path))
      })),
      pieces: all.length
    }
  }
})
