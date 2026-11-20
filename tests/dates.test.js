import { test } from "node:test"
import assert from "node:assert/strict"
import {
  localDate,
  addDays,
  daysBetween,
  isRealDate,
  formatDay,
} from "../src/dates.js"

test("addDays crosses a month and year end", () => {
  assert.equal(addDays("2026-11-28", 3), "2026-12-01")
})

test("addDays is stable across the US DST change", () => {
  assert.equal(addDays("2026-03-07", 2), "2026-03-09")
})

test("addDays is stable across the EU DST change", () => {
  assert.equal(addDays("2026-10-24", 2), "2026-10-26")
})

test("addDays knows leap days", () => {
  assert.equal(addDays("2028-02-28", 1), "2028-02-29")
})

test("daysBetween is negative when to is earlier", () => {
  assert.equal(daysBetween("2026-11-20", "2026-11-18"), -2)
})

test("daysBetween counts whole days across US DST", () => {
  assert.equal(daysBetween("2026-03-07", "2026-03-09"), 2)
})

test("localDate reads the local parts of a Date", () => {
  assert.equal(localDate(new Date(2026, 10, 20, 23, 59)), "2026-11-20")
})

test("formatDay gives a short weekday, month and day", () => {
  assert.equal(formatDay("2026-11-20"), "Fri, Nov 20")
})

test("isRealDate accepts a real date", () => {
  assert.equal(isRealDate("2026-11-20"), true)
})

for (const bad of [
  "2026-02-30",
  "2026-13-01",
  "0000-00-00",
  "11/20/2026",
  20261120,
  ["2026-11-20"],
  "1999-12-31",
]) {
  test(`isRealDate rejects ${JSON.stringify(bad)}`, () => {
    assert.equal(isRealDate(bad), false)
  })
}
