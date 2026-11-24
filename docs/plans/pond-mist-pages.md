# Pond Mist and Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Context

Michael saw the Informant Notation page and asked for two changes.
He wants a friendlier look with a "zen" feel, and from three sketches
he chose "Pond mist". He also wants the site split into pages,
because one page with everything on it is too messy. He chose four
pages: Today, Topics, Problems, and Settings.

**Goal:** The site has the Pond mist look in a light scheme and a
dark scheme, and it has four pages with a menu. Every function works
as before.

**Non-goals:** No change to the schedule, the queue, the storage
format, or the data. No new function. No fix for the wide table on a
phone, which stays an open decision of the owner.

**Tech stack:** HTML, CSS, JavaScript modules, `node --test`. No
dependency. System fonts only.

## Decisions

- The look ships first and the pages ship second. The first state
  is the sketch that Michael approved, so it needs no throwaway
  styles in the old look.
- Pages are hash routes in the one HTML file: `#/`, `#/topics`,
  `#/problems`, `#/settings`. Rejected: four HTML files. A change of
  file reloads the page, and a rating that the browser could not
  save lives in memory only, so a reload loses it. Hash routes also
  leave `index.html` and its security policy unchanged.
- With pages, each page shows one section on one sheet. The
  two-column layout with the topic rail is gone.
- The daily target, Export, and Import move to Settings.
- Notices show on every page. The import error shows on Settings
  only, because the Import control is there.
- The header and the notice area are built one time and stay in the
  document. A redraw replaces only the page below them. A screen
  reader then reads a notice one time, and a press on a menu link is
  never lost to a redraw.
- A rating shows as a color dot and its word. The symbols `!`, `!?`,
  and `?` are gone, as in the chosen sketch.
- The heading "All problems" becomes "Problems", to match the menu.
- Control borders are darker than in the sketch, so that they reach
  a contrast of 3 to 1.
- `DESIGN.md` is overwritten from the built page.
- The sketch `.impeccable/mocks/zen/c.css` is the reference for the
  look. Git ignores it.

## Acceptance criteria

1. In both schemes, text contrast is 4.5 to 1 or more. The border of
   a control and the focus mark are 3 to 1 or more.
2. A rating has a dot and a word in each place. No symbol remains.
3. Given no hash, `#/`, or an unknown hash, when the page loads,
   then only Today shows.
4. Given `#/topics`, `#/problems`, or `#/settings`, when the page
   loads, then only that page shows.
5. On each page the menu has four links, and only the link of the
   current page has `aria-current="page"`.
6. Given a press on a menu link, then the page changes with no
   reload, the document title names the page, and the keyboard focus
   moves to the heading of the page.
7. Given a rating that is in memory only, when he changes the page,
   then the rating is still there.
8. The controls `target`, `export`, and `import` exist on Settings
   only, with the same ids, names, and behavior.
9. A notice shows on every page. The import error shows on Settings.
10. Rate, show solution, the two filters, export, and import work as
    before.
11. The page body does not scroll sideways from 375 to 1700 pixels.
12. `index.html` does not change.
13. Each file has 400 lines at most and 80 characters for each line.

## Global constraints

- No change to `index.html`, `src/app.js`, `src/store.js`,
  `src/queue.js`, `src/schedule.js`, `src/dates.js`,
  `src/catalog.js`, `src/github.js`, `src/config.js`, `data/`, or
  `scripts/`. The `View` shape and the handler names stay.
- Each control keeps its id and its accessible name.
- The render code uses the same DOM calls as today. Each text lives
  in its own element. No class token comes from data.
- `styles.css` is the only style sheet and stays at 400 lines or
  less. A dev agent edits the present file and removes dead rules
  first. If the file cannot fit, the agent stops and reports.
- Tests first. Each dev agent saves the failing run and the passing
  run to files under `.superpowers/sdd/pond-mist-pages/`.
- No behavior assertion is weakened. A test changes only where a
  task names it. A test that moves to a page keeps its assertions.
- Each dev agent that edits render code or `styles.css` first reads
  `~/.claude/plugins/cache/impeccable/impeccable/4.9.2/skills/`
  `impeccable/reference/craft-floor.md`.
- Docs, commits, and comments use Simple English. The repository is
  public and stays neutral.

