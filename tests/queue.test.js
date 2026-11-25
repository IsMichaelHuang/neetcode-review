import { test } from "node:test"
import assert from "node:assert/strict"
import {
  buildToday,
  byLevel,
  startOrder,
  topicSummary,
} from "../src/queue.js"
import { mergeCatalog, parseTree } from "../src/catalog.js"
import { entry, ids, loadJson, problem } from "./helpers.js"

const today = "2026-11-20"
const build = (problems, ratings = {}, target = 4) =>
  buildToday({ problems, ratings, target, today })
const newOnes = (n) =>
  Array.from({ length: n }, (_, i) => problem(`n${i}`, `T${i}`))
const dueSet = (n) =>
  Array.from({ length: n }, (_, i) => problem(`d${i}`, "D"))
const failedOn = (list, date) =>
  Object.fromEntries(list.map((p) => [p.id, [entry(date, "failed")]]))

test("startOrder takes one problem per topic in turn", () => {
  const list = [problem("a1", "A"), problem("a2", "A"), problem("b1", "B")]
  assert.deepEqual(ids(startOrder(list)), ["a1", "b1", "a2"])
})

test("startOrder groups by Medium, Hard, Easy, then others", () => {
  const list = [
    problem("e", "A", "Easy"),
    problem("h", "A", "Hard"),
    problem("m", "A", "Medium"),
    problem("u", "A", "Unknown"),
  ]
  assert.deepEqual(ids(startOrder(list)), ["m", "h", "e", "u"])
})

test("AC2: a fresh start gives four Medium problems of mixed topics", () => {
  const problems = mergeCatalog(
    parseTree(loadJson("tests/fixtures/tree.json")),
    loadJson("data/problems.json"),
  )
  const r = build(problems)
  assert.equal(r.open.length, 4)
  assert.ok(r.open.every((o) => o.difficulty === "Medium"))
  for (let i = 1; i < r.open.length; i++) {
    assert.notEqual(r.open[i].topic, r.open[i - 1].topic)
  }
  assert.deepEqual(r.done, [])
  assert.equal(r.waiting, 0)
})

test("AC5: due problems come first by due date, then new ones", () => {
  const problems = [
    problem("p1", "A"),
    problem("p2", "B"),
    problem("p3", "C"),
    problem("n1", "D"),
    problem("n2", "E"),
  ]
  const ratings = {
    p1: [entry("2026-11-01", "clean")],
    p2: [entry("2026-11-18", "failed")],
    p3: [entry("2026-11-15", "struggled")],
  }
  const r = build(problems, ratings)
  assert.deepEqual(ids(r.open), [
    "p1",
    "p3",
    "p2",
    "n1",
  ])
})

test("a problem due today is open", () => {
  const r = build([problem("p", "A")], { p: [entry("2026-11-19", "failed")] })
  assert.equal(r.open.length, 1)
  assert.equal(r.open[0].id, "p")
})

test("a problem due in the future is not open", () => {
  const r = build([problem("p", "A")], { p: [entry("2026-11-19", "clean")] })
  assert.deepEqual(r.open, [])
  assert.equal(r.waiting, 0)
})

test("6 due with target 4 gives 4 open and 2 waiting", () => {
  const list = dueSet(6)
  const r = build(list, failedOn(list, "2026-11-18"))
  assert.equal(r.open.length, 4)
  assert.equal(r.waiting, 2)
})

test("4 rated today and 2 due give no open slots and 2 waiting", () => {
  const rated = Array.from({ length: 4 }, (_, i) => problem(`r${i}`, "R"))
  const due = dueSet(2)
  const ratings = {
    ...Object.fromEntries(
      rated.map((p) => [p.id, [entry(today, "clean")]]),
    ),
    ...failedOn(due, "2026-11-18"),
  }
  const r = build([...rated, ...due], ratings)
  assert.equal(r.done.length, 4)
  assert.deepEqual(r.open, [])
  assert.equal(r.waiting, 2)
})

