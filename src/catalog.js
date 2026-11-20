// Turns the GitHub file tree into a list of problems.
const FILE = /^([^/]+)\/([a-z0-9-]+)\/submission-(\d+)\.[A-Za-z0-9]+$/

// Returns Folder[] sorted by id.
export function parseTree(tree) {
  const found = new Map()
  for (const item of tree) {
    if (!item || typeof item.path !== "string") continue
    if (typeof item.type !== "string" || item.type !== "blob") continue
    const m = FILE.exec(item.path)
    if (!m || m[1] === "." || m[1] === "..") continue
    const [, folder, id, n] = m
    const old = found.get(id)
    if (old && old.folder < folder) continue
    const next = old && old.folder === folder ? old : { id, folder, files: [] }
    next.files.push({ path: item.path, n: Number(n) })
    found.set(id, next)
  }
  return [...found.values()].sort((a, b) => (a.id < b.id ? -1 : 1))
}

export function latestPath(folder) {
  return folder.files.reduce((a, b) => (b.n > a.n ? b : a)).path
}

export function titleFromId(id) {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

// Joins the tree with the known list. Null folders means no tree.
export function mergeCatalog(folders, known) {
  if (folders === null) {
    return known.map((k) => ({ ...k, folder: null, latestPath: null }))
  }
  const info = new Map(known.map((k) => [k.id, k]))
  return folders.map((f) => {
    const k = info.get(f.id) ?? {
      id: f.id,
      title: titleFromId(f.id),
      topic: "Unknown",
      difficulty: "Unknown",
    }
    return { ...k, folder: f.folder, latestPath: latestPath(f) }
  })
}
