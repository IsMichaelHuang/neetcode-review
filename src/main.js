// Starts the page: joins the controller to the screen.
import { createApp } from "./app.js"
import { render } from "./render.js"

const EXPORT_NAME = "neetcode-review-ratings.json"

const loadKnown = async (fetchFn) => {
  try {
    const res = await fetchFn("data/problems.json")
    const list = res.ok ? await res.json() : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const download = (document, text) => {
  const blob = new Blob([text], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.setAttribute("href", url)
  a.setAttribute("download", EXPORT_NAME)
  document.body.append(a)
  a.click()
  a.remove()
  // A short wait, so Firefox and Safari can start the download first.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const start = async ({ document, fetchFn, storage, now, confirmFn }) => {
  const known = await loadKnown(fetchFn)
  const app = createApp({ fetchFn, storage, now, known })
  const root = document.getElementById("app")
  // Keep the keyboard focus on the same control across a render.
  const paint = () => {
    const id = document.activeElement?.id
    render(root, app.view(), handlers)
    if (id) document.getElementById(id)?.focus?.()
  }
  const handlers = {
    onRate: (id, rating) => (app.rate(id, rating), paint()),
    onReveal: async (id) => (await app.reveal(id), paint()),
    // Paint after the focus move ends, so focus lands on the new node.
    onTarget: (n) => (app.setTarget(n), setTimeout(paint, 0)),
    onFilter: (f) => (app.setFilter(f), paint()),
    onExport: () => download(document, app.exportText()),
    onImport: (text) => (app.importText(text, confirmFn), paint()),
  }
  document.addEventListener("visibilitychange", () => {
    app.refresh()
    paint()
  })
  // Start the load first, so the first paint shows the saved ratings.
  const ready = app.init()
  paint()
  await ready
  paint()
  return app
}

const safeStorage = () => {
  try {
    return window.localStorage
  } catch {
    const fail = () => {
      throw new Error("storage is not available")
    }
    return { getItem: fail, setItem: fail, removeItem: fail }
  }
}

if (typeof window !== "undefined") {
  start({
    document: window.document,
    fetchFn: window.fetch.bind(window),
    storage: safeStorage(),
    now: () => new Date(),
    confirmFn: () =>
      window.confirm(
        "Replace your current ratings with the ratings in this file?",
      ),
  })
}
