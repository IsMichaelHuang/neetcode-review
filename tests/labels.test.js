import { test } from "node:test"
import assert from "node:assert/strict"
import {
  RATING_KEYS, RATING_LABEL, RATING_SYMBOL, RATE_CLASS, SYM_CLASS,
  DONE_CLASS, DUE_CLASS, topicCodes, statusText, urgency, statusClass,
} from "../src/labels.js"

test("topicCodes gives A and B to two topics in order", () => {
  assert.deepEqual([...topicCodes(["Graphs", "Trees"])],
    [["Graphs", "A"], ["Trees", "B"]])
})

test("topicCodes follows spreadsheet column names", () => {
  const names = Array.from({ length: 53 }, (_, i) => `t${i}`)
  const codes = topicCodes(names)
  assert.equal(codes.get("t0"), "A")
  assert.equal(codes.get("t25"), "Z")
  assert.equal(codes.get("t26"), "AA")
  assert.equal(codes.get("t27"), "AB")
  assert.equal(codes.get("t51"), "AZ")
  assert.equal(codes.get("t52"), "BA")
})

test("topicCodes of no topics is empty", () => {
  assert.equal(topicCodes([]).size, 0)
})

test("topicCodes merges repeated topics", () => {
  const codes = topicCodes(["A", "A"])
  assert.equal(codes.size, 1)
  assert.equal(codes.get("A"), "A")
})

test("topicCodes accepts a topic named constructor", () => {
  assert.equal(topicCodes(["constructor"]).get("constructor"), "A")
})

test("topicCodes counts distinct topics only", () => {
  assert.deepEqual([...topicCodes(["A", "B", "A", "C"])].at(-1),
    ["C", "C"])
})

test("statusText names the rating of a done row", () => {
  assert.equal(
    statusText({ kind: "done", lastRating: "clean" }), "done: Clean")
})

test("statusText of a done row with no rating ends empty", () => {
  assert.equal(statusText({ kind: "done", lastRating: null }), "done: ")
})

test("statusText ignores the rating key constructor", () => {
  assert.equal(
    statusText({ kind: "done", lastRating: "constructor" }), "done: ")
})

test("statusText ignores the rating key __proto__", () => {
  assert.equal(
    statusText({ kind: "done", lastRating: "__proto__" }), "done: ")
})

test("statusText of a new row is new", () => {
  assert.equal(statusText({ kind: "new" }), "new")
})

test("statusText of a due row with 0 days is due today", () => {
  assert.equal(statusText({ kind: "due", overdueDays: 0 }), "due today")
})

test("statusText uses the singular for 1 day", () => {
  assert.equal(
    statusText({ kind: "due", overdueDays: 1 }), "1 day overdue")
})

test("statusText uses the plural for 12 days", () => {
  assert.equal(
    statusText({ kind: "due", overdueDays: 12 }), "12 days overdue")
})

test("statusText of a later row follows the due rule", () => {
  assert.equal(
    statusText({ kind: "later", overdueDays: -2 }), "-2 days overdue")
})

test("urgency maps days to the four levels", () => {
  const cases = [[0, 0], [1, 1], [2, 1], [2.5, 1], [3, 2], [6, 2],
    [7, 3], [400, 3]]
  for (const [days, level] of cases) {
    assert.equal(urgency(days), level, `days ${days}`)
  }
})

test("urgency gives 0 for bad values", () => {
  for (const bad of [-1, NaN, Infinity, undefined, "3"]) {
    assert.equal(urgency(bad), 0, String(bad))
  }
})

test("statusClass of a done row names the rating", () => {
  assert.equal(
    statusClass({ kind: "done", lastRating: "failed" }), "done-failed")
})

test("statusClass of a done row with an unknown rating is kind-new", () => {
  assert.equal(
    statusClass({ kind: "done", lastRating: "x" }), "kind-new")
  assert.equal(
    statusClass({ kind: "done", lastRating: "constructor" }), "kind-new")
})

test("statusClass of a due row uses the urgency level", () => {
  assert.equal(statusClass({ kind: "due", overdueDays: 4 }), "due-2")
})

test("statusClass of new and later rows is kind-new", () => {
  assert.equal(statusClass({ kind: "new" }), "kind-new")
  assert.equal(statusClass({ kind: "later", overdueDays: -1 }), "kind-new")
})

test("RATING_KEYS and RATING_LABEL hold the three ratings", () => {
  assert.deepEqual(RATING_KEYS, ["clean", "struggled", "failed"])
  assert.deepEqual(RATING_LABEL,
    { clean: "Clean", struggled: "Struggled", failed: "Failed" })
})

test("RATING_SYMBOL holds the three symbols", () => {
  assert.deepEqual(RATING_SYMBOL,
    { clean: "!", struggled: "!?", failed: "?" })
})

test("class tables hold one token for each rating", () => {
  assert.equal(SYM_CLASS.clean, "sym-clean")
  assert.equal(RATE_CLASS.failed, "rate-failed")
  assert.equal(DONE_CLASS.struggled, "done-struggled")
  assert.deepEqual(DUE_CLASS, ["due-0", "due-1", "due-2", "due-3"])
})

test("each exported object and array is frozen", () => {
  const all = [RATING_KEYS, RATING_LABEL, RATING_SYMBOL, RATE_CLASS,
    SYM_CLASS, DONE_CLASS, DUE_CLASS]
  for (const x of all) assert.ok(Object.isFrozen(x))
})
