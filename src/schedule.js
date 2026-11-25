import { LADDER, RATINGS } from "./config.js"
import { addDays } from "./dates.js"

const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)

// Walk the history in date order. "step" is null before the first entry.
export const replay = (history) => {
  let step = null
  const sorted = [...history].sort(byDate)
  for (const { rating } of sorted) {
    if (rating === "failed") step = 0
    else if (rating === "struggled") step = Math.max(step ?? 0, 1)
    else step = Math.min(Math.max((step ?? -1) + 1, 2), LADDER.length - 1)
  }
  if (step === null) return { step: null, due: null }
  return { step, due: addDays(sorted.at(-1).date, LADDER[step]) }
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
