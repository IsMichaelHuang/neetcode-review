# NeetCode Review Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Context

Michael has 110 NeetCode solutions in a public repository. He wants
to keep them fresh for coding assessments. This plan builds a page
that puts those problems on a review schedule that his own ratings
control. He approved the design on 2026-11-20.

**Goal:** One static page that lists his solved problems, shows what
to redo today, and schedules each problem from his rating.

**Architecture:** Pure JavaScript modules hold all logic (catalog,
schedule, queue, store). A controller (`app.js`) joins them and
returns a plain view object. `render.js` maps that view to the DOM.
`main.js` connects the real `fetch`, `localStorage`, and document.

**Tech Stack:** HTML, CSS, JavaScript modules, Node 26 test runner
(`node --test`), GitHub Pages. No dependency of any kind.

**Spec:** `docs/superpowers/specs/`
`2026-11-20-neetcode-review-dashboard-design.md`. Acceptance criteria
AC1 to AC12 are the numbered list in that document.

**Spec corrections:**
- 56 folder names need the name map, not 57. `find-the-town-judge`
  is not in the NeetCode list. It gets a manual entry: title "Find
  the Town Judge", topic "Graphs", difficulty "Easy". The counts are
  then Medium 76, Easy 27, Hard 5, Unknown 2 (SQL).
- Import makes sure that the file is valid before it asks to replace
  the ratings. A rating that he makes today removes entries with a
  later date (a clock that moved back).

## What Michael approves

- The local folder `~/projects/personal/neetcode-review`, `git init`,
  and local commits on four stacked branches.
- The build as the tasks describe it, by Sonnet dev agents.
- Not included: the public GitHub repository, the push, the PRs, and
  GitHub Pages. Those wait for a separate go-ahead after hand-off.

## Global Constraints

- Every file: 400 lines maximum, 80 characters for each line. Exempt:
  `data/problems.json`, `scripts/*.json`, `tests/fixtures/*`.
- Tests first. Each dev agent shows the failing run, then the pass.
- No runtime dependency and no dev dependency. No build step.
- Relative imports carry the `.js` extension. A module has no side
  effect at import time.
- Remote text goes on screen through `textContent` only. Notices and
  error texts are fixed strings from `NOTICES`, never a remote body.
- Lookups by id or by topic use `Object.hasOwn` or a `Map`.
- This project never writes to the submissions repository.
- The repository is public. No committed file says how an assessment
  went or names his weak problems. `.gitignore` lists
  `neetcode-review-ratings*.json` and `.DS_Store`.
- Docs, commits, and comments use Simple English.
- Dev agents run on the `sonnet` model. Each gets the brief template
  from `~/.claude/PLANNING.md` section 8.
- No CI exists before the GitHub repository does. The main agent runs
  `npm test` on each branch tip.

## Constants (`src/config.js`)

```js
OWNER = "IsMichaelHuang"; REPO = "neetcode-submissions-aquuq6h3"
BRANCH = "main"; LADDER = [1, 3, 7, 14, 30, 60]
DEFAULT_TARGET = 4; MIN_TARGET = 1; MAX_TARGET = 10
RATINGS = ["failed", "struggled", "clean"]
DIFFICULTY_ORDER = ["Medium", "Hard", "Easy"]
ID_PATTERN = /^[a-z0-9-]+$/
STORAGE_KEY = "neetcode-review:state"
BAD_KEY = "neetcode-review:state.bad"
TREE_CACHE_KEY = "neetcode-review:tree"
TREE_MAX_AGE_MS = 600000; FETCH_TIMEOUT_MS = 8000
MAX_IMPORT_CHARS = 1000000
NOTICES = { stale, noTree, cannotSave, damaged, revealFailed }
  // five fixed texts, all different
```

## Review Focus

Each line has a test in the task that owns the code.

1. Damaged or wrong-shape JSON in `localStorage`: the page starts
   empty, copies the text to `BAD_KEY`, shows a notice. (Task 5)
2. Storage read or write throws: the rating still shows, and a notice
   says that the browser cannot save. (Tasks 5 and 6)
3. A saved rating for an id that left the repository: the queue
   ignores it, and export keeps it. (Tasks 4 and 6)
4. Date math across a month end, a leap day, and a DST change gives
   calendar days in every time zone. (Task 3)
5. The API answers 403, or a body with no usable folders, and no
   cache exists: the page lists `problems.json` and shows a notice.
   (Task 6)

## File Structure

```
index.html            page shell, CSP meta tag first in <head>
styles.css            all styles
src/config.js         constants only
src/catalog.js        tree -> folders -> problems
src/dates.js          calendar date math
src/schedule.js       history -> step and next date
src/queue.js          start order, list for today, topic summary
src/store.js          state shape, validate, load, save, import
src/github.js         URLs and the cached tree request
src/app.js            controller, returns the view object
src/render.js         view object -> DOM
src/main.js           wiring, exports start()
data/problems.json    array of 110 known problems (generated)
scripts/build-lib.mjs        pure buildProblems()
scripts/build-problems.mjs   command that writes problems.json
scripts/name-map.json        56 folder id -> list slug pairs
scripts/manual-problems.json 3 manual entries
scripts/check-limits.sh      file limit check
tests/*.test.js, tests/helpers.js, tests/dom.js
tests/fixtures/tree.json     live tree, reduced to { path, type }
```

