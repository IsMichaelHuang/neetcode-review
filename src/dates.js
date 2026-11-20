// Dates are "YYYY-MM-DD" strings. Math uses UTC, so no time zone
// or DST change can shift a day.
const pad = (n) => String(n).padStart(2, "0")
const parts = (s) => s.split("-").map(Number)
const utc = (s) => {
  const [y, m, d] = parts(s)
  return Date.UTC(y, m - 1, d)
}
const DAY_MS = 86400000

export const localDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const addDays = (date, n) => {
  const t = new Date(utc(date) + n * DAY_MS)
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(
    t.getUTCDate(),
  )}`
}

export const daysBetween = (from, to) =>
  Math.round((utc(to) - utc(from)) / DAY_MS)

export const isRealDate = (text) => {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false
  }
  const [y, m, d] = parts(text)
  const t = new Date(Date.UTC(y, m - 1, d))
  return (
    t.getUTCFullYear() === y &&
    t.getUTCMonth() === m - 1 &&
    t.getUTCDate() === d &&
    y >= 2000 &&
    y <= 2100
  )
}

export const formatDay = (date) =>
  new Date(utc(date)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  })
