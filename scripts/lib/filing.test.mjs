// What a filing has to guarantee before a reader is given an address for one.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { items, vocabulary } from './collection.mjs'
import { filings, at, ordinalOf, nearest, turn, reachAt } from './filing.mjs'

const all = await items('docs')
const words = vocabulary(all)
const positions = words.map((topic) => ({
  topic,
  keys: all.filter((item) => item.topics.includes(topic)).map((item) => item.path)
}))
const board = filings(positions)

test('there are filings at all, and every one is complete', () => {
  assert.ok(board.length > 0, 'no filing exists — every question would be empty')
  for (const filing of board) {
    assert.equal(filing.length, positions.length, 'a filing must answer every question')
    assert.equal(new Set(filing).size, filing.length, 'a filing may not use one piece twice')
  }
})

test('every answer is about the question it answers', () => {
  // The rule that makes recombining safe. Queneau's lines shared a rhyme; here
  // a piece may only answer a topic it actually carries.
  const carries = new Map(all.map((item) => [item.path, item.topics]))
  for (const filing of board) {
    filing.forEach((key, position) => {
      assert.ok(
        carries.get(key).includes(positions[position].topic),
        `${key} does not carry ${positions[position].topic}`
      )
    })
  }
})

test('the enumeration does not vary', () => {
  // A shared ordinal is only an address because this walk is a function of the
  // board. Same board, same order, twice.
  const again = filings(positions)
  assert.equal(again.length, board.length)
  assert.deepEqual(again[0], board[0])
  assert.deepEqual(again[board.length - 1], board[board.length - 1])
})

test('an ordinal names a filing and a filing names the ordinal', () => {
  for (const n of [0, 1, 7, 100, board.length - 1]) {
    const filing = at(n, board)
    assert.ok(filing, `${n} should be a filing`)
    assert.equal(ordinalOf(filing, board), n)
  }
})

test('every number in range is a filing — none are refused', () => {
  // The reason this is an ordinal rather than the archive's mixed-radix
  // address: there, most numbers are arrangements and the rest are refused.
  // Here one number in 2570 would be a filing, and an address a reader cannot
  // share is not an address.
  for (let n = 0; n < board.length; n += 37) {
    assert.ok(at(n, board), `${n} is in range and should be a filing`)
  }
  assert.equal(at(board.length, board), null, 'past the end is not a filing')
  assert.equal(at(-1, board), null, 'before the start is not a filing')
})

test('a number out of range lands somewhere real, and always the same somewhere', () => {
  for (const n of [board.length, board.length + 5, -1, -board.length - 3, 999999]) {
    const landed = nearest(n, board)
    assert.ok(at(landed, board), `${n} found nowhere to land`)
    assert.equal(nearest(n, board), landed, 'nearest is not deterministic')
  }
})

test('turning a line changes that line', () => {
  for (let position = 0; position < positions.length; position++) {
    if (reachAt(board, position) < 2) continue
    const moved = turn(0, board, position, 1)
    assert.notEqual(
      board[moved][position],
      board[0][position],
      `turning ${positions[position].topic} did not change it`
    )
    assert.equal(new Set(board[moved]).size, board[moved].length, 'the filing stopped being complete')
  }
})

test('turning a line may move others, and the filing stays complete', () => {
  // Stated as a test because it is the difference from the archive next door,
  // not a defect: every piece is used exactly once, so giving one question a
  // different piece takes that piece from wherever it was.
  let moved = 0
  for (let position = 0; position < positions.length; position++) {
    if (reachAt(board, position) < 2) continue
    const next = turn(0, board, position, 1)
    const differences = board[next].filter((key, i) => key !== board[0][i]).length
    assert.ok(differences >= 1)
    if (differences > 1) moved++
    assert.equal(new Set(board[next]).size, board[next].length)
  }
  assert.ok(moved > 0, 'no turn ever moved another line — the rule is not binding')
})
