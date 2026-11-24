// The page frame: the header, the notices, and the sections.
import { h } from "./h.js"
import { topicCodes } from "./labels.js"
import { todaySection } from "./render-today.js"
import { topicsSection, tableSection } from "./render-lists.js"
import { settingsSection } from "./render-settings.js"

const noteList = (doc, view) => {
  const notes = view.notices.map((t) =>
    h(doc, "p", { cls: "notice", role: "status", text: t }),
  )
  if (view.importError !== null) {
    notes.push(
      h(doc, "p", { cls: "error", role: "alert", text: view.importError }),
    )
  }
  return notes
}

const same = (a, b) =>
  a.length === b.length &&
  a.every((n, i) => n.className === b[i].className &&
    n.textContent === b[i].textContent)

export const render = (root, view, on) => {
  const doc = root.ownerDocument
  if (root.children.length === 0) {
    root.append(
      h(doc, "header", { cls: "top" }, [
        h(doc, "h1", { text: "NeetCode Review" }),
      ]),
      h(doc, "div", { cls: "notes" }),
      h(doc, "div", { cls: "page" }),
    )
  }
  const [, notes, page] = root.children
  const next = noteList(doc, view)
  if (!same(next, notes.children)) notes.replaceChildren(...next)
  const codes = topicCodes(view.topicOptions)
  page.replaceChildren(
    todaySection(doc, view, on, codes),
    topicsSection(doc, view, codes),
    tableSection(doc, view, on, codes),
    settingsSection(doc, view, on),
  )
}
