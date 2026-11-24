# Pond Mist and Pages: Design

This file belongs to `pond-mist-pages.md`.

## Design: Pond mist

Tokens, one on each line as `--name: #rrggbb;`, in the first `:root`
block and in the dark `:root` block. No other hex color exists. The
file `docs/plans/pond-mist-design.md` holds this table, and
`contrast.test.js` reads it.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--paper` | `#e9f0ef` | `#131c1d` | page ground |
| `--sheet` | `#fbfdfc` | `#1b2728` | the sheet, control ground |
| `--ink` | `#1d2b2e` | `#e4ecea` | text |
| `--ink-2` | `#4d5f62` | `#a3b3b2` | labels, date, level, "new" |
| `--rule` | `#d6e0de` | `#2c3a3b` | lines between rows |
| `--edge` | `#6f7f80` | `#7f9192` | borders of controls |
| `--accent` | `#2c6769` | `#7fc0bf` | name, numbers, focus mark |
| `--clean` | `#256a4c` | `#78c79d` | Clean |
| `--struggled` | `#7c5512` | `#e0b164` | Struggled |
| `--failed` | `#a23f3c` | `#ea928b` | Failed |

Type: the system sans face for all text, and the mono face for the
old solution. No serif. Weights 400, 500, 600, and 700. Sizes in
rem, and no other size: 0.75 (code letter), 0.8125 (labels, column
heads), 0.875 (controls, topic, level, status, table cells, hints),
1 (body, table titles, count), 1.1875 (entry titles), 1.375 (the
name), 1.5 (section headings). Body line height 1.5. Labels are in
normal case with no letter spacing.

Shapes: a radius is one of `999px` (controls, menu links), `50%`
(dots, code circles), `1.25rem` (the sheet), `0.75rem` (the solution
box, a notice). No `box-shadow`, gradient, `@font-face`, `@import`,
`url(`, `@keyframes`, or `!important`.

Layout of the look, on the one page:

- The rule with the selector `main` keeps its grid, its bottom
  space of 3rem, and its window layouts. `--pad` is 1rem, and 2rem
  from 720 pixels. The 1440 layout keeps the rail until Task 5.
- The header `.top` sits on the ground with no band. The name is at
  the left in `--accent`. The tools are at the right, as now.
- Today is a sheet: ground `--sheet`, radius 1.25rem, padding 1.5rem
  (1rem under 720 pixels). Topics and the table stay on the ground.
- Today keeps three entry layouts: one row from 1200 pixels, two
  lines from 720 to 1199, stacked under 720. The rule text
  `@media (min-width: 720px) and (max-width: 1199.98px)` stays. The
  track widths start from the present values. The main agent
  measures them in the browser.

Controls and states:

- Button, select, number input, file button: ground `--sheet`, text
  `--ink`, a 1 pixel border in `--edge`, a pill, padding 0.375rem
  0.875rem. Hover: 8 percent `--ink` mixed into `--sheet`. Active:
  14 percent. Native arrows stay. The file input text is `--ink`.
- Rating button: no border, ground 11 percent of the rating color
  mixed into `--sheet`, the word in the rating color with weight
  600, a dot of 0.625rem, a gap of 0.5rem, padding 0.375rem 0.875rem
  0.375rem 0.75rem. Hover: 20 percent. Pressed: ground the rating
  color, word and dot in `--sheet`, no change on hover. The word
  names the button, so it needs no border. Under 480 pixels: three
  equal buttons, the dot above the word, a gap of 0.25rem, padding
  0.375rem 0.25rem.
- Status: "new" in `--ink-2`. A done row has the dot and the word in
  the rating color, weight 600. Due steps use weights 400, 500, 600,
  and 700.
- Number in a Today row: `--accent`, weight 500. Topic code: a
  circle of 1.375rem, ground 18 percent `--accent` mixed into
  `--sheet`, letter in `--ink`.
- Lines between rows are 1 pixel in `--rule`. The last row of Today
  has none. A section heading has no rule under it.
- `.weak` is `--failed`, weight 600. `.weak.nil { opacity: 0; }`
  stays.
- Link: `--ink` with a 1 pixel underline in `--edge`. Hover: the
  underline is `--accent`.
- Focus: a 2 pixel outline in `--accent` with a 3 pixel offset.
- Selection: 28 percent `--accent` mixed into `--sheet`, text
  `--ink`. The scrollbar uses `--edge` on `--paper`.
