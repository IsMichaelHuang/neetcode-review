# A Quiet Title for a Done Row Implementation Plan

## Context

The next open problem needs to stand out, and a done row needs to
read as finished. Today a done title has the same weight and color
as an open title.

**Goal:** The title link of a done row is in Quiet Ink at weight
400. An open row does not change.

**Non-goals:** No change to the status, the dot, or the rating
buttons. No change to the Problems table or the Topics page.

## Decisions

- The `li` of a done row gets the classes `entry done`. An open row
  keeps the class `entry`.
- One CSS rule after the `.done-*` rule:
  `.done .title a { color: var(--ink-2); font-weight: 400; }`. Its
  specificity is (0,2,1). It beats `a` and `a:visited`.
- Quiet Ink on Sheet passes 4.5 to 1 in both color schemes. The
  contrast test already checks this pair.
- `styles.css` goes from 397 to 398 lines.

## Acceptance criteria

1. A done row has the classes `entry done`. An open row has only
   `entry`.
2. The done title link is `var(--ink-2)` at weight 400.
3. Text contrast stays at 4.5 to 1 or more.
4. `styles.css` stays at 400 lines or less.

## Changes

- `src/render-today.js`: the `entry` function sets `cls` to
  `entry done` when `row.kind === "done"`.
- `styles.css`: one rule line after the `.done-clean,
  .done-struggled, .done-failed` rule.
- `DESIGN.md`, Entry section: "The title of a done entry is in Quiet
  Ink at weight 400." One line is cut in the same section.

## Tasks

- [ ] Task 1, tests first:
  - `tests/render.today.test.js`: a done row has the class `done`
    and an open row does not.
  - `tests/static.test.js`: `styles.css` has a `.done .title a`
    rule with `color: var(--ink-2)` and `font-weight: 400`.
  - Red run, code and CSS, green run, `npm run limits`.
- [ ] Task 2: `DESIGN.md` Entry section. Net change of 0 lines.
- [ ] Task 3: this plan file.

`tests/styles.test.js` fails after the code change and before the CSS
rule, because the token `done` has no selector. This is the expected
red step.

## PR breakdown

One PR from `feature/quiet-done-title` into `main`. Push, the PR,
and the merge wait for the owner's go-ahead.

## Risks

- A lighter title on a done row. If the owner dislikes it, revert.

## Rollback

Revert the merge commit. No saved data changes.

## Verification

- `npm test` and `npm run limits` pass.
- Browser: Today with one done row and one open row. The done title
  is lighter, in both color schemes.

## Four questions
