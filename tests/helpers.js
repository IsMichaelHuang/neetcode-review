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