## Shared Types

```
Rating  = "failed" | "struggled" | "clean"
Entry   = { date: "YYYY-MM-DD", rating: Rating }
State   = { version: 1, target: number, ratings: { [id]: Entry[] } }
Known   = { id, title, topic, difficulty }
Item    = { path: string, type: string }
Folder  = { id, folder, files: { path, n }[] }
Problem = Known & { folder: string|null, latestPath: string|null }
```

## Tasks

Tasks 0 to 5 are in `neetcode-review-dashboard-tasks-1.md`.
Tasks 6 and 7 are in `neetcode-review-dashboard-tasks-2.md`.

## Test Plan

| Criterion | Test file |
|-----------|-----------|
| AC1 | `data.test.js`, `app.load.test.js` |
| AC2 | `queue.test.js`, `app.load.test.js`, `main.test.js` |
| AC3, AC4 | `schedule.test.js` |
| AC5 | `queue.test.js` |
| AC6 | `store.test.js`, `app.rate.test.js` |
| AC7 | `app.load.test.js`, `render.test.js` |
| AC8 | `github.test.js`, `app.load.test.js` |
| AC9, AC10 | `store.test.js`, `app.import.test.js` |
| AC11 | `catalog.test.js` |
| AC12 | `schedule.test.js`, `app.rate.test.js` |

The browser pass below is a second check, not the proof.

## Verification (main agent, after Task 7)

- [ ] `npm test` passes on each of the four branch tips.
- [ ] Serve the folder on localhost and open it in the browser pane.
      Rate a problem, reload, change the rating, reveal a solution,
      export, import, and set a width of 375 pixels. Make sure that
      the console shows no CSP error.
- [ ] Open three "Open on NeetCode" links, one of them SQL.
- [ ] Read the full diff of each branch. Search the tracked files
      for text that Global Constraints forbids in a public
      repository.
- [ ] Write the answers to the four questions at the end of
      `docs/plans/neetcode-review-dashboard.md`. Each action from
      those answers goes back to a dev agent as a TDD task.

## Risks

- A wrong pair in the name map gives a wrong title or topic. The
  build stops on a missing slug, the data test pins the counts, and
  the main agent reads all 110 titles.
- NeetCode changes the path format. `parseTree` then finds no
  folders, and the page falls back to `problems.json` with a notice.
- The browser data is cleared. Export is the backup. The README says
  this.
- `ismichaelhuang.github.io` also serves the portfolio. Each page on
  that address can read and change these keys. The key prefix stops
  accidents only. The page validates the saved state and the cached
  tree on each read. Ratings are not secret.
- A second damaged state overwrites the copy in `BAD_KEY`. The page
  saves only valid states, so damage needs an outside cause.

## Rollback

The page is static and holds no server data. To undo a release,
revert the merge commit on `main`, or turn off GitHub Pages. Ratings
stay in the browser in both cases.

## Review log

Three Sonnet reviewers read the first draft: correctness, tests and
TDD, security. They found 1 blocker and 15 major items. All are
fixed in this version.

- Blocker: a test import of the build script started a download.
  Fix: pure `build-lib.mjs`, and tests import only that file.
- Data loss paths: a `NaN` target, a folder id outside the id rule,
  and a date such as `2026-02-30` each made the next load reject all
  ratings. Fix: one `ID_PATTERN`, `isRealDate`, a safe `setTarget`,
  and `saveState` writes only valid states.
- Two tabs overwrote each other. Fix: `refresh()` before each change.
- The start order moved after each rating. Fix: `startOrder` runs
  over all problems.
- Public repository: the committed docs stay neutral, and the export
  file name is in `.gitignore`.
- Tests: `render.js` and `main.js` now have tests through a fake
  document. The time zone is fixed for the test run. The cache
  shape, the fake helpers, the view rules, and the URL strings are
  defined. Vague test lines now carry numbers.
- The page PR is split in two, so each PR covers one thing.

Rejected, with reasons:
- Size caps on stored state, solutions, and the downloaded list. The
  data is his own. Only the import text has a cap.
- A host guard inside each URL builder. The id rule and the folder
  rule already stop path tricks.
- Removal of control characters from the list. The main agent reads
  all 110 titles, and a test rejects `<` and `>`.
- A stub that returns a wrong value before each red run. A missing
  module is a valid first failure, and the dev agent shows the run.
- A CI workflow. No GitHub repository exists before the go-ahead.
- A time stamp on `BAD_KEY`. See Risks.

A fourth reviewer read the revised plan, because the first round
found a blocker. It found no blocker and 6 major items. All are
fixed: a wrong expected value in a `rate` test, `setTarget("")`, a
home for the import error, the save and refresh rules, a cached tree
with bad items or a future time, and the exact URL of
`data/problems.json`.

Rejected from that round:
- Date tests in more time zones. `addDays` and `daysBetween` use
  `Date.UTC` only, so the zone cannot change them.
- No link for `find-the-town-judge`. The folder comes from NeetCode,
  so the problem page exists there.
