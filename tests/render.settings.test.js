// Tests of the Settings section: target, export, and import.
import test from "node:test"
import assert from "node:assert/strict"
import { find, fire, byClass } from "./dom.js"
import { view, draw, byId } from "./render.fixtures.js"

const later = () => new Promise((r) => setImmediate(r))

const HINTS = {
  target: [
    "target-hint",
    "The number of problems on the Today page, from 1 to 10.",
  ],
  export: ["export-hint", "Download your ratings as a file."],
  import: [
    "import-hint",
    "Load ratings from a file. The page asks before it replaces your ratings.",
  ],
}

test("section.settings has a heading and three settings", () => {
  const doc = draw(view())
  const sec = byClass(doc.app, "settings")
  assert.equal(sec.length, 1)
  assert.equal(sec[0].tag, "section")
  assert.equal(sec[0].attrs["aria-labelledby"], "settings-h")
  const head = byId(doc, "settings-h")
  assert.equal(head.tag, "h2")
  assert.equal(head.textContent, "Settings")
  assert.equal(byClass(sec[0], "setting").length, 3)
})

test("each control sits in Settings with its own exact hint", () => {
  const doc = draw(view())
  const sec = byClass(doc.app, "settings")[0]
  for (const [id, [hintId, words]] of Object.entries(HINTS)) {
    const control = find(sec, (n) => n.attrs.id === id)
    assert.equal(control.length, 1)
    assert.equal(control[0].attrs["aria-describedby"], hintId)
    const hint = find(sec, (n) => n.attrs.id === hintId)
    assert.equal(hint.length, 1)
    assert.equal(hint[0].tag, "p")
    assert.equal(hint[0].className, "hint")
    assert.equal(hint[0].textContent, words)
  }
})

test("the controls keep their type and limits", () => {
  const doc = draw(view({ target: 6 }))
  const t = byId(doc, "target")
  assert.equal(t.attrs.type, "number")
  assert.equal(t.attrs.min, "1")
  assert.equal(t.attrs.max, "10")
  assert.equal(t.value, "6")
  assert.equal(byId(doc, "export").attrs.type, "button")
  assert.equal(byId(doc, "import").attrs.type, "file")
  assert.equal(byId(doc, "import").attrs.accept, "application/json,.json")
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
