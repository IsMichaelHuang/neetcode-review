import test from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"

test("no file breaks the size limits", () => {
  const out = execFileSync("sh", ["scripts/check-limits.sh"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  })
  assert.equal(out, "")
})
