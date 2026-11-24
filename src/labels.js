// Text helpers and fixed class tables for the render code.
export const RATING_KEYS = Object.freeze(["clean", "struggled", "failed"])

const table = (fn) =>
  Object.freeze(Object.fromEntries(RATING_KEYS.map((k, i) => [k, fn(k, i)])))

export const RATING_LABEL = table((k) => k[0].toUpperCase() + k.slice(1))
export const RATE_CLASS = table((k) => `rate-${k}`)
export const DOT_CLASS = table((k) => `dot-${k}`)
export const DONE_CLASS = table((k) => `done-${k}`)
export const DUE_CLASS = Object.freeze(["due-0", "due-1", "due-2", "due-3"])

// Read a table only for its own keys, so "constructor" finds nothing.
const own = (t, key) => (Object.hasOwn(t, key) ? t[key] : undefined)

const code = (n) => {
  let s = ""
  for (let i = n + 1; i > 0; i = Math.floor((i - 1) / 26)) {
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s
  }
  return s
}

// Spreadsheet-style codes: A to Z, then AA, AB, and so on.
export const topicCodes = (topics) => {
  const codes = new Map()
  for (const t of topics) if (!codes.has(t)) codes.set(t, code(codes.size))
  return codes
}

export const statusText = (row) => {
  if (row.kind === "done") {
    return `done: ${own(RATING_LABEL, row.lastRating) ?? ""}`
  }
  if (row.kind === "new") return "new"
  if (row.overdueDays === 0) return "due today"
  const s = row.overdueDays === 1 ? "" : "s"
  return `${row.overdueDays} day${s} overdue`
}

export const urgency = (days) => {
  if (typeof days !== "number" || !Number.isFinite(days)) return 0
  if (days >= 7) return 3
  if (days >= 3) return 2
  return days >= 1 ? 1 : 0
}

export const statusClass = (row) => {
  if (row.kind === "done") return own(DONE_CLASS, row.lastRating) ?? "kind-new"
  if (row.kind === "due") return DUE_CLASS[urgency(row.overdueDays)]
  return "kind-new"
}
