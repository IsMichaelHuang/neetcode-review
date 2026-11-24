// Tests of the Topics section and the All problems section.
import test from "node:test"
import assert from "node:assert/strict"
import { find, fire, hasClass, byClass } from "./dom.js"
import { row, view, draw, byId, one } from "./render.fixtures.js"

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
  const doc = draw(view(), log)
  byId(doc, "filter-topic").value = "Trees"
  const status = byId(doc, "filter-status")
  status.value = "weak"
  fire(status, "change")
  assert.deepEqual(log, [["onFilter", { topic: "Trees", status: "weak" }]])
})

test("an index row shows code, name, count, and weak count", () => {
  const topics = [{ topic: "Trees", total: 11, reviewed: 3, weak: 1 }]
  const doc = draw(view({ topics, topicOptions: ["Graphs", "Trees"] }))
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
  const doc = draw(view({ topics }))
  const weak = one(doc.app, "weak")
  assert.equal(weak.children[0].textContent, "0")
  assert.equal(weak.children[1].className, "sr")
  assert.equal(weak.children[1].textContent, "weak")
  assert.equal(weak.className, "weak nil")
})

test("an index topic with no code has no span.code", () => {
  const topics = [{ topic: "Other", total: 4, reviewed: 4, weak: 0 }]
  const doc = draw(view({ topics }))
  const li = one(doc.app, "index").children[0]
  assert.equal(byClass(li, "code").length, 0)
})

test("p.legend is hidden and reads reviewed and weak", () => {
  const doc = draw(view())
  const legend = one(doc.app, "legend")
  assert.equal(legend.tag, "p")
  assert.equal(legend.attrs["aria-hidden"], "true")
  assert.equal(legend.textContent, "reviewed · weak")
})

test("the table heads are the five column names", () => {
  const doc = draw(view())
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
  const doc = draw(
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

test("a failed last rating shows its symbol and word", () => {
  const doc = draw(view({ table: [row({ lastRating: "failed" })] }))
  const td = cells(tableRows(doc)[0])[3]
  assert.equal(td.children.length, 2)
  assert.equal(td.children[0].className, "sym sym-failed")
  assert.equal(td.children[0].textContent, "?")
  assert.equal(td.children[1].className, "word")
  assert.equal(td.children[1].textContent, "Failed")
})

test("no last rating shows span.nil with none", () => {
  const doc = draw(view({ table: [row({ lastRating: null })] }))
  const td = cells(tableRows(doc)[0])[3]
  assert.equal(td.children.length, 1)
  assert.equal(td.children[0].className, "nil")
  assert.equal(td.children[0].textContent, "none")
})

test("a next due date shows as a short day and null shows none", () => {
  const set = draw(view({ table: [row({ due: "2026-11-27" })] }))
  const td = cells(tableRows(set)[0])[4]
  assert.equal(td.children.length, 1)
  assert.equal(td.children[0].textContent, "Fri, Nov 27")
  const none = draw(view({ table: [row({ due: null })] }))
  const nil = cells(tableRows(none)[0])[4].children[0]
  assert.equal(nil.className, "nil")
  assert.equal(nil.textContent, "none")
})

test("an empty table has one tr.empty with a full-width cell", () => {
  const doc = draw(view({ table: [] }))
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
  const doc = draw(view())
  assert.equal(label(doc, "filter-topic").textContent, "Topic")
  assert.equal(label(doc, "filter-status").textContent, "Status")
})

test("a problem title in the table is a link in td.title", () => {
  const doc = draw(view({ table: [row({ title: "Alpha" })] }))
  const td = cells(tableRows(doc)[0])[0]
  assert.equal(td.className, "title")
  assert.equal(td.children[0].textContent, "Alpha")
})

test("the topic index has the list role", () => {
  const doc = draw(view())
  assert.equal(one(doc.app, "index").attrs.role, "list")
})
