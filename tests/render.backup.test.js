import { test } from "node:test"
import assert from "node:assert/strict"
import { NOTICES } from "../src/config.js"
import { text } from "./dom.js"
import { draw, view } from "./render.fixtures.js"

test("the Today page shows the backup notice when it is due", () => {
  const doc = draw(view({ backupDue: true }), [], "today")
  assert.ok(text(doc.app).includes(NOTICES.backup))
})

test("the Today page shows no backup notice when it is not due", () => {
  const doc = draw(view({ backupDue: false }), [], "today")
  assert.equal(text(doc.app).includes(NOTICES.backup), false)
})

test("the other pages never show the backup notice", () => {
  for (const page of ["topics", "problems", "settings"]) {
    const doc = draw(view({ backupDue: true }), [], page)
    assert.equal(text(doc.app).includes(NOTICES.backup), false, page)
  }
})
