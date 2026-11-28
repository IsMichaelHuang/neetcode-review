import { test } from "node:test"
import assert from "node:assert/strict"
import { BACKUP_DAYS, EXPORTED_KEY, STORAGE_KEY } from "../src/config.js"
import { createApp } from "../src/app.js"
import { treeUrl } from "../src/github.js"
import { saveState } from "../src/store.js"
import { entry, fakeFetch, fakeStorage, loadJson } from "./helpers.js"

const known = loadJson("data/problems.json")
const tree = loadJson("tests/fixtures/tree.json")
const routes = { [treeUrl()]: { status: 200, body: { tree } } }
const P1 = "two-integer-sum"
const P2 = "is-anagram"
const TODAY = "2026-11-20"
const imported = JSON.stringify({
  version: 1,
  target: 4,
  ratings: { [P2]: [entry("2026-11-19", "clean")] },
})

const make = (storage) =>
  createApp({
    fetchFn: fakeFetch(routes).fetchFn,
    storage,
    known,
    now: () => new Date(2026, 10, 20, 12),
  })

const setup = async ({ ratings = {}, exported } = {}) => {
  const storage = fakeStorage()
  saveState(storage, { version: 1, target: 4, ratings })
  if (exported) storage.setItem(EXPORTED_KEY, exported)
  const app = make(storage)
  await app.init()
  return { app, storage }
}
const rated = (date) => ({ [P1]: [entry(date, "clean")] })

test("there is no notice when there are no ratings", async () => {
  const { app } = await setup({ exported: "2026-01-01" })
  assert.equal(app.view().backupDue, false)
})

test("14 days after an export gives no notice", async () => {
  const { app } = await setup({
    ratings: rated("2026-11-19"),
    exported: "2026-11-06",
  })
  assert.equal(BACKUP_DAYS, 14)
  assert.equal(app.view().backupDue, false)
})

test("15 days after an export gives the notice", async () => {
  const { app } = await setup({
    ratings: rated("2026-11-19"),
    exported: "2026-11-05",
  })
  assert.equal(app.view().backupDue, true)
})

test("a first rating 15 days ago with no export gives the notice", async () => {
  const { app } = await setup({ ratings: rated("2026-11-05") })
  assert.equal(app.view().backupDue, true)
})

test("a first rating 14 days ago with no export gives no notice", async () => {
  const { app } = await setup({ ratings: rated("2026-11-06") })
  assert.equal(app.view().backupDue, false)
})

test("the oldest rating date counts, not the newest", async () => {
  const ratings = {
    [P1]: [entry("2026-10-01", "clean"), entry("2026-11-19", "clean")],
  }
  const { app } = await setup({ ratings })
  assert.equal(app.view().backupDue, true)
})

test("an export date in the future gives the notice", async () => {
  const { app } = await setup({
    ratings: rated("2026-11-19"),
    exported: "2026-11-25",
  })
  assert.equal(app.view().backupDue, true)
})

test("a failed read gives no notice", async () => {
  const { app, storage } = await setup({ ratings: rated("2026-10-01") })
  assert.equal(app.view().backupDue, true)
  storage.failReads = true
  app.refresh()
  assert.equal(app.view().backupDue, false)
})

test("markExported clears the notice and stores today", async () => {
  const { app, storage } = await setup({ ratings: rated("2026-10-01") })
  app.markExported()
  assert.equal(app.view().backupDue, false)
  assert.equal(storage.getItem(EXPORTED_KEY), TODAY)
})

test("markExported does nothing while the read failed", async () => {
  const storage = fakeStorage()
  saveState(storage, { version: 1, target: 4, ratings: rated("2026-10-01") })
  storage.failReads = true
  const app = make(storage)
  await app.init()
  storage.failReads = false
  app.markExported()
  assert.equal(storage.getItem(EXPORTED_KEY), null)
})

test("a failed save still clears the notice in this session", async () => {
  const { app, storage } = await setup({ ratings: rated("2026-10-01") })
  storage.failWrites = true
  app.markExported()
  assert.equal(app.view().backupDue, false)
  assert.equal(storage.getItem(EXPORTED_KEY), null)
})

test("markExported leaves the ratings key alone", async () => {
  const { app, storage } = await setup({ ratings: rated("2026-10-01") })
  const before = storage.getItem(STORAGE_KEY)
  app.markExported()
  assert.equal(storage.getItem(STORAGE_KEY), before)
})

test("a good import sets the export date", async () => {
  const { app, storage } = await setup({ ratings: rated("2026-10-01") })
  assert.deepEqual(app.importText(imported, () => true), { ok: true })
  assert.equal(storage.getItem(EXPORTED_KEY), TODAY)
  assert.equal(app.view().backupDue, false)
})

test("a cancelled import does not set the export date", async () => {
  const { app, storage } = await setup({ ratings: rated("2026-10-01") })
  app.importText(imported, () => false)
  assert.equal(storage.getItem(EXPORTED_KEY), null)
  assert.equal(app.view().backupDue, true)
})

test("a failed import does not set the export date", async () => {
  const { app, storage } = await setup({ ratings: rated("2026-10-01") })
  app.importText("{oops", () => true)
  assert.equal(storage.getItem(EXPORTED_KEY), null)
  assert.equal(app.view().backupDue, true)
})

test("a second app sees the date after refresh", async () => {
  const { app, storage } = await setup({ ratings: rated("2026-10-01") })
  const other = make(storage)
  await other.init()
  assert.equal(other.view().backupDue, true)
  app.markExported()
  other.refresh()
  assert.equal(other.view().backupDue, false)
})
