import { test } from "node:test"
import assert from "node:assert/strict"
import {
  emptyState,
  validate,
  importText,
  exportText,
  loadState,
  saveState,
} from "../src/store.js"
import {
  STORAGE_KEY,
  BAD_KEY,
  NOTICES,
  MAX_IMPORT_CHARS,
} from "../src/config.js"
import { entry, fakeStorage } from "./helpers.js"

const good = () => ({
  version: 1,
  target: 4,
  ratings: {
    "two-sum": [entry("2026-11-01", "clean"), entry("2026-11-05", "failed")],
  },
})
const withRatings = (ratings) => ({ ...good(), ratings })

test("emptyState has version 1, target 4, and no ratings", () => {
  assert.deepEqual(emptyState(), { version: 1, target: 4, ratings: {} })
})

test("export then import gives back the same state", () => {
  const s = good()
  assert.deepEqual(importText(exportText(s)).state, s)
})

const bad = {
  "broken json": "{oops",
  "json null": "null",
  "json array": "[]",
  "version 2": JSON.stringify({ ...good(), version: 2 }),
  "target 0": JSON.stringify({ ...good(), target: 0 }),
  "target 11": JSON.stringify({ ...good(), target: 11 }),
  "target 2.5": JSON.stringify({ ...good(), target: 2.5 }),
  "target as string": JSON.stringify({ ...good(), target: "4" }),
  "unknown rating": JSON.stringify(
    withRatings({ a: [entry("2026-11-01", "great")] }),
  ),
  "date in US format": JSON.stringify(
    withRatings({ a: [entry("11/20/2026", "clean")] }),
  ),
  "date that does not exist": JSON.stringify(
    withRatings({ a: [entry("2026-02-30", "clean")] }),
  ),
  "date as array": JSON.stringify(
    withRatings({ a: [entry(["2026-11-20"], "clean")] }),
  ),
  "entry as string": JSON.stringify(withRatings({ a: ["clean"] })),
  "two entries with one date": JSON.stringify(
    withRatings({
      a: [entry("2026-11-01", "clean"), entry("2026-11-01", "failed")],
    }),
  ),
  "ratings as array": JSON.stringify({ ...good(), ratings: [] }),
  "empty history": JSON.stringify(withRatings({ a: [] })),
  "text over the size limit": "x".repeat(MAX_IMPORT_CHARS + 1),
  "id with capital letters": JSON.stringify(
    withRatings({ Bad: [entry("2026-11-01", "clean")] }),
  ),
}
for (const [name, text] of Object.entries(bad)) {
  test(`importText rejects ${name}`, () => {
    const r = importText(text)
    assert.equal(r.ok, false)
    assert.equal(typeof r.error, "string")
    assert.ok(r.error.length > 0)
  })
}

test("importText rejects an own __proto__ id", () => {
  const text = '{"version":1,"target":4,"ratings":{"__proto__":[]}}'
  const r = importText(text)
  assert.equal(r.ok, false)
  assert.ok(r.error.length > 0)
})

test("validate never throws and hides input in the error", () => {
  for (const v of [undefined, null, 5, "x", [], { ratings: 1 }]) {
    const r = validate(v)
    assert.equal(r.ok, false)
    assert.ok(r.error.length > 0)
  }
  const secret = "SECRET-VALUE"
  const r = validate(withRatings({ a: [entry("2026-11-01", secret)] }))
  assert.equal(r.ok, false)
  assert.ok(!r.error.includes(secret))
})

test("id constructor with a valid history is kept", () => {
  const s = withRatings({ constructor: [entry("2026-11-01", "clean")] })
  const r = validate(s)
  assert.equal(r.ok, true)
  assert.deepEqual(Object.keys(r.state.ratings), ["constructor"])
  assert.deepEqual(r.state.ratings.constructor, [entry("2026-11-01", "clean")])
})

test("extra keys are removed at every level", () => {
  const s = {
    ...good(),
    extra: 1,
    ratings: { a: [{ date: "2026-11-01", rating: "clean", note: "x" }] },
  }
  const r = validate(s)
  assert.equal(r.ok, true)
  assert.deepEqual(r.state, {
    version: 1,
    target: 4,
    ratings: { a: [entry("2026-11-01", "clean")] },
  })
})

test("a history given out of order is sorted by date", () => {
  const r = validate(
    withRatings({
      a: [entry("2026-11-09", "clean"), entry("2026-11-01", "failed")],
    }),
  )
  assert.deepEqual(r.state.ratings.a, [
    entry("2026-11-01", "failed"),
    entry("2026-11-09", "clean"),
  ])
})

test("loadState with nothing saved gives empty state and no notice", () => {
  assert.deepEqual(loadState(fakeStorage()), {
    state: emptyState(),
    notice: null,
  })
})

test("loadState keeps a copy of damaged text", () => {
  const st = fakeStorage()
  st.setItem(STORAGE_KEY, "{oops")
  assert.deepEqual(loadState(st), {
    state: emptyState(),
    notice: NOTICES.damaged,
  })
  assert.equal(st.getItem(BAD_KEY), "{oops")
})

test("loadState treats a saved version 2 as damaged", () => {
  const st = fakeStorage()
  const text = JSON.stringify({ ...good(), version: 2 })
  st.setItem(STORAGE_KEY, text)
  assert.deepEqual(loadState(st), {
    state: emptyState(),
    notice: NOTICES.damaged,
  })
  assert.equal(st.getItem(BAD_KEY), text)
})

test("loadState does not throw when the bad copy cannot be saved", () => {
  const st = fakeStorage()
  st.setItem(STORAGE_KEY, "{oops")
  st.failWrites = true
  assert.deepEqual(loadState(st), {
    state: emptyState(),
    notice: NOTICES.damaged,
  })
})

test("loadState reports cannotSave when a read throws", () => {
  const st = fakeStorage({ failReads: true })
  assert.deepEqual(loadState(st), {
    state: emptyState(),
    notice: NOTICES.cannotSave,
  })
})

test("saveState then loadState gives back the state", () => {
  const st = fakeStorage()
  const s = good()
  assert.equal(saveState(st, s), true)
  assert.deepEqual(loadState(st), { state: s, notice: null })
})

test("saveState returns false when the write throws", () => {
  assert.equal(saveState(fakeStorage({ failWrites: true }), good()), false)
})

test("saveState refuses an invalid state and keeps the old text", () => {
  const st = fakeStorage()
  const s = good()
  saveState(st, s)
  const before = st.getItem(STORAGE_KEY)
  assert.equal(saveState(st, { ...s, target: NaN }), false)
  assert.equal(st.getItem(STORAGE_KEY), before)
})
