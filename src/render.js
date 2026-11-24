// The band and the page. The sections live in their own modules.
import { h, labelled } from "./h.js"
import { topicCodes } from "./labels.js"
import { todaySection } from "./render-today.js"
import { topicsSection, tableSection } from "./render-lists.js"

const topBar = (doc, view, on) => {
  const target = h(doc, "input", {
    id: "target",
    type: "number",
    min: 1,
    max: 10,
    value: String(view.target),
  })
  target.addEventListener("change", (e) =>
    on.onTarget(e.target.value === "" ? NaN : Number(e.target.value)),
  )
  const exp = h(doc, "button", { type: "button", id: "export", text: "Export" })
  exp.addEventListener("click", () => on.onExport())
  const imp = h(doc, "input", {
    id: "import",
    type: "file",
    accept: "application/json,.json",
  })
  imp.addEventListener("change", async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    let text = ""
    try {
      text = await file.text()
    } catch {
      // An unreadable file goes on as empty text, which is not valid JSON.
    }
    on.onImport(text)
  })
  return h(doc, "header", { cls: "top" }, [
    h(doc, "h1", { text: "NeetCode Review" }),
    h(doc, "div", { cls: "tools" }, [
      labelled(doc, "target", "Daily target", target),
      exp,
      labelled(doc, "import", "Import ratings", imp),
    ]),
  ])
}

export const render = (root, view, on) => {
  const doc = root.ownerDocument
  const codes = topicCodes(view.topicOptions)
  root.replaceChildren(
    topBar(doc, view, on),
    todaySection(doc, view, on, codes),
    topicsSection(doc, view, codes),
    tableSection(doc, view, on, codes),
  )
}
