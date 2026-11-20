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
