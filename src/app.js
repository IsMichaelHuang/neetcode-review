// The controller. It joins the data modules and returns plain objects.
import { MIN_TARGET, MAX_TARGET, NOTICES } from "./config.js"
import { parseTree, mergeCatalog } from "./catalog.js"
import { localDate, formatDay, daysBetween } from "./dates.js"
import { replay, rate as rateHistory, isWeak } from "./schedule.js"
import { buildToday, topicSummary } from "./queue.js"
import {
  emptyState,
  loadState,
  saveState,
  importText as parseImport,
  exportText as stringify,
} from "./store.js"
import { loadTree, rawUrl, problemUrl, folderUrl } from "./github.js"

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
const STATUSES = ["new", "due", "weak"]

export const createApp = ({ fetchFn, storage, now, known }) => {
  let state = emptyState()
  let loadNotice = null
  let treeNotice = null
  let unsaved = false
  let importError = null
  let problems = mergeCatalog(null, known)
  let filters = { topic: "all", status: "all" }
  const solutions = new Map()
  const pending = new Map()

  const historyOf = (id) =>
    Object.hasOwn(state.ratings, id) ? state.ratings[id] : []

  const refresh = () => {
    if (unsaved) return
    const r = loadState(storage)
    if (r.notice === null) state = r.state
  }

  const save = () => {
    unsaved = !saveState(storage, state)
    // A good save also clears an unreadable-storage notice from init.
    if (!unsaved && loadNotice === NOTICES.cannotSave) loadNotice = null
  }

  const change = (next) => {
    refresh()
    state = next(state)
    save()
  }

  const rowFor = (p, today) => {
    const history = historyOf(p.id)
    const due = history.length > 0 ? replay(history).due : null
    let kind = "later"
    if (history.some((e) => e.date === today)) kind = "done"
    else if (due !== null && due <= today) kind = "due"
    else if (history.length === 0) kind = "new"
    return {
      id: p.id,
      title: p.title,
      topic: p.topic,
      difficulty: p.difficulty,
      kind,
      overdueDays: kind === "due" ? daysBetween(due, today) : 0,
      lastRating: history.at(-1)?.rating ?? null,
      due,
      problemUrl: problemUrl(p.id),
      folderUrl: folderUrl(p.folder, p.id),
      canReveal: p.latestPath !== null,
      solution: solutions.get(p.id) ?? null,
    }
  }

  const matches = (row, p) => {
    if (filters.topic !== "all" && row.topic !== filters.topic) return false
    if (filters.status === "weak") return isWeak(historyOf(p.id))
    return filters.status === "all" || row.kind === filters.status
  }

  const view = () => {
    const date = now()
    const today = localDate(date)
    const { done, open, waiting } = buildToday({
      problems,
      ratings: state.ratings,
      target: state.target,
      today,
    })
    const queue = [...done, ...open.map((o) => o.problem)]
    const all = [...problems].sort(
      (a, b) => cmp(a.title, b.title) || cmp(a.id, b.id),
    )
    const rows = all.map((p) => [rowFor(p, today), p])
    const notices = [treeNotice, loadNotice, unsaved && NOTICES.cannotSave]
    return {
      today,
      todayLabel: formatDay(today),
      target: state.target,
      doneCount: rows.filter(([r]) => r.kind === "done").length,
      waiting,
      notices: [...new Set(notices.filter(Boolean))],
      importError,
      queue: queue.map((p) => rowFor(p, today)),
      topics: topicSummary(problems, state.ratings),
      table: rows.filter(([r, p]) => matches(r, p)).map(([r]) => r),
      filters: { ...filters },
      topicOptions: [...new Set(problems.map((p) => p.topic))].sort(cmp),
    }
  }

  const init = async () => {
    const loaded = loadState(storage)
    state = loaded.state
    loadNotice = loaded.notice
    const { tree, stale } = await loadTree(fetchFn, storage, now().getTime())
    const folders = tree === null ? null : parseTree(tree)
    problems = mergeCatalog(folders?.length ? folders : null, known)
    treeNotice = tree === null ? NOTICES.noTree : stale ? NOTICES.stale : null
  }

  const fetchSolution = async (p) => {
    try {
      const res = await fetchFn(rawUrl(p.latestPath))
      if (!res.ok) throw new Error("bad status")
      solutions.set(p.id, { text: await res.text() })
    } catch {
      solutions.set(p.id, { error: NOTICES.revealFailed })
    }
  }

  const reveal = (id) => {
    const p = problems.find((x) => x.id === id)
    if (!p || p.latestPath === null) return Promise.resolve()
    if (solutions.get(id)?.text !== undefined) return Promise.resolve()
    if (!pending.has(id)) {
      const job = fetchSolution(p).finally(() => pending.delete(id))
      pending.set(id, job)
    }
    return pending.get(id)
  }

  return {
    init,
    view,
    refresh,
    reveal,
    rate(id, rating) {
      if (!problems.some((p) => p.id === id)) return
      const today = localDate(now())
      change((s) => {
        const next = rateHistory(historyOf(id), today, rating)
        return { ...s, ratings: { ...s.ratings, [id]: next } }
      })
    },
    setTarget(n) {
      if (!Number.isFinite(n)) return
      const target = Math.min(MAX_TARGET, Math.max(MIN_TARGET, Math.round(n)))
      change((s) => ({ ...s, target }))
    },
    setFilter({ topic, status }) {
      filters = {
        topic: typeof topic === "string" ? topic : "all",
        status: STATUSES.includes(status) ? status : "all",
      }
    },
    exportText: () => stringify(state),
    importText(text, confirmFn) {
      const r = parseImport(text)
      if (!r.ok) {
        importError = r.error
        return { ok: false, error: r.error }
      }
      importError = null
      if (!confirmFn()) return { ok: false, cancelled: true }
      change(() => r.state)
      return { ok: true }
    },
  }
}
