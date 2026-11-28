// The Today section: the queue of entries.
import { h, outside, known, dot, rated, topicName } from "./h.js"
import {
  RATING_KEYS,
  RATING_LABEL,
  RATE_CLASS,
  statusText,
  statusClass,
} from "./labels.js"

const COLS = [
  "No.",
  "Problem",
  "Topic",
  "Level",
  "Status",
  "",
  "How did it go?",
]

const statusCell = (doc, row) => {
  const kids = []
  if (row.kind === "done" && known(row.lastRating)) {
    kids.push(dot(doc, row.lastRating))
  }
  kids.push(h(doc, "span", { cls: "word", text: statusText(row) }))
  return h(doc, "span", { cls: `status ${statusClass(row)}` }, kids)
}

const revealCell = (doc, row, on) => {
  const kids = []
  if (row.canReveal) {
    const b = h(doc, "button", {
      type: "button",
      id: `reveal-${row.id}`,
      "aria-label": `Show my old solution: ${row.title}`,
      text: "Solution",
    })
    b.addEventListener("click", () => on.onReveal(row.id))
    kids.push(b)
  }
  return h(doc, "span", { cls: "sol" }, kids)
}

const rateGroup = (doc, row, on) => {
  const kids = RATING_KEYS.map((rating) => {
    const pressed = row.lastRating === rating && row.kind === "done"
    const b = h(
      doc,
      "button",
      {
        type: "button",
        id: `rate-${row.id}-${rating}`,
        cls: RATE_CLASS[rating],
        "aria-label": `${RATING_LABEL[rating]}: ${row.title}`,
        "aria-pressed": String(pressed),
      },
      rated(doc, rating),
    )
    b.addEventListener("click", () => on.onRate(row.id, rating))
    return b
  })
  return h(
    doc,
    "div",
    {
      cls: "rate",
      role: "group",
      "aria-label": `How did it go: ${row.title}`,
    },
    kids,
  )
}

const solutionBlock = (doc, row) => {
  const s = row.solution
  if (!s) return []
  if (s.error !== undefined) {
    return [
      h(doc, "div", { cls: "solution" }, [
        h(doc, "p", { cls: "error", text: s.error }),
      ]),
    ]
  }
  const kids = [h(doc, "pre", { tabindex: "0", text: s.text })]
  if (row.folderUrl !== null) {
    kids.push(outside(doc, row.folderUrl, "Other submissions on GitHub"))
  }
  return [h(doc, "div", { cls: "solution" }, kids)]
}

const entry = (doc, row, on, codes, index) =>
  h(doc, "li", { cls: row.kind === "done" ? "entry done" : "entry" }, [
    h(doc, "span", { cls: "no", text: String(index + 1) }),
    h(doc, "span", { cls: "title" }, [
      outside(
        doc,
        row.problemUrl,
        row.title,
        `Open on NeetCode: ${row.title}`,
      ),
    ]),
    h(doc, "span", { cls: "topic" }, topicName(doc, codes, row.topic)),
    h(doc, "span", { cls: "level", text: row.difficulty }),
    statusCell(doc, row),
    revealCell(doc, row, on),
    rateGroup(doc, row, on),
    ...solutionBlock(doc, row),
  ])

export const todaySection = (doc, view, on, codes) => {
  const queue = view.queue
  const list =
    queue.length === 0
      ? [h(doc, "p", { cls: "empty", text: "Nothing to review today." })]
      : [
          h(
            doc,
            "div",
            { cls: "cols", "aria-hidden": "true" },
            COLS.map((t) => h(doc, "span", { text: t })),
          ),
          h(
            doc,
            "ol",
            { cls: "entries", role: "list" },
            queue.map((r, i) => entry(doc, r, on, codes, i)),
          ),
        ]
  const more =
    view.waiting > 0
      ? [
          h(doc, "p", {
            cls: "more",
            text: `${view.waiting} more due on later days.`,
          }),
        ]
      : []
  return h(doc, "section", { cls: "today", "aria-labelledby": "today-h" }, [
    h(doc, "div", { cls: "head" }, [
      h(doc, "h2", { id: "today-h", tabindex: "-1", text: "Today" }),
      h(doc, "p", { cls: "date", text: view.todayLabel }),
      h(doc, "p", {
        cls: "count",
        text: `${view.doneCount} of ${view.target} done`,
      }),
    ]),
    ...list,
    ...more,
  ])
}
