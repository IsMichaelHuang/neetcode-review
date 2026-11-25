# Simplify Audit Implementation Plan

## Context

A simplify audit found eight places where the code holds the same
value twice, does the same work twice, or keeps code that nothing
uses. The owner asked for a plan and a build with no further input.
So this plan records each decision that the owner did not make.

Goal: remove each duplicate and each unused part. The page shows and
saves the same things as before.

Non-goals:

- No change to the look, the schedule, the storage format, or the
  data.
- No change to the old plan files in `docs/plans/`. They are records.
  `tests/contrast.test.js` reads `pond-mist-design.md`.
- No change to the guards that use `Object.hasOwn`, the `win?.` checks
  in `src/main.js`, or the page fallback in `src/render.js`. Tests
  cover each of them.

## Decisions

- The owner gave no input, so the plan mode approval step is
  replaced by the review of two Sonnet reviewers.
- `buildToday` returns problems only. The app works out the kind and
  the overdue days in `rowFor`, as it does now. The list keeps its
  name `open`.
- `RATINGS` in `src/config.js` becomes the one list of ratings, in
  display order: clean, struggled, failed. The code uses it only with
  `includes`, so the order changes nothing there. `RATING_KEYS` in
  `src/labels.js` points to the same array.
- The target range comes from `MIN_TARGET` and `MAX_TARGET` in each
  place: the input, its hint, and the import error.
- If `npm run limits` prints a line, it exits with 1. `npm test`
  already fails in that case, through `tests/limits.test.js`.

## Acceptance criteria

1. `buildToday` returns `{ done, open, waiting }`, where `open` is a
   list of problems. The Today list shows the same rows in the same
   order as before.
2. `doneCount` in the view equals the length of `done`.
3. `app.js` holds no copy of `cmp` or `historyOf`. It imports them
   from `queue.js`.
4. `RATING_KEYS` is the same array as `RATINGS`.
5. The number 10 does not appear in `src/render-settings.js` or in
   `src/store.js`. The input, the hint, and the error text still say
   1 and 10.
6. `scripts/build-lib.mjs` imports `LEVEL_ORDER` and has no own list
   of levels.
7. `replay` gives the same result with one sort and no extra pass.
8. The storage fallback in `src/main.js` has no `removeItem`. The
   helper `table` in `src/labels.js` passes no index.
9. If a file breaks a limit, `sh scripts/check-limits.sh` prints the
   line and exits with 1. If no file breaks a limit, it prints
   nothing and exits with 0.

## Tasks

Task 1 and Task 2 touch no shared file. They run one after the other
in this checkout, because both commit here.

### Task 0 (main agent)

- [ ] Create `chore/simplify-audit` from `main`. Save this plan.
- [ ] Two Sonnet reviewers read the plan: correctness with tests, and
      docs with file limits. Fix what they find. Commit.

### Task 1 (Sonnet dev agent): the Today queue and shared helpers

Files: `src/queue.js`, `src/app.js`, `tests/queue.test.js`,
`tests/app.rate.test.js`.

- [ ] Tests first, in `tests/queue.test.js`:
  - Each `r.open.map((o) => o.problem)` becomes `r.open`.
  - "AC2": the open problems are Medium, and the state has no
    rating. So each open problem is new, and the `kind` check is
    not needed. `r.open[i].problem.topic` becomes `r.open[i].topic`.
  - "AC5": the ids stay `p1, p3, p2, n1`. The `kind` and
    `overdueDays` checks move to a new app test, described below.
  - "a problem due today is open with overdueDays 0" becomes "a
    problem due today is open". It checks the id `p`. The problem
    has a rating, so it can only be due. The overdue value moves to
    the app test.
  - "an id such as constructor with no rating is a new problem"
    checks the id `constructor`.
- [ ] New tests in `tests/app.rate.test.js`. They describe the
      present behavior, so they pass before the code change. Run
      them green first.
  - With target 4, rate `add-two-numbers` failed on 2026-11-07,
    `anagram-groups` failed on 2026-11-17, and
    `binary-tree-right-side-view` failed on 2026-11-18. The queue
    is these three, then `coin-change`. The kinds are
    `due, due, due, new`, and the overdue days are `12, 2, 1, 0`.
  - A second test of its own: seed one id failed on 2026-11-19
    with `seed(storage, ...)`. Its queue row has the kind `due`
    and the overdue days 0. The test checks only that row.
- [ ] The test at line 305 of `tests/app.rate.test.js` uses
      `[...done, ...open]`.
- [ ] Red run. Then code: `buildToday` pushes problems into `open`.
      If nothing else uses `daysBetween`, remove its import.
      Export `cmp` and `historyOf` from `queue.js`. In `app.js`,
      import both, call `historyOf(state.ratings, id)`, use
      `byLevel([...done, ...open])`, and set `doneCount` to
      `done.length`.
- [ ] Green run of `npm test`, then `npm run limits`. One commit.

### Task 2 (Sonnet dev agent): one source for each value

Source files:

- `src/config.js`, `src/labels.js`, `src/h.js`
- `src/render-settings.js`, `src/store.js`
- `src/schedule.js`, `src/main.js`
- `scripts/build-lib.mjs`, `scripts/check-limits.sh`, `README.md`

Test files:

- `tests/labels.test.js`, `tests/static.test.js`
- `tests/build-problems.test.js`, `tests/limits.test.js`

