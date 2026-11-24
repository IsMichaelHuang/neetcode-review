import test from "node:test"
import assert from "node:assert/strict"
import { start } from "../src/main.js"
import { treeUrl } from "../src/github.js"
import { fakeDocument, fakeWindow, find, text, fire } from "./dom.js"
import { fakeFetch, fakeStorage, loadJson } from "./helpers.js"
import { saveState } from "../src/store.js"
import { createApp } from "../src/app.js"

const known = loadJson("data/problems.json")
const routes = () => ({
  [treeUrl()]: {
    status: 200,
    body: { tree: loadJson("tests/fixtures/tree.json") },
  },
  "data/problems.json": { status: 200, body: known },
})
const now = () => new Date(2026, 10, 20, 12)

test("start renders 4 queue rows into the app element", async () => {
  const doc = fakeDocument()
  const { fetchFn, calls } = fakeFetch(routes())
  await start({
    document: doc,
    fetchFn,
    storage: fakeStorage(),
    now,
    confirmFn: () => true,
  })
  assert.ok(calls.includes("data/problems.json"))
  assert.equal(find(doc.app, (n) => n.tag === "ol")[0].children.length, 4)
})

test("a visibilitychange event shows ratings from another app", async () => {
  const doc = fakeDocument()
  const storage = fakeStorage()
  const { fetchFn } = fakeFetch(routes())
  await start({ document: doc, fetchFn, storage, now, confirmFn: () => true })
  assert.ok(text(doc.app).includes("0 of 4 done"))

  const other = createApp({ fetchFn, storage, now, known })
  await other.init()
  other.rate(other.view().queue[0].id, "clean")

  fire(doc, "visibilitychange")
  assert.ok(text(doc.app).includes("1 of 4 done"))
})

test("the first paint shows saved ratings while the tree loads", async () => {
  const doc = fakeDocument()
  const storage = fakeStorage()
  const ratings = {
    "two-integer-sum": [{ date: "2026-11-20", rating: "clean" }],
  }
  saveState(storage, { version: 1, target: 4, ratings })
  const base = fakeFetch(routes()).fetchFn
  const fetchFn = (url) =>
    url === treeUrl() ? new Promise(() => {}) : base(url)
  start({ document: doc, fetchFn, storage, now, confirmFn: () => true })
  await new Promise((r) => setTimeout(r, 0))
  assert.ok(text(doc.app).includes("1 of 4 done"))
})

test("a problems file that is not a list is ignored", async () => {
  const doc = fakeDocument()
  const r = { ...routes(), "data/problems.json": { status: 200, body: {} } }
  const { fetchFn } = fakeFetch(r)
  await start({
    document: doc,
    fetchFn,
    storage: fakeStorage(),
    now,
    confirmFn: () => true,
    win: fakeWindow("#/problems"),
  })
  const rows = find(doc.app, (n) => n.tag === "tr")
  assert.equal(rows.length, 111)
})

test("focus moves to the next control after a target change", async () => {
  const doc = fakeDocument()
  const { fetchFn } = fakeFetch(routes())
  await start({
    document: doc,
    fetchFn,
    storage: fakeStorage(),
    now,
    confirmFn: () => true,
    win: fakeWindow("#/settings"),
  })
  const byId = (id) => find(doc.app, (n) => n.attrs.id === id)[0]
  const input = byId("target")
  const oldExport = byId("export")
  doc.activeElement = input
  input.value = "3"
  fire(input, "change")
  doc.activeElement = oldExport
  await new Promise((r) => setTimeout(r, 0))
  const newExport = byId("export")
  assert.equal(doc.activeElement, newExport)
  assert.notEqual(newExport, oldExport)
  assert.equal(byId("target").value, "3")
})

const sections = (doc) =>
  find(doc.app, (n) => n.tag === "section").map((n) => n.className)

test("a start at #/topics draws the Topics section only", async () => {
  const doc = fakeDocument()
  const { fetchFn } = fakeFetch(routes())
  const win = fakeWindow("#/topics")
  await start({
    document: doc,
    fetchFn,
    storage: fakeStorage(),
    now,
    confirmFn: () => true,
    win,
  })
  assert.deepEqual(sections(doc), ["topics"])
})

