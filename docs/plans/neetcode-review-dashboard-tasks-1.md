# NeetCode Review Dashboard: Tasks 0 to 5

The shared sections are in `neetcode-review-dashboard.md`.

## PR 1: `feature/problem-catalog` (Tasks 0 to 2)

### Task 0: Project setup (main agent)

- [ ] Create the folder. Run `git init -b main`. Commit `.gitignore`
      and a README stub. Create branch `feature/problem-catalog`.
- [ ] Add `package.json`: `"type": "module"`, `"private": true`,
      scripts `test` = `TZ=America/New_York node --test`, `limits` =
      `sh scripts/check-limits.sh`.
- [ ] Add `scripts/check-limits.sh` from PLANNING.md section 7, with
      the exempt paths from Global Constraints.
- [ ] Save this plan under `docs/plans/` as three files, each under
      400 lines: `neetcode-review-dashboard.md` (all but the tasks),
      `...-tasks-1.md` (Tasks 0 to 5), `...-tasks-2.md` (Tasks 6 and
      7). Copy the design document. Apply the spec corrections. Make
      the Intent text neutral, as Global Constraints requires.
- [ ] Add `scripts/name-map.json` (the 56 pairs that planning made
      sure exist in the NeetCode list), `scripts/manual-problems.json`
      (town judge, and 2 SQL entries with topic "SQL" and difficulty
      "Unknown"), and `tests/fixtures/tree.json`. Commit.

### Task 1: Foundations and catalog

**Files:** Create `src/config.js`, `src/catalog.js`,
`tests/helpers.js`, `tests/catalog.test.js`, `tests/limits.test.js`.

**Produces:**
- `src/config.js` with the Constants block.
- `tests/helpers.js`: `loadJson(pathFromRepoRoot)` built on
  `readFileSync`. `entry(date, rating) -> Entry`.
  `problem(id, topic, difficulty = "Medium") -> Problem` with title
  = id, folder "T", latestPath `T/<id>/submission-0.py`.
  `ids(list) -> string[]`.
- `parseTree(tree: Item[]) -> Folder[]`, sorted by id. It keeps only
  blobs whose path matches
  `^([^/]+)/([a-z0-9-]+)/submission-(\d+)\.[A-Za-z0-9]+$`. It drops
  a path whose first segment is `.` or `..`. It skips an item that
  is not an object with a string `path` and a string `type`. If two
  topic folders hold one id, the folder that sorts first wins, and
  the result keeps only the files of that folder.
- `latestPath(folder: Folder) -> string`, highest `n` as a number.
- `titleFromId(id: string) -> string`.
- `mergeCatalog(folders: Folder[]|null, known: Known[]) -> Problem[]`.
  With `null`, it returns each known problem with `folder` and
  `latestPath` set to `null`. With folders, it returns one problem
  for each folder and drops a known problem with no folder. An
  unknown id gets `titleFromId`, topic "Unknown", difficulty
  "Unknown".

- [ ] **Step 1: Write the failing tests**

```js
const fixture = loadJson("tests/fixtures/tree.json")
const byId = (id) => parseTree(fixture).find((f) => f.id === id)
parseTree(fixture).length === 110          // README.md ignored
ids(parseTree(fixture)) is sorted
latestPath(byId("duplicate-integer")).endsWith("submission-4.java")
latestPath({ files: [{ path: "a/b/submission-9.py", n: 9 },
  { path: "a/b/submission-10.py", n: 10 }] })
  === "a/b/submission-10.py"
// each of these paths gives parseTree(...).length === 0:
//   "SQL/x/notes.txt", "SQL/x/submission-x.py", "SQL/x/submission-1",
//   "a/b/c/submission-1.py", "T/Bad_Id/submission-1.py",
//   "../x/submission-1.py", and "SQL/x" with type "tree"
// parseTree([null, 5, { path: 7, type: "blob" }]) -> [], no throw
// id "x" in folders "B" and "A" -> one Folder with folder "A"
titleFromId("two-integer-sum") === "Two Integer Sum"
// AC11
mergeCatalog(parseTree([{ path: "T/new-problem/submission-0.py",
  type: "blob" }]), [])[0]
  // -> title "New Problem", topic "Unknown", difficulty "Unknown",
  //    folder "T", latestPath "T/new-problem/submission-0.py"
mergeCatalog(null, [k])[0].latestPath === null
mergeCatalog([], [k]).length === 0
// limits.test.js: `sh scripts/check-limits.sh` prints nothing
```

