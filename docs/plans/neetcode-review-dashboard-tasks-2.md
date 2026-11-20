# NeetCode Review Dashboard: Tasks 6 and 7

The shared sections are in `neetcode-review-dashboard.md`.

## PR 3: `feature/review-controller` (Task 6, stacked on PR 2)

### Task 6: GitHub access and controller

**Files:** Create `src/github.js`, `src/app.js`,
`tests/github.test.js`, `tests/app.load.test.js`,
`tests/app.rate.test.js`, `tests/app.import.test.js`. If `app.js`
nears 400 lines, move the view builder to `src/view.js`. Extend
`tests/helpers.js` with `fakeFetch(routes) -> { fetchFn, calls }`.
`routes` maps a URL to `{ status, body }` or to an `Error` that the
call throws. A response is `{ ok, status, json(), text() }`.
`json()` gives the body as it is. `text()` gives a string body as it
is, and `JSON.stringify` of any other body. An unknown URL gives
status 404. `calls` lists each requested URL.

**Consumes:** `parseTree`, `mergeCatalog` (Task 1). `localDate`,
`formatDay`, `replay`, `rate`, `isWeak` (Task 3). `buildToday`,
`topicSummary` (Task 4). `loadState`, `saveState`, `importText`,
`exportText` (Task 5). Constants and test helpers.

**Produces (github.js):**
- `treeUrl()`, `rawUrl(path)`, `problemUrl(id)`,
  `folderUrl(folder, id)`. Each path segment passes through
  `encodeURIComponent`. `folderUrl(null, id)` is `null`.
- `loadTree(fetchFn, storage, nowMs: number) -> Promise<{ tree:
  Item[]|null, stale: boolean }>`. The cache text is
  `{ at: number, tree: Item[] }`. Steps:
  1. Read the cache in a `try`. A cache with another shape, or with
     `at` after `nowMs`, counts as no cache.
  2. If `nowMs - at < TREE_MAX_AGE_MS`, return the cache with
     `stale: false` and make no request.
  3. Request `treeUrl()` with
     `{ signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }`. A good
     answer has an ok status, a `tree` array, no `truncated: true`,
     and one folder or more after `parseTree`. Reduce it to `Item[]`,
     write the cache in a `try`, return it with `stale: false`.
  4. Otherwise return the cache with `stale: true`. With no cache,
     return `{ tree: null, stale: false }`.

**Produces (app.js):** `createApp({ fetchFn, storage, now, known })
-> App`. `now` is `() => Date`. Tests use
`new Date(2026, 10, 20, 12)`.

```
init(): Promise<void>   loads the state, then the tree
view(): View            calls now() on each call
rate(id, rating)        refresh, change, save
reveal(id): Promise<void>   one request for each id at most
setTarget(n)   if n is not a finite number, keep the old value.
               Otherwise Math.round, clamp to 1..10, save
setFilter({ topic, status })
exportText(): string
importText(text, confirmFn) -> { ok: true } |
  { ok: false, error: string } | { ok: false, cancelled: true }
  validates first, calls confirmFn() only for a valid file, and
  sets view().importError (null after a good import)
refresh()      reloads the state from storage
```

Save rules:
- `rate`, `setTarget`, and `importText` call `refresh()`, apply the
  change in memory, then call `saveState`.
- A save that returns `false` sets an `unsaved` flag and adds
  `NOTICES.cannotSave`. The change stays in memory. The next save
  that returns `true` clears the flag and the notice.
- `refresh()` does nothing while `unsaved` is set. Otherwise it calls
  `loadState` and replaces the state only for a `null` notice.
- `init` adds the notice of `loadState` to the notices.
- The error texts of `validate` are fixed strings. They hold no part
  of the file.

```
View = { today, todayLabel, target, doneCount, waiting,
  notices: string[], importError: string|null, queue: Row[],
  topics: Summary[], table: Row[], filters: { topic, status },
  topicOptions: string[] }
Row = { id, title, topic, difficulty,
  kind: "done" | "due" | "new" | "later", overdueDays: number,
  lastRating: Rating|null, due: string|null, problemUrl: string,
  folderUrl: string|null, canReveal: boolean,
  solution: null | { text: string } | { error: string } }
kind: "done" has an entry dated today. Otherwise "due" has
  due <= today. Otherwise "new" has no history. Otherwise "later".
overdueDays: 0 for a row that is not due.
solution: { error: NOTICES.revealFailed } after a failed request.
queue: the done rows sorted by id, then the open rows of buildToday.
table: all problems sorted by title, then id, after the filters.
filters.topic: "all" or a topic. filters.status: "all" | "new" |
  "due" | "weak". "new" and "due" match kind. "weak" uses isWeak.
canReveal: latestPath is not null.
notices: NOTICES.stale for a stale tree, NOTICES.noTree for no
  tree, plus the notice of loadState, plus NOTICES.cannotSave after
  a failed save. No text appears twice.
```