## Design

The tokens, the look, and the page structure are in
`pond-mist-design.md`.

## Tasks

Tasks 0 to 8 are in `pond-mist-pages-tasks.md`.

## PR breakdown

Three stacked PRs. Each one targets the branch that it came from.

1. `feature/page-redesign` into `main`: the Informant Notation
   redesign, built before this plan.
2. `feature/pond-mist` into `feature/page-redesign`: the look.
3. `feature/pages` into `feature/pond-mist`: four pages.

PR 2 and PR 3 each pass 400 changed lines. The style sheet is one
file, and the page structure moves together with its tests, so
neither splits further. Push, the PRs, and the merges wait for a
go-ahead after the hand-off report.

## Test plan

| Criterion | Proof |
|-----------|-------|
| 1 | `contrast.test.js` |
| 2 | `labels.test.js`, render tests |
| 3, 4 | `pages.test.js`, `main.test.js`, render tests |
| 5 | `render.test.js` |
| 6, 7 | `main.test.js`, the browser pass of Task 8 |
| 8 | `render.settings.test.js`, `render.test.js` |
| 9 | `render.test.js` |
| 10 | tests of app, store, queue, main, and render |
| 11 | the width script. No unit test guards it. |
| 12 | `static.test.js`, the `git diff` step |
| 13 | `npm run limits` |

## Risks

- A dev agent writes the styles with no browser. The browser pass
  finds layout faults, and one fix round is expected.
- `styles.css` is near 400 lines. If it cannot fit, the agent stops,
  and the owner decides on a second style sheet.
- A person who knows the one-page site must learn the menu. An old
  link to the site still opens Today.
- A change of page drops what lives in the document only: the name
  of a chosen file and a target that he typed but did not confirm.
- Known and not new: a press on Export right after an edit of the
  target can be lost to the redraw. The menu does not have this
  fault, because the header stays.
- The focus mark shows on a page heading after a move by keyboard.
- The widths are measured on macOS only.
- Michael approved a sketch where only Today was on a sheet. With
  pages, each page has a sheet. The hand-off report shows it.

## Rollback

Revert the merge commit of PR 3 to return to one page in the Pond
mist look. Revert PR 2 also to return to the Informant look. No
saved data changes, because the storage format and the logic do not
change.

## Review log

Three Sonnet reviewers read the first draft: correctness with
accessibility, tests, and styles with security. They found 6
blockers and about 20 major items. All are fixed in this version.

- Blockers: present tests broke with no name in the plan, and Task 2
  of the draft could not end with a passing run. Fix: each changed
  or deleted test has its name in a task, and the basic route code
  lands in the same task as the split.
- The pages came first in the draft. That state needed throwaway
  styles in the old look and had white text on a white ground. Fix:
  the look comes first.
- A redraw rebuilt the header and the notices. A press on a menu
  link could be lost, and a screen reader read each notice again.
  Fix: both stay in the document.
- The import error followed the user to each page. Fix: Settings
  only.
- Focus order, a same-page hash change, and the unknown page id had
  no rule. Each has one now.
- The rating buttons did not fit under 408 pixels, and the menu had
  no numbers. Both have numbers now.
- The border color failed 3 to 1 on a hover ground. It is darker
  now, and the test covers the hover and active grounds.
- `--focus` was a copy of `--accent`. It is gone.
- More contrast pairs, the forced-colors dot, the hints tied to
  their controls, and the heading ids from the page id.

A fourth reviewer read the revised plan, because the first round
found blockers. It found 3 blockers and 5 major items. All are fixed:

- Task 1 lists each render file, and the dot stays a square until
  Task 2 allows a radius.
- The focus contrast test has a name and reads `accent`.
- The `serif` rule allows `sans-serif`.
- Task 5 removes the rail and builds no menu.
- Task 6 lists each file and names each test with its counts.
- The root keeps its three nodes, and a test makes sure of it.

Rejected, with reasons:

- A second style sheet now. `index.html` must not change. The plan
  has a stop rule in its place.
- No scroll to the top on the Back button. One rule for each page
  change is simpler, and each page is short above the fold.
- A fix for the lost Export press. The fault is not new, and the fix
  needs a change of the focus logic that this plan does not touch.
