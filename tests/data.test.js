import { test } from "node:test"
import assert from "node:assert/strict"
import { mergeCatalog, parseTree } from "../src/catalog.js"
import { loadJson } from "./helpers.js"

const known = loadJson("data/problems.json")
const fixture = loadJson("tests/fixtures/tree.json")
const all = mergeCatalog(parseTree(fixture), known)
const count = (key, value) =>
  all.filter((p) => p[key] === value).length
const find = (id) => all.find((p) => p.id === id)

test("the catalog has 110 unique problems with titles", () => {
  assert.equal(all.length, 110)
  assert.equal(new Set(all.map((p) => p.id)).size, 110)
  assert.ok(all.every((p) => p.title.length > 0))
})

test("difficulty counts match", () => {
  assert.equal(count("difficulty", "Medium"), 76)
  assert.equal(count("difficulty", "Easy"), 27)
  assert.equal(count("difficulty", "Hard"), 5)
  assert.equal(count("difficulty", "Unknown"), 2)
})

test("topic counts match", () => {
  assert.equal(count("topic", "SQL"), 2)
  assert.equal(count("topic", "Unknown"), 0)
})

test("known titles and topics are right", () => {
  assert.equal(find("duplicate-integer").title, "Contains Duplicate")
  assert.equal(find("two-integer-sum").title, "Two Sum")
  assert.equal(find("find-the-town-judge").topic, "Graphs")
})

test("titles and topics are safe and short", () => {
  for (const p of all) {
    for (const text of [p.title, p.topic]) {
      assert.ok(!/[<>]/.test(text), p.id)
      assert.ok(text.length <= 100, p.id)
    }
  }
})
