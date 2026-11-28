import { readFileSync } from "node:fs"

const ROOT = new URL("../", import.meta.url)

export const loadJson = (path) =>
  JSON.parse(readFileSync(new URL(path, ROOT), "utf8"))

export const entry = (date, rating) => ({ date, rating })

export const problem = (id, topic, difficulty = "Medium") => ({
  id,
  title: id,
  topic,
  difficulty,
  folder: "T",
  latestPath: `T/${id}/submission-0.py`,
})

export const ids = (list) => list.map((x) => x.id)

export const fakeStorage = ({ failWrites = false, failReads = false } = {}) => {
  const data = new Map()
  return {
    failWrites,
    failReads,
    getItem(key) {
      if (this.failReads) throw new Error("read failed")
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, text) {
      if (this.failWrites) throw new Error("write failed")
      data.set(key, String(text))
    },
    removeItem(key) {
      data.delete(key)
    },
  }
}

// A navigator whose storage.persist counts its calls. `persist` is the
// function that runs on each call.
export const fakeNavigator = (persist = async () => true) => {
  const nav = { calls: 0 }
  nav.storage = {
    persist() {
      nav.calls++
      return persist()
    },
  }
  return nav
}

// routes maps a URL to { status, body } or to an Error to throw.
export const fakeFetch = (routes) => {
  const calls = []
  const fetchFn = async (url) => {
    calls.push(url)
    const route = routes[url] ?? { status: 404, body: "" }
    if (route instanceof Error) throw route
    const { status, body } = route
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
      text: async () =>
        typeof body === "string" ? body : JSON.stringify(body),
    }
  }
  return { fetchFn, calls }
}

// The text of both style files, without comments.
export const readCss = () =>
  ["styles.css", "lists.css"]
    .map((f) => readFileSync(new URL(f, ROOT), "utf8"))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
