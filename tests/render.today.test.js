// Tests of the Today section.
import test from "node:test"
import assert from "node:assert/strict"
import { render } from "../src/render.js"
import { fakeDocument, find, text, fire, hasClass, byClass } from "./dom.js"
import { row, view, handlers, draw, byId, one } from "./render.fixtures.js"

const entry = (doc, n = 0) => one(doc.app, "entry", n)
const first = (root, token) => one(root, token)
const RATINGS = ["clean", "struggled", "failed"]

test("a hostile title shows as plain text", () => {
  const title = "<img src=x onerror=alert(1)>"
  const doc = draw(view({ queue: [row({ title })], table: [] }))
  assert.ok(text(doc.app).includes(title))
  assert.equal(find(doc.app, (n) => n.tag === "img").length, 0)
})

test("a row with no solution has no pre element and no code", () => {
  const doc = draw(view())
  assert.equal(find(doc.app, (n) => n.tag === "pre").length, 0)
})

test("a row with solution text shows it in a pre element", () => {
  const solution = { text: "def f(): pass" }
  const doc = draw(view({ queue: [row({ solution })] }))
  const pre = find(doc.app, (n) => n.tag === "pre")
  assert.equal(pre.length, 1)
  assert.equal(pre[0].textContent, "def f(): pass")
})

test("a row with a solution error shows the error text", () => {
  const solution = { error: "The solution could not load." }
  const doc = draw(view({ queue: [row({ solution })] }))
  assert.ok(text(doc.app).includes("The solution could not load."))
  assert.equal(find(doc.app, (n) => n.tag === "pre").length, 0)
})

test("a row with canReveal false has no reveal button", () => {
  const doc = draw(view({ queue: [row({ canReveal: false })] }))
  assert.equal(
    find(doc.app, (n) => n.attrs.id === "reveal-two-sum").length,
    0,
  )
  const sol = byClass(entry(doc), "sol")
  assert.equal(sol.length, 1)
  assert.equal(sol[0].children.length, 0)
})

test("a done row shows its rating and three rating buttons", () => {
  const done = row({ kind: "done", lastRating: "struggled" })
  const doc = draw(view({ queue: [done], doneCount: 1 }))
  const li = find(doc.app, (n) => n.tag === "ol")[0].children[0]
  assert.ok(text(li).includes("done: Struggled"))
  const pressed = {}
  for (const r of RATINGS) {
    pressed[r] = byId(doc, `rate-two-sum-${r}`).attrs["aria-pressed"]
  }
  assert.deepEqual(pressed, {
    clean: "false",
    struggled: "true",
    failed: "false",
  })
  const dot = byClass(first(li, "status"), "dot")
  assert.equal(dot.length, 1)
  assert.equal(dot[0].className, "dot dot-struggled")
  assert.equal(dot[0].textContent, "")
  assert.equal(dot[0].children.length, 0)
  assert.equal(dot[0].attrs["aria-hidden"], "true")
})

test("queue controls carry the problem title in their labels", () => {
  const a = row({ id: "a", title: "Alpha" })
  const b = row({ id: "b", title: "Beta" })
  const doc = draw(view({ queue: [a, b] }))
  assert.equal(byId(doc, "rate-a-clean").attrs["aria-label"], "Clean: Alpha")
  assert.equal(byId(doc, "rate-b-clean").attrs["aria-label"], "Clean: Beta")
  assert.equal(
    byId(doc, "reveal-a").attrs["aria-label"],
    "Show my old solution: Alpha",
  )
  const open = find(
    doc.app,
    (n) => n.attrs["aria-label"] === "Open on NeetCode: Beta",
  )
  assert.equal(open.length, 1)
  const groups = find(doc.app, (n) => n.attrs.role === "group")
  assert.deepEqual(
    groups.map((g) => g.attrs["aria-label"]),
    ["How did it go: Alpha", "How did it go: Beta"],
  )
})

