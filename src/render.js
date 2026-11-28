// The page frame: the header, the notices, and the sections.
import { h } from "./h.js"
import { topicCodes } from "./labels.js"
import { todaySection } from "./render-today.js"
import { topicsSection, tableSection } from "./render-lists.js"
import { settingsSection } from "./render-settings.js"
import { PAGES } from "./pages.js"
import { NOTICES } from "./config.js"

const noteList = (doc, view, page) => {
  const notes = view.notices.map((t) =>
    h(doc, "p", { cls: "notice", role: "status", text: t }),
  )
  if (page === "today" && view.backupDue) {
    notes.push(
      h(doc, "p", { cls: "notice", role: "status", text: NOTICES.backup }),
    )
  }
  if (page === "settings" && view.importError !== null) {
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

const SECTIONS = {
  today: todaySection,
  topics: (doc, view, on, codes) => topicsSection(doc, view, codes),
  problems: tableSection,
  settings: (doc, view, on) => settingsSection(doc, view, on),
}

const menu = (doc) =>
  h(
    doc,
    "nav",
    { cls: "menu", "aria-label": "Pages" },
    PAGES.map((p) =>
      h(doc, "a", { id: `nav-${p.id}`, href: p.hash, text: p.label }),
    ),
  )

export const render = (root, view, on, page = "today") => {
  const doc = root.ownerDocument
  const id = Object.hasOwn(SECTIONS, page) ? page : "today"
  if (root.children.length === 0) {
    root.append(
      h(doc, "header", { cls: "top" }, [
        h(doc, "h1", { text: "NeetCode Review" }),
        menu(doc),
      ]),
      h(doc, "div", { cls: "notes" }),
      h(doc, "div", { cls: "page" }),
    )
  }
  const [top, notes, body] = root.children
  // children is an HTMLCollection in a browser: it has no forEach.
  ;[...top.children[1].children].forEach((a, i) =>
    a.setAttribute("aria-current", PAGES[i].id === id ? "page" : "false"),
  )
  const next = noteList(doc, view, id)
  if (!same(next, notes.children)) notes.replaceChildren(...next)
  const codes = topicCodes(view.topicOptions)
  body.replaceChildren(SECTIONS[id](doc, view, on, codes))
}
