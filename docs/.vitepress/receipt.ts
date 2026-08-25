import { createHash } from 'node:crypto'

/**
 * An order-invariant receipt over the bibliography, borrowed from how uuidna.com
 * fingerprints its theorem ledger.
 *
 * The published citations feed is the one artefact here that leaves the site and
 * gets read on its own -- a reference manager fetches it, a reader saves it, and
 * from that moment nothing ties it back to the ledger it came from. Every other
 * check in this repository compares two things inside the build. This one gives
 * the feed something a stranger can recompute after it has travelled.
 *
 * Each work folds to a leaf address; the leaves are sorted and folded again, so
 * the receipt depends on the SET of works and not on the order the array happens
 * to be in. Reordering `WORKS` must not move it. Changing a title must.
 *
 * What the receipt is worth, stated as a bound rather than a promise, because a
 * bound is what a hash gives you:
 *
 *   - Any edit moves it. That is free and needs no key.
 *   - A forgery that keeps the receipt costs a SHA-256 collision, ~2^128 work by
 *     the birthday bound -- half the exponent of a preimage, not the whole of it.
 *   - SHA-256 is symmetric, so Shor's algorithm has no factoring or
 *     discrete-log target here at all. Grover's search is quadratic, which takes
 *     256 bits to a ~128-bit floor. Both are still bounds, not maxima.
 *
 * It is not a signature: anyone can recompute a receipt for content they wrote
 * themselves. It proves the feed and the ledger agree, not that either is true.
 */

const sha256 = (input: string) => createHash('sha256').update(input, 'utf8').digest('hex')

/** The vocabulary the feed-level receipt category belongs to. */
export const RECEIPT_SCHEME = 'tag:titaniachaos.github.io,2026:clown/receipt'

export interface Receipt {
  /** How many leaves went in. A receipt over nothing is not a receipt. */
  leaves: number
  /** The fold, hex. */
  value: string
  /** `sha256:<hex>`, the form that travels in the feed. */
  term: string
}

/**
 * Fold a set of leaf strings to one receipt.
 *
 * The leaf itself is hashed before sorting so that the sort is over fixed-width
 * addresses rather than over prose -- otherwise the order depends on locale
 * collation, and two machines can disagree about the same set.
 */
export function fold(leaves: string[]): Receipt {
  const addresses = leaves.map(sha256).sort()
  const value = sha256(addresses.join('\n'))
  return { leaves: addresses.length, value, term: `sha256:${value}` }
}

/**
 * The leaf for one work, from the fields the feed publishes.
 *
 * Only what a reader can see in the feed goes in. A field the feed does not
 * carry could drift without moving the receipt, and a receipt that covers more
 * than the artefact makes a promise the artefact cannot keep.
 *
 * The fields are joined on a separator that cannot occur in any of them rather
 * than run together, so the boundaries are unambiguous. Plain concatenation
 * would let one work's title ending in a type name fold to the same leaf as a
 * different split of the same characters.
 */
const UNIT = String.fromCharCode(31) // ASCII unit separator

export function workLeaf(w: {
  id: string
  title: string
  authors?: string[]
  type: string
  read: string
  records: string[]
}): string {
  return [
    w.id,
    w.title,
    (w.authors ?? []).join('; '),
    w.type,
    w.read,
    [...w.records].sort().join(',')
  ].join(UNIT)
}