test("a click on Failed calls onRate with failed once", () => {
  const log = []
  const doc = draw(view(), log)
  fire(byId(doc, "rate-two-sum-failed"), "click")
  assert.deepEqual(log, [["onRate", "two-sum", "failed"]])
})

test("a click on reveal calls onReveal with the id", () => {
  const log = []
  const doc = draw(view(), log)
  fire(byId(doc, "reveal-two-sum"), "click")
  assert.deepEqual(log, [["onReveal", "two-sum"]])
})

test("a due row with overdueDays 0 shows due today", () => {
  const due = row({ kind: "due", overdueDays: 0, due: "2026-11-20" })
  const doc = draw(view({ queue: [due] }))
  assert.ok(text(doc.app).includes("due today"))
})

test("doneCount 5 with target 4 shows 5 of 4 done", () => {
  const doc = draw(view({ doneCount: 5, target: 4 }))
  assert.ok(text(doc.app).includes("5 of 4 done"))
})

test("the queue list has the list role", () => {
  const doc = draw(view())
  assert.equal(find(doc.app, (n) => n.tag === "ol")[0].attrs.role, "list")
})

test("every blank-target link is safe and goes to a known host", () => {
  const doc = draw(view({ queue: [row({ solution: { text: "x" } })] }))
  const links = find(doc.app, (n) => n.tag === "a")
  assert.ok(links.length >= 3)
  for (const a of links) {
    assert.equal(a.attrs.target, "_blank")
    assert.equal(a.attrs.rel, "noopener noreferrer")
    assert.match(
      a.attrs.href,
      /^https:\/\/(neetcode\.io\/problems\/|github\.com\/IsMichaelHuang\/)/,
    )
  }
})

test("a null folder URL makes no link", () => {
  const doc = draw(
    view({ queue: [row({ folderUrl: null, solution: { text: "x" } })] }),
  )
  const hrefs = find(doc.app, (n) => n.tag === "a").map((a) => a.attrs.href)
  assert.ok(hrefs.every((h) => h.startsWith("https://neetcode.io/")))
})

test("a second render of the queue leaves one entry", () => {
  const doc = fakeDocument()
  render(doc.app, view(), handlers())
  render(doc.app, view(), handlers())
  assert.equal(byClass(doc.app, "entry").length, 1)
})

test("span.no texts are 1 and 2 for two rows", () => {
  const doc = draw(view({ queue: [row({ id: "a" }), row({ id: "b" })] }))
  const nos = byClass(doc.app, "no").map((n) => n.textContent)
  assert.deepEqual(nos, ["1", "2"])
})

test("span.title holds one link with the title and a label", () => {
  const doc = draw(view({ queue: [row({ title: "Alpha" })] }))
  const t = first(entry(doc), "title")
  assert.equal(t.children.length, 1)
  assert.equal(t.children[0].tag, "a")
  assert.equal(t.children[0].textContent, "Alpha")
  assert.equal(t.children[0].attrs["aria-label"], "Open on NeetCode: Alpha")
})

test("the reveal button text is Solution", () => {
  const doc = draw(view())
  assert.equal(byId(doc, "reveal-two-sum").textContent, "Solution")
})

test("each rating button has a dot and a word", () => {
  const doc = draw(view())
  const words = { clean: "Clean", struggled: "Struggled", failed: "Failed" }
  for (const r of RATINGS) {
    const b = byId(doc, `rate-two-sum-${r}`)
    assert.ok(hasClass(b, `rate-${r}`))
    assert.equal(b.children.length, 2)
    const [dot, word] = b.children
    assert.equal(dot.tag, "span")
    assert.equal(dot.className, `dot dot-${r}`)
    assert.equal(dot.textContent, "")
    assert.equal(dot.children.length, 0)
    assert.equal(dot.attrs["aria-hidden"], "true")
    assert.equal(word.className, "word")
    assert.equal(word.textContent, words[r])
  }
})

test("a new row has a status without a dot and kind-new", () => {
  const doc = draw(view())
  const st = first(entry(doc), "status")
  assert.equal(byClass(st, "dot").length, 0)
  assert.ok(hasClass(st, "kind-new"))
  assert.equal(first(st, "word").textContent, "new")
})

