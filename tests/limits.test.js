import test from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

test("no file breaks the size limits", () => {
  // spawnSync, so a failure shows the WIDE and LONG lines.
  const r = spawnSync("sh", ["scripts/check-limits.sh"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  })
  assert.equal(r.stdout, "")
  assert.equal(r.status, 0)
})

const script = new URL("../scripts/check-limits.sh", import.meta.url).pathname

// Run the script in a new git folder that holds one file.
const run = (content) => {
  const dir = mkdtempSync(join(tmpdir(), "limits-"))
  try {
    spawnSync("git", ["init", "-q"], { cwd: dir })
    writeFileSync(join(dir, "a.txt"), content)
    return spawnSync("sh", [script], { cwd: dir, encoding: "utf8" })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test("a line of 81 characters gives WIDE and exit 1", () => {
  const r = run("x".repeat(81) + "\n")
  assert.equal(r.status, 1)
  assert.match(r.stdout, /WIDE/)
})

test("a file of 401 lines gives LONG and exit 1", () => {
  const r = run("x\n".repeat(401))
  assert.equal(r.status, 1)
  assert.match(r.stdout, /LONG/)
})

test("a short file gives no output and exit 0", () => {
  const r = run("short\n")
  assert.equal(r.status, 0)
  assert.equal(r.stdout, "")
})
