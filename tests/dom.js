// A small fake DOM. It has only the members that render.js may use.
// A real append takes a string too, but the render code must not.
const checkNodes = (nodes) => {
  for (const n of nodes) {
    const ok = n !== null && typeof n === "object" && "tag" in n &&
      "ownerDocument" in n
    if (!ok) throw new TypeError("append takes elements only")
  }
}

const makeElement = (doc, tag) => ({
  tag,
  tagName: tag.toUpperCase(),
  isContentEditable: false,
  ownerDocument: doc,
  children: [],
  attrs: {},
  listeners: {},
  className: "",
  value: "",
  textContent: "",
  get id() {
    return this.attrs.id
  },
  focus() {
    this.ownerDocument.activeElement = this
  },
  append(...nodes) {
    checkNodes(nodes)
    this.children.push(...nodes)
  },
  replaceChildren(...nodes) {
    checkNodes(nodes)
    this.children = [...nodes]
  },
  setAttribute(name, value) {
    this.attrs[name] = String(value)
  },
  getAttribute(name) {
    return this.attrs[name] ?? null
  },
  addEventListener(type, fn) {
    ;(this.listeners[type] ??= []).push(fn)
  },
  click() {
    for (const fn of this.listeners.click ?? []) fn({ target: this })
  },
  remove() {
    const kids = this.ownerDocument.body.children
    const i = kids.indexOf(this)
    if (i >= 0) kids.splice(i, 1)
  },
})

const walk = (node, visit) => {
  visit(node)
  for (const child of node.children ?? []) walk(child, visit)
}

export const fakeDocument = () => {
  const doc = {
    listeners: {},
    activeElement: null,
    createElement: (tag) => makeElement(doc, tag),
    addEventListener(type, fn) {
      ;(this.listeners[type] ??= []).push(fn)
    },
    getElementById(id) {
      return find(doc.body, (n) => n.attrs?.id === id)[0] ?? null
    },
  }
  doc.body = doc.createElement("body")
  const app = doc.createElement("main")
  app.setAttribute("id", "app")
  doc.body.append(app)
  doc.app = app
  return doc
}

// All nodes under root (and root itself) for which test(node) is true.
export const find = (root, test) => {
  const found = []
  walk(root, (n) => {
    if (test(n)) found.push(n)
  })
  return found
}

export const hasClass = (node, token) =>
  String(node.className).split(" ").includes(token)

export const byClass = (root, token) =>
  find(root, (n) => n.className !== undefined && hasClass(n, token))

export const text = (root) => {
  let out = ""
  walk(root, (n) => {
    out += `${n.textContent ?? ""} `
  })
  return out
}

export const fire = (node, type, event = { target: node }) => {
  for (const fn of node.listeners[type] ?? []) fn(event)
}

// A fake window: a hash, listeners, a way to fire events, scrollTo calls.
export const fakeWindow = (hash = "") => {
  const win = {
    location: { hash },
    listeners: {},
    scrolls: [],
    addEventListener(type, fn) {
      ;(this.listeners[type] ??= []).push(fn)
    },
    fire(type) {
      for (const fn of this.listeners[type] ?? []) fn({ type })
    },
    scrollTo(...args) {
      this.scrolls.push(args)
    },
  }
  return win
}