test("a done row with lastRating null has no dot and kind-new", () => {
  const doc = draw(view({ queue: [row({ kind: "done", lastRating: null })] }))
  const st = first(entry(doc), "status")
  assert.equal(byClass(st, "dot").length, 0)
  assert.ok(hasClass(st, "kind-new"))
})

test("due rows of 0, 2, 4, 9 days get due-0 to due-3", () => {
  const queue = [0, 2, 4, 9].map((d) =>
    row({ id: `d${d}`, kind: "due", overdueDays: d }),
  )
  const doc = draw(view({ queue }))
  const got = queue.map((_, i) => first(entry(doc, i), "status").className)
  assert.deepEqual(got, [
    "status due-0",
    "status due-1",
    "status due-2",
    "status due-3",
  ])
})

test("an entry topic shows the code and then the name", () => {
  const doc = draw(
    view({
      queue: [row({ topic: "Trees" })],
      topicOptions: ["Graphs", "Trees"],
    }),
  )
  const t = first(entry(doc), "topic")
  assert.equal(t.children.length, 2)
  assert.equal(t.children[0].className, "code")
  assert.equal(t.children[0].textContent, "B")
  assert.equal(t.children[0].attrs["aria-hidden"], "true")
  assert.equal(t.children[1].className, "name")
  assert.equal(t.children[1].textContent, "Trees")
})

test("a row topic that is not in topicOptions has no code", () => {
  const doc = draw(view({ queue: [row({ topic: "Unknown" })] }))
  const t = first(entry(doc), "topic")
  assert.equal(byClass(t, "code").length, 0)
  assert.equal(t.children.length, 1)
  assert.equal(t.children[0].textContent, "Unknown")
})

test("div.cols is hidden and holds the seven column heads", () => {
  const doc = draw(view())
  const cols = byClass(doc.app, "cols")
  assert.equal(cols.length, 1)
  assert.equal(cols[0].tag, "div")
  assert.equal(cols[0].attrs["aria-hidden"], "true")
  assert.ok(cols[0].children.every((n) => n.tag === "span"))
  assert.deepEqual(
    cols[0].children.map((n) => n.textContent),
    ["No.", "Problem", "Topic", "Level", "Status", "", "How did it go?"],
  )
})

test("two rows show How did it go? one time", () => {
  const doc = draw(view({ queue: [row({ id: "a" }), row({ id: "b" })] }))
  assert.equal(text(doc.app).split("How did it go?").length - 1, 1)
})

test("an empty queue shows p.empty and no list or column heads", () => {
  const doc = draw(view({ queue: [] }))
  const empty = byClass(doc.app, "empty").filter((n) => n.tag === "p")
  assert.equal(empty.length, 1)
  assert.equal(empty[0].textContent, "Nothing to review today.")
  assert.equal(find(doc.app, (n) => n.tag === "ol").length, 0)
  assert.equal(byClass(doc.app, "cols").length, 0)
})

test("waiting 3 shows p.more and waiting 0 shows none", () => {
  const more = byClass(draw(view({ waiting: 3 })).app, "more")
  assert.equal(more.length, 1)
  assert.equal(more[0].tag, "p")
  assert.equal(more[0].textContent, "3 more due on later days.")
  assert.equal(byClass(draw(view({ waiting: 0 })).app, "more").length, 0)
})

test("the pre of a shown solution can take keyboard focus", () => {
  const doc = draw(view({ queue: [row({ solution: { text: "x" } })] }))
  const pre = find(doc.app, (n) => n.tag === "pre")[0]
  assert.equal(pre.attrs.tabindex, "0")
})

test("the Today head has the h2, the date, and the count", () => {
  const doc = draw(view())
  const h2 = byId(doc, "today-h")
  assert.equal(h2.tag, "h2")
  assert.equal(h2.textContent, "Today")
  const date = first(doc.app, "date")
  assert.equal(date.tag, "p")
  assert.equal(date.textContent, "Fri Nov 20")
})
