import test from "node:test"
import assert from "node:assert/strict"
import { render } from "../src/render.js"
import { fakeDocument, find, text, fire } from "./dom.js"

const row = (over = {}) => ({
  id: "two-sum",
  title: "Two Sum",
  topic: "Arrays & Hashing",
  difficulty: "Easy",
  kind: "new",
  overdueDays: 0,
  lastRating: null,
  due: null,
  problemUrl: "https://neetcode.io/problems/two-sum",
  folderUrl: "https://github.com/IsMichaelHuang/r/tree/main/A/two-sum",
  canReveal: true,
  solution: null,
  ...over,
})

const view = (over = {}) => ({
  today: "2026-11-20",
  todayLabel: "Fri Nov 20",
  target: 4,
  doneCount: 0,
  waiting: 0,
  notices: [],
  importError: null,
  queue: [row()],
  topics: [{ topic: "Trees", total: 11, reviewed: 3, weak: 1 }],
  table: [row()],
  filters: { topic: "all", status: "all" },
  topicOptions: ["Trees", "Graphs"],
  ...over,
})

const handlers = (log = []) => {
  const h = {}
  for (const name of [
    "onRate",
    "onReveal",
    "onTarget",
    "onExport",
    "onImport",
    "onFilter",
  ]) {
    h[name] = (...args) => log.push([name, ...args])
  }
  return h
}

const draw = (v, log) => {
  const doc = fakeDocument()
  render(doc.app, v, handlers(log))
  return doc
}
const byId = (doc, id) => find(doc.app, (n) => n.attrs.id === id)[0]
const buttons = (doc, label) =>
  find(doc.app, (n) => n.tag === "button" && n.textContent === label)

test("a hostile title shows as plain text", () => {
  const title = "<img src=x onerror=alert(1)>"
  const doc = draw(view({ queue: [row({ title })], table: [] }))
  assert.ok(text(doc.app).includes(title))
  assert.equal(find(doc.app, (n) => n.tag === "img").length, 0)
})

test("a row with no solution has no pre element and no code", () => {
  const doc = draw(view())
  assert.equal(find(doc.app, (n) => n.tag === "pre").length, 0)
})

test("a row with solution text shows it in a pre element", () => {
  const solution = { text: "def f(): pass" }
  const doc = draw(view({ queue: [row({ solution })] }))
  const pre = find(doc.app, (n) => n.tag === "pre")
  assert.equal(pre.length, 1)
  assert.equal(pre[0].textContent, "def f(): pass")
})

test("a row with a solution error shows the error text", () => {
  const solution = { error: "The solution could not load." }
  const doc = draw(view({ queue: [row({ solution })] }))
  assert.ok(text(doc.app).includes("The solution could not load."))
  assert.equal(find(doc.app, (n) => n.tag === "pre").length, 0)
})

test("a row with canReveal false has no reveal button", () => {
  const doc = draw(view({ queue: [row({ canReveal: false })] }))
  assert.equal(buttons(doc, "Show my old solution").length, 0)
})

test("a done row shows its rating and three rating buttons", () => {
  const done = row({ kind: "done", lastRating: "struggled" })
  const doc = draw(view({ queue: [done], doneCount: 1 }))
  const li = find(doc.app, (n) => n.tag === "ol")[0].children[0]
  assert.ok(text(li).includes("done: Struggled"))
  const pressed = {}
  for (const label of ["Clean", "Struggled", "Failed"]) {
    assert.equal(buttons(doc, label).length, 1)
    pressed[label] = buttons(doc, label)[0].attrs["aria-pressed"]
  }
  assert.deepEqual(pressed, {
    Clean: "false",
    Struggled: "true",
    Failed: "false",
  })
})

test("queue controls carry the problem title in their labels", () => {
  const a = row({ id: "a", title: "Alpha" })
  const b = row({ id: "b", title: "Beta" })
  const doc = draw(view({ queue: [a, b] }))
  const [c1, c2] = buttons(doc, "Clean")
  assert.equal(c1.attrs["aria-label"], "Clean: Alpha")
  assert.equal(c2.attrs["aria-label"], "Clean: Beta")
  const [r1] = buttons(doc, "Show my old solution")
  assert.equal(r1.attrs["aria-label"], "Show my old solution: Alpha")
  const open = find(
    doc.app,
    (n) => n.attrs["aria-label"] === "Open on NeetCode: Beta",
  )
  assert.equal(open.length, 1)
  const groups = find(doc.app, (n) => n.attrs.role === "group")
  assert.deepEqual(
    groups.map((g) => g.attrs["aria-label"]),
    ["How did it go: Alpha", "How did it go: Beta"],
  )
})

