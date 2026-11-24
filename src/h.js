// Shared DOM helpers. All text goes in through textContent.
import { RATING_LABEL, DOT_CLASS } from "./labels.js"

// Make an element. attrs: cls, text, value, or any other attribute.
export const h = (doc, tag, attrs = {}, kids = []) => {
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

export const outside = (doc, href, label, name = null) =>
  h(doc, "a", {
    "aria-label": name,
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    text: label,
  })

export const labelled = (doc, id, label, control) =>
  h(doc, "div", { cls: "field" }, [
    h(doc, "label", { for: id, text: label }),
    control,
  ])

export const select = (doc, id, options, current) => {
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

// True only for the three known ratings, so "constructor" is not one.
export const known = (rating) => Object.hasOwn(RATING_LABEL, rating)

// The color dot of a rating. A word always sits next to it.
export const dot = (doc, rating) =>
  h(doc, "span", { cls: `dot ${DOT_CLASS[rating]}`, "aria-hidden": "true" })

// A rating dot and its word, for a status or a table cell.
export const rated = (doc, rating) => [
  dot(doc, rating),
  h(doc, "span", { cls: "word", text: RATING_LABEL[rating] }),
]

// The code square and the name of a topic. No code: the name alone.
export const topicName = (doc, codes, topic) => {
  const kids = [h(doc, "span", { cls: "name", text: topic })]
  if (codes.has(topic)) {
    kids.unshift(
      h(doc, "span", {
        cls: "code",
        "aria-hidden": "true",
        text: codes.get(topic),
      }),
    )
  }
  return kids
}
