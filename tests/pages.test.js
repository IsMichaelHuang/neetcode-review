import test from "node:test"
import assert from "node:assert/strict"
import { PAGES, pageOf, titleOf } from "../src/pages.js"

const HASH = { today: "#/", topics: "#/topics", problems: "#/problems",
  settings: "#/settings" }

test("PAGES lists the four pages in order", () => {
  assert.deepEqual(PAGES.map((p) => p.id), Object.keys(HASH))
  for (const p of PAGES) assert.equal(p.hash, HASH[p.id])
  assert.deepEqual(PAGES.map((p) => p.label),
    ["Today", "Topics", "Problems", "Settings"])
})

test("PAGES and each item are frozen", () => {
  assert.ok(Object.isFrozen(PAGES))
  for (const p of PAGES) assert.ok(Object.isFrozen(p))
})

test("each hash and each id is distinct", () => {
  assert.equal(new Set(PAGES.map((p) => p.hash)).size, PAGES.length)
  assert.equal(new Set(PAGES.map((p) => p.id)).size, PAGES.length)
})

test("pageOf maps each page hash to its id", () => {
  for (const [id, hash] of Object.entries(HASH)) {
    assert.equal(pageOf(hash), id)
  }
})

test("pageOf gives today for every other value", () => {
  for (const v of ["", "#topics", "#/Topics", "#/topics/", "#/constructor",
    "#/__proto__", undefined, null]) {
    assert.equal(pageOf(v), "today")
  }
})

test("titleOf adds the label to the app name", () => {
  assert.equal(titleOf("today"), "NeetCode Review")
  assert.equal(titleOf("topics"), "Topics · NeetCode Review")
  assert.equal(titleOf("problems"), "Problems · NeetCode Review")
  assert.equal(titleOf("settings"), "Settings · NeetCode Review")
})

test("titleOf gives the app name for an unknown id", () => {
  assert.equal(titleOf("nope"), "NeetCode Review")
  assert.equal(titleOf("constructor"), "NeetCode Review")
})
