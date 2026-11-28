// Tests of the Topics section and the Problems section.
import test from "node:test"
import assert from "node:assert/strict"
import { find, fire, hasClass, byClass } from "./dom.js"
import { row, view, draw, byId, one } from "./render.fixtures.js"

const onTopics = (v, log) => draw(v, log, "topics")
const onProblems = (v, log) => draw(v, log, "problems")

const tableRows = (doc) =>
  find(doc.app, (n) => n.tag === "tbody")[0].children
const cells = (tr) => {
  assert.ok(tr, "no table row")
  assert.ok(tr.children.length >= 5, "short row")
  return tr.children
}
const label = (doc, id) =>
  find(doc.app, (n) => n.tag === "label" && n.attrs.for === id)[0]

test("a change of a filter calls onFilter with topic and status", () => {
  const log = []
  const doc = onProblems(view(), log)
  byId(doc, "filter-topic").value = "Trees"
  const status = byId(doc, "filter-status")
  status.value = "weak"
  fire(status, "change")
  assert.deepEqual(log, [["onFilter", { topic: "Trees", status: "weak" }]])
})

test("an index row shows code, name, count, and weak count", () => {
  const topics = [{ topic: "Trees", total: 11, reviewed: 3, weak: 1 }]
  const doc = onTopics(view({ topics, topicOptions: ["Graphs", "Trees"] }))
  const li = one(doc.app, "index").children[0]
  const [code, name, num, weak] = li.children
  assert.equal(code.className, "code")
  assert.equal(code.textContent, "B")
  assert.equal(name.className, "name")
  assert.equal(name.textContent, "Trees")
  assert.equal(num.className, "num")
  assert.equal(num.children.length, 2)
  assert.equal(num.children[0].textContent, "3 of 11")
  assert.equal(num.children[1].className, "sr")
  assert.equal(num.children[1].textContent, "reviewed")
  assert.equal(weak.children.length, 2)
  assert.equal(weak.children[0].textContent, "1")
  assert.equal(weak.children[1].className, "sr")
  assert.equal(weak.children[1].textContent, "weak")
  assert.ok(hasClass(weak, "weak"))
  assert.ok(!hasClass(weak, "nil"))
})

test("an index row with weak 0 has the class nil", () => {
  const topics = [{ topic: "Trees", total: 4, reviewed: 4, weak: 0 }]
  const doc = onTopics(view({ topics }))
  const weak = one(doc.app, "weak")
  assert.equal(weak.children[0].textContent, "0")
  assert.equal(weak.children[1].className, "sr")
  assert.equal(weak.children[1].textContent, "weak")
  assert.equal(weak.className, "weak nil")
})

test("an index topic with no code has no span.code", () => {
  const topics = [{ topic: "Other", total: 4, reviewed: 4, weak: 0 }]
  const doc = onTopics(view({ topics }))
  const li = one(doc.app, "index").children[0]
  assert.equal(byClass(li, "code").length, 0)
})

test("p.legend is hidden and reads reviewed and weak", () => {
  const doc = onTopics(view())
  const legend = one(doc.app, "legend")
  assert.equal(legend.tag, "p")
  assert.equal(legend.attrs["aria-hidden"], "true")
  assert.equal(legend.textContent, "reviewed · weak")
})

test("the table heads are the five column names", () => {
  const doc = onProblems(view())
  const ths = find(doc.app, (n) => n.tag === "th").map((n) => n.textContent)
  assert.deepEqual(ths, [
    "Problem",
    "Topic",
    "Level",
    "Last rating",
    "Next due",
  ])
})

test("a table topic cell holds the code and then the name", () => {
  const doc = onProblems(
    view({
      table: [row({ topic: "Trees" })],
      topicOptions: ["Graphs", "Trees"],
    }),
  )
  const td = cells(tableRows(doc)[0])[1]
  assert.equal(td.children.length, 2)
  assert.equal(td.children[0].className, "code")
  assert.equal(td.children[0].textContent, "B")
  assert.equal(td.children[1].className, "name")
  assert.equal(td.children[1].textContent, "Trees")
})

