import { test } from "node:test"
import assert from "node:assert/strict"
import { NOTICES, STORAGE_KEY, BAD_KEY } from "../src/config.js"
import { createApp } from "../src/app.js"
import { treeUrl } from "../src/github.js"
import { buildToday } from "../src/queue.js"
import { loadState, saveState } from "../src/store.js"
import { entry, fakeFetch, fakeStorage, loadJson } from "./helpers.js"

const known = loadJson("data/problems.json")
const tree = loadJson("tests/fixtures/tree.json")
const routes = { [treeUrl()]: { status: 200, body: { tree } } }
const P1 = "two-integer-sum"
const P2 = "is-anagram"

const setup = async (storage = fakeStorage()) => {
  const clock = { now: new Date(2026, 10, 20, 12) }
  const { fetchFn } = fakeFetch(routes)
  const make = () =>
    createApp({ fetchFn, storage, known, now: () => clock.now })
  const app = make()
  await app.init()
  return { app, make, storage, clock }
}
const seed = (storage, ratings, target = 4) =>
  saveState(storage, { version: 1, target, ratings })
const find = (list, id) => list.find((r) => r.id === id)

test("a clean rating moves the row to done and saves", async () => {
  const { app, make, storage } = await setup()
  app.rate(P1, "clean")
  const check = (v) => {
    const r = find(v.queue, P1)
    assert.equal(r.kind, "done")
    assert.equal(r.lastRating, "clean")
    assert.equal(r.due, "2026-11-27")
    assert.equal(v.doneCount, 1)
  }
  check(app.view())
  const again = make()
  await again.init()
  check(again.view())
  assert.equal(storage.getItem("neetcode-review:state") !== null, true)
})

test("a second rating on one day replaces the first", async () => {
  const { app } = await setup()
  app.rate(P1, "clean")
  app.rate(P1, "failed")
  const v = app.view()
  const r = find(v.queue, P1)
  assert.equal(r.kind, "done")
  assert.equal(r.lastRating, "failed")
  assert.equal(r.due, "2026-11-21")
  assert.equal(v.doneCount, 1)
})

test("table kinds: later and due", async () => {
  const storage = fakeStorage()
  seed(storage, {
    [P1]: [entry("2026-11-19", "clean")],
    [P2]: [entry("2026-11-18", "failed")],
  })
  const { app } = await setup(storage)
  const t = app.view().table
  assert.equal(find(t, P1).kind, "later")
  assert.equal(find(t, P2).kind, "due")
  assert.equal(find(t, P2).overdueDays, 1)
})

test("6 due problems and target 4 leave 2 waiting", async () => {
  const storage = fakeStorage()
  const ratings = {}
  for (const k of known.slice(0, 6)) {
    ratings[k.id] = [entry("2026-11-10", "failed")]
  }
  seed(storage, ratings)
  const { app } = await setup(storage)
  const v = app.view()
  assert.equal(v.waiting, 2)
  assert.deepEqual(v.queue.map((r) => r.kind), ["due", "due", "due", "due"])
  assert.ok(v.queue.every((r) => r.overdueDays > 0))
})

test("moving the clock to the next day changes today", async () => {
  const { app, clock } = await setup()
  app.rate(P1, "failed")
  clock.now = new Date(2026, 10, 21, 12)
  const v = app.view()
  assert.equal(v.today, "2026-11-21")
  assert.equal(v.doneCount, 0)
  assert.equal(find(v.table, P1).kind, "due")
})

test("two tabs keep both ratings", async () => {
  const storage = fakeStorage()
  const a = await setup(storage)
  const b = await setup(storage)
  a.app.rate("two-integer-sum", "clean")
  b.app.rate("is-anagram", "struggled")
  const c = await setup(storage)
  const t = c.app.view().table
  assert.equal(find(t, P1).lastRating, "clean")
  assert.equal(find(t, P2).lastRating, "struggled")
})

