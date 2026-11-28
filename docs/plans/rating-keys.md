# Rating Keys Implementation Plan

## Context

The owner wants to rate a problem without the mouse. He solves a
problem on NeetCode, comes back to the page, and rates the result.
Keys 1, 2, and 3 do this for the problem that holds the keyboard
focus.

**Goal:** With the focus on a Today row, the keys 1, 2, and 3 rate
that row as Clean, Struggled, or Failed.

**Non-goals:** No key for the Solution button. No key outside the
Today rows. No Settings toggle for the keys. No change to the rating
buttons, to `main.js`, or to the stylesheet.

## Decisions

- The key rates the row that holds the focus. It does nothing when
  the focus is outside a Today row. The owner sees which row he
  rates. A key cannot rate a row that moved when the tree loaded.
  WCAG 2.1.4 allows a one-key shortcut that works only while its
  part of the page has the focus. When he comes back from the
  NeetCode tab, the focus is still on the title link of that row.
- A new pure module `src/keys.js` has `ratingForKey(event)`. It
  returns `"clean"`, `"struggled"`, `"failed"`, or null. It returns
  null for a repeat, a composition, Ctrl, Cmd, or Alt, a key other
  than "1", "2", or "3", a target of type INPUT, TEXTAREA, SELECT, or
  PRE, and a content-editable target. Shift is allowed, so the digit
  row of an AZERTY keyboard works. It maps the keys through
  `RATING_KEYS`.
- `src/render-today.js` puts one `keydown` listener on each entry
  `li`. Events from the title link, the Solution button, a rating
  button, and the solution box reach it. For a rating, it calls
  `preventDefault()`, focuses the rating button of that row, and
  clicks it. The buttons come from `rateGroup` in the closure. The
  click runs `onRate` as before. `paint` keeps the focus on the
  button by its id.
- A hint below the list, with class `hint`, when the queue is not
  empty. It is not `more`, because a test counts `.more` nodes.
- The fake DOM in `tests/dom.js` gets `tagName`, `isContentEditable`,
  `click`, and `remove`. Only new members, so no test weakens.

## Acceptance criteria

1. A key on the link of a row rates that row, and `preventDefault`
   runs one time.
2. A key on another row rates that other row.
3. A repeat, a modifier, a "4", a key in a solution box, or a key in
   a field does nothing and does not call `preventDefault`.
4. A key on a done row changes its rating.
5. After a key rating, the focus is on the pressed button of that
   row.
6. The hint shows with rows and not with an empty queue.

## Changes

- `src/keys.js`: new, `ratingForKey`.
- `src/render-today.js`: `rateGroup` returns the group and its
  buttons. `entry` adds the listener. `todaySection` adds the hint.
- `tests/dom.js`: new members.
- `tests/keys.test.js`, `tests/render.keys.test.js`, and one test in
  `tests/main.test.js`.
- `README.md` "Keys" section, `PRODUCT.md` functions list, and the
  Rating buttons section of `DESIGN.md`.

## Tasks

- [x] Task 1: tests first, red run, code, green run,
      `npm run limits`, one commit.
- [x] Task 2: the docs and this plan, one commit.

## PR breakdown

One PR from `feature/rating-keys` into `main`. Push, the PR, and the
merge wait for the owner's go-ahead.

## Risks

- A rating by accident. It needs the focus in a row, no repeat, no
  modifier, and never a field. A wrong rating is fixed with a click
  on another button of that row. Ratings of the same day replace each
  other.

## Review log

Four reviewers read the plan, then one more read the revised part.
Main changes for this PR:

- The key rates the focused row, not the first open row. Reasons:
  the wrong-row risk and WCAG 2.1.4.
- The focus goes to the pressed button.
- The hint class is `hint`, not `more`.
- PRE is excluded, so reading a solution is safe.
- The fake DOM gets `tagName`.
- Rejected: a Settings toggle for the keys. The focus scope meets
  WCAG 2.1.4 with less code.

## Rollback

Revert the merge commit. No saved data changes.

## Verification

- `npm test` and `npm run limits` pass.
- Browser: Tab to a title link, press 2, and check the rating and
  the focus on the Struggled button.

## Four questions

1. Regressions. `rateGroup` returns `{ group, buttons }` now. Its only
   caller is `entry`, and it changes in the same commit. A digit key
   outside a Today entry does what it did before. The quiet done
   title edits the same `li` line of `entry`. The rebase keeps both:
   the `done` class and the key listener.
2. Security. None found. A key maps only to one of the three fixed
   ratings, and it acts only on the row that holds the focus.
3. Efficiency. None found. Each row has one listener, and the list
   has at most 10 rows.
4. More tests. Action: in a browser, press a key with the focus on a
   title link, and make sure that the focus lands on the pressed
   button. The fake DOM cannot show a real focus move.
