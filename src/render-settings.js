// The Settings section: the daily target, Export, and Import.
import { h, labelled } from "./h.js"

const hint = (doc, id, words) => h(doc, "p", { cls: "hint", id, text: words })

const targetControl = (doc, view, on) => {
  const target = h(doc, "input", {
    id: "target",
    type: "number",
    min: 1,
    max: 10,
    value: String(view.target),
    "aria-describedby": "target-hint",
  })
  target.addEventListener("change", (e) =>
    on.onTarget(e.target.value === "" ? NaN : Number(e.target.value)),
  )
  return target
}

const exportControl = (doc, on) => {
  const exp = h(doc, "button", {
    type: "button",
    id: "export",
    text: "Export",
    "aria-describedby": "export-hint",
  })
  exp.addEventListener("click", () => on.onExport())
  return exp
}

const importControl = (doc, on) => {
  const imp = h(doc, "input", {
    id: "import",
    type: "file",
    accept: "application/json,.json",
    "aria-describedby": "import-hint",
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
  return imp
}

export const settingsSection = (doc, view, on) =>
  h(doc, "section", { cls: "settings", "aria-labelledby": "settings-h" }, [
    h(doc, "div", { cls: "head" }, [
      h(doc, "h2", { id: "settings-h", tabindex: "-1", text: "Settings" }),
    ]),
    h(doc, "div", { cls: "setting" }, [
      labelled(doc, "target", "Daily target", targetControl(doc, view, on)),
      hint(
        doc,
        "target-hint",
        "The number of problems on the Today page, from 1 to 10.",
      ),
    ]),
    h(doc, "div", { cls: "setting" }, [
      exportControl(doc, on),
      hint(doc, "export-hint", "Download your ratings as a file."),
    ]),
    h(doc, "div", { cls: "setting" }, [
      labelled(doc, "import", "Import ratings", importControl(doc, on)),
      hint(
        doc,
        "import-hint",
        "Load ratings from a file. The page asks before it replaces " +
          "your ratings.",
      ),
    ]),
  ])
