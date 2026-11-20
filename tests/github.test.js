import { test } from "node:test"
import assert from "node:assert/strict"
import { TREE_CACHE_KEY } from "../src/config.js"
import {
  treeUrl,
  rawUrl,
  problemUrl,
  folderUrl,
  loadTree,
} from "../src/github.js"
import { fakeFetch, fakeStorage, loadJson } from "./helpers.js"

const R = "IsMichaelHuang/neetcode-submissions-aquuq6h3"
const F = "Data%20Structures%20%26%20Algorithms"
const tree = loadJson("tests/fixtures/tree.json")
const NOW = 1_000_000_000
const good = { status: 200, body: { tree } }

const setup = ({ age, route, cache } = {}) => {
  const storage = fakeStorage()
  if (cache !== undefined) storage.setItem(TREE_CACHE_KEY, cache)
  else if (age !== undefined) {
    const at = NOW - age
    storage.setItem(TREE_CACHE_KEY, JSON.stringify({ at, tree }))
  }
  const { fetchFn, calls } = fakeFetch(route ? { [treeUrl()]: route } : {})
  return { storage, fetchFn, calls }
}
const cached = (storage) => JSON.parse(storage.getItem(TREE_CACHE_KEY))

test("treeUrl", () => {
  assert.equal(
    treeUrl(),
    `https://api.github.com/repos/${R}/git/trees/main?recursive=1`,
  )
})

test("rawUrl encodes each path segment", () => {
  const path =
    "Data Structures & Algorithms/duplicate-integer/submission-4.java"
  assert.equal(
    rawUrl(path),
    `https://raw.githubusercontent.com/${R}/main/${F}` +
      "/duplicate-integer/submission-4.java",
  )
})

test("problemUrl", () => {
  assert.equal(
    problemUrl("duplicate-integer"),
    "https://neetcode.io/problems/duplicate-integer",
  )
})

test("folderUrl", () => {
  assert.equal(
    folderUrl("Data Structures & Algorithms", "duplicate-integer"),
    `https://github.com/${R}/tree/main/${F}/duplicate-integer`,
  )
})

test("folderUrl is null without a folder", () => {
  assert.equal(folderUrl(null, "x"), null)
})

test("a cache of 599999 ms makes no request", async () => {
  const { storage, fetchFn, calls } = setup({ age: 599999, route: good })
  const r = await loadTree(fetchFn, storage, NOW)
  assert.deepEqual(r, { tree, stale: false })
  assert.deepEqual(calls, [])
})

test("a cache of 600000 ms makes one request and updates at", async () => {
  const { storage, fetchFn, calls } = setup({ age: 600000, route: good })
  const r = await loadTree(fetchFn, storage, NOW)
  assert.deepEqual(r, { tree, stale: false })
  assert.deepEqual(calls, [treeUrl()])
  assert.deepEqual(cached(storage), { at: NOW, tree })
})

test("a good answer with no cache is written to the cache", async () => {
  const { storage, fetchFn } = setup({ route: good })
  const r = await loadTree(fetchFn, storage, NOW)
  assert.deepEqual(r, { tree, stale: false })
  assert.deepEqual(cached(storage), { at: NOW, tree })
})

test("an old cache and a thrown error give the stale cache", async () => {
  const route = new Error("offline")
  const { storage, fetchFn } = setup({ age: 700000, route })
  assert.deepEqual(await loadTree(fetchFn, storage, NOW), {
    tree,
    stale: true,
  })
})

test("an old cache and status 403 give the stale cache", async () => {
  const route = { status: 403, body: { message: "rate limit" } }
  const { storage, fetchFn } = setup({ age: 700000, route })
  assert.deepEqual(await loadTree(fetchFn, storage, NOW), {
    tree,
    stale: true,
  })
})

test("an old cache and an empty tree give the stale cache", async () => {
  const route = { status: 200, body: { tree: [] } }
  const { storage, fetchFn } = setup({ age: 700000, route })
  assert.deepEqual(await loadTree(fetchFn, storage, NOW), {
    tree,
    stale: true,
  })
})

test("an old cache and a truncated tree give the stale cache", async () => {
  const route = { status: 200, body: { tree, truncated: true } }
  const { storage, fetchFn } = setup({ age: 700000, route })
  assert.deepEqual(await loadTree(fetchFn, storage, NOW), {
    tree,
    stale: true,
  })
})

test("no cache and status 403 give no tree", async () => {
  const route = { status: 403, body: "<b>x</b>" }
  const { storage, fetchFn } = setup({ route })
  assert.deepEqual(await loadTree(fetchFn, storage, NOW), {
    tree: null,
    stale: false,
  })
})

for (const cache of ["{oops", JSON.stringify({ at: 1, tree: "x" })]) {
  test(`cache text ${cache} counts as no cache`, async () => {
    const route = { status: 403, body: "" }
    const { storage, fetchFn, calls } = setup({ cache, route })
    assert.deepEqual(await loadTree(fetchFn, storage, NOW), {
      tree: null,
      stale: false,
    })
    assert.equal(calls.length, 1)
  })
}

test("a cache dated in the future makes one request", async () => {
  const { storage, fetchFn, calls } = setup({ age: -1, route: good })
  const r = await loadTree(fetchFn, storage, NOW)
  assert.deepEqual(r, { tree, stale: false })
  assert.equal(calls.length, 1)
})

test("a failed cache write does not throw", async () => {
  const { storage, fetchFn } = setup({ route: good })
  storage.failWrites = true
  assert.deepEqual(await loadTree(fetchFn, storage, NOW), {
    tree,
    stale: false,
  })
})
