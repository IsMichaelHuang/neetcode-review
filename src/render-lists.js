// The Topics section and the All problems section.
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
      h(doc, "h2", { id: "topics-h", text: "Topics" }),
      h(doc, "p", {
        cls: "legend",
        "aria-hidden": "true",
        text: "reviewed · weak",
      }),
    ]),
    h(
      doc,
      "ul",
      { cls: "index" },
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

const tableRow = (doc, r, codes) =>
  h(doc, "tr", {}, [
    h(doc, "td", { cls: "title" }, [outside(doc, r.problemUrl, r.title)]),
    h(doc, "td", {}, topicName(doc, codes, r.topic)),
    h(doc, "td", { text: r.difficulty }),
    h(doc, "td", {}, last(doc, r.lastRating)),
    h(doc, "td", {}, [
      r.due === null
        ? nil(doc)
        : h(doc, "span", { text: formatDay(r.due) }),
    ]),
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
          h(doc, "tr", { cls: "empty" }, [
            h(doc, "td", {
              colspan: "5",
              text: "No problem matches these filters.",
            }),
          ]),
        ]
      : view.table.map((r) => tableRow(doc, r, codes))
  const th = (t) => h(doc, "th", { scope: "col", text: t })
  return h(doc, "section", { cls: "all", "aria-labelledby": "all-h" }, [
    h(doc, "div", { cls: "head" }, [
      h(doc, "h2", { id: "all-h", text: "All problems" }),
      h(doc, "div", { cls: "filters" }, [
        labelled(doc, "filter-topic", "Topic", topic),
        labelled(doc, "filter-status", "Status", status),
      ]),
    ]),
    h(doc, "div", { cls: "table-wrap" }, [
      h(doc, "table", {}, [
        h(doc, "thead", {}, [h(doc, "tr", {}, HEADS.map(th))]),
        h(doc, "tbody", {}, rows),
      ]),
    ]),
  ])
}
