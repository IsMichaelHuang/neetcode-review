# Today Sorted by Level Implementation Plan

## Context

Michael wants the daily list to show its problems sorted by level,
from Easy to Hard. He also asked for a flexible count of "1 + N"
problems each day. He then said that "1 + N" is only the number of
problems for each day. That control exists already: Settings has
"Daily target", from 1 to 10, and Today shows that many problems.
So the count needs no code. The hand-off tells him where it is.

**Goal:** The Today page shows its problems from Easy to Medium to
Hard. A level that is not one of these three shows last.

**Non-goals:** No change to which problems the list picks: due
problems still come first, then new problems in the present start
order. No change to the daily target or its range of 1 to 10. No
change to the Problems table or the Topics page.

## Decisions

- Only the display order changes. `buildToday` in `src/queue.js`
  picks the problems as now. A new pure function sorts the picked
  list by level.
- The sort is stable. Inside one level the present order stays:
  problems rated today, then due problems with the oldest due date
  first, then new problems.
- A problem that he rates today moves to the top of its level group,
  as it moved to the top of the whole list before. It never leaves
  its level group.
- Michael chose "Easy to Hard" over "keep due problems first". So
  an overdue Hard review sits at the bottom of the list on purpose.
- The "Daily target" label and its hint stay as they are. The hint
  already says "The number of problems on the Today page, from 1 to
  10." No code is needed for the count.
- A new constant `LEVEL_ORDER` holds the display order: Easy,
  Medium, Hard. It lives next to `DIFFICULTY_ORDER`, which keeps its
  job: the order in which new problems are picked.

## Acceptance criteria

1. Given a Today list with problems of each level, the list shows
   all Easy problems, then all Medium, then all Hard, then others.
2. Inside one level, the order is done, then due, then new.
3. The same problems are picked as before for every state.
4. The row numbers 1 to N follow the new order.

## Changes

- `src/config.js`: add
  `export const LEVEL_ORDER = ["Easy", "Medium", "Hard"]`.
- `src/queue.js`: add `export const byLevel = (list) => ...`. It
  returns a new array, sorted with a stable sort by
  `LEVEL_ORDER.indexOf(p.difficulty)`. An index of -1 counts as
  `LEVEL_ORDER.length`, so an unknown level is last. `indexOf` is
  safe for a level such as "constructor". The input does not
  change.
- `src/app.js`, line 95, under 80 characters:
  `const queue = byLevel([...done, ...open.map((o) => o.problem)])`.
- `PRODUCT.md` line 56: "A list for today. It picks due problems
  first and new problems after, and shows them from Easy to Hard."
- `README.md` line 35: "`#/` shows Today, the list of problems to
  review, from Easy to Hard."
- `DESIGN.md` and `.impeccable/surfaces/index-html.md`: checked,
  no change. They record the look and the parts, not the order.

## Tasks

- [ ] Task 0 (main agent): create `feature/sort-today-by-level` from
      `main`. Save this plan as `docs/plans/sort-today-by-level.md`.
      Two Sonnet reviewers read it: correctness with tests, and docs
      with limits. Fix what they find. Commit.
- [ ] Task 1 (Sonnet dev agent), tests first:
  - `tests/queue.test.js`: `byLevel` gives Easy, Medium, Hard, then
    "Unknown". A level of "constructor" or `undefined` is last too.
    It keeps the input order inside one level. It does not change
    its input. An empty list gives an empty list.
  - `tests/app.rate.test.js`: the target is 5. The state has a
    done Medium, a due Medium, a due Hard, and a due Easy, so one
    slot is left for a new problem. The test names the expected id
    order: the Easy, then the done Medium, the due Medium, and the
    new Medium, then the Hard. The set of ids equals the set that
    `buildToday` picks.
  - The same commit changes `PRODUCT.md` and `README.md`.
  - Red run, code, green run, `npm run limits`, one commit.
- [ ] Task 2 (main agent): `npm test`, `npm run limits`. In the
      browser, seed ratings with all three levels and check the
      Today page at 1440 and 375 pixels. Rate the first Medium
      row and make sure that the focus stays on its button. Write
      the four answers into the plan. Hand-off report.

## PR breakdown

One PR from `feature/sort-today-by-level` into `main`. Push, the PR,
and the merge wait for Michael's go-ahead.

## Risks

- The first row is no longer always the most overdue problem. A Hard
  review that is many days overdue now sits at the bottom.
- With only 5 Hard problems, most days have no Hard row.
- After a rating, the row moves to the top of its level group. The
  focus follows the button, because it is kept by id.
- The two problems of level "Unknown" are picked last and show
  last.

## Review log

Two Sonnet reviewers read the plan: correctness with tests, and docs
with the owner's request. They found no blocker. The plan now has
these fixes:

- the rule for an unknown level
- one test file and its exact order of ids
- a focus check after a rating
- the reason why an overdue Hard review sits at the bottom
- the reason why the count needs no code

## Rollback

Revert the merge commit. No saved data changes.

## Verification

- `npm test` and `npm run limits` pass.
- Browser: seed a done Medium, a due Hard, a due Easy, and new
  problems. The Today page shows Easy first and Hard last, and the
  row numbers run 1 to N from the top.