- [ ] **Step 2:** Run `npm test`. Expect failures because the
      modules do not exist.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test`. Expect a pass.
- [ ] **Step 5:** Commit.

### Task 2: Problem data

**Files:** Create `scripts/build-lib.mjs`,
`scripts/build-problems.mjs`, `data/problems.json`,
`tests/build-problems.test.js`, `tests/data.test.js`.

**Consumes:** `parseTree`, `mergeCatalog`, `loadJson`.

**Produces:** in `build-lib.mjs`, `buildProblems(ids: string[],
list: object[], nameMap: object, manual: Known[]) -> { problems:
Known[], missing: string[] }`. A manual entry wins. Otherwise the
slug is the own property `nameMap[id]`, or the id. It must equal a
list item `link` without the trailing slash. Title and topic come
from `problem` and `pattern`, and both must be non-empty strings.
Difficulty is `difficulty` if it is Easy, Medium, or Hard, otherwise
"Unknown". An id with no valid match goes to `missing`. `problems`
is sorted by id.

Tests import `build-lib.mjs` only. The command
`node scripts/build-problems.mjs` reads ids from
`tests/fixtures/tree.json`, downloads the list from
`https://raw.githubusercontent.com/neetcode-gh/leetcode/main/`
`.problemSiteData.json`, and writes `data/problems.json` as one
array with one entry on each line. If `missing` is not empty, it
prints the ids, writes nothing, and exits with code 1.

- [ ] **Step 1: Write the failing tests**

```js
// build-problems.test.js
const item = { problem: "Contains Duplicate", link:
  "contains-duplicate/", pattern: "Arrays & Hashing",
  difficulty: "Easy" }
const map = { "duplicate-integer": "contains-duplicate" }
buildProblems(["duplicate-integer"], [item], map, []).problems
  // -> [{ id: "duplicate-integer", title: "Contains Duplicate",
  //       topic: "Arrays & Hashing", difficulty: "Easy" }]
buildProblems(["contains-duplicate"], [item], {}, []).missing  // []
buildProblems(["nope"], [item], {}, []).missing          // ["nope"]
buildProblems(["a"], [item], { a: "not-in-list" }, []).missing
  // ["a"]
// manual wins over the list:
const manual = { id: "contains-duplicate", title: "Mine",
  topic: "SQL", difficulty: "Unknown" }
buildProblems(["contains-duplicate"], [item], {}, [manual])
  .problems[0]   // deep equals manual
// difficulty "Insane" in the list -> "Unknown"
// a list item with a number as `problem` -> id goes to missing
// id "constructor" with an empty map -> missing ["constructor"]
// ids ["b", "a"] -> problems sorted ["a", "b"]
// data.test.js (AC1)
const all = mergeCatalog(parseTree(fixture), problems)
all.length === 110; ids are unique; every title is not empty
count(difficulty): Medium 76, Easy 27, Hard 5, Unknown 2
count(topic "SQL") === 2; count(topic "Unknown") === 0
title("duplicate-integer") === "Contains Duplicate"
title("two-integer-sum") === "Two Sum"
topic("find-the-town-judge") === "Graphs"
// no title or topic holds "<", ">", or more than 100 characters
```

- [ ] **Step 2:** Run both test files. Expect failures.
- [ ] **Step 3:** Implement `buildProblems`, then run the command to
      write `data/problems.json`.
- [ ] **Step 4:** Run `npm test`.
- [ ] **Step 5:** Commit. The main agent reads all 110 titles.

## PR 2: `feature/rating-schedule` (Tasks 3 to 5, stacked on PR 1)

### Task 3: Dates and schedule

**Files:** Create `src/dates.js`, `src/schedule.js`,
`tests/dates.test.js`, `tests/schedule.test.js`.

**Produces:**
- `localDate(d: Date) -> string`, from the local getters of `d`.
- `addDays(date: string, n: number) -> string` and
  `daysBetween(from: string, to: string) -> number`. Both use
  `Date.UTC` on the parsed parts, so no time zone can change them.
- `isRealDate(text: unknown) -> boolean`: a string that matches
  `^\d{4}-\d{2}-\d{2}$`, gives the same parts back after a
  `Date.UTC` round trip, and has a year from 2000 to 2100.
- `formatDay(date: string) -> string` with `toLocaleDateString`,
  locale `en-US`, `timeZone: "UTC"`, short weekday, short month,
  numeric day.
- `replay(history: Entry[]) -> { step: number|null,
  due: string|null }`. Failed: step 0. Struggled: `max(prev ?? 0, 1)`.
  Clean: `min(max((prev ?? -1) + 1, 2), 5)`.
  `due = addDays(last.date, LADDER[step])`.
