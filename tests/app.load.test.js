import { test } from "node:test"
import assert from "node:assert/strict"
import { NOTICES, TREE_CACHE_KEY } from "../src/config.js"
import { createApp } from "../src/app.js"
import { treeUrl, rawUrl } from "../src/github.js"
import { parseTree, mergeCatalog } from "../src/catalog.js"
import { topicSummary } from "../src/queue.js"
import { saveState } from "../src/store.js"
import { entry, fakeFetch, fakeStorage, loadJson } from "./helpers.js"

const known = loadJson("data/problems.json")
const tree = loadJson("tests/fixtures/tree.json")
const good = { [treeUrl()]: { status: 200, body: { tree } } }
const SOLUTION =
  "Data Structures & Algorithms/duplicate-integer/submission-4.java"

const setup = async ({ routes = good, storage = fakeStorage() } = {}) => {
  const clock = { now: new Date(2026, 10, 20, 12) }
  const { fetchFn, calls } = fakeFetch(routes)
  const make = () =>
    createApp({ fetchFn, storage, known, now: () => clock.now })
  const app = make()
  await app.init()
  return { app, make, calls, storage, clock, routes }
}
const seed = (storage, ratings) =>
  saveState(storage, { version: 1, target: 4, ratings })

test("a fresh start lists 110 problems and 4 new ones", async () => {
  const { app } = await setup()
  const v = app.view()
  assert.equal(v.table.length, 110)
  assert.equal(v.queue.length, 4)
  assert.deepEqual(v.queue.map((r) => r.kind), ["new", "new", "new", "new"])
  assert.equal(v.today, "2026-11-20")
  assert.equal(v.todayLabel, "Fri, Nov 20")
  assert.deepEqual(v.notices, [])
})

test("before init the view uses the known list", () => {
  const { fetchFn } = fakeFetch(good)
  const app = createApp({
    fetchFn,
    storage: fakeStorage(),
    known,
    now: () => new Date(2026, 10, 20, 12),
  })
  assert.equal(app.view().table.length, 110)
})

test("an old cache and status 500 show a stale notice", async () => {
  const storage = fakeStorage()
  const at = new Date(2026, 10, 20, 12).getTime() - 600001
  storage.setItem(TREE_CACHE_KEY, JSON.stringify({ at, tree }))
  const routes = { [treeUrl()]: { status: 500, body: "" } }
  const { app } = await setup({ routes, storage })
  const v = app.view()
  assert.equal(v.table.length, 110)
  assert.deepEqual(v.notices, [NOTICES.stale])
})

test("status 403 and no cache show the known list only", async () => {
  const routes = { [treeUrl()]: { status: 403, body: "<b>x</b>" } }
  const { app } = await setup({ routes })
  const v = app.view()
  assert.equal(v.table.length, 110)
  assert.ok(v.table.every((r) => r.canReveal === false))
  assert.deepEqual(v.notices, [NOTICES.noTree])
  assert.ok(v.notices.every((n) => !n.includes("<b>")))
})

test("a second app inside 10 minutes makes no API request", async () => {
  const { make, calls, clock } = await setup()
  assert.equal(calls.length, 1)
  clock.now = new Date(2026, 10, 20, 12, 9)
  const second = make()
  await second.init()
  assert.equal(calls.length, 1)
  assert.equal(second.view().table.length, 110)
})

test("a solution loads only on reveal, once", async () => {
  const routes = {
    ...good,
    [rawUrl(SOLUTION)]: { status: 200, body: "class A {}" },
  }
  const { app, calls } = await setup({ routes })
  const RAW = "https://raw.githubusercontent.com"
  assert.ok(calls.every((u) => !u.startsWith(RAW)))
  const row = () => app.view().table.find((r) => r.id === "duplicate-integer")
  assert.equal(row().solution, null)
  assert.ok(app.view().table.every((r) => r.solution === null))
  await app.reveal("duplicate-integer")
  assert.equal(calls.length, 2)
  assert.equal(calls[1], rawUrl(SOLUTION))
  assert.deepEqual(row().solution, { text: "class A {}" })
  await app.reveal("duplicate-integer")
  assert.equal(calls.length, 2)
})

test("a failed reveal gives a fixed error, then tries again", async () => {
  const routes = {
    ...good,
    [rawUrl(SOLUTION)]: { status: 404, body: "<i>no</i>" },
  }
  const { app, calls } = await setup({ routes })
  const row = () => app.view().table.find((r) => r.id === "duplicate-integer")
  await app.reveal("duplicate-integer")
  assert.deepEqual(row().solution, { error: NOTICES.revealFailed })
  routes[rawUrl(SOLUTION)] = { status: 200, body: "ok" }
  await app.reveal("duplicate-integer")
  assert.equal(calls.length, 3)
  assert.deepEqual(row().solution, { text: "ok" })
})

test("reveal ignores an unknown id and a problem with no file", async () => {
  const routes = { [treeUrl()]: { status: 403, body: "" } }
  const { app, calls } = await setup({ routes })
  await app.reveal("nope")
  await app.reveal("duplicate-integer")
  assert.equal(calls.length, 1)
})

test("the topic filter keeps only that topic", async () => {
  const { app } = await setup()
  app.setFilter({ topic: "Graphs", status: "all" })
  const v = app.view()
  assert.equal(v.table.length, 12)
  assert.ok(v.table.every((r) => r.topic === "Graphs"))
  assert.deepEqual(v.filters, { topic: "Graphs", status: "all" })
})

test("the status filters keep the matching rows", async () => {
  const storage = fakeStorage()
  seed(storage, {
    "two-integer-sum": [entry("2026-11-18", "failed")],
    "is-anagram": [entry("2026-11-19", "clean")],
    "valid-sudoku": [entry("2026-11-15", "struggled")],
  })
  const { app } = await setup({ storage })
  const pick = (status) => {
    app.setFilter({ topic: "all", status })
    return app.view().table.map((r) => r.id).sort()
  }
  assert.equal(pick("new").length, 107)
  assert.deepEqual(pick("due"), ["two-integer-sum", "valid-sudoku"])
  assert.deepEqual(pick("weak"), ["two-integer-sum", "valid-sudoku"])
  assert.equal(pick("bogus").length, 110)
})

test("the table sorts by title, then id", async () => {
  const { app } = await setup()
  const titles = app.view().table.map((r) => r.title)
  assert.deepEqual(titles, [...titles].sort())
})

test("topic options are sorted and topics match the summary", async () => {
  const { app } = await setup()
  const v = app.view()
  const topics = [...new Set(known.map((k) => k.topic))].sort()
  assert.deepEqual(v.topicOptions, topics)
  const problems = mergeCatalog(parseTree(tree), known)
  assert.deepEqual(v.topics, topicSummary(problems, {}))
})
