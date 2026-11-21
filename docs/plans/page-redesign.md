# Page Redesign (Informant Notation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Context

The review page works, but its look is a plain default. Michael asked
for a redesign with the impeccable skill. He set three facts: he
reviews at a laptop next to neetcode.io, he wants to know what to
solve now, and the redesign covers look and layout only. From four
sketched directions he chose "Informant Notation".

**Goal:** Give the page the Informant Notation look and a layout for
a laptop window of any width, with every function and rule unchanged.

**Architecture:** Only the view layer changes. The render code builds
a new DOM structure from the same `View` object. A new pure module
`src/labels.js` holds the text helpers and the class tables.
`styles.css` is rewritten. `src/app.js`, the data modules,
`src/main.js`, and `index.html` do not change.

**Tech Stack:** HTML, CSS, JavaScript modules, `node --test`. No
dependency. System fonts only.

**Spec:** `.impeccable/surfaces/index-html.md` (the direction
contract) and `PRODUCT.md`. The chosen sketch is
`.impeccable/mocks/decision/assigned.html`.

## What Michael approves

- The design decisions in "Design tokens", "DOM contract", and
  "Layout" below, and the stated departures from the sketch.
- Three build tasks by Sonnet dev agents, tests first, on the branch
  `feature/page-redesign`, with local commits.
- Not included: push, pull request, and merge. Those wait for a
  go-ahead after the hand-off report.

## Departures from the chosen sketch

- The "110" mark on the band is gone. A fixed count goes stale.
- The solution button reads "Solution" and has no column head. The
  sketch had "Show" under a head. Under 1200 pixels no head is
  visible, so the button must explain itself.
- The topic index is a list, not a table, so it can flow in columns
  on a mid-width window. It keeps the caption "reviewed · weak".
- Import stays a file input with its label. Only its button gets the
  look of the band buttons.
- Under 1200 pixels an entry takes two lines. The sketch shows the
  1440 pixel screen only.

## Global Constraints

- Look and layout only. No change to `src/app.js`, `src/main.js`,
  `src/store.js`, `src/queue.js`, `src/schedule.js`, `src/dates.js`,
  `src/catalog.js`, `src/github.js`, `src/config.js`, `index.html`,
  `data/`, or `scripts/`.
- The `View` and `Row` shapes and the handler names stay as they are.
- Each control keeps its id: `target`, `export`, `import`,
  `filter-topic`, `filter-status`, `reveal-<id>`,
  `rate-<id>-<rating>`.
- Each `aria-label` of a control stays as it is today.
- The render code uses only `createElement`, `append`,
  `replaceChildren`, `textContent`, `setAttribute`, `className`,
  `value`, and `addEventListener`.
- Each text lives in its own element. No element has both a text and
  child elements. `append` takes elements only, never a string.
- `className` is a list of tokens with one space between them. Each
  token comes from a fixed table in `src/labels.js` or is a literal
  in the render code. No token comes from data.
- The content security policy does not change. No font file, no
  image, no inline style. The policy blocks font files, so the page
  uses system faces. This is a stated exception to the craft rule
  about display faces.
- Every file: 400 lines maximum, 80 characters for each line.
- Tests first. Each dev agent saves the failing run and the passing
  run to files, before and after its code.
- No existing behavior assertion is weakened. An assertion changes
  only where Task 2 names the test and its new assertion. The count
  of `assert` calls in a changed test does not go down.
- Each dev agent that edits render code or `styles.css` first reads
  the craft rules of the skill:
  `~/.claude/plugins/cache/impeccable/impeccable/4.9.2/skills/`
  `impeccable/reference/craft-floor.md`.
- Docs, commits, and comments use Simple English. The repository is
  public and stays neutral.

## Design

The design tokens, the DOM contract, and the layout are in
`page-redesign-design.md`.

## Tasks

Tasks 0 to 4 are in `page-redesign-tasks.md`.

## PR breakdown

One PR from `feature/page-redesign` into `main`. The structure and
the styles do not work without each other, so they ship together.
The PR passes 400 changed lines, and its text states this reason.

## Test Plan

| Requirement | Proof |
|-------------|-------|
| Every function still works | tests of app, store, queue, main |
| Handlers, ids, labels unchanged | the three render test files |
| Symbol with word in each place | render tests, `labels.test.js` |
| Topic codes | `labels.test.js`, render tests |
| Nothing labelled twice | `render.today.test.js` |
| Each class has a style | `styles.test.js` |
| Contrast in both schemes | `contrast.test.js` |
| The rules of the look | `static.test.js` |
| No change to CSP or `index.html` | `static.test.js`, the diff |
| Layout at nine widths | scripted browser checks in Task 4 |

## Risks

- The widths in "Layout" are estimates until Task 4 measures them.
- `subgrid` and `color-mix` need a browser from 2023 or later. The
  page already supports current browsers only.
- The faces differ by system. Charter and Iowan Old Style exist on
  macOS. Windows gets Palatino or Georgia, and Linux gets a serif
  like Times. Text widths change with the face, so the breakpoints
  fit macOS best. Only macOS is checked.
- The dev agent of Task 3 writes the styles with no browser. The
  browser pass of Task 4 will find layout faults, and one fix round
  is expected.
- A person who knows the old page must learn the new place of each
  control. Names and ids stay.

## Rollback

Revert the merge commit of the PR. No saved data changes, because
the storage format and the logic do not change.

## Review log

Three Sonnet reviewers read the first draft: correctness and
accessibility, tests, and CSS with architecture. They found 2
blockers and about 25 major items. All are fixed in this version.

- Blocker: the column widths did not fit at 1440 pixels. Fix: new
  tracks, a narrower Topics column, a shorter button text, and
  breakpoints at 1440, 1200, and 720 with a two-line entry between.
- Blocker: a text next to child elements breaks the fake document
  and changes order in a browser. Fix: each text has its own
  element, and `append` rejects a string.
- The side-by-side window is the main case, so the mid-width layout
  is now designed, not left to stacking.
- The topic index lost the words "reviewed" and "0 weak". Both are
  back, one of them for screen readers only.
- Light Clean on its hover tint was under 4.5 to 1. The token is
  darker now, and the test covers the tint.
- Controls had no stated borders, states, or color scheme. Each has
  them now.
- Tests: the changed assertions are listed by test. Each class must
  have a style. The token format is fixed so that a test can read it.
- The arrow glyph after a title is gone. The underline marks a link.

Rejected, with reasons:

- A single `due` class in place of four steps. The weight ramp is a
  stated part of the chosen direction.
- A self-hosted display face. The security policy blocks font files,
  and `index.html` must not change.
- Custom select arrows. Native controls keep their own arrows.
- A scripted check on Windows and Linux. The owner works on macOS.

A fourth reviewer read the revised plan, because the first round
found blockers. It found no blocker and 6 major items. All are fixed:
the class test now matches whole names, each small class has a
stated look, the test views are defined, the active tint is in the
contrast test with a darker Failed red, the stacked rating buttons
have a rule for 375 pixels, and the label tables ignore keys such as
"constructor".
