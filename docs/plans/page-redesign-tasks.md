# Page Redesign: Tasks

The shared sections are in `page-redesign.md` and
`page-redesign-design.md`.

### Task 0: Setup (main agent)

- [ ] In `.gitignore`, replace the line `.impeccable/` with
      `.impeccable/hook.cache.json`, `.impeccable/hook.pending.json`,
      and `.impeccable/config.local.json`.
- [ ] In `scripts/check-limits.sh`, exempt the folder `.impeccable/`.
      The design tool writes those files in its own format.
- [ ] In the surface brief, replace the motion sentence with the
      motion rule of this plan.
- [ ] Save this plan under `docs/plans/` as `page-redesign.md`,
      `page-redesign-design.md` (tokens, DOM contract, layout), and
      `page-redesign-tasks.md`. Commit them with `PRODUCT.md`, the
      surface brief, `.gitignore`, and the limits script.

### Task 1: Label helpers

**Files:** Create `src/labels.js`, `tests/labels.test.js`.

**Produces**, all frozen where they are objects or arrays:
- `RATING_KEYS = ["clean", "struggled", "failed"]`.
- Each table is read with `Object.hasOwn`, so a key such as
  "constructor" finds nothing.
- `RATING_LABEL`: Clean, Struggled, Failed.
- `RATING_SYMBOL`: "!", "!?", "?".
- `RATE_CLASS`, `SYM_CLASS`, `DONE_CLASS`: for each key the token
  `rate-<key>`, `sym-<key>`, `done-<key>`.
- `DUE_CLASS = ["due-0", "due-1", "due-2", "due-3"]`.
- `topicCodes(topics: string[]) -> Map<string, string>`. Index 0
  gets "A", 25 gets "Z", 26 "AA", 27 "AB", 51 "AZ", 52 "BA". The
  index counts distinct topics, so `["A", "B", "A", "C"]` gives C the
  code "C".
- `statusText(row: Row) -> string`, with the same results as the
  function of that name in `render.js` today.
- `urgency(overdueDays: unknown) -> 0 | 1 | 2 | 3`. 0 gives 0. 1 and
  2 give 1. 3 to 6 give 2. 7 or more gives 3. A value that is not a
  finite number, or is under 0, gives 0.
- `statusClass(row: Row) -> string`: `done-<rating>` for a done row
  with a known rating, `due-<n>` for a due row, otherwise `kind-new`.

- [ ] **Step 1: Write the failing tests**

```js
[...topicCodes(["Graphs", "Trees"])]
  // [["Graphs", "A"], ["Trees", "B"]]
// 53 names: index 25 "Z", 26 "AA", 27 "AB", 51 "AZ", 52 "BA"
topicCodes([]).size === 0
topicCodes(["A", "A"]) has size 1, and get("A") === "A"
topicCodes(["constructor"]).get("constructor") === "A"
statusText({ kind: "done", lastRating: "clean" }) === "done: Clean"
statusText({ kind: "done", lastRating: null }) === "done: "
statusText({ kind: "done", lastRating: "constructor" }) === "done: "
statusText({ kind: "done", lastRating: "__proto__" }) === "done: "
statusClass({ kind: "done", lastRating: "constructor" }) === "kind-new"
[...topicCodes(["A", "B", "A", "C"])].at(-1) deep equals ["C", "C"]
statusText({ kind: "new" }) === "new"
statusText({ kind: "due", overdueDays: 0 }) === "due today"
statusText({ kind: "due", overdueDays: 1 }) === "1 day overdue"
statusText({ kind: "due", overdueDays: 12 }) === "12 days overdue"
urgency: 0 -> 0, 1 -> 1, 2 -> 1, 2.5 -> 1, 3 -> 2, 6 -> 2, 7 -> 3,
  400 -> 3, -1 -> 0, NaN -> 0, Infinity -> 0, undefined -> 0,
  "3" -> 0
statusClass: done + "failed" -> "done-failed"; done + "x" ->
  "kind-new"; due + 4 days -> "due-2"; new -> "kind-new";
  later -> "kind-new"
RATING_SYMBOL deep equals { clean: "!", struggled: "!?", failed: "?" }
SYM_CLASS.clean === "sym-clean"; RATE_CLASS.failed === "rate-failed"
each exported object and array is frozen
```

