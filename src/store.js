import {
  DEFAULT_TARGET,
  MIN_TARGET,
  MAX_TARGET,
  RATINGS,
  ID_PATTERN,
  STORAGE_KEY,
  EXPORTED_KEY,
  BAD_KEY,
  MAX_IMPORT_CHARS,
  NOTICES,
} from "./config.js"
import { isRealDate } from "./dates.js"

export const emptyState = () => ({
  version: 1,
  target: DEFAULT_TARGET,
  ratings: {},
})

const fail = (error) => ({ ok: false, error })
const isObject = (v) => v !== null && typeof v === "object"
const isPlain = (v) => isObject(v) && !Array.isArray(v)

// Checks one history. Returns a new sorted array or an error text.
const checkHistory = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    return "Each history must be a list with at least one entry."
  }
  const seen = new Set()
  const out = []
  for (const e of list) {
    if (!isPlain(e)) return "Each entry must be an object."
    if (!isRealDate(e.date)) return "An entry has a date that is not real."
    if (!RATINGS.includes(e.rating)) return "An entry has an unknown rating."
    if (seen.has(e.date)) return "A history has two entries for one date."
    seen.add(e.date)
    out.push({ date: e.date, rating: e.rating })
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : 1))
}

export const validate = (value) => {
  try {
    if (!isPlain(value)) return fail("The data must be an object.")
    if (value.version !== 1) return fail("The version must be 1.")
    const t = value.target
    if (!Number.isInteger(t) || t < MIN_TARGET || t > MAX_TARGET) {
      const range = `from ${MIN_TARGET} to ${MAX_TARGET}`
      return fail(`The target must be a whole number ${range}.`)
    }
    if (!isPlain(value.ratings)) return fail("The ratings must be an object.")
    const ratings = {}
    for (const [id, list] of Object.entries(value.ratings)) {
      if (!ID_PATTERN.test(id)) return fail("A problem id is not valid.")
      const h = checkHistory(list)
      if (typeof h === "string") return fail(h)
      ratings[id] = h
    }
    return { ok: true, state: { version: 1, target: t, ratings } }
  } catch {
    return fail("The data could not be checked.")
  }
}

export const importText = (text) => {
  if (typeof text !== "string" || text.length > MAX_IMPORT_CHARS) {
    return fail("The text is too long or is not text.")
  }
  let value
  try {
    value = JSON.parse(text)
  } catch {
    return fail("The text is not valid JSON.")
  }
  return validate(value)
}

export const exportText = (state) => JSON.stringify(state, null, 2)

export const loadState = (storage) => {
  let text
  try {
    text = storage.getItem(STORAGE_KEY)
  } catch {
    return { state: emptyState(), notice: NOTICES.cannotSave }
  }
  if (text === null) return { state: emptyState(), notice: null }
  const r = importText(text)
  if (r.ok) return { state: r.state, notice: null }
  try {
    storage.setItem(BAD_KEY, text)
  } catch {
    // No safe copy exists, so never say that one was kept.
    return { state: emptyState(), notice: NOTICES.cannotSave }
  }
  return { state: emptyState(), notice: NOTICES.damaged }
}

// The date of the last export. It is not part of the state object, so the
// export file and validate do not change.
export const loadExported = (storage) => {
  try {
    const date = storage.getItem(EXPORTED_KEY)
    return isRealDate(date) ? date : null
  } catch {
    return null
  }
}

export const saveExported = (storage, date) => {
  if (!isRealDate(date)) return false
  try {
    storage.setItem(EXPORTED_KEY, date)
    return true
  } catch {
    return false
  }
}

export const saveState =(storage, state) => {
  const r = validate(state)
  if (!r.ok) return false
  try {
    storage.setItem(STORAGE_KEY, exportText(r.state))
    return true
  } catch {
    return false
  }
}
