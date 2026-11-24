// The four pages, their hashes, and their titles.
const APP = "NeetCode Review"

export const PAGES = Object.freeze(
  [
    { id: "today", hash: "#/", label: "Today" },
    { id: "topics", hash: "#/topics", label: "Topics" },
    { id: "problems", hash: "#/problems", label: "Problems" },
    { id: "settings", hash: "#/settings", label: "Settings" },
  ].map(Object.freeze),
)

export const pageOf = (hash) =>
  PAGES.find((p) => p.hash === hash)?.id ?? "today"

export const titleOf = (id) => {
  const page = PAGES.find((p) => p.id === id)
  return page === undefined || id === "today"
    ? APP
    : `${page.label} · ${APP}`
}
