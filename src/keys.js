// The rating for a key press, or null. Pure: it reads the event only.
import { RATING_KEYS } from "./labels.js"

// A key typed in these nodes is text, not a rating. PRE is the solution.
const TEXT_TAGS = ["INPUT", "TEXTAREA", "SELECT", "PRE"]

export const ratingForKey = (event) => {
  if (event.repeat || event.isComposing) return null
  if (event.ctrlKey || event.metaKey || event.altKey) return null
  const target = event.target
  if (target?.isContentEditable) return null
  if (TEXT_TAGS.includes(target?.tagName)) return null
  // Shift is allowed, so the digit row of an AZERTY keyboard works.
  const at = ["1", "2", "3"].indexOf(event.key)
  return at < 0 ? null : RATING_KEYS[at]
}
