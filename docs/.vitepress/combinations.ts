/**
 * The parameters for every combined-topic page, in one language.
 *
 * `/solitude`, `/audience/solitude`, `/audience/solitude/studio-practice` —
 * ten singles, 29 pairs and 16 triples, which is 55 questions in each language
 * out of eleven words and no maintenance.
 *
 * Ten singles rather than eleven: `sources` is also a written page, and the
 * page keeps the address.
 *
 * The paths are computed from the English sources, and that is not a
 * shortcut: check-topics already proves every post and page carries the same
 * tags in all three languages, so which one you read the collection in changes
 * the words on the page and never its shape.
 */

import { items, paths, reserved } from '../../scripts/lib/collection.mjs'
import { TOPIC_NAMES, TOPIC_UI, fill } from './topics.ts'
import type { Lang } from './locale.ts'
import type { Topic } from './topics.ts'

export interface CombinationParams {
  params: Record<string, string>
}

const all = await items('docs')
const taken = await reserved('docs')
const everything = paths(all, undefined, taken)

export function combinations(lang: Lang, depth: 1 | 2 | 3): CombinationParams[] {
  const names = TOPIC_NAMES[lang]
  const ui = TOPIC_UI[lang]

  return everything
    .filter((found: { want: string[] }) => found.want.length === depth)
    .map((found: { want: string[] }) => {
      const spoken = found.want.map((w) => names[w as Topic]).join(' · ')
      const params: Record<string, string> = {
        // The component reads this rather than re-deriving from t1/t2/t3: one
        // place decides what the question was.
        topics: found.want.join(' '),
        name: spoken,
        title: fill(ui.title, spoken),
        description: fill(ui.description, spoken)
      }
      found.want.forEach((word, at) => {
        params[`t${at + 1}`] = word
      })
      return { params }
    })
}
