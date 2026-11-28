import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { readCss } from "./helpers.js"

const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
const NAMES = [
  "paper", "sheet", "ink", "ink-2", "rule",
  "edge", "accent", "clean", "struggled", "failed",
]

// The light block is the first ":root {". The dark block is inside
// the prefers-color-scheme media query.
const blocks = () => {
  const light = css.match(/:root\s*\{([^}]*)\}/)
  const dark = css.match(
    /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/,
  )
  return { light: light?.[1], dark: dark?.[1] }
}

const read = (body) => {
  const out = {}
  for (const m of (body ?? "").matchAll(/--([\w-]+):\s*#([0-9a-f]{6});/gi)) {
    out[m[1]] = m[2]
  }
  return out
}

const tokens = () => {
  const b = blocks()
  return { light: read(b.light), dark: read(b.dark) }
}

const channels = (hex) =>
  [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))

const lum = ([r, g, b]) => {
  const f = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// color-mix(in srgb, c p%, paper): a linear mix of channel values.
const mix = (c, paper, p) => c.map((v, i) => v * p + paper[i] * (1 - p))

const SCHEMES = ["light", "dark"]
const each = (fn) => {
  const t = tokens()
  for (const s of SCHEMES) fn(s, t[s], (n) => channels(t[s][n]))
}

test("both token blocks hold all ten tokens as six-digit hex", () => {
  const t = tokens()
  for (const s of SCHEMES) {
    for (const n of NAMES) assert.ok(t[s][n], `${s} block lacks --${n}`)
  }
})

const PAIRS = []
for (const fg of ["ink", "ink-2", "accent", "clean", "struggled", "failed"]) {
  for (const bg of ["paper", "sheet"]) PAIRS.push([fg, bg])
}
for (const [fg, bg] of PAIRS) {
  test(`${fg} on ${bg} has contrast 4.5 or more in both schemes`, () => {
    each((s, t, c) => {
      assert.ok(t[fg] && t[bg], `${s} lacks a token`)
      const r = ratio(c(fg), c(bg))
      assert.ok(r >= 4.5, `${s}: ${fg} on ${bg} is ${r.toFixed(2)}`)
    })
  })
}

// [text, mixed color, percent of the mixed color, ground, min ratio]
const MIXES = []
for (const n of ["clean", "struggled", "failed"]) {
  for (const p of [0.11, 0.2]) MIXES.push([n, n, p, "sheet", 4.5])
}
for (const p of [0.08, 0.14]) {
  MIXES.push(["ink", "ink", p, "sheet", 4.5])
  MIXES.push(["edge", "ink", p, "sheet", 3])
}
for (const p of [0.18, 0.28]) MIXES.push(["ink", "accent", p, "sheet", 4.5])
MIXES.push(["ink", "sheet", 0.6, "paper", 4.5])
for (const [fg, top, p, ground, min] of MIXES) {
  const name = `${fg} on ${Math.round(p * 100)} percent ${top} over ${ground}`
  test(`${name} has contrast ${min} or more`, () => {
    each((s, t, c) => {
      assert.ok(t[fg] && t[top] && t[ground], `${s} lacks a token`)
      const r = ratio(c(fg), mix(c(top), c(ground), p))
      assert.ok(r >= min, `${s}: ${name} is ${r.toFixed(2)}`)
    })
  })
}

for (const [fg, bg] of [
  ["accent", "paper"], ["accent", "sheet"],
  ["edge", "paper"], ["edge", "sheet"],
]) {
  test(`${fg} on ${bg} has contrast 3 or more in both schemes`, () => {
    each((s, t, c) => {
      assert.ok(t[fg] && t[bg], `${s} lacks a token`)
      const r = ratio(c(fg), c(bg))
      assert.ok(r >= 3, `${s}: ${fg} on ${bg} is ${r.toFixed(2)}`)
    })
  })
}

test("no hex color or rgb() appears outside the two token blocks", () => {
  const rest = readCss().replace(/:root\s*\{[^}]*\}/g, "")
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(rest), "a hex color is outside")
  assert.ok(!/rgba?\(/i.test(rest), "an rgb() is outside")
  assert.ok(css.length > 0)
})

test("no hsl, hwb, lab, lch, oklab, oklch, or color() outside tokens", () => {
  const rest = readCss().replace(/:root\s*\{[^}]*\}/g, "")
  const re = /(?<![\w-])(hsla?|hwb|lab|lch|oklab|oklch|color)\(/i
  assert.ok(!re.test(rest), "a banned color function is outside")
  assert.ok(/color-mix\(/.test(rest), "color-mix must stay allowed")
})

test("the tokens have the values of the design file", () => {
  const doc = readFileSync(
    new URL("../docs/plans/pond-mist-design.md", import.meta.url),
    "utf8",
  )
  const want = { light: {}, dark: {} }
  const tick = "\\s*`#([0-9a-f]{6})`"
  const head = "^\\|\\s*`--([\\w-]+)`\\s*\\|"
  const re = new RegExp(head + tick + "\\s*\\|" + tick, "gim")
  for (const m of doc.matchAll(re)) {
    want.light[m[1]] = m[2].toLowerCase()
    want.dark[m[1]] = m[3].toLowerCase()
  }
  assert.equal(Object.keys(want.light).length, 10)
  const have = tokens()
  for (const s of SCHEMES) {
    for (const n of NAMES) {
      assert.equal(have[s][n]?.toLowerCase(), want[s][n], `${s} --${n}`)
    }
  }
})

// A link underline is softer than a control border, and still 3 to 1.
test("the link underline is a 50 percent ink mix with contrast 3", () => {
  const rule = "text-decoration-color: color-mix(in srgb, var(--ink) 50%"
  assert.ok(css.includes(`${rule}, var(--sheet));`), "no underline mix")
  each((s, t, c) => {
    const r = ratio(mix(c("ink"), c("sheet"), 0.5), c("sheet"))
    assert.ok(r >= 3, `${s}: the underline is ${r.toFixed(2)}`)
  })
})