test("a failed last rating shows its dot and word", () => {
  const doc = onProblems(view({ table: [row({ lastRating: "failed" })] }))
  const td = cells(tableRows(doc)[0])[3]
  assert.equal(td.children.length, 2)
  assert.equal(td.children[0].className, "dot dot-failed")
  assert.equal(td.children[0].textContent, "")
  assert.equal(td.children[0].children.length, 0)
  assert.equal(td.children[0].attrs["aria-hidden"], "true")
  assert.equal(td.children[1].className, "word")
  assert.equal(td.children[1].textContent, "Failed")
})

test("no last rating shows span.nil with none", () => {
  const doc = onProblems(view({ table: [row({ lastRating: null })] }))
  const td = cells(tableRows(doc)[0])[3]
  assert.equal(td.children.length, 1)
  assert.equal(td.children[0].className, "nil")
  assert.equal(td.children[0].textContent, "none")
})

test("a next due date shows as a short day and null shows none", () => {
  const set = onProblems(view({ table: [row({ due: "2026-11-27" })] }))
  const td = cells(tableRows(set)[0])[4]
  assert.equal(td.children.length, 1)
  assert.equal(td.children[0].textContent, "Fri, Nov 27")
  const none = onProblems(view({ table: [row({ due: null })] }))
  const nil = cells(tableRows(none)[0])[4].children[0]
  assert.equal(nil.className, "nil")
  assert.equal(nil.textContent, "none")
})

test("an empty table has one tr.empty with a full-width cell", () => {
  const doc = onProblems(view({ table: [] }))
  const rows = tableRows(doc)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].className, "empty")
  assert.equal(rows[0].children.length, 1)
  assert.equal(rows[0].children.length, 1)
  assert.equal(rows[0].children[0].attrs.colspan, "5")
  assert.equal(
    rows[0].children[0].textContent,
    "No problem matches these filters.",
  )
})

test("the filter labels are Topic and Status", () => {
  const doc = onProblems(view())
  assert.equal(label(doc, "filter-topic").textContent, "Topic")
  assert.equal(label(doc, "filter-status").textContent, "Status")
})

test("a problem title in the table is a link in td.title", () => {
  const doc = onProblems(view({ table: [row({ title: "Alpha" })] }))
  const td = cells(tableRows(doc)[0])[0]
  assert.equal(td.className, "title")
  assert.equal(td.children[0].textContent, "Alpha")
})

test("the topic index has the list role", () => {
  const doc = onTopics(view())
  assert.equal(one(doc.app, "index").attrs.role, "list")
})

const HEADS = ["Problem", "Topic", "Level", "Last rating", "Next due"]
const labels = (tds) => tds.slice(1).map((td) => td.attrs["data-label"])

test("each cell but the title has a data-label from the heads", () => {
  const doc = onProblems(view({ table: [row({ title: "Alpha" })] }))
  const tds = cells(tableRows(doc)[0])
  assert.equal(tds[0].attrs["data-label"], undefined)
  assert.deepEqual(labels(tds), HEADS.slice(1))
})

test("a label never comes from row data", () => {
  const doc = onProblems(view({ table: [row({ title: "data-label" })] }))
  assert.deepEqual(labels(cells(tableRows(doc)[0])), HEADS.slice(1))
})

test("the table parts have explicit roles", () => {
  const doc = onProblems(view({ table: [row()] }))
  const all = (tag) => find(doc.app, (n) => n.tag === tag)
  assert.equal(all("table")[0].attrs.role, "table")
  for (const p of [...all("thead"), ...all("tbody")]) {
    assert.equal(p.attrs.role, "rowgroup")
  }
  for (const tr of all("tr")) assert.equal(tr.attrs.role, "row")
  for (const th of all("th")) assert.equal(th.attrs.role, "columnheader")
  for (const td of all("td")) assert.equal(td.attrs.role, "cell")
})

test("the empty row has a cell role and no data-label", () => {
  const doc = onProblems(view({ table: [] }))
  const tr = tableRows(doc)[0]
  assert.equal(tr.attrs.role, "row")
  assert.equal(tr.children[0].attrs.role, "cell")
  assert.equal(tr.children[0].attrs["data-label"], undefined)
  assert.equal(tr.children[0].attrs.colspan, "5")
})