- [ ] Tests first:
  - `labels.test.js`: `RATING_KEYS` is the same object as `RATINGS`
    from `config.js` (`assert.equal`). `RATINGS` is frozen.
  - `static.test.js`: `src/render-settings.js` and `src/store.js`
    have no match of `/\b10\b/`, and each imports `MAX_TARGET`.
  - `build-problems.test.js`: `scripts/build-lib.mjs` imports
    `LEVEL_ORDER` from `../src/config.js` and has no `LEVELS =`.
  - `limits.test.js`: three cases, each in a new temporary folder
    with `git init`. Run the script by its absolute path with
    `spawnSync`, because `execFileSync` throws on exit 1. Set
    `cwd` to the temporary folder.
  - A file with `"x".repeat(81)` on one line: exit 1, and the
    output has `WIDE`.
  - A file of `"x\n".repeat(401)`: exit 1, and the output has
    `LONG`.
  - A file with one short line: exit 0, and no output.
- [ ] Red run. Then code:
  - `RATINGS = Object.freeze(["clean", "struggled", "failed"])` and
    `RATING_KEYS = RATINGS`. `known` in `h.js` uses
    `RATING_KEYS.includes`.
  - `render-settings.js` and `store.js` build the numbers and the
    texts from `MIN_TARGET` and `MAX_TARGET`.
  - `build-lib.mjs` imports `LEVEL_ORDER`.
  - `replay` sorts once and reads the last date from the sorted
    copy with `.at(-1)`. In the loop, `prev` is a copy of `step`,
    and `step` does not change before it is read. So the three
    rating lines read `step`, and `prev` goes away.
  - Remove `removeItem` from `safeStorage` and the index from
    `table`.
  - `check-limits.sh` runs its loop inside `out=$(...)` and prints
    `$out` in the same format. If the output is not empty, the
    script exits with 1.
  - `README.md`: add one sentence. It says that `npm run limits`
    exits with an error on a broken limit.
- [ ] Green run of `npm test`, then `npm run limits`. One commit.

### Task 3 (main agent): verify and hand off

- [ ] Review each diff. `npm test`, `npm run limits`, and
      `git diff --exit-code main -- index.html styles.css`.
- [ ] In the browser: Today with seeded ratings of each level,
      Settings with the target input, and the Problems table. No
      console error.
- [ ] Make sure that the diff has fewer than 400 changed lines.
- [ ] Write the four answers here. Push, and open one PR into `main`.
      The merge waits for the owner.

## PR breakdown

One PR from `chore/simplify-audit` into `main`. It is about one
thing: duplicates and unused code. The diff stays under 400 lines.

## Test plan

| Criterion | Proof |
|-----------|-------|
| 1, 2, 3 | `queue.test.js`, `app.rate.test.js`, the browser |
| 4 | `labels.test.js` |
| 5 | `static.test.js`, `render.settings.test.js` |
| 6 | `build-problems.test.js` |
| 7 | `schedule.test.js`, unchanged |
| 8 | the full suite, unchanged |
| 9 | `limits.test.js` |

## Risks

- The `kind` and `overdueDays` checks leave `queue.test.js`. The new
  app test keeps the same values, so no check is lost.
- A static test reads source text. A rename can break it. This is
  the same kind of test as the present ones in `static.test.js`.
- The limits test needs `git` on the machine. `npm test` already
  needs it.

## Rollback

Revert the merge commit. No saved data changes.

## Review log

Two Sonnet reviewers read the plan: correctness with tests, and docs
with file limits. They found one blocker and one major item. Both are
fixed:

- Blocker: `execFileSync` throws on exit 1. The limits test now uses
  `spawnSync`, and it has a clean case and a `LONG` case.
- Major: some `kind` checks left the queue tests with no new home.
  The app tests now check a due row with 0 overdue days. The plan
  says why each other `kind` check follows from its input.

Minor fixes:

- the `topic` line in AC2
- the green first run of the new app tests
- the meaning of `prev`
- the output of the limits script
- a check of the diff size

A third reviewer read the changed parts and found no blocker. It
asked for the second app test to stand alone, and for a final
newline in the 401-line file. Both are in the plan.

Noted and accepted: `known` gave true for the array `["clean"]`, and
now gives false. The view gives a string or null only.

## Verification

- `npm test` runs 385 tests, and all pass. Task 1 added 2 tests, and
  Task 2 added 6.
- `npm run limits` prints nothing and exits with 0.
  `index.html` and `styles.css` did not change.
- The code and the tests change about 210 lines. The rest of the diff
  is this plan.
- In the browser, Today showed five rows. The first row was Easy and
  due today. Next came three Medium rows: done, 4 days overdue, and
  new. The last row was Hard and 14 days overdue. The count read
  "1 of 5 done".
- A rating on the Medium row set the button to pressed and kept the
  focus on it. Settings showed min 1, max 10, and the same hint. The
  Weak filter on Problems listed the three problems with a failed or
  struggled rating. The console showed no error.

## Four questions

Regressions:

- None found. `buildToday` has one caller, `app.js`. It used only the
  problems. The app tests keep the kind and overdue checks that left
  the queue tests. The browser pass showed the same rows, counts, and
  texts as before.
- `RATINGS` has a new order. Its users call `includes` only.
- `known` now gives false for the array `["clean"]`. The view gives a
  string or null only, so no screen changes.

Security flaws:

- None found. The change adds no input, no network target, and no
  storage key. The guards that use `Object.hasOwn` stay. `known`
  still gives false for "constructor", and a test covers it.

Efficiency:

- The view no longer counts every row for `doneCount`, and `replay`
  no longer walks the history twice. The files in `src/` have 6
  fewer lines.

Extra test cases:

- None needed. The limits script has a test for each of its three
  results. Each moved check has a new home in the app tests.
