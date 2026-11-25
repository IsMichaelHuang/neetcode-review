import { DIFFICULTY_ORDER, LEVEL_ORDER } from "./config.js"
import { isWeak, replay } from "./schedule.js"

export const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

// An id with no own key, or an empty list, has no history.
export const historyOf = (ratings, id) =>
  Object.hasOwn(ratings, id) ? ratings[id] : []

// Take one problem from each topic in turn, until all are used.
const roundRobin = (group) => {
  const topics = new Map()
  for (const p of [...group].sort((a, b) => cmp(a.id, b.id))) {
    if (!topics.has(p.topic)) topics.set(p.topic, [])
    topics.get(p.topic).push(p)
  }
  const queues = [...topics.keys()].sort(cmp).map((t) => topics.get(t))
  const out = []
  for (let i = 0; queues.some((q) => i < q.length); i++) {
    for (const q of queues) if (i < q.length) out.push(q[i])
  }
  return out
}

export const startOrder = (problems) => {
  const groups = new Map(DIFFICULTY_ORDER.map((d) => [d, []]))
  const others = new Map()
  for (const p of problems) {
    const g = groups.has(p.difficulty) ? groups : others
    if (!g.has(p.difficulty)) g.set(p.difficulty, [])
    g.get(p.difficulty).push(p)
  }
  return [...groups.values(), ...others.values()].flatMap(roundRobin)
}

// Only the display order. An unknown level goes last.
const rank = (p) => {
  const i = LEVEL_ORDER.indexOf(p.difficulty)
  return i === -1 ? LEVEL_ORDER.length : i
}
export const byLevel = (list) => [...list].sort((a, b) => rank(a) - rank(b))

export const buildToday = ({ problems, ratings, target, today }) => {
  const done = []
  const due = []
  for (const problem of problems) {
    const history = historyOf(ratings, problem.id)
    if (history.some((e) => e.date === today)) done.push(problem)
    else if (history.length > 0) {
      const { due: date } = replay(history)
      if (date <= today) due.push({ problem, date })
    }
  }
  done.sort((a, b) => cmp(a.id, b.id))
  due.sort((a, b) => cmp(a.date, b.date) || cmp(a.problem.id, b.problem.id))
  const slots = Math.max(0, target - done.length)
  const open = due.slice(0, slots).map(({ problem }) => problem)
  const fresh = startOrder(problems).filter(
    (p) => historyOf(ratings, p.id).length === 0,
  )
  for (const problem of fresh) {
    if (open.length >= slots) break
    open.push(problem)
  }
  return { done, open, waiting: Math.max(0, due.length - slots) }
}

export const topicSummary = (problems, ratings) => {
  const rows = new Map()
  for (const { id, topic } of problems) {
    if (!rows.has(topic)) {
      rows.set(topic, { topic, total: 0, reviewed: 0, weak: 0 })
    }
    const row = rows.get(topic)
    const history = historyOf(ratings, id)
    row.total++
    if (history.length > 0) row.reviewed++
    if (isWeak(history)) row.weak++
  }
  return [...rows.values()].sort((a, b) => cmp(a.topic, b.topic))
}
