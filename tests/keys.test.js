// Tests of the rating keys.
import test from "node:test"
import assert from "node:assert/strict"
import { ratingForKey } from "../src/keys.js"

const press = (key, over = {}) => ({ key, target: { tagName: "A" }, ...over })

test("the keys 1, 2, and 3 give the three ratings", () => {
  assert.equal(ratingForKey(press("1")), "clean")
  assert.equal(ratingForKey(press("2")), "struggled")
  assert.equal(ratingForKey(press("3")), "failed")
})

test("Shift with a digit key still rates", () => {
  assert.equal(ratingForKey(press("1", { shiftKey: true })), "clean")
})

test("other keys give null", () => {
  for (const key of ["4", "0", "a", "Enter", " ", "constructor"]) {
    assert.equal(ratingForKey(press(key)), null)
  }
})

test("a repeat, a composition, or a modifier gives null", () => {
  for (const over of [
    { repeat: true },
    { isComposing: true },
    { ctrlKey: true },
    { metaKey: true },
    { altKey: true },
  ]) {
    assert.equal(ratingForKey(press("1", over)), null)
  }
})

test("a field, a solution box, or an editable node gives null", () => {
  for (const tagName of ["INPUT", "TEXTAREA", "SELECT", "PRE"]) {
    assert.equal(ratingForKey(press("2", { target: { tagName } })), null)
  }
  const target = { tagName: "DIV", isContentEditable: true }
  assert.equal(ratingForKey(press("2", { target })), null)
})

test("an event with no target still rates", () => {
  assert.equal(ratingForKey({ key: "3" }), "failed")
})
