# Phone Layout for the Problems Table Implementation Plan

## Context

At 375 pixels the Problems table scrolls sideways inside its wrapper.
The table has a minimum width of 36rem. The page body does not
scroll, but the table is hard to read on a phone.

**Goal:** Under 720 pixels the Problems table does not scroll
sideways. From 720 pixels the table scrolls in its wrapper as before.

**Non-goals:** No change to the columns, the filters, or the Topics
page. No change to the CSP.

## Decisions

- Split first, in its own commit. The Topic index and Table rules move
  from `styles.css` to a new `lists.css`. `styles.css` has 397 lines,
  so it has no room for the phone rules.
- Moved: `.topics, .problems`, the Topic index rules, the `.legend`
  size rule, and the Table rules. Staying in `styles.css`: the shared
  rules `label, .cols, th`, the color rule with `.legend`,
  `.entry > *, .index li > *`, and the size rule with `td, .index`.
- No moved selector has a later rule for the same property in
  `styles.css`, so the cascade gives the same result.
- `index.html` links `lists.css` after `styles.css`. The CSP does not
  change, because `style-src 'self'` covers both files.
- The phone layout is CSS plus two attributes. Each cell but the
  title gets `data-label` from the `HEADS` constant, never from row
  data. The table parts get explicit roles, so the table keeps its
  meaning when its `display` changes.
- `thead` copies the `.sr` declarations and is not `display: none`, so
  screen readers still read the heads.
- The label is `content: attr(data-label) ": " / ""`. The second value
  hides the text from screen readers where the browser supports it.
  The first `content` is the fallback.

## Acceptance criteria

1. `index.html` links `styles.css`, then `lists.css`.
2. `lists.css` has no `:root` block, no hex color, and no `url(`.
3. Every moved selector is still found in the joined text of both
   files, and none stays in `styles.css`.
4. Each cell but the title has a `data-label` that matches its head.
5. The table, row groups, rows, heads, and cells have explicit roles.
6. The empty row keeps `colspan` and its text.
7. The `lists.css` block for `max-width: 719.98px` sets `min-width: 0`
   on `table` and hides `thead` without `display: none`.

## Changes

- `lists.css`: the moved rules, then the phone block.
- `styles.css`: only the moved rules leave.
- `index.html`: one link line.
- `src/render-lists.js`: `data-label` and roles.
- `tests/helpers.js`: `readCss()` at the end of the file. It joins
  both style files and strips comments.
- `tests/static.test.js`, `tests/styles.test.js`,
  `tests/contrast.test.js`: the CSS readers use `readCss()`. The token
  tests keep reading the `:root` blocks of `styles.css`.
- `PRODUCT.md`: the Accessibility section.
- `DESIGN.md`: the file names for the type scale, the Layout open
  items, and the "Table of all problems" section.

## Tasks

- [x] Task 1, tests first: the split tests fail, the split makes them
      pass, `npm test` and `npm run limits` pass, one commit.
- [x] Task 2, tests first: the render and static tests fail, the
      layout code makes them pass, the docs change, one commit.
- [ ] Task 3, in a browser: check Problems at 375, 719, 720, and 1440
      pixels in the light and the dark scheme. The `.table-wrap`
      `scrollWidth` equals `clientWidth` under 720 pixels. Topics and
      Today do not change.

## Review log

The plan was reviewed by four reviewers before the build. The notes
that apply to this PR:

- The phone block of `lists.css` has the same media query as a block
  in `styles.css`. A test of the phone rules reads `lists.css` alone.
- `readCss()` goes at the end of `tests/helpers.js`, so that a branch
  that adds a helper in the middle merges cleanly.
- The new static tests go right after the data URL test, so that a
  branch that adds a test at the end merges cleanly.
- The roles are explicit, because a table with `display: block` loses
  its meaning in some browsers.

## Rollback

Revert the merge commit. The split and the phone layout come back out
together, and `styles.css` holds all the rules again.

## Verification

- `npm test` and `npm run limits` pass.
- Browser: the layout at the four widths above.

## Four questions

1. Regressions. None found in the browser. At 1440 pixels the Topics
   index and the table compute the same values as before the split.
   At 720 pixels the table is a table again, with no sideways scroll.
   At 375 and 719 pixels the frame does not scroll and no cell passes
   its right edge. The explicit roles repeat the native roles from
   720 pixels, which does no harm. A browser without the `/ ""` form
   of `content` reads a label such as "Topic:" two times.
2. Security. None found. The labels come from the `HEADS` constant
   and reach the page through `setAttribute`. The second stylesheet
   comes from the same site, so the CSP does not change.
3. Efficiency. The page loads one more small CSS file. `styles.css`
   has no room for the rules, so the split is the smaller cost.
4. More tests. None left. The layout checks at 375, 719, 720, and
   1440 pixels ran in a browser on the merge of all four branches.