- [ ] **Step 1: Write the failing tests**

```js
// github.test.js
const R = "IsMichaelHuang/neetcode-submissions-aquuq6h3"
const F = "Data%20Structures%20%26%20Algorithms"
treeUrl() ===
  `https://api.github.com/repos/${R}/git/trees/main?recursive=1`
rawUrl("Data Structures & Algorithms/duplicate-integer/" +
  "submission-4.java") === `https://raw.githubusercontent.com/` +
  `${R}/main/${F}/duplicate-integer/submission-4.java`
problemUrl("duplicate-integer") ===
  "https://neetcode.io/problems/duplicate-integer"
folderUrl("Data Structures & Algorithms", "duplicate-integer") ===
  `https://github.com/${R}/tree/main/${F}/duplicate-integer`
folderUrl(null, "x") === null
// loadTree, route body { tree: fixture }:
//   cache age 599999 ms -> no request, stale false
//   cache age 600000 ms -> one request, cache `at` is updated
//   a good answer with no cache is written to the cache
//   old cache + thrown Error -> cache tree, stale true
//   old cache + status 403 -> cache tree, stale true
//   old cache + body { tree: [] } -> stale true
//   old cache + body { tree, truncated: true } -> stale true
//   no cache + status 403 -> { tree: null, stale: false }
//   cache text "{oops" or { at: 1, tree: "x" } -> treated as none
//   cache with `at` = nowMs + 1 -> one request
//   failWrites during the cache write -> no throw, tree returned
// app.load.test.js, tree fixture, today 2026-11-20:
//   AC1/AC2: table.length 110, queue has 4 rows of kind "new",
//     todayLabel "Fri, Nov 20", notices []
//   AC8: cache older than 600000 ms + status 500 -> 110 rows,
//     notices [NOTICES.stale]
//   Review Focus 5: status 403, no cache -> 110 rows from known,
//     canReveal false on each row, notices [NOTICES.noTree]. The
//     403 body "<b>x</b>" appears in no notice
//   a second app inside 10 minutes makes no API request
//   AC7: after init, no call starts with
//     "https://raw.githubusercontent.com", each solution is null.
//     reveal("duplicate-integer") -> one call, equal to rawUrl of
//     submission-4.java. solution.text equals the body. A second
//     reveal makes no new call
//   reveal with status 404 -> solution.error is a fixed string
//   setFilter topic "Graphs" -> only Graphs rows. Status "new",
//     "due", and "weak" each give the matching rows only
//   topicOptions is sorted and has no repeats. topics matches
//     topicSummary
// app.rate.test.js:
//   AC6: rate(id,"clean") -> queue row kind "done", lastRating
//     "clean", due "2026-11-27", doneCount 1. A new app on the
//     same storage shows the same values
//   AC12: then rate(id,"failed") -> same row still in queue, kind
//     "done", lastRating "failed", due "2026-11-21", doneCount 1
//   table kinds: [clean 11-19] is "later", [failed 11-18] is "due"
//   waiting: 6 due problems and target 4 -> waiting 2
//   clock: move now() to 2026-11-21 -> today changes, doneCount 0,
//     the row rated failed is kind "due"
//   two tabs: app A and app B on one storage. A rates p1. B rates
//     p2. A new app shows both ratings
//   Review Focus 2: failWrites on, then rate p1 -> row is "done",
//     notices has NOTICES.cannotSave. refresh() keeps p1. Then
//     failWrites off, rate p2 -> the notice is gone, and a new app
//     shows p1 and p2
//   failReads on, then refresh() -> the ratings stay in the view
//   setTarget(2) -> queue length 2, saved. 99 -> 10. 0 -> 1.
//     2.5 -> 3. NaN and "" -> the target stays, the saved state
//     still loads
// app.import.test.js:
//   AC10: bad text -> ok false, error set, confirmFn not called,
//     importError equals the error, ratings and stored text
//     unchanged. The error holds no part of the bad text
//   valid text + failWrites -> the view shows the imported
//     ratings, notices has NOTICES.cannotSave
//   valid text + confirmFn false -> cancelled true, no change
//   AC9: valid text + confirmFn true -> view shows the imported
//     ratings and target. A new app on the same storage does too
//   Review Focus 3: state with ratings["gone-id"], rate another
//     problem -> exportText() still holds "gone-id", and no queue
//     or table row has that id
```

- [ ] **Steps 2 to 5:** Fail, implement, `npm test`, commit.

## PR 4: `feature/review-page` (Task 7, stacked on PR 3)

### Task 7: The page

**Files:** Create `index.html`, `styles.css`, `src/render.js`,
`src/main.js`, `tests/dom.js`, `tests/render.test.js`,
`tests/main.test.js`, `tests/static.test.js`. Replace the README
stub.

**Consumes:** `createApp` and the `View` type from Task 6.

**Produces:**
- `render(root, view: View, handlers: { onRate(id, rating),
  onReveal(id), onTarget(n), onExport(), onImport(text),
  onFilter(filters) })`. It replaces the content of `root`. It uses
  only `root.ownerDocument.createElement`, `append`,
  `replaceChildren`, `textContent`, `setAttribute`, `className`,
  `value`, and `addEventListener`. Class names come from fixed
  tables, never from data.
- `start({ document, fetchFn, storage, now, confirmFn }) ->
  Promise<App>` in `main.js`. It requests the exact URL
  `"data/problems.json"`, creates the app, renders into `#app` after
  `init` and after each action, and on `visibilitychange` it calls
  `refresh()` and renders. The file calls `start` with the real
  objects only if `window` exists. This is the one allowed side
  effect at import time.
