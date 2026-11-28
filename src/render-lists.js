// The Topics section and the Problems section.
import { formatDay } from "./dates.js"
import {
  h,
  outside,
  labelled,
  select,
  known,
  rated,
  topicName,
} from "./h.js"

const STATUS_OPTIONS = [
  ["all", "All"],
  ["new", "New"],
  ["due", "Due"],
  ["weak", "Weak"],
]
const HEADS = ["Problem", "Topic", "Level", "Last rating", "Next due"]

const last = (doc, rating) =>
  known(rating) ? rated(doc, rating) : [nil(doc)]

const nil = (doc) => h(doc, "span", { cls: "nil", text: "none" })

export const topicsSection = (doc, view, codes) =>
  h(doc, "section", { cls: "topics", "aria-labelledby": "topics-h" }, [
    h(doc, "div", { cls: "head" }, [
      h(doc, "h2", { id: "topics-h", tabindex: "-1", text: "Topics" }),
      h(doc, "p", {
        cls: "legend",
        "aria-hidden": "true",
        text: "reviewed · weak",
      }),
    ]),
    h(
      doc,
      "ul",
      { cls: "index", role: "list" },
      view.topics.map((t) =>
        h(doc, "li", {}, [
          ...topicName(doc, codes, t.topic),
          h(doc, "span", { cls: "num" }, [
            h(doc, "span", { text: `${t.reviewed} of ${t.total}` }),
            h(doc, "span", { cls: "sr", text: "reviewed" }),
          ]),
          h(
            doc,
            "span",
            { cls: t.weak === 0 ? "weak nil" : "weak" },
            [
              h(doc, "span", { text: String(t.weak) }),
              h(doc, "span", { cls: "sr", text: "weak" }),
            ],
          ),
        ]),
      ),
    ),
  ])

// A cell has a role and a label, so a stacked row keeps its meaning.
const cell = (doc, i, attrs, kids = []) =>
  h(doc, "td", { role: "cell", "data-label": HEADS[i], ...attrs }, kids)

const tableRow = (doc, r, codes) =>
  h(doc, "tr", { role: "row" }, [
    h(doc, "td", { role: "cell", cls: "title" }, [
      outside(doc, r.problemUrl, r.title),
    ]),
    cell(doc, 1, {}, topicName(doc, codes, r.topic)),
    cell(doc, 2, { text: r.difficulty }),
    cell(doc, 3, {}, last(doc, r.lastRating)),
    cell(
      doc,
      4,
      {},
      [
        r.due === null
          ? nil(doc)
          : h(doc, "span", { text: formatDay(r.due) }),
      ],
    ),
  ])

export const tableSection = (doc, view, on, codes) => {
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
  const rows =
    view.table.length === 0
      ? [
          h(doc, "tr", { cls: "empty", role: "row" }, [
            h(doc, "td", {
              role: "cell",
              colspan: "5",
              text: "No problem matches these filters.",
            }),
          ]),
        ]
      : view.table.map((r) => tableRow(doc, r, codes))
  const th = (t) =>
    h(doc, "th", { scope: "col", role: "columnheader", text: t })
  const attrs = { cls: "problems", "aria-labelledby": "problems-h" }
  return h(doc, "section", attrs, [
    h(doc, "div", { cls: "head" }, [
      h(doc, "h2", { id: "problems-h", tabindex: "-1", text: "Problems" }),
      h(doc, "div", { cls: "filters" }, [
        labelled(doc, "filter-topic", "Topic", topic),
        labelled(doc, "filter-status", "Status", status),
      ]),
    ]),
    h(doc, "div", { cls: "table-wrap" }, [
      h(doc, "table", { role: "table" }, [
        h(doc, "thead", { role: "rowgroup" }, [
          h(doc, "tr", { role: "row" }, HEADS.map(th)),
        ]),
        h(doc, "tbody", { role: "rowgroup" }, rows),
      ]),
    ]),
  ])
}
