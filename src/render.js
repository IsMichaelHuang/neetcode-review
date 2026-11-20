// Turns a View into DOM nodes. All text goes in through textContent.
import { formatDay } from "./dates.js"

// Class names come from these tables, never from data.
const KIND_CLASS = {
  due: "kind-due",
  new: "kind-new",
  later: "kind-later",
}
const RATING_CLASS = {
  clean: "rate-clean",
  struggled: "rate-struggled",
  failed: "rate-failed",
}
const RATING_LABEL = {
  clean: "Clean",
  struggled: "Struggled",
  failed: "Failed",
}
const DONE_CLASS = {
  clean: "done-clean",
  struggled: "done-struggled",
  failed: "done-failed",
}
const RATINGS = ["clean", "struggled", "failed"]
const STATUS_OPTIONS = [
  ["all", "All"],
  ["new", "New"],
  ["due", "Due"],
  ["weak", "Weak"],
]

// Make an element. attrs: cls, text, value, or any other attribute.
const h = (doc, tag, attrs = {}, kids = []) => {
  const el = doc.createElement(tag)
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue
    if (name === "cls") el.className = value
    else if (name === "text") el.textContent = value
    else if (name === "value") el.value = value
    else el.setAttribute(name, value)
  }
  el.append(...kids)
  return el
}

const outside = (doc, href, label, name = null) =>
  h(doc, "a", {
    "aria-label": name,
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    text: label,
  })

const statusText = (row) => {
  if (row.kind === "done") {
    return `done: ${RATING_LABEL[row.lastRating] ?? ""}`
  }
  if (row.kind === "new") return "new"
  if (row.overdueDays === 0) return "due today"
  const s = row.overdueDays === 1 ? "" : "s"
  return `${row.overdueDays} day${s} overdue`
}

const solutionBlock = (doc, row) => {
  const s = row.solution
  if (!s) return []
  if (s.error !== undefined) {
    return [h(doc, "p", { cls: "error", text: s.error })]
  }
  const kids = [h(doc, "pre", { text: s.text })]
  if (row.folderUrl !== null) {
    kids.push(outside(doc, row.folderUrl, "Other submissions on GitHub"))
  }
  return [h(doc, "div", { cls: "solution" }, kids)]
}

const statusClass = (row) =>
  row.kind === "done" ? DONE_CLASS[row.lastRating] : KIND_CLASS[row.kind]

const queueRow = (doc, row, on, index) => {
  const actions = [
    outside(
      doc,
      row.problemUrl,
      "Open on NeetCode",
      `Open on NeetCode: ${row.title}`,
    ),
  ]
  if (row.canReveal) {
    const reveal = h(doc, "button", {
      type: "button",
      id: `reveal-${row.id}`,
      "aria-label": `Show my old solution: ${row.title}`,
      text: "Show my old solution",
    })
    reveal.addEventListener("click", () => on.onReveal(row.id))
    actions.push(reveal)
  }
  const rate = []
  for (const rating of RATINGS) {
    const b = h(doc, "button", {
      type: "button",
      id: `rate-${row.id}-${rating}`,
      cls: RATING_CLASS[rating],
      "aria-label": `${RATING_LABEL[rating]}: ${row.title}`,
      "aria-pressed": String(row.lastRating === rating && row.kind === "done"),
      text: RATING_LABEL[rating],
    })
    b.addEventListener("click", () => on.onRate(row.id, rating))
    rate.push(b)
  }
  const head = h(doc, "div", { cls: "row-head" }, [
    h(doc, "span", { text: `${index + 1}.` }),
    h(doc, "strong", { text: row.title }),
    h(doc, "span", { text: row.topic }),
    h(doc, "span", { text: row.difficulty }),
    h(doc, "span", { cls: statusClass(row), text: statusText(row) }),
  ])
  return h(doc, "li", {}, [
    head,
    h(doc, "div", { cls: "actions" }, actions),
    h(doc, "div", { cls: "actions" }, [
      h(doc, "span", { text: "How did it go?" }),
      h(doc, "div", {
        cls: "actions",
        role: "group",
        "aria-label": `How did it go: ${row.title}`,
      }, rate),
    ]),
    ...solutionBlock(doc, row),
  ])
}

const labelled = (doc, id, label, control) =>
  h(doc, "div", { cls: "field" }, [
    h(doc, "label", { for: id, text: label }),
    control,
  ])

