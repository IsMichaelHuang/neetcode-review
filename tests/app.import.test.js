import { test } from "node:test"
import assert from "node:assert/strict"
import { NOTICES, STORAGE_KEY } from "../src/config.js"
import { createApp } from "../src/app.js"
import { treeUrl } from "../src/github.js"
import { saveState } from "../src/store.js"
import { entry, fakeFetch, fakeStorage, loadJson } from "./helpers.js"

const known = loadJson("data/problems.json")
const tree = loadJson("tests/fixtures/tree.json")
const routes = { [treeUrl()]: { status: 200, body: { tree } } }
const P1 = "two-integer-sum"
const P2 = "is-anagram"
const imported = JSON.stringify({
  version: 1,
  target: 6,
  ratings: { [P2]: [entry("2026-11-19", "clean")] },
})

const setup = async (ratings = { [P1]: [entry("2026-11-18", "failed")] }) => {
  const storage = fakeStorage()
  saveState(storage, { version: 1, target: 4, ratings })
  const { fetchFn } = fakeFetch(routes)
  const make = () =>
    createApp({
      fetchFn,
      storage,
      known,
      now: () => new Date(2026, 10, 20, 12),
    })
  const app = make()
  await app.init()
  return { app, make, storage }
}
const find = (list, id) => list.find((r) => r.id === id)

test("bad text is refused with a fixed error", async () => {
  const { app, storage } = await setup()
  const before = storage.getItem(STORAGE_KEY)
  let asked = 0
  const r = app.importText("{oops secret-text", () => asked++)
  assert.equal(r.ok, false)
  assert.equal(typeof r.error, "string")
  assert.equal(r.error.includes("secret-text"), false)
  assert.equal(asked, 0)
  assert.equal(app.view().importError, r.error)
  assert.equal(find(app.view().table, P1).lastRating, "failed")
  assert.equal(storage.getItem(STORAGE_KEY), before)
})

test("valid text with a failed save still shows the data", async () => {
  const { app, storage } = await setup()
  storage.failWrites = true
  assert.deepEqual(app.importText(imported, () => true), { ok: true })
  const v = app.view()
  assert.equal(find(v.table, P2).lastRating, "clean")
  assert.deepEqual(v.notices, [NOTICES.cannotSave])
})

test("a cancelled import changes nothing", async () => {
  const { app, storage } = await setup()
  const before = storage.getItem(STORAGE_KEY)
  const r = app.importText(imported, () => false)
  assert.deepEqual(r, { ok: false, cancelled: true })
  const v = app.view()
  assert.equal(v.importError, null)
  assert.equal(v.target, 4)
  assert.equal(find(v.table, P2).lastRating, null)
  assert.equal(storage.getItem(STORAGE_KEY), before)
})

test("a confirmed import replaces the data and saves it", async () => {
  const { app, make } = await setup()
  app.importText("{bad", () => true)
  assert.deepEqual(app.importText(imported, () => true), { ok: true })
  const check = (v) => {
    assert.equal(v.target, 6)
    assert.equal(v.importError, null)
    assert.equal(find(v.table, P2).lastRating, "clean")
    assert.equal(find(v.table, P1).lastRating, null)
  }
  check(app.view())
  const again = make()
  await again.init()
  check(again.view())
})

test("ratings for an id that is gone stay in the export", async () => {
  const { app } = await setup({ "gone-id": [entry("2026-11-01", "clean")] })
  app.rate(P1, "clean")
  assert.ok(app.exportText().includes("gone-id"))
  const v = app.view()
  assert.equal(v.queue.some((r) => r.id === "gone-id"), false)
  assert.equal(v.table.some((r) => r.id === "gone-id"), false)
})

test("a failed read never lets an import overwrite saved data", async () => {
  const storage = fakeStorage()
  saveState(storage, {
    version: 1,
    target: 4,
    ratings: { [P1]: [entry("2026-11-18", "failed")] },
  })
  const before = storage.getItem(STORAGE_KEY)
  storage.failReads = true
  const { fetchFn } = fakeFetch(routes)
  const app = createApp({
    fetchFn,
    storage,
    known,
    now: () => new Date(2026, 10, 20, 12),
  })
  await app.init()
  assert.deepEqual(app.importText(imported, () => true), { ok: true })
  storage.failReads = false
  assert.equal(storage.getItem(STORAGE_KEY), before)
  const v = app.view()
  assert.equal(find(v.table, P2).lastRating, "clean")
  assert.equal(v.target, 6)
})
