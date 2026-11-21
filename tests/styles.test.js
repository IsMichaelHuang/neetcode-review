import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { everyState, draw } from "./render.fixtures.js"
import { find } from "./dom.js"

const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")

const tokens = () => {
  const found = new Set()
  for (const v of everyState()) {
    for (const n of find(draw(v).app, () => true)) {
      for (const t of String(n.className ?? "").split(" ")) {
        if (t) found.add(t)
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
