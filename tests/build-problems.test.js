import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { buildProblems } from "../scripts/build-lib.mjs"

const item = {
  problem: "Contains Duplicate",
  link: "contains-duplicate/",
  pattern: "Arrays & Hashing",
  difficulty: "Easy",
}
const map = { "duplicate-integer": "contains-duplicate" }

test("maps an id through the name map", () => {
  const r = buildProblems(["duplicate-integer"], [item], map, [])
  assert.deepEqual(r.problems, [
    {
      id: "duplicate-integer",
      title: "Contains Duplicate",
      topic: "Arrays & Hashing",
      difficulty: "Easy",
    },
  ])
})

test("uses the id as slug when the map has no entry", () => {
  const r = buildProblems(["contains-duplicate"], [item], {}, [])
  assert.deepEqual(r.missing, [])
})

test("reports an unknown id as missing", () => {
  assert.deepEqual(buildProblems(["nope"], [item], {}, []).missing, [
    "nope",
  ])
})

test("reports a mapped slug that is not in the list", () => {
  const r = buildProblems(["a"], [item], { a: "not-in-list" }, [])
  assert.deepEqual(r.missing, ["a"])
})

test("a manual entry wins over the list", () => {
  const manual = {
    id: "contains-duplicate",
    title: "Mine",
    topic: "SQL",
    difficulty: "Unknown",
  }
  const r = buildProblems(["contains-duplicate"], [item], {}, [manual])
  assert.deepEqual(r.problems[0], manual)
  assert.deepEqual(r.missing, [])
})

test("an invalid difficulty becomes Unknown", () => {
  const bad = { ...item, difficulty: "Insane" }
  const r = buildProblems(["contains-duplicate"], [bad], {}, [])
  assert.equal(r.problems[0].difficulty, "Unknown")
})

test("a non-string title sends the id to missing", () => {
  const bad = { ...item, problem: 5 }
  const r = buildProblems(["contains-duplicate"], [bad], {}, [])
  assert.deepEqual(r.missing, ["contains-duplicate"])
  assert.deepEqual(r.problems, [])
})

test("an inherited key is not a map entry", () => {
  const r = buildProblems(["constructor"], [item], {}, [])
  assert.deepEqual(r.missing, ["constructor"])
})

test("problems are sorted by id", () => {
  const list = [
    { ...item, link: "a/" },
    { ...item, link: "b/" },
  ]
  const r = buildProblems(["b", "a"], list, {}, [])
  assert.deepEqual(
    r.problems.map((p) => p.id),
    ["a", "b"],
  )
})

test("a manual entry with an id outside the list is returned", () => {
  const manual = { id: "mine", title: "M", topic: "SQL", difficulty: "Easy" }
  const r = buildProblems(["mine"], [item], {}, [manual])
  assert.deepEqual(r.problems, [manual])
  assert.deepEqual(r.missing, [])
})

test("a mixed run returns one problem and one missing id", () => {
  const r = buildProblems(["contains-duplicate", "nope"], [item], {}, [])
  assert.equal(r.problems.length, 1)
  assert.deepEqual(r.missing, ["nope"])
})

test("build-lib takes its levels from config.js", () => {
  const code = readFileSync(
    new URL("../scripts/build-lib.mjs", import.meta.url),
    "utf8",
  )
  assert.match(code, /import[^;\n]*\bLEVEL_ORDER\b/)
  assert.match(code, /from "\.\.\/src\/config\.js"/)
  assert.doesNotMatch(code, /LEVELS =/)
})
