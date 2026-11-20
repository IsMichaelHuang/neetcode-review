import test from "node:test"
import assert from "node:assert/strict"
import { start } from "../src/main.js"
import { treeUrl } from "../src/github.js"
import { fakeDocument, find, text, fire } from "./dom.js"
import { fakeFetch, fakeStorage, loadJson } from "./helpers.js"
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
