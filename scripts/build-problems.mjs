// Command: builds data/problems.json. Tests never import this file.
import { readFileSync, writeFileSync } from "node:fs"
import { parseTree } from "../src/catalog.js"
import { buildProblems } from "./build-lib.mjs"

const URL_LIST =
  "https://raw.githubusercontent.com/neetcode-gh/leetcode/main/" +
  ".problemSiteData.json"
const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)))

const ids = parseTree(read("../tests/fixtures/tree.json")).map((f) => f.id)
const res = await fetch(URL_LIST)
if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`)
const list = await res.json()
const { problems, missing } = buildProblems(
  ids,
  list,
  read("./name-map.json"),
  read("./manual-problems.json"),
)
if (missing.length > 0) {
  console.error("Missing ids:", missing.join(", "))
  process.exit(1)
}
const lines = problems.map((p) => "  " + JSON.stringify(p))
const out = "[\n" + lines.join(",\n") + "\n]\n"
writeFileSync(new URL("../data/problems.json", import.meta.url), out)
console.log(`Wrote ${problems.length} problems.`)