const topBar = (doc, view, on) => {
  const target = h(doc, "input", {
    id: "target",
    type: "number",
    min: 1,
    max: 10,
    value: String(view.target),
  })
  target.addEventListener("change", (e) => on.onTarget(Number(e.target.value)))
  const exp = h(doc, "button", { type: "button", id: "export", text: "Export" })
  exp.addEventListener("click", () => on.onExport())
  const imp = h(doc, "input", {
    id: "import",
    type: "file",
    accept: "application/json,.json",
  })
  imp.addEventListener("change", async (e) => {
    const file = e.target.files?.[0]
    if (file) on.onImport(await file.text())
  })
  return h(doc, "header", {}, [
    h(doc, "h1", { text: "NeetCode Review" }),
    h(doc, "div", { cls: "bar" }, [
      labelled(doc, "target", "Daily target", target),
      exp,
      labelled(doc, "import", "Import ratings", imp),
    ]),
  ])
}

const todaySection = (doc, view, on) => {
  const notes = view.notices.map((t) => h(doc, "p", { cls: "notice", text: t }))
  if (view.importError !== null) {
    notes.push(
      h(doc, "p", { cls: "error", role: "alert", text: view.importError }),
    )
  }
  const list =
    view.queue.length === 0
      ? [h(doc, "p", { text: "Nothing to review today." })]
      : [h(doc, "ol", {}, view.queue.map((r, i) => queueRow(doc, r, on, i)))]
  const more =
    view.waiting > 0
      ? [h(doc, "p", { text: `${view.waiting} more due on later days.` })]
      : []
  return h(doc, "section", { "aria-labelledby": "today-h" }, [
    h(doc, "h2", { id: "today-h", text: `Today, ${view.todayLabel}` }),
    h(doc, "p", {
      cls: "count",
      text: `${view.doneCount} of ${view.target} done`,
    }),
    ...notes,
    ...list,
    ...more,
  ])
}

const topicsSection = (doc, view) =>
  h(doc, "section", { "aria-labelledby": "topics-h" }, [
    h(doc, "h2", { id: "topics-h", text: "Topics" }),
    h(
      doc,
      "ul",
      { cls: "topics" },
      view.topics.map((t) =>
        h(doc, "li", {
          text: `${t.topic}: ${t.reviewed} of ${t.total} reviewed, ` +
            `${t.weak} weak`,
        }),
      ),
    ),
  ])

const select = (doc, id, options, current) => {
  const el = h(
    doc,
    "select",
    { id },
    options.map(([value, label]) =>
      h(doc, "option", { value, text: label }),
    ),
  )
  el.value = current // after the options exist, so a real select takes it
  return el
}

const tableSection = (doc, view, on) => {
  const f = view.filters
  const topic = select(
    doc,
    "filter-topic",
    [["all", "All"], ...view.topicOptions.map((t) => [t, t])],
    f.topic,
  )
  const status = select(doc, "filter-status", STATUS_OPTIONS, f.status)
  const changed = () =>
    on.onFilter({ topic: topic.value, status: status.value })
  topic.addEventListener("change", changed)
  status.addEventListener("change", changed)
  const th = (t) => h(doc, "th", { scope: "col", text: t })
  const td = (t) => h(doc, "td", { text: t })
  const rows = view.table.map((r) =>
    h(doc, "tr", {}, [
      h(doc, "td", {}, [outside(doc, r.problemUrl, r.title)]),
      td(r.topic),
      td(r.difficulty),
      td(RATING_LABEL[r.lastRating] ?? "none"),
      td(r.due === null ? "none" : formatDay(r.due)),
    ]),
  )
  const head = ["Problem", "Topic", "Difficulty", "Last rating", "Next due"]
  return h(doc, "section", { "aria-labelledby": "all-h" }, [
    h(doc, "h2", { id: "all-h", text: "All problems" }),
    h(doc, "div", { cls: "bar" }, [
      labelled(doc, "filter-topic", "Topic", topic),
      labelled(doc, "filter-status", "Status", status),
    ]),
    h(doc, "div", { cls: "table-wrap" }, [
      h(doc, "table", {}, [
        h(doc, "thead", {}, [h(doc, "tr", {}, head.map(th))]),
        h(doc, "tbody", {}, rows),
      ]),
    ]),
  ])
}

export const render = (root, view, on) => {
  const doc = root.ownerDocument
  root.replaceChildren(
    topBar(doc, view, on),
    todaySection(doc, view, on),
    topicsSection(doc, view),
    tableSection(doc, view, on),
  )
}
