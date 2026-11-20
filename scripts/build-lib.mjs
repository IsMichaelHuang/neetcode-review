// Pure logic. No network and no file access.
const LEVELS = ["Easy", "Medium", "Hard"]
const text = (v) => typeof v === "string" && v.length > 0

export function buildProblems(ids, list, nameMap, manual) {
  const bySlug = new Map(
    list.map((x) => [String(x?.link).replace(/\/$/, ""), x]),
  )
  const hand = new Map(manual.map((k) => [k.id, k]))
  const problems = []
  const missing = []
  for (const id of ids) {
    if (hand.has(id)) {
      problems.push(hand.get(id))
      continue
    }
    const slug = Object.hasOwn(nameMap, id) ? nameMap[id] : id
    const x = bySlug.get(slug)
    if (!x || !text(x.problem) || !text(x.pattern)) {
      missing.push(id)
      continue
    }
    const difficulty = LEVELS.includes(x.difficulty)
      ? x.difficulty
      : "Unknown"
    problems.push({ id, title: x.problem, topic: x.pattern, difficulty })
  }
  problems.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  return { problems, missing }
}
