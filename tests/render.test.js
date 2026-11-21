// Tests of the band, the notices, and the whole page.
import test from "node:test"
import assert from "node:assert/strict"
import { render } from "../src/render.js"
import { fakeDocument, find, text, fire, hasClass, byClass } from "./dom.js"
import { row, view, handlers, draw, byId } from "./render.fixtures.js"
import { everyState } from "./render.fixtures.js"

const bad = "<b>x</b>"
const later = () => new Promise((r) => setImmediate(r))

test("each notice and the import error show as text", () => {
  const doc = draw(
    view({ notices: ["Notice one.", "Notice two."], importError: "Bad file." }),
  )
  const all = text(doc.app)
  for (const t of ["Notice one.", "Notice two.", "Bad file."]) {
    assert.ok(all.includes(t))
  }
})

test("each notice has the status role", () => {
  const doc = draw(view({ notices: ["One.", "Two."] }))
  const notes = find(doc.app, (n) => n.className === "notice")
  assert.equal(notes.length, 2)
  assert.ok(notes.every((n) => n.attrs.role === "status"))
})

test("the import error is a p.error with the alert role", () => {
  const doc = draw(view({ importError: "Bad file." }))
  const errs = find(doc.app, (n) => n.className === "error")
  assert.equal(errs.length, 1)
  assert.equal(errs[0].attrs.role, "alert")
})

test("no notice and no error make no p.notice and no p.error", () => {
  const doc = draw(view())
  const ps = find(doc.app, (n) => n.tag === "p")
  assert.equal(ps.filter((n) => hasClass(n, "notice")).length, 0)
  assert.equal(ps.filter((n) => hasClass(n, "error")).length, 0)
})

test("a change of the target field calls onTarget with a number", () => {
  const log = []
  const doc = draw(view(), log)
  const field = byId(doc, "target")
  field.value = "6"
  fire(field, "change")
  assert.deepEqual(log, [["onTarget", 6]])
})

test("an empty target field calls onTarget with NaN", () => {
  const log = []
  const doc = draw(view(), log)
  const field = byId(doc, "target")
  field.value = ""
  fire(field, "change")
  assert.equal(log.length, 1)
  assert.ok(Number.isNaN(log[0][1]))
})

test("a file that cannot be read passes an empty text", async () => {
  const log = []
  const doc = draw(view(), log)
  const files = [{ text: async () => Promise.reject(new Error("no")) }]
  await fire(byId(doc, "import"), "change", { target: { files } })
  await later()
  assert.deepEqual(log, [["onImport", ""]])
})

test("no chosen file calls nothing", async () => {
  const log = []
  const doc = draw(view(), log)
  await fire(byId(doc, "import"), "change", { target: { files: [] } })
  await later()
  assert.deepEqual(log, [])
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
  await later()
  assert.deepEqual(log, [["onImport", '{"a":1}']])
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

test("header.cover holds the h1 and the target, export, import", () => {
  const doc = draw(view())
  const cover = byClass(doc.app, "cover")
  assert.equal(cover.length, 1, "no band")
  assert.equal(cover[0].tag, "header")
  const h1 = find(cover[0], (n) => n.tag === "h1")
  assert.equal(h1.length, 1)
  assert.equal(h1[0].textContent, "NeetCode Review")
  for (const id of ["target", "export", "import"]) {
    assert.equal(find(cover[0], (n) => n.attrs.id === id).length, 1)
  }
})

test("the band labels are Daily target and Import ratings", () => {
  const doc = draw(view())
  const label = (id) =>
    find(doc.app, (n) => n.tag === "label" && n.attrs.for === id)
  assert.equal(label("target")[0].textContent, "Daily target")
  assert.equal(label("import")[0].textContent, "Import ratings")
})

test("every state keeps text and children in separate elements", () => {
  for (const v of everyState()) {
    const doc = draw(v)
    const mixed = find(
      doc.app,
      (n) => n.textContent !== "" && n.children.length > 0,
    )
    assert.equal(mixed.length, 0)
  }
})

test("every state has no id twice and no dangling reference", () => {
  for (const v of everyState()) {
    const doc = draw(v)
    const ids = find(doc.app, (n) => n.attrs.id !== undefined).map(
      (n) => n.attrs.id,
    )
    assert.equal(new Set(ids).size, ids.length)
    const refs = find(
      doc.app,
      (n) => n.attrs["aria-labelledby"] !== undefined,
    ).map((n) => n.attrs["aria-labelledby"])
    const fors = find(doc.app, (n) => n.attrs.for !== undefined).map(
      (n) => n.attrs.for,
    )
    assert.ok(refs.length >= 3 && fors.length >= 4)
    for (const id of [...refs, ...fors]) assert.ok(ids.includes(id))
  }
})

test("every span.sym and span.code is hidden from the reader", () => {
  const marks = everyState().flatMap((v) =>
    find(
      draw(v).app,
      (n) => n.tag === "span" && (hasClass(n, "sym") || hasClass(n, "code")),
    ),
  )
  assert.ok(marks.length > 0)
  assert.ok(marks.every((n) => n.attrs["aria-hidden"] === "true"))
})

test("hostile data never becomes a class or a style of text", () => {
  const hostile = [
    row({ id: "h1", topic: bad, kind: "z z", lastRating: "constructor" }),
    row({ id: "h2", topic: bad, kind: "done", lastRating: "constructor" }),
  ]
  const doc = draw(view({ queue: hostile, table: hostile }))
  const names = find(doc.app, (n) => n.className !== undefined)
  const shown = find(
    doc.app,
    (n) => hasClass(n, "name") && n.textContent === bad,
  )
  assert.ok(shown.length >= 4)
  assert.equal(find(doc.app, (n) => n.tag === "b").length, 0)
  assert.ok(!text(doc.app).includes("constructor"))
  for (const n of names) {
    for (const x of ["<", "function", "undefined", "[object", "constructor"]) {
      assert.ok(!n.className.includes(x))
    }
  }
})