test("a failed save keeps the change and shows a notice", async () => {
  const { app, make, storage } = await setup()
  storage.failWrites = true
  app.rate(P1, "clean")
  assert.equal(find(app.view().queue, P1).kind, "done")
  assert.deepEqual(app.view().notices, [NOTICES.cannotSave])
  app.refresh()
  assert.equal(find(app.view().queue, P1).kind, "done")
  storage.failWrites = false
  app.rate(P2, "failed")
  assert.deepEqual(app.view().notices, [])
  const again = make()
  await again.init()
  const t = again.view().table
  assert.equal(find(t, P1).lastRating, "clean")
  assert.equal(find(t, P2).lastRating, "failed")
})

test("a failed read keeps the ratings in the view", async () => {
  const { app, storage } = await setup()
  app.rate(P1, "clean")
  storage.failReads = true
  app.refresh()
  assert.equal(find(app.view().queue, P1).lastRating, "clean")
})

test("setTarget rounds, clamps, and ignores bad values", async () => {
  const { app, make, storage } = await setup()
  app.setTarget(2)
  assert.equal(app.view().queue.length, 2)
  assert.equal(loadState(storage).state.target, 2)
  const set = (n) => {
    app.setTarget(n)
    return app.view().target
  }
  assert.equal(set(99), 10)
  assert.equal(set(0), 1)
  assert.equal(set(2.5), 3)
  assert.equal(set(NaN), 3)
  assert.equal(set(""), 3)
  for (const bad of [null, undefined, "3", Infinity]) {
    assert.equal(set(bad), 3)
  }
  const again = make()
  await again.init()
  assert.equal(again.view().target, 3)
  assert.deepEqual(loadState(storage), {
    state: { version: 1, target: 3, ratings: {} },
    notice: null,
  })
})

test("an unknown id changes nothing and an unknown rating throws", async () => {
  const { app, storage } = await setup()
  app.rate("nope", "clean")
  assert.equal(storage.getItem("neetcode-review:state"), null)
  assert.throws(() => app.rate(P1, "great"), RangeError)
})

const seedTwo = () => {
  const storage = fakeStorage()
  seed(storage, {
    [P1]: [entry("2026-11-18", "clean")],
    "duplicate-integer": [entry("2026-11-19", "clean")],
  })
  return storage
}
const stored = (storage) => {
  const was = storage.failReads
  storage.failReads = false
  const text = storage.getItem(STORAGE_KEY)
  storage.failReads = was
  return text
}

test("a failed read never lets a rating overwrite saved data", async () => {
  const storage = seedTwo()
  const before = stored(storage)
  storage.failReads = true
  const { app, make } = await setup(storage)
  assert.deepEqual(app.view().notices, [NOTICES.cannotSave])
  app.rate("course-schedule", "clean")
  assert.equal(stored(storage), before)
  const v = app.view()
  assert.equal(find(v.queue, "course-schedule").kind, "done")
  assert.ok(v.notices.includes(NOTICES.cannotSave))
  storage.failReads = false
  app.rate(P2, "failed")
  assert.equal(app.view().notices.includes(NOTICES.cannotSave), false)
  const again = make()
  await again.init()
  const w = again.view()
  assert.equal(w.notices.includes(NOTICES.cannotSave), false)
  assert.equal(find(w.table, P1).lastRating, "clean")
  assert.equal(find(w.table, "duplicate-integer").lastRating, "clean")
  assert.equal(find(w.table, P2).lastRating, "failed")
})

test("a failed read never lets setTarget overwrite saved data", async () => {
  const storage = seedTwo()
  const before = stored(storage)
  storage.failReads = true
  const { app } = await setup(storage)
  app.setTarget(2)
  assert.equal(stored(storage), before)
  assert.equal(app.view().target, 2)
})

test("a read that fails after init shows a notice, then recovers", async () => {
  const storage = fakeStorage()
  seed(storage, { [P1]: [entry("2026-11-18", "clean")] })
  const { app, make } = await setup(storage)
  assert.deepEqual(app.view().notices, [])
  const before = stored(storage)
  storage.failReads = true
  app.rate(P2, "failed")
  assert.deepEqual(app.view().notices, [NOTICES.cannotSave])
  assert.equal(find(app.view().queue, P2).kind, "done")
  assert.equal(stored(storage), before)
  storage.failReads = false
  app.rate("coin-change", "clean")
  assert.deepEqual(app.view().notices, [])
  const t = (await (async () => {
    const again = make()
    await again.init()
    return again.view().table
  })())
  assert.equal(find(t, P1).lastRating, "clean")
  assert.equal(find(t, "coin-change").lastRating, "clean")
})

