// Tests of the page frame, the notices, and the whole page.
import test from "node:test"
import assert from "node:assert/strict"
import { render } from "../src/render.js"
import { PAGES } from "../src/pages.js"
import { fakeDocument, find, text, hasClass, byClass } from "./dom.js"
import { row, view, handlers, draw, byId } from "./render.fixtures.js"
import { everyState } from "./render.fixtures.js"

const bad = "<b>x</b>"
const notesOf = (doc) => doc.app.children[1]
const ALL = PAGES.map((p) => p.id)

test("each notice and the import error show as text", () => {
  const doc = draw(
    view({ notices: ["Notice one.", "Notice two."], importError: "Bad file." }),
    undefined,
    "settings",
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
  const doc = draw(view({ importError: "Bad file." }), undefined, "settings")
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
  const two = view({ queue: [row({ id: "a" }), row({ id: "b" })] })
  const today = fakeDocument()
  render(today.app, two, handlers(), "today")
  render(today.app, two, handlers(), "today")
  assert.equal(find(today.app, (n) => n.tag === "ol").length, 1)
  assert.equal(find(today.app, (n) => n.tag === "ol")[0].children.length, 2)
  assert.equal(find(today.app, (n) => n.tag === "li").length, 2)
  const all = fakeDocument()
  render(all.app, view(), handlers(), "problems")
  render(all.app, view(), handlers(), "problems")
  assert.equal(find(all.app, (n) => n.tag === "tbody").length, 1)
  assert.equal(find(all.app, (n) => n.tag === "tbody")[0].children.length, 1)
})

test("header.top holds the h1 and the menu and no control", () => {
  const doc = draw(view())
  const cover = byClass(doc.app, "top")
  assert.equal(cover.length, 1, "no band")
  assert.equal(cover[0].tag, "header")
  const h1 = find(cover[0], (n) => n.tag === "h1")
  assert.equal(h1.length, 1)
  assert.equal(h1[0].textContent, "NeetCode Review")
  assert.deepEqual(
    cover[0].children.map((n) => n.tag),
    ["h1", "nav"],
  )
  const all = find(cover[0], () => true)
  assert.equal(all.length, 3 + PAGES.length, "the header, h1, nav, links")
  const kinds = ["button", "input", "select"]
  const ctl = find(cover[0], (n) => kinds.includes(n.tag))
  assert.equal(ctl.length, 0)
  const ids = find(cover[0], (n) => n.attrs.id !== undefined)
  assert.deepEqual(ids.map((n) => n.attrs.id), ALL.map((id) => `nav-${id}`))
})

test("the Settings labels are Daily target and Import ratings", () => {
  const doc = draw(view(), undefined, "settings")
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
    let refCount = 0
    let forCount = 0
    for (const page of ALL) {
      const doc = draw(v, undefined, page)
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
      refCount += refs.length
      forCount += fors.length
      for (const id of [...refs, ...fors]) assert.ok(ids.includes(id))
    }
    assert.ok(refCount >= 3 && forCount >= 4)
  }
})

