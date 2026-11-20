import { test } from "node:test"
import assert from "node:assert/strict"
import { replay, rate, isWeak } from "../src/schedule.js"
import { entry } from "./helpers.js"

const d = "2026-11-20"
const h = [entry("2026-11-01", "clean"), entry("2026-11-08", "clean")]

test("replay of an empty history has no step and no due date", () => {
  assert.deepEqual(replay([]), { step: null, due: null })
})

test("a first failed rating gives step 0, due in 1 day", () => {
  assert.deepEqual(replay(rate([], d, "failed")), {
    step: 0,
    due: "2026-11-21",
  })
})

test("a first struggled rating gives step 1, due in 3 days", () => {
  assert.deepEqual(replay(rate([], d, "struggled")), {
    step: 1,
    due: "2026-11-23",
  })
})

test("a first clean rating gives step 2, due in 7 days", () => {
  assert.deepEqual(replay(rate([], d, "clean")), {
    step: 2,
    due: "2026-11-27",
  })
})

test("clean after two clean ratings moves up to step 4", () => {
  assert.deepEqual(replay(rate(h, "2026-11-22", "clean")), {
    step: 4,
    due: "2026-12-22",
  })
})

test("struggled after two clean ratings holds step 3", () => {
  assert.deepEqual(replay(rate(h, "2026-11-22", "struggled")), {
    step: 3,
    due: "2026-12-06",
  })
})

test("failed after two clean ratings resets to step 0", () => {
  assert.deepEqual(replay(rate(h, "2026-11-22", "failed")), {
    step: 0,
    due: "2026-11-23",
  })
})

test("clean at the top step stays at step 5", () => {
  const top = [
    entry("2026-09-01", "clean"),
    entry("2026-09-08", "clean"),
    entry("2026-09-22", "clean"),
    entry("2026-10-22", "clean"),
  ]
  assert.equal(replay(top).step, 5)
  assert.deepEqual(replay(rate(top, "2026-12-21", "clean")), {
    step: 5,
    due: "2027-02-19",
  })
})

test("struggled after failed gives step 1", () => {
  const hist = [entry(d, "failed"), entry("2026-11-21", "struggled")]
  assert.equal(replay(hist).step, 1)
})

test("clean after failed gives step 2", () => {
  const hist = [entry(d, "failed"), entry("2026-11-21", "clean")]
  assert.deepEqual(replay(hist), { step: 2, due: "2026-11-28" })
})

test("rate replaces an entry with the same date", () => {
  assert.deepEqual(rate(rate([], d, "clean"), d, "failed"), [
    entry(d, "failed"),
  ])
})

test("rate drops entries dated after the new one", () => {
  const hist = [entry("2026-11-25", "clean")]
  assert.deepEqual(rate(hist, d, "failed"), [entry(d, "failed")])
})

test("rate keeps an earlier entry first", () => {
  const out = rate([entry("2026-11-05", "clean")], "2026-11-10", "clean")
  assert.deepEqual(
    out.map((e) => e.date),
    ["2026-11-05", "2026-11-10"],
  )
})

test("rate sorts the result by date", () => {
  const hist = [entry("2026-11-08", "clean"), entry("2026-11-01", "clean")]
  assert.deepEqual(
    rate(hist, d, "clean").map((e) => e.date),
    ["2026-11-01", "2026-11-08", d],
  )
})

test("rate does not change its input", () => {
  const copy = structuredClone(h)
  rate(h, d, "clean")
  assert.deepEqual(h, copy)
})

test("rate throws RangeError for an unknown rating", () => {
  assert.throws(() => rate([], d, "great"), RangeError)
})

test("isWeak is false for an empty history", () => {
  assert.equal(isWeak([]), false)
})

test("isWeak is true when the last rating is struggled", () => {
  assert.equal(isWeak([entry(d, "struggled")]), true)
})

test("isWeak is false when the last rating is clean", () => {
  const hist = [entry(d, "failed"), entry("2026-11-21", "clean")]
  assert.equal(isWeak(hist), false)
})

test("replay of an unsorted history gives the same result as sorted", () => {
  const unsorted = [entry("2026-11-21", "clean"), entry("2026-11-20", "failed")]
  assert.deepEqual(replay(unsorted), { step: 2, due: "2026-11-28" })
})
