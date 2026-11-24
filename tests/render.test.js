// Tests of the page frame, the notices, and the whole page.
import test from "node:test"
import assert from "node:assert/strict"
import { render } from "../src/render.js"
import { fakeDocument, find, text, hasClass, byClass } from "./dom.js"
import { row, view, handlers, draw, byId } from "./render.fixtures.js"
import { everyState } from "./render.fixtures.js"

const bad = "<b>x</b>"
const notesOf = (doc) => doc.app.children[1]

test("each notice and the import error show as text", () => {
  const doc = draw(
    view({ notices: ["Notice one.", "Notice two."], importError: "Bad file." }),
  )
  const all = text(notesOf(doc))
  for (const t of ["Notice one.", "Notice two.", "Bad file."]) {
    assert.ok(all.includes(t))
  }
})

test("each notice has the status role", () => {
  const doc = draw(view({ notices: ["One.", "Two."] }))
  const notes = find(notesOf(doc), (n) => n.className === "notice")
  assert.equal(notes.length, 2)
  assert.ok(notes.every((n) => n.attrs.role === "status"))
})

test("the import error is a p.error with the alert role", () => {
  const doc = draw(view({ importError: "Bad file." }))
  const errs = find(notesOf(doc), (n) => n.className === "error")
  assert.equal(errs.length, 1)
  assert.equal(errs[0].attrs.role, "alert")
})

test("no notice and no error make no p.notice and no p.error", () => {
  const doc = draw(view())
  const ps = find(doc.app, (n) => n.tag === "p")
  assert.equal(ps.filter((n) => hasClass(n, "notice")).length, 0)
  assert.equal(ps.filter((n) => hasClass(n, "error")).length, 0)
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

test("header.top holds the h1 and no control", () => {
  const doc = draw(view())
  const cover = byClass(doc.app, "top")
  assert.equal(cover.length, 1, "no band")
  assert.equal(cover[0].tag, "header")
  const h1 = find(cover[0], (n) => n.tag === "h1")
  assert.equal(h1.length, 1)
  assert.equal(h1[0].textContent, "NeetCode Review")
  const all = find(cover[0], () => true)
  assert.equal(all.length, 2, "the header and the h1 only")
  assert.equal(find(cover[0], (n) => n.attrs.id !== undefined).length, 0)
})

test("the Settings labels are Daily target and Import ratings", () => {
  const doc = draw(view())
  const sec = byClass(doc.app, "settings")[0]
  const label = (id) =>
    find(sec, (n) => n.tag === "label" && n.attrs.for === id)
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

test("every span.dot and span.code is hidden from the reader", () => {
  const marks = everyState().flatMap((v) =>
    find(
      draw(v).app,
      (n) => n.tag === "span" && (hasClass(n, "dot") || hasClass(n, "code")),
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

test("no element has a text equal to a rating symbol", () => {
  for (const v of everyState()) {
    const hit = find(
      draw(v).app,
      (n) => ["!", "!?", "?"].includes(n.textContent),
    )
    assert.equal(hit.length, 0)
  }
})

test("a constructor or __proto__ rating gives no dot", () => {
  for (const lastRating of ["constructor", "__proto__"]) {
    const doc = draw(view({
      queue: [row({ kind: "done", lastRating })],
      table: [row({ lastRating })],
    }))
    const own = [
      ...byClass(doc.app, "status"),
      ...find(doc.app, (n) => n.tag === "td"),
    ]
    assert.equal(own.flatMap((n) => byClass(n, "dot")).length, 0)
  }
})

const kinds = (doc) =>
  doc.app.children.map((n) => `${n.tag}.${n.className}`)

test("the root holds header.top, div.notes, and div.page", () => {
  const doc = draw(view())
  assert.deepEqual(kinds(doc), ["header.top", "div.notes", "div.page"])
  const page = doc.app.children[2]
  assert.deepEqual(
    page.children.map((n) => `${n.tag}.${n.className}`),
    ["section.today", "section.topics", "section.all", "section.settings"],
  )
})

test("a second render keeps the same three nodes of the root", () => {
  const doc = fakeDocument()
  render(doc.app, view(), handlers())
  const first = [...doc.app.children]
  render(doc.app, view({ notices: ["New."] }), handlers())
  assert.equal(doc.app.children.length, 3)
  first.forEach((n, i) => assert.equal(doc.app.children[i], n))
})

test("notices and the import error sit in div.notes, in no section", () => {
  const doc = draw(view({ notices: ["One."], importError: "Bad." }))
  const notes = notesOf(doc)
  assert.equal(notes.className, "notes")
  assert.deepEqual(notes.children.map((n) => n.className), ["notice", "error"])
  for (const sec of find(doc.app, (n) => n.tag === "section")) {
    const hit = find(
      sec,
      (n) => n.attrs.role === "status" || n.attrs.role === "alert",
    )
    assert.equal(hit.length, 0)
  }
})

test("the same notices keep the same p.notice nodes", () => {
  const doc = fakeDocument()
  render(doc.app, view({ notices: ["A.", "B."] }), handlers())
  const before = [...notesOf(doc).children]
  render(doc.app, view({ notices: ["A.", "B."] }), handlers())
  before.forEach((n, i) => assert.equal(notesOf(doc).children[i], n))
})

test("a new notice text gives new p.notice nodes", () => {
  const doc = fakeDocument()
  render(doc.app, view({ notices: ["A."] }), handlers())
  const before = notesOf(doc).children[0]
  render(doc.app, view({ notices: ["C."] }), handlers())
  assert.notEqual(notesOf(doc).children[0], before)
  assert.equal(notesOf(doc).children[0].textContent, "C.")
})

test("an empty list leaves div.notes with no children", () => {
  const doc = fakeDocument()
  render(doc.app, view({ notices: ["A."], importError: "X" }), handlers())
  render(doc.app, view(), handlers())
  assert.equal(notesOf(doc).children.length, 0)
  assert.equal(doc.app.children.length, 3)
})