test("every span.dot and span.code is hidden from the reader", () => {
  const marks = everyState().flatMap((v) =>
    ALL.flatMap((page) =>
      find(
        draw(v, undefined, page).app,
        (n) =>
          n.tag === "span" && (hasClass(n, "dot") || hasClass(n, "code")),
      ),
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
  const docs = ["today", "problems"].map((page) =>
    draw(view({ queue: hostile, table: hostile }), undefined, page),
  )
  const names = docs.flatMap((d) =>
    find(d.app, (n) => n.className !== undefined),
  )
  const shown = docs.flatMap((d) =>
    find(d.app, (n) => hasClass(n, "name") && n.textContent === bad),
  )
  assert.ok(shown.length >= 4)
  for (const doc of docs) {
    assert.equal(find(doc.app, (n) => n.tag === "b").length, 0)
    assert.ok(!text(doc.app).includes("constructor"))
  }
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
    ["section.today"],
  )
  for (const id of ALL) {
    const one = draw(view(), undefined, id).app.children[2]
    assert.deepEqual(
      one.children.map((n) => `${n.tag}.${n.className}`),
      [`section.${id}`],
    )
  }
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
  const doc = draw(
    view({ notices: ["One."], importError: "Bad." }),
    undefined,
    "settings",
  )
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

const link = (doc, id) => find(doc.app, (n) => n.attrs.id === id)[0]
const current = (doc) =>
  find(doc.app, (n) => n.attrs["aria-current"] === "page").map(
    (n) => n.attrs.id,
  )

test("the menu has one link for each page", () => {
  const doc = draw(view())
  const navs = find(doc.app, (n) => n.tag === "nav")
  assert.equal(navs.length, 1)
  assert.equal(navs[0].className, "menu")
  assert.equal(navs[0].attrs["aria-label"], "Pages")
  assert.equal(doc.app.children[0].children[1], navs[0])
  assert.equal(navs[0].children.length, 4)
  navs[0].children.forEach((a, i) => {
    assert.equal(a.tag, "a")
    assert.equal(a.attrs.id, `nav-${PAGES[i].id}`)
    assert.equal(a.attrs.href, PAGES[i].hash)
    assert.equal(a.textContent, PAGES[i].label)
  })
})

test("only the link of the current page has aria-current page", () => {
  for (const id of ALL) {
    const doc = draw(view(), undefined, id)
    assert.deepEqual(current(doc), [`nav-${id}`])
    for (const p of ALL.filter((x) => x !== id)) {
      assert.equal(link(doc, `nav-${p}`).attrs["aria-current"], "false")
    }
  }
})

test("an unknown page id counts as today", () => {
  for (const bogus of ["nope", "constructor", "__proto__", undefined]) {
    const doc = draw(view(), undefined, bogus)
    assert.deepEqual(current(doc), ["nav-today"])
    assert.deepEqual(
      find(doc.app, (n) => n.tag === "section").map((n) => n.className),
      ["today"],
    )
  }
})

test("a second render with another page updates the menu", () => {
  const doc = fakeDocument()
  render(doc.app, view(), handlers(), "today")
  const kept = [...doc.app.children]
  const nav = doc.app.children[0].children[1]
  const links = [...nav.children]
  render(doc.app, view(), handlers(), "topics")
  assert.equal(link(doc, "nav-today").attrs["aria-current"], "false")
  assert.equal(link(doc, "nav-topics").attrs["aria-current"], "page")
  assert.equal(doc.app.children.length, 3)
  kept.forEach((n, i) => assert.equal(doc.app.children[i], n))
  assert.equal(doc.app.children[0].children[1], nav)
  assert.equal(doc.app.children[0].children.length, 2)
  links.forEach((a, i) => assert.equal(nav.children[i], a))
})

test("each page heading is an h2 with tabindex -1", () => {
  for (const { id } of PAGES) {
    const doc = draw(view(), undefined, id)
    const h = byId(doc, `${id}-h`)
    assert.equal(h.tag, "h2")
    assert.equal(h.attrs.tabindex, "-1")
    const heads = find(doc.app, (n) => String(n.attrs.id).endsWith("-h"))
    assert.equal(heads.length, 1)
  }
})

test("the table section is section.problems with a Problems heading", () => {
  const sec = byClass(draw(view(), undefined, "problems").app, "problems")
  assert.equal(sec.length, 1)
  assert.equal(sec[0].tag, "section")
  assert.equal(sec[0].attrs["aria-labelledby"], "problems-h")
  const doc = draw(view(), undefined, "problems")
  assert.equal(byId(doc, "problems-h").textContent, "Problems")
})

test("target, export, and import exist on Settings only", () => {
  for (const id of ["target", "export", "import"]) {
    for (const page of ALL) {
      const app = draw(view(), undefined, page).app
      const hit = find(app, (n) => n.attrs.id === id)
      assert.equal(hit.length, page === "settings" ? 1 : 0)
    }
  }
})

test("a notice shows on each page", () => {
  for (const page of ALL) {
    const doc = draw(view({ notices: ["Hello."] }), undefined, page)
    const notes = find(notesOf(doc), (n) => n.className === "notice")
    assert.equal(notes.length, 1)
    assert.equal(notes[0].textContent, "Hello.")
  }
})

test("the import error shows on Settings and on no other page", () => {
  for (const page of ALL) {
    const doc = draw(view({ importError: "Bad." }), undefined, page)
    const errs = find(doc.app, (n) => n.attrs.role === "alert")
    assert.equal(errs.length, page === "settings" ? 1 : 0)
  }
})