- `rate(history, date, rating) -> Entry[]`: a new sorted array. It
  drops each entry with a date after `date`. An entry with the same
  date is replaced. An unknown rating throws `RangeError`.
- `isWeak(history) -> boolean`: last rating is failed or struggled.

- [ ] **Step 1: Write the failing tests**

```js
addDays("2026-11-28", 3) === "2026-12-01"
addDays("2026-03-07", 2) === "2026-03-09"      // US DST change
addDays("2026-10-24", 2) === "2026-10-26"      // EU DST change
addDays("2028-02-28", 1) === "2028-02-29"
daysBetween("2026-11-20", "2026-11-18") === -2
daysBetween("2026-03-07", "2026-03-09") === 2
localDate(new Date(2026, 10, 20, 23, 59)) === "2026-11-20"
formatDay("2026-11-20") === "Fri, Nov 20"
isRealDate: true for "2026-11-20". False for "2026-02-30",
  "2026-13-01", "0000-00-00", "11/20/2026", 20261120,
  ["2026-11-20"], "1999-12-31"
replay([])                       // { step: null, due: null }
const d = "2026-11-20"           // AC3
replay(rate([], d, "failed"))    // { step: 0, due: "2026-11-21" }
replay(rate([], d, "struggled")) // { step: 1, due: "2026-11-23" }
replay(rate([], d, "clean"))     // { step: 2, due: "2026-11-27" }
// AC4: clean on 11-01 and 11-08 gives step 3 (14 days)
const h = [entry("2026-11-01","clean"), entry("2026-11-08","clean")]
replay(rate(h, "2026-11-22", "clean"))     // step 4, 2026-12-22
replay(rate(h, "2026-11-22", "struggled")) // step 3, 2026-12-06
replay(rate(h, "2026-11-22", "failed"))    // step 0, 2026-11-23
// clean on 09-01, 09-08, 09-22, 10-22 -> step 5. Clean again on
//   12-21 -> step 5, due "2027-02-19"
replay([entry(d,"failed"), entry("2026-11-21","struggled")]).step
  === 1
replay([entry(d,"failed"), entry("2026-11-21","clean")])
  // { step: 2, due: "2026-11-28" }
rate(rate([], d, "clean"), d, "failed") // AC12: [entry(d,"failed")]
rate([entry("2026-11-25","clean")], d, "failed")
  // [entry(d,"failed")]: the later entry is dropped
rate([entry("2026-11-05","clean")], "2026-11-10", "clean")
  // 2 entries, 11-05 first
rate([entry("2026-11-08","clean"), entry("2026-11-01","clean")],
  d, "clean")   // 3 entries in date order
rate(h, d, "clean") does not change h
rate([], d, "great") throws RangeError
isWeak([]) === false; isWeak([entry(d,"struggled")]) === true
isWeak([entry(d,"failed"), entry("2026-11-21","clean")]) === false
```

- [ ] **Steps 2 to 5:** Fail, implement, `npm test`, commit.

### Task 4: Queue

**Files:** Create `src/queue.js`, `tests/queue.test.js`.

**Consumes:** `replay`, `isWeak`, `daysBetween`, test helpers.

**Produces:**
- `startOrder(problems: Problem[]) -> Problem[]`. Groups in the order
  Medium, Hard, Easy, then all other values. Inside a group, sort the
  topics A to Z and the problems of a topic by id. Then take one
  problem from each topic in turn until the group is empty.
- `buildToday({ problems, ratings, target, today }) -> { done:
  Problem[], open: { problem, kind: "due"|"new",
  overdueDays: number }[], waiting: number }`. `done` holds problems
  with an entry dated today, sorted by id.
  `slots = max(0, target - done.length)`. Due problems (`due <=
  today`, not in `done`) sort by `due`, then id. `open` takes due
  problems first. Then it takes problems with no history, in the
  order of `startOrder` over all problems. `waiting = max(0,
  dueCount - slots)`.
- `topicSummary(problems, ratings) -> { topic, total, reviewed,
  weak }[]`, sorted by topic. `reviewed` counts problems with a
  history. `weak` counts problems where `isWeak` is true.

- [ ] **Step 1: Write the failing tests** (`today` = "2026-11-20")