test("damaged text after a failed read clears the notice on save", async () => {
  const storage = fakeStorage()
  storage.failReads = true
  const { app } = await setup(storage)
  storage.failReads = false
  storage.setItem(STORAGE_KEY, "{oops")
  app.rate(P1, "clean")
  assert.deepEqual(app.view().notices, [NOTICES.damaged])
})

test("reads that never recover show one notice only", async () => {
  const storage = fakeStorage()
  storage.failReads = true
  const { app } = await setup(storage)
  app.rate(P1, "clean")
  app.rate(P2, "clean")
  assert.deepEqual(app.view().notices, [NOTICES.cannotSave])
})

test("damaged text that cannot be copied is never overwritten", async () => {
  const storage = fakeStorage()
  storage.setItem(STORAGE_KEY, "{oops")
  storage.failWrites = true
  const { app } = await setup(storage)
  assert.deepEqual(app.view().notices, [NOTICES.cannotSave])
  storage.failWrites = false
  app.rate(P1, "clean")
  assert.equal(storage.getItem(BAD_KEY), "{oops")
  assert.equal(find(app.view().queue, P1).kind, "done")
})

test("a refresh that reads damaged text shows a notice", async () => {
  const storage = fakeStorage()
  seed(storage, { [P1]: [entry("2026-11-18", "clean")] })
  const { app } = await setup(storage)
  storage.setItem(STORAGE_KEY, "{oops")
  app.refresh()
  const v = app.view()
  assert.deepEqual(v.notices, [NOTICES.damaged])
  assert.equal(find(v.table, P1).lastRating, "clean")
})

test("today shows Easy, Medium, Hard and picks the same problems", async () => {
  const storage = fakeStorage()
  const failed = [entry("2026-11-10", "failed")]
  const ratings = {
    "add-two-numbers": [entry("2026-11-20", "clean")],
    "anagram-groups": failed,
    "find-median-in-a-data-stream": failed,
    "balanced-binary-tree": failed,
  }
  seed(storage, ratings, 5)
  const { app } = await setup(storage)
  const v = app.view()
  assert.deepEqual(v.queue.map((r) => r.id), [
    "balanced-binary-tree",
    "add-two-numbers",
    "anagram-groups",
    "coin-change",
    "find-median-in-a-data-stream",
  ])
  const { done, open } = buildToday({
    problems: known,
    ratings,
    target: 5,
    today: "2026-11-20",
  })
  const picked = [...done, ...open].map((p) => p.id)
  assert.deepEqual(v.queue.map((r) => r.id).sort(), picked.sort())
})

test("the queue rows keep their kind and overdue days", async () => {
  const storage = fakeStorage()
  seed(storage, {
    "add-two-numbers": [entry("2026-11-07", "failed")],
    "anagram-groups": [entry("2026-11-17", "failed")],
    "binary-tree-right-side-view": [entry("2026-11-18", "failed")],
  })
  const { app } = await setup(storage)
  const q = app.view().queue
  assert.deepEqual(q.map((r) => r.id), [
    "add-two-numbers",
    "anagram-groups",
    "binary-tree-right-side-view",
    "coin-change",
  ])
  assert.deepEqual(q.map((r) => r.kind), ["due", "due", "due", "new"])
  assert.deepEqual(q.map((r) => r.overdueDays), [12, 2, 1, 0])
})

test("a problem due today is a due row with 0 overdue days", async () => {
  const storage = fakeStorage()
  seed(storage, { [P1]: [entry("2026-11-19", "failed")] })
  const { app } = await setup(storage)
  const r = find(app.view().queue, P1)
  assert.equal(r.kind, "due")
  assert.equal(r.overdueDays, 0)
})
