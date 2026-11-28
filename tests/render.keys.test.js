// Tests of the rating keys on the Today rows.
import test from "node:test"
import assert from "node:assert/strict"
import { find, byClass, fire } from "./dom.js"
import { row, view, draw, one } from "./render.fixtures.js"

const rows = () => [
  row({ id: "two-sum", title: "Two Sum" }),
  row({ id: "valid-anagram", title: "Valid Anagram" }),
]
const entry = (doc, n) => one(doc.app, "entry", n)
const link = (li) => find(li, (n) => n.tag === "a")[0]

// Press a key on a node of the row. Returns the preventDefault count.
const press = (li, key, over = {}, node = link(li)) => {
  const ev = { key, target: node, prevented: 0, ...over }
  ev.preventDefault = () => ev.prevented++
  fire(li, "keydown", ev)
  return ev.prevented
}

test("a key on the link of a row rates that row", () => {
  const log = []
  const doc = draw(view({ queue: rows() }), log)
  assert.equal(press(entry(doc, 0), "2"), 1)
  assert.deepEqual(log, [["onRate", "two-sum", "struggled"]])
})

test("a key on another row rates the other row", () => {
  const log = []
  const doc = draw(view({ queue: rows() }), log)
  press(entry(doc, 1), "3")
  assert.deepEqual(log, [["onRate", "valid-anagram", "failed"]])
})

test("the key focuses the rating button, then clicks it", () => {
  const doc = draw(view({ queue: rows() }), [])
  press(entry(doc, 0), "1")
  assert.equal(doc.activeElement.attrs.id, "rate-two-sum-clean")
})

test("Shift with 1 rates", () => {
  const log = []
  const doc = draw(view({ queue: rows() }), log)
  press(entry(doc, 0), "1", { shiftKey: true })
  assert.deepEqual(log, [["onRate", "two-sum", "clean"]])
})

test("a repeat, a modifier, or a 4 does nothing", () => {
  const log = []
  const doc = draw(view({ queue: rows() }), log)
  const li = entry(doc, 0)
  const cases = [
    ["1", { repeat: true }],
    ["1", { ctrlKey: true }],
    ["1", { metaKey: true }],
    ["1", { altKey: true }],
    ["1", { isComposing: true }],
    ["4", {}],
  ]
  for (const [key, over] of cases) assert.equal(press(li, key, over), 0)
  assert.deepEqual(log, [])
  assert.equal(doc.activeElement, null)
})

test("a key on the pre of a shown solution does nothing", () => {
  const log = []
  const queue = [row({ solution: { text: "x = 1" } })]
  const doc = draw(view({ queue }), log)
  const li = entry(doc, 0)
  const pre = find(li, (n) => n.tag === "pre")[0]
  assert.equal(press(li, "1", {}, pre), 0)
  assert.deepEqual(log, [])
})

test("a key on a done row changes its rating", () => {
  const log = []
  const done = row({ kind: "done", lastRating: "clean" })
  const doc = draw(view({ queue: [done], doneCount: 1 }), log)
  press(entry(doc, 0), "3")
  assert.deepEqual(log, [["onRate", "two-sum", "failed"]])
})

test("the hint shows with rows and not with an empty queue", () => {
  const hint = byClass(draw(view()).app, "hint")
  assert.equal(hint.length, 1)
  assert.equal(hint[0].tag, "p")
  assert.equal(
    hint[0].textContent,
    "With the focus on a problem, press 1, 2, or 3 to rate it: " +
      "Clean, Struggled, or Failed.",
  )
  const none = draw(view({ queue: [] }))
  assert.equal(byClass(none.app, "hint").length, 0)
})