- `tests/dom.js`: `fakeDocument()` with exactly the members above,
  plus `getElementById`, `find(root, test)`, `text(root)`, and
  `fire(node, type, event)`.

Requirements:
- The layout follows the sketch in the spec. A done row shows its
  rating and keeps the three rating buttons. A due row with
  `overdueDays` 0 shows "due today". The count reads "5 of 4 done"
  if he passes the target.
- Outside links use `target="_blank"` and
  `rel="noopener noreferrer"`. No link exists for a `null` URL.
- Export downloads `neetcode-review-ratings.json` through
  `URL.createObjectURL`. Import reads the file text and passes it to
  `onImport`. An error from import shows as text.
- `index.html` has a CSP meta tag as the first element of `<head>`,
  with these directives: `default-src 'none'`, `script-src 'self'`,
  `style-src 'self'`, `img-src 'self'`, `connect-src 'self'
  https://api.github.com https://raw.githubusercontent.com`,
  `base-uri 'none'`, `form-action 'none'`.
- No inline script, no `style` attribute, no `on...` attribute.
- Accessibility: semantic elements, a label for each control,
  visible focus, text contrast of 4.5 to 1 or more, no meaning by
  color alone, usable at a width of 375 pixels.
- README (present tense, neutral): purpose, local run with
  `python3 -m http.server 8000`, tests, where ratings live, that
  other pages on the same `github.io` address can read them, backup
  by export, how to rebuild `problems.json` (refresh
  `tests/fixtures/tree.json` first), how Pages serves the site.

- [ ] **Step 1: Write the failing tests**

```js
// render.test.js, with fakeDocument() and a hand-made View:
//   a title "<img src=x onerror=alert(1)>" shows as that text
//   AC7: a row with solution null has no <pre> and no code text.
//     A row with solution { text } shows the text in a <pre>
//   a row with solution { error } shows the error text
//   a row with canReveal false has no reveal button
//   a done row shows its rating and three rating buttons
//   a click on "Failed" calls onRate(id, "failed") once
//   a click on reveal calls onReveal(id)
//   each notice shows as text. importError shows as text
//   overdueDays 0 on a due row shows "due today"
//   doneCount 5 and target 4 show "5 of 4 done"
//   a change of the target field calls onTarget with a number
//   a change of a filter calls onFilter({ topic, status })
//   a click on Export calls onExport()
//   every link with target "_blank" has rel "noopener noreferrer",
//     and its href starts with "https://neetcode.io/problems/" or
//     "https://github.com/IsMichaelHuang/"
//   a second render leaves one copy of each row
// main.test.js, with fakeDocument, fakeFetch, fakeStorage:
//   start() renders 4 queue rows into #app
//   a second app rates a problem on the same storage, then a
//     "visibilitychange" event -> the count shows "1 of 4 done"
// static.test.js:
//   no file in src/ and not index.html matches: innerHTML,
//     outerHTML, insertAdjacentHTML, document.write, \beval\(,
//     new Function, DOMParser, createContextualFragment, srcdoc,
//     javascript:, setAttribute("style", setAttribute("on
//   index.html: no inline <script> body, no style= attribute, no
//     on...= attribute. The CSP meta tag is the first element in
//     <head>, and each directive above is present
//   index.html loads "src/main.js" with type="module"
//   styles.css has no "url(data:"
```

- [ ] **Steps 2 to 5:** Fail, implement, `npm test`, commit.
