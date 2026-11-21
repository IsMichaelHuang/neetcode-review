// Shared builders for the three render test files.
import assert from "node:assert/strict"
import { render } from "../src/render.js"
import { fakeDocument, find, byClass } from "./dom.js"

export const row = (over = {}) => ({
  id: "two-sum",
  title: "Two Sum",
  topic: "Arrays & Hashing",
  difficulty: "Easy",
  kind: "new",
  overdueDays: 0,
  lastRating: null,
  due: null,
  problemUrl: "https://neetcode.io/problems/two-sum",
  folderUrl: "https://github.com/IsMichaelHuang/r/tree/main/A/two-sum",
  canReveal: true,
  solution: null,
  ...over,
})

export const view = (over = {}) => ({
  today: "2026-11-20",
  todayLabel: "Fri Nov 20",
  target: 4,
  doneCount: 0,
  waiting: 0,
  notices: [],
  importError: null,
  queue: [row()],
  topics: [{ topic: "Trees", total: 11, reviewed: 3, weak: 1 }],
  table: [row()],
  filters: { topic: "all", status: "all" },
  topicOptions: ["Trees", "Graphs"],
  ...over,
})

export const handlers = (log = []) => {
  const h = {}
  for (const name of [
    "onRate",
    "onReveal",
    "onTarget",
    "onExport",
    "onImport",
    "onFilter",
  ]) {
    h[name] = (...args) => log.push([name, ...args])
  }
  return h
}

export const draw = (v, log) => {
  const doc = fakeDocument()
  render(doc.app, v, handlers(log))
  return doc
}

// Finds an element by id and asserts that it exists.
export const byId = (doc, id) => {
  const el = find(doc.app, (n) => n.attrs.id === id)[0]
  assert.ok(el, `no element with id ${id}`)
  return el
}

// Finds the n-th element with a class and asserts that it exists.
export const one = (root, token, n = 0) => {
  const el = byClass(root, token)[n]
  assert.ok(el, `no element with class ${token}`)
  return el
}

const ratings = ["clean", "struggled", "failed"]

// Three views that together show each state of the page.
export const everyState = () => {
  const topicOptions = ["Trees", "Graphs", "Heaps"]
  const rated = ratings.map((r, i) =>
    row({
      id: `done-${r}`,
      title: `Done ${r}`,
      topic: "Graphs",
      kind: "done",
      lastRating: r,
      due: `2026-11-2${i}`,
    }),
  )
  const due = [0, 2, 4, 9].map((d) =>
    row({
      id: `due-${d}`,
      title: `Due ${d}`,
      topic: "Heaps",
      kind: "due",
      overdueDays: d,
      due: "2026-11-10",
    }),
  )
  const queue = [
    row({ id: "new-one", title: "New one", topic: "Trees" }),
    ...due,
    ...rated,
    row({ id: "shown", title: "Shown", solution: { text: "x = 1" } }),
    row({ id: "failed", title: "Fail", solution: { error: "No file." } }),
  ]
  const full = view({
    queue,
    table: [
      ...queue,
      row({ id: "out", title: "Out", topic: "Other topic" }),
    ],
    topics: [
      { topic: "Trees", total: 11, reviewed: 3, weak: 1 },
      { topic: "Graphs", total: 5, reviewed: 5, weak: 0 },
    ],
    notices: ["Notice one.", "Notice two."],
    importError: "Bad file.",
    waiting: 3,
    doneCount: 3,
    topicOptions,
  })
  const empty = view({ queue: [], table: [], topics: [], topicOptions })
  const plain = view({
    queue: [row({ id: "plain", canReveal: false })],
    table: [row({ id: "plain", canReveal: false })],
    topics: [{ topic: "Trees", total: 2, reviewed: 0, weak: 0 }],
    topicOptions,
  })
  return [full, empty, plain]
}