test("a start with no win draws the Today section only", async () => {
  const doc = fakeDocument()
  const { fetchFn } = fakeFetch(routes())
  await start({
    document: doc,
    fetchFn,
    storage: fakeStorage(),
    now,
    confirmFn: () => true,
  })
  assert.deepEqual(sections(doc), ["today"])
})

const boot = async (hash, storage = fakeStorage()) => {
  const doc = fakeDocument()
  const win = fakeWindow(hash)
  const { fetchFn } = fakeFetch(routes())
  await start({
    document: doc,
    fetchFn,
    storage,
    now,
    confirmFn: () => true,
    win,
  })
  const byId = (id) => find(doc.app, (n) => n.attrs.id === id)[0]
  return { doc, win, byId }
}
const go = (win, hash) => {
  win.location.hash = hash
  win.fire("hashchange")
}

test("a start at #/topics sets the title and moves no focus", async () => {
  const { doc } = await boot("#/topics")
  assert.equal(doc.title, "Topics · NeetCode Review")
  assert.notEqual(doc.activeElement?.id, "topics-h")
})

test("a start at an unknown hash gives Today and the plain title", async () => {
  const { doc } = await boot("#/nope")
  assert.equal(doc.title, "NeetCode Review")
  assert.deepEqual(sections(doc), ["today"])
})

test("a hashchange to another page paints, scrolls, and focuses", async () => {
  const { doc, win, byId } = await boot("#/")
  byId("nav-settings").focus()
  go(win, "#/settings")
  assert.deepEqual(sections(doc), ["settings"])
  assert.equal(doc.title, "Settings · NeetCode Review")
  assert.deepEqual(win.scrolls, [[0, 0]])
  assert.equal(doc.activeElement.id, "settings-h")
})

test("a hashchange within the same page does nothing", async () => {
  const { doc, win, byId } = await boot("#/")
  byId("nav-topics").focus()
  go(win, "#/typo")
  assert.deepEqual(win.scrolls, [])
  assert.equal(doc.activeElement.id, "nav-topics")
  assert.deepEqual(sections(doc), ["today"])
})

test("a rating press does not scroll", async () => {
  const { doc, win } = await boot("#/")
  const pick = () =>
    find(doc.app, (n) => /^rate-.*-clean$/.test(n.attrs.id ?? ""))[0]
  fire(pick(), "click")
  assert.equal(pick().attrs["aria-pressed"], "true")
  assert.deepEqual(win.scrolls, [])
})

test("a visibilitychange on #/topics still shows Topics", async () => {
  const { doc } = await boot("#/topics")
  fire(doc, "visibilitychange")
  assert.deepEqual(sections(doc), ["topics"])
})

test("a rating stays pressed after a trip when writes fail", async () => {
  const storage = fakeStorage({ failWrites: true })
  const { doc, win } = await boot("#/", storage)
  const pick = () =>
    find(doc.app, (n) => /^rate-.*-clean$/.test(n.attrs.id ?? ""))[0]
  const button = pick()
  fire(button, "click")
  assert.equal(pick().attrs["aria-pressed"], "true")
  go(win, "#/topics")
  go(win, "#/")
  assert.equal(pick().attrs["aria-pressed"], "true")
  assert.equal(pick().attrs.id, button.attrs.id)
})

// A paint can run after the hash changes and before hashchange fires.
test("a paint that sees a new page scrolls and focuses one time", async () => {
  const { doc, win, byId } = await boot("#/")
  byId("nav-settings").focus()
  win.location.hash = "#/settings"
  fire(doc, "visibilitychange")
  assert.deepEqual(sections(doc), ["settings"])
  assert.equal(doc.activeElement.id, "settings-h")
  win.fire("hashchange")
  assert.deepEqual(win.scrolls, [[0, 0]])
  assert.equal(doc.activeElement.id, "settings-h")
})
