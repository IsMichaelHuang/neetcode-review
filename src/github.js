// URL builders and the cached request for the GitHub file tree.
import {
  OWNER,
  REPO,
  BRANCH,
  TREE_CACHE_KEY,
  TREE_MAX_AGE_MS,
  FETCH_TIMEOUT_MS,
} from "./config.js"
import { parseTree } from "./catalog.js"

const enc = (path) => path.split("/").map(encodeURIComponent).join("/")
const REPO_PATH = `${OWNER}/${REPO}`

export const treeUrl = () =>
  `https://api.github.com/repos/${REPO_PATH}/git/trees/${BRANCH}?recursive=1`

export const rawUrl = (path) =>
  `https://raw.githubusercontent.com/${REPO_PATH}/${BRANCH}/${enc(path)}`

export const problemUrl = (id) =>
  `https://neetcode.io/problems/${encodeURIComponent(id)}`

export const folderUrl = (folder, id) =>
  folder === null
    ? null
    : `https://github.com/${REPO_PATH}/tree/${BRANCH}/${enc(folder)}/${enc(id)}`

// A cache with another shape, or from the future, counts as no cache.
const readCache = (storage, nowMs) => {
  try {
    const c = JSON.parse(storage.getItem(TREE_CACHE_KEY))
    if (Number.isFinite(c?.at) && Array.isArray(c.tree) && c.at <= nowMs) {
      return c
    }
  } catch {
    // Treat a read or parse error as no cache.
  }
  return null
}

const fetchTree = async (fetchFn) => {
  try {
    const res = await fetchFn(treeUrl(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return null
    const body = await res.json()
    if (!Array.isArray(body?.tree) || body.truncated === true) return null
    const items = body.tree
      .filter((i) => i !== null && typeof i === "object")
      .map(({ path, type }) => ({ path, type }))
    return parseTree(items).length > 0 ? items : null
  } catch {
    return null
  }
}

export const loadTree = async (fetchFn, storage, nowMs) => {
  const cache = readCache(storage, nowMs)
  if (cache && nowMs - cache.at < TREE_MAX_AGE_MS) {
    return { tree: cache.tree, stale: false }
  }
  const tree = await fetchTree(fetchFn)
  if (tree) {
    try {
      storage.setItem(TREE_CACHE_KEY, JSON.stringify({ at: nowMs, tree }))
    } catch {
      // The cache is a bonus. The tree still works.
    }
    return { tree, stale: false }
  }
  if (cache) return { tree: cache.tree, stale: true }
  return { tree: null, stale: false }
}
