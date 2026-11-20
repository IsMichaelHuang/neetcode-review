import { LADDER, RATINGS } from "./config.js"
import { addDays } from "./dates.js"

const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

// Walk the history in date order. "prev" is the step after the
// entry before this one, or null before the first entry.
export const replay = (history) => {
  let step = null
  for (const { rating } of [...history].sort(byDate)) {
    const prev = step
    if (rating === "failed") step = 0
    else if (rating === "struggled") step = Math.max(prev ?? 0, 1)
    else step = Math.min(Math.max((prev ?? -1) + 1, 2), LADDER.length - 1)
  }
  if (step === null) return { step: null, due: null }
  const last = history.reduce((a, b) => (byDate(a, b) >= 0 ? a : b))
  return { step, due: addDays(last.date, LADDER[step]) }
}

export const rate = (history, date, rating) => {
  if (!RATINGS.includes(rating)) {
    throw new RangeError(`Unknown rating: ${rating}`)
  }
  return [...history.filter((e) => e.date < date), { date, rating }].sort(
    byDate,
  )
}

export const isWeak = (history) => {
  const last = history.at(-1)
  return last !== undefined && last.rating !== "clean"
}
