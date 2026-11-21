import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
const NAMES = [
  "paper", "ink", "ink-2", "rule", "cover",
  "on-cover", "clean", "struggled", "failed", "focus",
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

const PAIRS = [
  ["ink", "paper"],
  ["ink-2", "paper"],
  ["clean", "paper"],
  ["struggled", "paper"],
  ["failed", "paper"],
  ["on-cover", "cover"],
]
for (const [fg, bg] of PAIRS) {
  test(`${fg} on ${bg} has contrast 4.5 or more in both schemes`, () => {
    each((s, t, c) => {
      assert.ok(t[fg] && t[bg], `${s} lacks a token`)
      const r = ratio(c(fg), c(bg))
      assert.ok(r >= 4.5, `${s}: ${fg} on ${bg} is ${r.toFixed(2)}`)
    })
  })
}

for (const state of ["clean", "struggled", "failed"]) {
  for (const p of [0.1, 0.2]) {
    test(`${state} on ${p * 100} percent of itself keeps 4.5`, () => {
      each((s, t, c) => {
        assert.ok(t[state] && t.paper, `${s} lacks a token`)
        const bg = mix(c(state), c("paper"), p)
        const r = ratio(c(state), bg)
        assert.ok(r >= 4.5, `${s}: ${state} on ${p} mix is ${r.toFixed(2)}`)
      })
    })
  }
}

test("focus on paper has contrast 3 or more in both schemes", () => {
  each((s, t, c) => {
    assert.ok(t.focus && t.paper, `${s} lacks a token`)
    const r = ratio(c("focus"), c("paper"))
    assert.ok(r >= 3, `${s}: focus on paper is ${r.toFixed(2)}`)
  })
})

test("the band color is the same in both schemes", () => {
  const t = tokens()
  assert.ok(t.light.cover)
  assert.equal(t.light.cover, t.dark.cover)
})

test("no hex color or rgb() appears outside the two token blocks", () => {
  const rest = css.replace(/:root\s*\{[^}]*\}/g, "")
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(rest), "a hex color is outside")
  assert.ok(!/rgba?\(/i.test(rest), "an rgb() is outside")
  assert.ok(css.length > 0)
})

test("no hsl, hwb, lab, lch, oklab, oklch, or color() outside tokens", () => {
  const rest = css.replace(/:root\s*\{[^}]*\}/g, "")
  const re = /(?<![\w-])(hsla?|hwb|lab|lch|oklab|oklch|color)\(/i
  assert.ok(!re.test(rest), "a banned color function is outside")
  assert.ok(/color-mix\(/.test(rest), "color-mix must stay allowed")
})

test("the tokens have the values of the design file", () => {
  const doc = readFileSync(
    new URL("../docs/plans/page-redesign-design.md", import.meta.url),
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