```js
ids(startOrder([problem("a1","A"), problem("a2","A"),
  problem("b1","B")]))                       // ["a1", "b1", "a2"]
ids(startOrder([problem("e","A","Easy"), problem("h","A","Hard"),
  problem("m","A","Medium"), problem("u","A","Unknown")]))
  // ["m", "h", "e", "u"]
// AC2, with mergeCatalog(parseTree(fixture), problems.json), no
//   ratings, target 4:
//   open.length 4, all kind "new", all Medium,
//   no two neighbors share a topic, done [], waiting 0
// AC5, target 4, plus new problems:
//   p1 [clean 11-01]     -> due 11-08, overdueDays 12
//   p2 [failed 11-18]    -> due 11-19, overdueDays 1
//   p3 [struggled 11-15] -> due 11-18, overdueDays 2
//   open ids [p1, p3, p2, <first new>], kinds [due,due,due,new]
// [failed 11-19] -> due today: in open, overdueDays 0
// [clean 11-19] -> due 11-26: not in open
// 6 due + target 4 -> 4 open, waiting 2
// 4 rated today + 2 due -> open [], waiting 2
// 5 rated today + target 4 -> done 5, open []
// stable order: new a1(A) b1(B) c1(C) d1(D) a2(A), target 4 ->
//   open [a1,b1,c1,d1]. Rate a1 today -> done [a1],
//   open [b1,c1,d1], not a2
// Review Focus 3: ratings["gone-id"] changes nothing
// a problem with id "constructor" and no rating is kind "new"
// topicSummary: sorted by topic. Topic A with a1 [failed], a2 []
//   -> { total 2, reviewed 1, weak 1 }. a1 [failed, then clean]
//   -> weak 0. A rating for an unknown id changes nothing
```

- [ ] **Steps 2 to 5:** Fail, implement, `npm test`, commit.

### Task 5: Store

**Files:** Create `src/store.js`, `tests/store.test.js`. Extend
`tests/helpers.js` with `fakeStorage({ failWrites = false,
failReads = false } = {})`. It has `getItem`, `setItem`,
`removeItem`, and the two switches as properties that a test can
change later.

**Consumes:** `isRealDate`, constants.

**Produces:**
- `emptyState() -> State` (target 4).
- `validate(value: unknown) -> { ok: true, state: State } |
  { ok: false, error: string }`. Rules: `version === 1`. `target` is
  a number, an integer, from 1 to 10. `ratings` is a plain object.
  Each own key matches `ID_PATTERN`. Each history is a non-empty
  array of objects. Each entry has a date where `isRealDate` is true
  and a known rating. Dates are unique in one history. The result is
  a new object with sorted histories and no extra keys.
- `importText(text: string)`: a text longer than `MAX_IMPORT_CHARS`
  is an error. Then `JSON.parse` in a `try`, then `validate`.
- `exportText(state: State) -> string`.
- `loadState(storage) -> { state: State, notice: string|null }`. No
  saved text: empty state, no notice. Text that fails `importText`:
  empty state, `NOTICES.damaged`, and the text is copied to
  `BAD_KEY` inside a `try`. A read that throws: empty state,
  `NOTICES.cannotSave`. This function never throws.
- `saveState(storage, state: State) -> boolean`. It writes only a
  state that passes `validate`. It returns `false` for an invalid
  state or a write that throws.

- [ ] **Step 1: Write the failing tests**

```js
importText(exportText(s)).state deep equals s          // AC9
// AC10, each gives ok false and a non-empty error:
//   "{oops", "null", "[]", version 2, target 0, target 11,
//   target 2.5, target "4", rating "great", date "11/20/2026",
//   date "2026-02-30", date ["2026-11-20"], an entry that is a
//   string, two entries with one date, ratings as array, an empty
//   history, a text of MAX_IMPORT_CHARS + 1 characters, and
//   JSON.parse('{"version":1,"target":4,"ratings":
//     {"__proto__":[]}}')
// id "constructor" with a valid history is accepted and kept
// extra keys are removed. A history given out of order is sorted
loadState(fakeStorage()) // { state: emptyState(), notice: null }
// Review Focus 1: storage holds "{oops" -> emptyState(),
//   NOTICES.damaged, BAD_KEY holds "{oops". Same for a stored
//   state with version 2
// damaged text and failWrites -> emptyState(), no throw
// Review Focus 2: failReads -> emptyState(), NOTICES.cannotSave
saveState(storage, s) === true, then loadState gives s     // AC6
saveState(fakeStorage({ failWrites: true }), s) === false
saveState(storage, { ...s, target: NaN }) === false, and the
  stored text is unchanged
```

- [ ] **Steps 2 to 5:** Fail, implement, `npm test`, commit.