test("a click on Failed calls onRate with failed once", () => {
  const log = []
  const doc = draw(view(), log)
  fire(buttons(doc, "Failed")[0], "click")
  assert.deepEqual(log, [["onRate", "two-sum", "failed"]])
})

test("a click on reveal calls onReveal with the id", () => {
  const log = []
  const doc = draw(view(), log)
  fire(buttons(doc, "Show my old solution")[0], "click")
  assert.deepEqual(log, [["onReveal", "two-sum"]])
})

test("each notice and the import error show as text", () => {
  const doc = draw(
    view({ notices: ["Notice one.", "Notice two."], importError: "Bad file." }),
  )
  const all = text(doc.app)
  for (const t of ["Notice one.", "Notice two.", "Bad file."]) {
    assert.ok(all.includes(t))
  }
})

test("a due row with overdueDays 0 shows due today", () => {
  const due = row({ kind: "due", overdueDays: 0, due: "2026-11-20" })
  const doc = draw(view({ queue: [due] }))
  assert.ok(text(doc.app).includes("due today"))
})

test("doneCount 5 with target 4 shows 5 of 4 done", () => {
  const doc = draw(view({ doneCount: 5, target: 4 }))
  assert.ok(text(doc.app).includes("5 of 4 done"))
})

test("a change of the target field calls onTarget with a number", () => {
  const log = []
  const doc = draw(view(), log)
  const field = byId(doc, "target")
  field.value = "6"
  fire(field, "change")
  assert.deepEqual(log, [["onTarget", 6]])
})

test("a change of a filter calls onFilter with topic and status", () => {
  const log = []
  const doc = draw(view(), log)
  byId(doc, "filter-topic").value = "Trees"
  const status = byId(doc, "filter-status")
  status.value = "weak"
  fire(status, "change")
  assert.deepEqual(log, [["onFilter", { topic: "Trees", status: "weak" }]])
})

test("a click on Export calls onExport", () => {
  const log = []
  const doc = draw(view(), log)
  fire(byId(doc, "export"), "click")
  assert.deepEqual(log, [["onExport"]])
})

test("a file chosen for import passes its text to onImport", async () => {
  const log = []
  const doc = draw(view(), log)
  const files = [{ text: async () => '{"a":1}' }]
  const input = byId(doc, "import")
  await fire(input, "change", { target: { files } })
  await new Promise((r) => setImmediate(r))
  assert.deepEqual(log, [["onImport", '{"a":1}']])
})

test("every blank-target link is safe and goes to a known host", () => {
  const doc = draw(view({ queue: [row({ solution: { text: "x" } })] }))
  const links = find(doc.app, (n) => n.tag === "a")
  assert.ok(links.length >= 3)
  for (const a of links) {
    assert.equal(a.attrs.target, "_blank")
    assert.equal(a.attrs.rel, "noopener noreferrer")
    assert.match(
      a.attrs.href,
      /^https:\/\/(neetcode\.io\/problems\/|github\.com\/IsMichaelHuang\/)/,
    )
  }
})

test("a null folder URL makes no link", () => {
  const doc = draw(
    view({ queue: [row({ folderUrl: null, solution: { text: "x" } })] }),
  )
  const hrefs = find(doc.app, (n) => n.tag === "a").map((a) => a.attrs.href)
  assert.ok(hrefs.every((h) => h.startsWith("https://neetcode.io/")))
})

test("a second render leaves one copy of each row", () => {
  const doc = fakeDocument()
  render(doc.app, view(), handlers())
  render(doc.app, view(), handlers())
  assert.equal(find(doc.app, (n) => n.tag === "ol").length, 1)
  assert.equal(find(doc.app, (n) => n.tag === "ol")[0].children.length, 1)
  assert.equal(find(doc.app, (n) => n.tag === "li").length, 2)
  assert.equal(find(doc.app, (n) => n.tag === "tbody")[0].children.length, 1)
})