- [ ] **Step 2:** Run `npm test` into the red file. Expect the new
      file to fail because the module does not exist.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test` into the green file. Run
      `npm run limits`.
- [ ] **Step 5:** Commit.

### Task 2: New page structure

**Files:** Create `src/h.js`, `src/render-today.js`,
`src/render-lists.js`. Modify `src/render.js`, `tests/dom.js`.
Replace `tests/render.test.js` with `tests/render.fixtures.js`
(`row`, `view`, `handlers`, `draw`, `byId`, `everyState`),
`tests/render.test.js` (the band, notices, the whole page),
`tests/render.today.test.js`, and `tests/render.lists.test.js`.
`tests/main.test.js` needs no change: its five tests fit the new
structure.

**Consumes:** everything that `src/labels.js` exports. `render.js`
deletes its own label tables.

**Produces:** `render(root, view, handlers)` with the same signature,
and the DOM contract above.

`everyState()` returns three views that together show each state:
a queue with new, due, and done rows of all ratings, a shown
solution, a failed solution, two notices, an import error, and
`waiting` 3. An empty queue with an empty table. A row with
`canReveal` false and a topic with a weak count of 0.

If a test file passes 400 lines, split it by section.

**`tests/dom.js` changes:** `append` throws a `TypeError` for a
value that is not a fake element (an object with `tag` and
`ownerDocument`). Add `hasClass(node, token)` and
`byClass(root, token)`, which split `className` at spaces.

- [ ] **Step 1: Move, change, and add the tests first**

Tests that move with every assertion unchanged: the hostile title, no
`pre` before a solution, the solution in a `pre`, the solution error,
notices and the import error as text, due today, 5 of 4 done, the
target change, the empty target, the unreadable file, no chosen file,
the status role of notices, the list role, the filter change, Export,
the import of a file, safe links, a null folder URL, a second render.

Tests that change. `buttons(doc, label)` is gone. Each lookup by id
first asserts that the element exists.

- "canReveal false has no reveal button". Old: no button with the
  text. New: no element with the id `reveal-two-sum`, and `span.sol`
  exists with no child.
- "a done row shows its rating". Old: three buttons found by text,
  and a map by label. New: the same map with the ids
  `rate-two-sum-<rating>`, pressed "true" on struggled only. The
  `li` text holds "done: Struggled". The status holds a `span.sym`
  "!?" with `sym-struggled`.
- "queue controls carry the title". Old: buttons by text. New:
  `rate-a-clean` has the label "Clean: Alpha", `rate-b-clean` has
  "Clean: Beta", `reveal-a` has "Show my old solution: Alpha". The
  link and the group labels as before.
- "a click on Failed". Old: the button by text. New:
  `rate-two-sum-failed`, with the same log.
- "a click on reveal". Old: the button by text. New:
  `reveal-two-sum`, with the same log.

New tests, one test for each line:

```js
// today
// span.no texts are "1" and "2" for two rows
// span.title has one child: an "a" with the title as text and the
//   aria-label "Open on NeetCode: <title>"
// the reveal button text is "Solution"
// each rating button has two children: children[0] is span.sym
//   with the symbol, sym-<rating>, and aria-hidden "true";
//   children[1] is span.word with the label. Check all three
// a new row: the status has no span.sym and the class kind-new
// a done row with lastRating null: no span.sym, class kind-new
// due rows with overdueDays 0, 2, 4, 9: status classes due-0,
//   due-1, due-2, due-3
// entry topic: topicOptions ["Graphs","Trees"], topic "Trees" ->
//   span.topic children[0] span.code "B", children[1] span.name
// a row topic that is not in topicOptions has no span.code
// div.cols: aria-hidden "true", 7 spans with the texts of the
//   contract
// two rows: text(doc.app) holds "How did it go?" one time
// an empty queue: p.empty with its text, no ol, no div.cols
// waiting 3: p.more "3 more due on later days."; waiting 0: none
// a row with solution text: the pre has tabindex "0"
// h2 "Today", p.date holds view.todayLabel
// lists
// index row { Trees, 11, 3, 1 }: span.code "B", span.name "Trees",
//   span.num children "3 of 11" and span.sr "reviewed", span.weak
//   "1 weak" without the class nil
// index row with weak 0: span.weak "0 weak" with the class nil
// p.legend: aria-hidden "true", text "reviewed · weak"
// table heads: Problem, Topic, Level, Last rating, Next due
// table topic cell: children span.code then span.name
// last rating "failed": span.sym "?" sym-failed + span.word
//   "Failed"; null: span.nil "none"
// next due "2026-11-27": the text "Fri, Nov 27"; null: span.nil
// an empty table: one tr.empty, td colspan "5", its text
// labels: "Topic" for filter-topic, "Status" for filter-status
// page
// header.cover holds the h1 and the ids target, export, import
// labels: "Daily target" for target, "Import ratings" for import
// no notice and no error: no p.notice and no p.error
// invariants on a view with every state: no element has both a
//   text and children; no id appears twice; each aria-labelledby
//   and each label "for" points to an id that exists; each
//   span.sym and span.code has aria-hidden "true"
// hostile data: topic "<b>x</b>", lastRating "constructor", kind
//   "z z": the topic shows as given text; no text and no class
//   comes from lastRating; no className on the page holds "<",
//   "function", "undefined", or "[object"
```

- [ ] **Step 2:** Run `npm test` into the red file. The changed and
      new tests fail on their assertions. Tests of other files pass.
- [ ] **Step 3:** Build the render files to the DOM contract.
- [ ] **Step 4:** Run `npm test` into the green file. Run
      `npm run limits`.
- [ ] **Step 5:** Commit. The message says that the page has no
      matching styles before Task 3.

### Task 3: New styles

**Files:** Rewrite `styles.css`. Create `tests/contrast.test.js` and
`tests/styles.test.js`. Extend `tests/static.test.js`.

**Consumes:** the class names and ids of the DOM contract, and
`tests/render.fixtures.js`.

- [ ] **Step 1: Write the failing tests**

```js
// contrast.test.js: read styles.css and strip comments. Read the
//   ten tokens of the light block and of the dark block. Fail if a
//   token is missing in a block. Compute the WCAG contrast ratio.
//   In both schemes each pair is 4.5 or more: ink/paper,
//   ink-2/paper, clean/paper, struggled/paper, failed/paper,
//   on-cover/cover, and each state color on a mix of 10 percent
//   and of 20 percent of itself with paper. In both schemes
//   focus/paper is 3 or more.
//   No "#" color and no "rgb(" appears outside the two blocks.
// styles.test.js: render each view of everyState() into the fake
//   document. Collect every class token. Strip the comments of
//   styles.css. Each token matches
//   new RegExp("\\." + token + "(?![\\w-])") in it.
// static.test.js, new cases for styles.css:
//   no /border-radius:\s*(?!0\s*[;}])/, no "box-shadow",
//   no "gradient(",
//   no "@import", no "url(", no "@font-face", no "@keyframes",
//   no /!\s*important/i
//   each font-size is one of 0.75rem, 0.875rem, 1rem, 1.1875rem,
//   1.5rem, 1.875rem, or inherit; a "font:" shorthand is only
//   "font: inherit"
//   a "transition" exists, and the prefers-reduced-motion block
//   holds "transition: none"
//   guards, green before the rewrite: "color-scheme: light dark",
//   "prefers-color-scheme: dark", ":focus-visible"
//   it holds "forced-colors: active"
```

- [ ] **Step 2:** Run `npm test` into the red file. The contrast
      test, the class test, and the bans that the old file breaks
      fail. The report lists each new case that passes already.
- [ ] **Step 3:** Rewrite `styles.css` with the tokens, the rules of
      the look, and the layout of this plan. The file stays under 400
      lines. Do not split it, because `index.html` has one link. If
      it cannot stay under 400 lines, stop and report.
- [ ] **Step 4:** Run `npm test` into the green file. Run
      `npm run limits`.
- [ ] **Step 5:** Commit. Do not start a server or a browser.

### Task 4: Verify and finish (main agent)

- [ ] Run `npm test` and `npm run limits`.
- [ ] Serve the folder on localhost. Seed the browser storage with a
      state that gives: a new row, due rows of 0, 2, 4, and 9 days,
      and done rows of all three ratings.
- [ ] At each width 1700, 1440, 1439, 1200, 1199, 900, 720, 719, and
      375, in the light and the dark scheme, read these values with
      a script: the page has no sideways scroll;
      `ol.entries.scrollWidth` is not over its `clientWidth`; no
      entry cell overlaps the next; no word in a rating button wraps;
      `div.cols` is displayed at 1200 or more and not under it;
      Topics is at the right of Today at 1440 or more and under it
      below that; no element has a rounded corner.
- [ ] Drive each state: a shown solution, a failed solution, a
      notice, an import error, an empty filter result, an empty
      queue, focus on a band control and on a paper control.
- [ ] Compare the 1440 by 900 screen with the sketch: the band, the
      Today rows in one line each, the rating group at the right
      end, the index at the right, and the head "All problems" on
      the first screen.
- [ ] Run the impeccable detector on the changed files one time.
- [ ] Save screenshots to `.impeccable/review/` and run the
      impeccable finish reviewer. Send its fixes to one dev agent as
      one task. A fix that changes structure or tokens gets a test
      first. Then get the verdict.
- [ ] Run the impeccable documenter. It writes `DESIGN.md` and
      `.impeccable/design.json`.
- [ ] Add a short "Design" section to the README. It points to
      `DESIGN.md` and `PRODUCT.md`, and it says that a new topic
      shifts the code letters of the topics after it.
- [ ] Write the answers to the four questions at the end of
      `docs/plans/page-redesign.md`. Send the hand-off report.
