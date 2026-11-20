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