- The solution box: ground `--paper`, radius 0.75rem, no border.
- A notice: ground `--sheet`, radius 0.75rem. An error: `--failed`,
  weight 600.
- Transition: `background-color` in 150 milliseconds, `ease-out`.
  Under `prefers-reduced-motion: reduce`: none.
- Under `forced-colors: active`: a rating button has a 1 pixel
  border, a pressed one has a 3 pixel border, and `.dot` has
  `forced-color-adjust: none`.

Class changes: `sym` and `sym-<rating>` become `dot` and
`dot-<rating>`, and the element has no text. `cover` becomes `top`.

## Design: pages

New pure module `src/pages.js`:

- `PAGES`, a frozen list of frozen items with `id`, `hash`, and
  `label`: `today "#/" "Today"`, `topics "#/topics" "Topics"`,
  `problems "#/problems" "Problems"`, `settings "#/settings"
  "Settings"`. The heading of a page has the id `<id>-h`.
- `pageOf(hash) -> id`. It compares with `===` against each `hash`.
  Every other value gives `today`.
- `titleOf(id) -> string`. Today and an unknown id give "NeetCode
  Review". Each other page gives "<label> · NeetCode Review".

`render(root, view, on, page = "today")`. An id that is not in
`PAGES` counts as `today`. The first render builds three children of
the root. Each later render keeps the first two nodes.

```
header.top                kept across renders
  h1                      "NeetCode Review"
  nav.menu [aria-label="Pages"]
    a#nav-<id> [href=<hash>]   label, one for each page.
              aria-current is "page" on the current link and
              "false" on each other link. A render updates it.
div.notes                 kept across renders, also when empty
  p.notice [role=status]  one for each notice
  p.error [role=alert]    the import error, on Settings only
div.page                  a render replaces its one child
  section, by page:
  today     section.today     as now, without notices and the error
  topics    section.topics    as now
  problems  section.problems [aria-labelledby=problems-h]
                              the table section, h2 "Problems"
  settings  section.settings [aria-labelledby=settings-h]
    div.head     h2#settings-h "Settings"
    div.setting  div.field: label "Daily target" + input#target
                   [aria-describedby=target-hint]
                 p.hint#target-hint "The number of problems on the
                   Today page, from 1 to 10."
    div.setting  button#export [aria-describedby=export-hint]
                 p.hint#export-hint "Download your ratings as a
                   file."
    div.setting  div.field: label "Import ratings" + input#import
                   [aria-describedby=import-hint]
                 p.hint#import-hint "Load ratings from a file. The
                   page asks before it replaces your ratings."
```

- After the first render, `render` never changes the children of
  the root. It changes `aria-current`, the children of `div.notes`,
  and the child of `div.page` only.
- A render replaces the children of `div.notes` only if the list of
  class and text pairs differs from the list on screen.
- The fake document has no `firstChild` and no `querySelector`. The
  render code reads `root.children` to find the kept nodes.
- Each page heading `h2` has `tabindex="-1"`.
- Files: `src/render.js` keeps the header, the notes, and `render`.
  New `src/render-settings.js` holds the Settings section.

`src/main.js`:

- `start` takes an optional `win` with `location.hash`,
  `addEventListener`, and `scrollTo`. With no `win`, the page is
  Today.
- `paint` reads `win.location.hash` each time, passes
  `pageOf(hash)` to `render`, and sets `document.title`.
- On `hashchange`, only if the page differs from the last page:
  paint, then `scrollTo(0, 0)`, then focus the heading of the page.
  Every other paint keeps the focus by id, as now.
- The start code at the end of the file passes `win: window`.

Styles for the pages:

- `main#app` has one content column, `minmax(0, 76rem)`. The 1440
  block and the rail are gone. `.tools` is gone.
- `.menu`: a flex row at the right of the header, gap 0.25rem,
  `flex-wrap: wrap`. The name has `flex: none`. A link is a pill of
  0.875rem with padding 0.375rem 0.75rem, `white-space: nowrap`, no
  underline, text `--ink`. Hover: 60 percent `--sheet` mixed into
  `--paper`. The current page: ground `--sheet`, weight 600.
- `.notes` sits between the header and the sheet. It takes no space
  when it is empty.
- Each section is a sheet, 1.5rem below the header. The Settings
  sheet is 36rem wide at most. `.setting` blocks have 1.5rem between
  them. `.hint` is 0.875rem in `--ink-2`.
- The topic index flows in columns of 18.5rem inside its sheet.