test("5 rated today with target 4 gives done 5 and no open", () => {
  const rated = Array.from({ length: 5 }, (_, i) => problem(`r${i}`, "R"))
  const ratings = Object.fromEntries(
    rated.map((p) => [p.id, [entry(today, "clean")]]),
  )
  const r = build([...rated, ...newOnes(3)], ratings)
  assert.equal(r.done.length, 5)
  assert.deepEqual(r.open, [])
})

test("done is sorted by id", () => {
  const list = [problem("b", "A"), problem("a", "A")]
  const ratings = failedOn(list, today)
  assert.deepEqual(ids(build(list, ratings).done), ["a", "b"])
})

test("rating a problem today keeps the order of the new problems", () => {
  const list = [
    problem("a1", "A"),
    problem("b1", "B"),
    problem("c1", "C"),
    problem("d1", "D"),
    problem("a2", "A"),
  ]
  const before = build(list)
  assert.deepEqual(ids(before.open), [
    "a1",
    "b1",
    "c1",
    "d1",
  ])
  const after = build(list, { a1: [entry(today, "clean")] })
  assert.deepEqual(ids(after.done), ["a1"])
  assert.deepEqual(ids(after.open), [
    "b1",
    "c1",
    "d1",
  ])
})

test("a rating for an id that is not in problems changes nothing", () => {
  const list = [problem("a1", "A"), problem("b1", "B")]
  const base = build(list)
  const extra = build(list, { "gone-id": [entry(today, "failed")] })
  assert.deepEqual(extra, base)
})

test("an id such as constructor with no rating is a new problem", () => {
  const r = build([problem("constructor", "A")])
  assert.equal(r.open.length, 1)
  assert.equal(r.open[0].id, "constructor")
})

test("topicSummary counts total, reviewed, and weak, sorted by topic", () => {
  const list = [
    problem("b1", "B"),
    problem("a1", "A"),
    problem("a2", "A"),
  ]
  const ratings = { a1: [entry("2026-11-18", "failed")] }
  assert.deepEqual(topicSummary(list, ratings), [
    { topic: "A", total: 2, reviewed: 1, weak: 1 },
    { topic: "B", total: 1, reviewed: 0, weak: 0 },
  ])
})

test("topicSummary is not weak after a clean rating", () => {
  const list = [problem("a1", "A"), problem("a2", "A")]
  const ratings = {
    a1: [entry("2026-11-17", "failed"), entry("2026-11-18", "clean")],
  }
  assert.deepEqual(topicSummary(list, ratings), [
    { topic: "A", total: 2, reviewed: 1, weak: 0 },
  ])
})

test("topicSummary ignores a rating for an unknown id", () => {
  const list = [problem("a1", "A")]
  const r = topicSummary(list, { x: [entry(today, "failed")] })
  assert.deepEqual(r, [{ topic: "A", total: 1, reviewed: 0, weak: 0 }])
})

const lv = (id, difficulty) => ({ ...problem(id, "T"), difficulty })

test("byLevel sorts Easy, Medium, Hard, then other levels", () => {
  const list = [lv("h", "Hard"), lv("u", "Unknown"), lv("e", "Easy")]
  list.push(lv("m", "Medium"))
  assert.deepEqual(ids(byLevel(list)), ["e", "m", "h", "u"])
})

test("byLevel puts constructor and a missing level last, in order", () => {
  const list = [lv("x", "constructor"), lv("e", "Easy"), lv("y", undefined)]
  assert.deepEqual(ids(byLevel(list)), ["e", "x", "y"])
})

test("byLevel keeps the input order inside one level", () => {
  const list = ["c", "a", "b"].map((id) => lv(id, "Medium"))
  assert.deepEqual(ids(byLevel(list)), ["c", "a", "b"])
})

test("byLevel does not change its input", () => {
  const list = [lv("h", "Hard"), lv("e", "Easy")]
  const copy = [...list]
  const out = byLevel(list)
  assert.notEqual(out, list)
  assert.deepEqual(list, copy)
})

test("byLevel of an empty list is an empty list", () => {
  assert.deepEqual(byLevel([]), [])
})
