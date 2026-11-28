// Fixed values for the whole page.
export const OWNER = "IsMichaelHuang"
export const REPO = "neetcode-submissions-aquuq6h3"
export const BRANCH = "main"
export const LADDER = [1, 3, 7, 14, 30, 60]
export const DEFAULT_TARGET = 4
export const MIN_TARGET = 1
export const MAX_TARGET = 10
export const RATINGS = Object.freeze(["clean", "struggled", "failed"])
export const DIFFICULTY_ORDER = ["Medium", "Hard", "Easy"]
export const LEVEL_ORDER = ["Easy", "Medium", "Hard"]
export const ID_PATTERN = /^[a-z0-9-]+$/
export const STORAGE_KEY = "neetcode-review:state"
export const BAD_KEY = "neetcode-review:state.bad"
export const EXPORTED_KEY = "neetcode-review:exported"
export const BACKUP_DAYS = 14
export const TREE_CACHE_KEY = "neetcode-review:tree"
export const TREE_MAX_AGE_MS = 600000
export const FETCH_TIMEOUT_MS = 8000
export const MAX_IMPORT_CHARS = 1000000

// Fixed texts. The page never shows a remote message.
export const NOTICES = Object.freeze({
  stale: "The file list may be out of date, so some solutions may be new.",
  noTree: "The file list could not load, so only saved problems show.",
  cannotSave: "Your changes could not be saved in this browser.",
  damaged: "Your saved data was damaged, so a safe copy was kept.",
  backup:
    "Your ratings have no export from the last 14 days. " +
    "Export them on the Settings page.",
  revealFailed: "The solution could not load, so try again later.",
})
