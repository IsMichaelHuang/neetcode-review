import test from "node:test"
import assert from "node:assert/strict"
import {
  parseTree,
  latestPath,
  titleFromId,
  mergeCatalog,
} from "../src/catalog.js"
import { loadJson, ids } from "./helpers.js"

const fixture = loadJson("tests/fixtures/tree.json")
const byId = (id) => parseTree(fixture).find((f) => f.id === id)
const blob = (path) => ({ path, type: "blob" })

test("parseTree finds 110 folders and ignores README.md", () => {
  assert.equal(parseTree(fixture).length, 110)
})

test("parseTree sorts folders by id", () => {
  const list = ids(parseTree(fixture))
  assert.deepEqual(list, [...list].sort())
})

test("latestPath picks the highest submission number", () => {
  assert.ok(
    latestPath(byId("duplicate-integer")).endsWith("submission-4.java"),
  )
})

test("latestPath compares numbers, not strings", () => {
  const folder = {
    files: [
      { path: "a/b/submission-9.py", n: 9 },
      { path: "a/b/submission-10.py", n: 10 },
    ],
  }
  assert.equal(latestPath(folder), "a/b/submission-10.py")
})

for (const item of [
  blob("SQL/x/notes.txt"),
  blob("SQL/x/submission-x.py"),
  blob("SQL/x/submission-1"),
  blob("a/b/c/submission-1.py"),
  blob("T/Bad_Id/submission-1.py"),
  blob("../x/submission-1.py"),
  blob("./x/submission-1.py"),
  { path: "SQL/x", type: "tree" },
]) {
  test(`parseTree drops ${item.type} ${item.path}`, () => {
    assert.equal(parseTree([item]).length, 0)
  })
}

test("parseTree skips malformed items without throwing", () => {
  assert.deepEqual(parseTree([null, 5, { path: 7, type: "blob" }]), [])
})

test("parseTree keeps the folder that sorts first for one id", () => {
  const out = parseTree([
    blob("B/x/submission-0.py"),
    blob("A/x/submission-1.py"),
  ])
  assert.equal(out.length, 1)
  assert.equal(out[0].folder, "A")
  assert.deepEqual(out[0].files, [{ path: "A/x/submission-1.py", n: 1 }])
})

test("titleFromId makes a title", () => {
  assert.equal(titleFromId("two-integer-sum"), "Two Integer Sum")
})

test("mergeCatalog gives an unknown id a default record", () => {
  const folders = parseTree([blob("T/new-problem/submission-0.py")])
  assert.deepEqual(mergeCatalog(folders, [])[0], {
    id: "new-problem",
    title: "New Problem",
    topic: "Unknown",
    difficulty: "Unknown",
    folder: "T",
    latestPath: "T/new-problem/submission-0.py",
  })
})

const k = { id: "k", title: "K", topic: "Arrays", difficulty: "Easy" }

test("mergeCatalog with null folders keeps known problems", () => {
  const p = mergeCatalog(null, [k])[0]
  assert.equal(p.latestPath, null)
  assert.equal(p.folder, null)
  assert.equal(p.title, "K")
})

test("mergeCatalog drops a known problem with no folder", () => {
  assert.equal(mergeCatalog([], [k]).length, 0)
})
