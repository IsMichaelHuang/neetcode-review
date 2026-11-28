import test from "node:test"
import assert from "node:assert/strict"
import { readCss } from "./helpers.js"
import { everyState, draw } from "./render.fixtures.js"
import { find } from "./dom.js"
import { PAGES } from "../src/pages.js"

const css = readCss()

const tokens = () => {
  const found = new Set()
  for (const v of everyState()) {
    for (const { id } of PAGES) {
      for (const n of find(draw(v, undefined, id).app, () => true)) {
        for (const t of String(n.className ?? "").split(" ")) {
          if (t) found.add(t)
        }
      }
    }
  }
  return [...found]
}

test("the views produce class tokens to check", () => {
  assert.ok(tokens().length > 20)
})

test("each class token of the render code has a selector", () => {
  const missing = tokens().filter(
    (t) => !new RegExp("\\." + t + "(?![\\w-])").test(css),
  )
  assert.deepEqual(missing, [])
})
