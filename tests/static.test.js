import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const sources = [
  ...readdirSync(new URL("../src/", import.meta.url)).map((f) => `src/${f}`),
  "index.html",
]
const html = read("index.html")

const BANNED = [
  /innerHTML/,
  /outerHTML/,
  /insertAdjacentHTML/,
  /document\.write/,
  /\beval\(/,
  /new Function/,
  /DOMParser/,
  /createContextualFragment/,
  /srcdoc/,
  /javascript:/,
  /setAttribute\("style"/,
  /setAttribute\("on/,
]

test("no source file or index.html uses an unsafe sink", () => {
  for (const file of sources) {
    const code = read(file)
    for (const re of BANNED) {
      assert.ok(!re.test(code), `${file} matches ${re}`)
    }
  }
})

test("index.html has no inline script, style, or on attribute", () => {
  assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/i.test(html))
  assert.ok(!/<script[^>]*>[^<]+<\/script>/i.test(html))
  assert.ok(!/\sstyle\s*=/i.test(html))
  assert.ok(!/\son[a-z]+\s*=/i.test(html))
})

test("the CSP meta tag is first in head with every directive", () => {
  const head = html.match(/<head>\s*(<[^>]*>)/i)[1]
  assert.match(head, /^<meta\b/i)
  assert.match(head, /http-equiv="Content-Security-Policy"/i)
  const csp = head.match(/content="([^"]*)"/i)[1]
  const wanted = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self'",
    "connect-src 'self' https://api.github.com " +
      "https://raw.githubusercontent.com",
    "base-uri 'none'",
    "form-action 'none'",
  ]
  const have = csp.split(";").map((d) => d.trim().replace(/\s+/g, " "))
  assert.deepEqual(have.filter(Boolean), wanted)
})

test("index.html loads src/main.js as a module", () => {
  assert.match(html, /<script type="module" src="src\/main\.js"><\/script>/)
})

test("styles.css has no data URL", () => {
  assert.ok(!read("styles.css").includes("url(data:"))
})

const css = () => read("styles.css").replace(/\/\*[\s\S]*?\*\//g, "")

test("styles.css has no rounded corner, even as a longhand", () => {
  assert.ok(!/radius\s*:(?!\s*0\s*[;}])/.test(css()))
})

for (const [name, re] of [
  ["box-shadow", /box-shadow/],
  ["a gradient", /gradient\(/],
  ["@import", /@import/],
  ["url()", /url\(/],
  ["@font-face", /@font-face/],
  ["@keyframes", /@keyframes/],
  ["!important", /!\s*important/i],
]) {
  test(`styles.css has no ${name}`, () => {
    assert.ok(!re.test(css()))
  })
}

test("styles.css uses only the sizes of the type scale", () => {
  const ok = ["0.75rem", "0.875rem", "1rem", "1.1875rem", "1.5rem",
    "1.875rem", "inherit"]
  const sizes = [...css().matchAll(/font-size:\s*([^;}]+)/g)]
  assert.ok(sizes.length > 0)
  for (const m of sizes) {
    assert.ok(ok.includes(m[1].trim()), `font-size ${m[1]}`)
  }
})

test("styles.css uses the font shorthand only as font: inherit", () => {
  for (const m of css().matchAll(/(?<![\w-])font:\s*([^;}]+)/g)) {
    assert.equal(m[1].trim(), "inherit")
  }
})

test("styles.css has a transition and turns it off for reduced motion", () => {
  const c = css()
  assert.match(c, /transition:/)
  const block = c.match(
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\}\s*\}/,
  )
  assert.ok(block, "no reduced-motion block")
  assert.match(block[0], /transition:\s*none/)
})

test("styles.css keeps its scheme and focus guards", () => {
  const c = css()
  assert.match(c, /color-scheme:\s*light dark/)
  assert.match(c, /prefers-color-scheme:\s*dark/)
  assert.match(c, /:focus-visible/)
})

test("styles.css has a forced-colors rule", () => {
  assert.match(css(), /forced-colors:\s*active/)
})

// The text of an @media block, found by matching braces.
const mediaBlock = (c, query) => {
  const at = c.indexOf(`@media (${query}) {`)
  assert.ok(at >= 0, `no media block for ${query}`)
  let depth = 0
  for (let i = c.indexOf("{", at); i < c.length; i++) {
    if (c[i] === "{") depth++
    if (c[i] === "}" && --depth === 0) return c.slice(at, i + 1)
  }
  return assert.fail("unclosed media block")
}

test("at 1200 pixels each entry spans all tracks of the subgrid", () => {
  const block = mediaBlock(css(), "min-width: 1200px")
  const rules = [...block.matchAll(/([^{}]+)\{([^}]*)\}/g)]
  const hit = rules.some(
    (m) => /\.entry\b/.test(m[1]) && /grid-column:\s*1 \/ -1/.test(m[2]),
  )
  assert.ok(hit, "no rule gives .entry grid-column: 1 / -1")
})

test("a zero weak count is hidden with opacity", () => {
  assert.match(css(), /\.weak\.nil\s*\{\s*opacity:\s*0;\s*\}/)
})

test("styles.css has a media query for 720 to 1199.98 pixels", () => {
  const q = "(min-width: 720px) and (max-width: 1199.98px)"
  assert.ok(css().includes(`@media ${q} {`))
})

test("the band aligns with the page through --wide", () => {
  const c = css()
  assert.match(c, /\.cover\s*\{[^}]*padding:[^;]*var\(--wide\)/)
  assert.match(mediaBlock(c, "min-width: 1440px"), /--wide:\s*96rem/)
})

test("at 480 pixels a rating symbol is a flush block", () => {
  const block = mediaBlock(css(), "min-width: 480px")
  const hit = [...block.matchAll(/([^{}]+)\{([^}]*)\}/g)].some(
    (m) => /\.rate \.sym/.test(m[1]) && /width:\s*1\.875rem/.test(m[2]),
  )
  assert.ok(hit, "no .rate .sym rule with width 1.875rem")
})

test("the page bottom space is on main, not on sections", () => {
  const c = css()
  assert.ok(!/margin-bottom:\s*3rem/.test(c))
  assert.match(c, /\nmain\s*\{[^}]*padding-bottom:\s*3rem/)
})
