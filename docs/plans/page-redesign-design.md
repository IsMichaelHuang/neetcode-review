# Page Redesign: Design

This file holds the design decisions of `page-redesign.md`.

## Design tokens (`styles.css`)

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--paper` | `#ffffff` | `#0f1320` | page ground |
| `--ink` | `#14110f` | `#f2f0ea` | text, rules, control borders |
| `--ink-2` | `#4a4744` | `#b9b6ae` | date, level, "none", "new" |
| `--rule` | `#c9c7c2` | `#3a4058` | hairlines of the topic index |
| `--cover` | `#1d3fbf` | `#1d3fbf` | the band |
| `--on-cover` | `#ffffff` | `#ffffff` | text and borders on the band |
| `--clean` | `#177043` | `#5fd08f` | Clean |
| `--struggled` | `#8a5200` | `#f0b24a` | Struggled |
| `--failed` | `#b71c1c` | `#ff8f85` | Failed |
| `--focus` | `#1d3fbf` | `#9db4ff` | focus outline |

Token format, so that a test can read it:

- The light tokens are in the first `:root { ... }` block. The dark
  tokens are in `:root { ... }` inside
  `@media (prefers-color-scheme: dark)`. Both blocks hold all ten.
- One token on each line, as `--name: #rrggbb;` with six digits.
- No hex color and no `rgb(` appears outside these two blocks. Rules
  use `var(...)` and `color-mix(...)`.
- `:root` keeps `color-scheme: light dark`.

Faces, all system stacks:

- `--serif`: `Charter, "Iowan Old Style", "Palatino Linotype",
  Palatino, Georgia, serif`. Use: the name, section heads, problem
  titles.
- `--sans`: `system-ui, -apple-system, "Segoe UI", "Helvetica Neue",
  Arial, sans-serif`. Use: all other text.
- `--mono`: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`.
  Use: the old solution.

Type scale in rem, fixed, and no other size: 0.75 (column heads and
the caption: bold capitals, letter-spacing 0.06em), 0.875 (labels,
buttons, index, table cells), 1 (body, table titles), 1.1875 (entry
titles, the done count), 1.5 (the name), 1.875 (section heads).
Numbers use `tabular-nums`.

Rules of the look:

- No rounded corner, no `box-shadow`, no gradient, no `@font-face`,
  no `@keyframes`, no `!important`. Controls set
  `border-radius: 0` and `font: inherit`.
- A section head has a 3 pixel rule in `--ink` below it. Today rows
  and table rows have a 1 pixel rule in `--ink`. Index rows have a
  1 pixel rule in `--rule`.
- A topic code is a square of 1.375rem in `--ink` with the letter in
  `--paper`, bold, 0.75rem.
- A symbol (`.sym`) is a square of 1.375rem filled with its state
  color, with the symbol in `--paper`, in the serif face, bold.
- One rule sets the color of a rating: `.rate-clean, .sym-clean,
  .done-clean { --c: var(--clean) }`, and the same for the other two.
- A rating button: a 2 pixel border in `--c`, then the symbol, then
  the word in `--c`. Pressed: ground `--c`, word in `--paper`, and
  the symbol square turns to `--paper` with the symbol in `--c`.
- Other controls on paper (the solution button, the selects): ground
  `--paper`, text `--ink`, a 1 pixel border in `--ink`. Selects and
  the number input keep their native arrows.
- Controls on the band: a 2 pixel border in `--on-cover`. Buttons
  and the file button are clear with text in `--on-cover`. The
  number input has the ground `--paper` and text `--ink`. The band
  sets `color: var(--on-cover)`.
- States. Hover: a ground of 10 percent of the control color mixed
  into its ground, in 150 milliseconds, `ease-out`. Active: 20
  percent. A pressed button does not change on hover. Under
  `prefers-reduced-motion: reduce`: `transition: none`. No control
  is ever disabled, so no disabled look exists.
- Nothing moves on load or on a press, because the page redraws
  after each action. The page has no authored motion.
- Links are in `--ink` with a 1 pixel underline and a 3 pixel
  offset. Hover: a 2 pixel underline. Visited links look the same.
- Focus: a 3 pixel outline in `--focus` with a 2 pixel offset. On
  the band the outline is `--on-cover`.
- Under `forced-colors: active`, a pressed button has a 4 pixel
  border.
- Status looks: `kind-new` is `--ink-2`. `done-<rating>` is `--c`,
  bold. `due-0` to `due-3` are `--ink` with weights 600, 700, 800,
  and 900. Color is never the only signal, because the text says the
  state.
- A notice is a box with a 1 pixel border in `--ink`. An error is in
  `--failed`, bold.
- `pre` uses `--mono` at 0.875rem, a 1 pixel border in `--ink`, a
  maximum height of 24rem, and scrolls inside itself.

Looks of the small classes. Each class of the DOM contract has a
selector in `styles.css`:

- `.cover`, `.tools`, `.field`, `.head`, `.filters`, `.today`,
  `.topics`, `.all`, `.cols`, `.entries`, `.entry`, `.sol`, `.rate`,
  `.solution`, `.index`, `.table-wrap`: layout, as in "Layout".
- `.no`: bold, tabular. `.title`: the serif face, bold.
- `.name`: wraps anywhere. `.word`: never wraps.
- `.date`, `.level`, `.legend`, `.more`, `.empty`, `.nil`: `--ink-2`.
- `.count`, `.num`: bold, tabular. `.weak`: `--failed`, bold, and
  with `.nil` it is `--ink-2` and regular.
- `.status`, `.code`, `.sym`, `.notice`, `.error`: as in the rules
  above.
- `.sr`: hidden from the eye with a clip, and still read aloud.

## DOM contract

```
header.cover
  h1                      "NeetCode Review"
  div.tools
    div.field             label[for=target] "Daily target"
                          + input#target [type=number min=1 max=10]
    button#export         "Export"
    div.field             label[for=import] "Import ratings"
                          + input#import [type=file]
section.today [aria-labelledby=today-h]
  div.head
    h2#today-h            "Today"
    p.date                view.todayLabel
    p.count               "1 of 4 done"
  p.notice [role=status]  one for each notice, or none
  p.error [role=alert]    the import error, or none
  div.cols [aria-hidden=true]   only if the queue has an entry
    span x7               "No." "Problem" "Topic" "Level" "Status"
                          "" "How did it go?"
  ol.entries [role=list]        only if the queue has an entry
    li.entry
      span.no             "1"
      span.title          a[href target rel aria-label] title
      span.topic          span.code [aria-hidden=true] "F"
                          + span.name topic
      span.level          difficulty
      span.status <class> span.sym (done rows only) + span.word
      span.sol            button#reveal-<id> "Solution", or empty
      div.rate [role=group aria-label]
        button#rate-<id>-<rating> [aria-pressed aria-label]
          span.sym [aria-hidden=true] "!"  +  span.word "Clean"
      div.solution        pre [tabindex=0] + a, or p.error
  p.empty                 "Nothing to review today." (empty queue)
  p.more                  "<n> more due on later days." (n over 0)
section.topics [aria-labelledby=topics-h]
  div.head
    h2#topics-h           "Topics"
    p.legend [aria-hidden=true]  "reviewed · weak"
  ul.index
    li                    span.code + span.name
                          + span.num: span "3 of 11" + span.sr
                            "reviewed"
                          + span.weak "1 weak" (class nil for 0)
section.all [aria-labelledby=all-h]
  div.head
    h2#all-h              "All problems"
    div.filters           div.field: label "Topic" + select
                          div.field: label "Status" + select
  div.table-wrap > table
    thead   Problem | Topic | Level | Last rating | Next due
    tbody   tr: td.title a
                | td: span.code + span.name
                | td: difficulty
                | td: span.sym + span.word, or span.nil "none"
                | td: span date, or span.nil "none"
            tr.empty: td [colspan=5]
                "No problem matches these filters."
```

Rules:

- Symbols: Clean "!", Struggled "!?", Failed "?". A symbol always has
  its word next to it. Each `span.sym` and each `span.code` has
  `aria-hidden="true"`. `span.sym` also has `sym-<rating>`.
- A rating button has the class `rate-<rating>`.
- `span.status` has one more class: `kind-new`, `done-<rating>`, or
  for a due row `due-0` to `due-3` from `urgency`. Its word is the
  text of today: "new", "due today", "1 day overdue", "<n> days
  overdue", "done: Clean".
- `span.sol` is always there. It is empty if `canReveal` is false.
- A done row shows `span.sym` only for a known rating.
- The `className` of a notice is exactly `notice`, and of an error
  exactly `error`.
- `ul.index li` is a grid, so each span is read as its own item.
- Codes come from `topicCodes(view.topicOptions)`. A topic with no
  code gets no `span.code`.
- The title link has `aria-label="Open on NeetCode: <title>"`. The
  reveal button has `aria-label="Show my old solution: <title>"`.
- `span.sr` is hidden from the eye and read by a screen reader.
- The text "How did it go?" appears one time on the page.

Files: `src/h.js` holds `h`, `outside`, `labelled`, and `select`.
`src/render-today.js` holds the Today section.
`src/render-lists.js` holds Topics and All problems. `src/render.js`
keeps the band and `render`.

## Layout (`styles.css`)

`main#app` is a grid with no padding. Its columns: a gutter of
`minmax(var(--pad), 1fr)`, the left column `minmax(0, 76rem)`, a gap,
the right column, and a second gutter. `--pad` is 2rem, and 1rem
under 720 pixels. The band spans all columns, has a minimum height of
64 pixels, and wraps its controls.

Four layouts by viewport width:

- 1440 pixels or more: two columns. Today and All problems are at
  the left. Topics is at the right, 18rem wide. The gap is 1.5rem.
  An entry is one row.
- 1200 to 1439 pixels: one column in the order Today, Topics, All
  problems. An entry is one row.
- 720 to 1199 pixels: one column. An entry has two lines.
- Under 720 pixels: one column. An entry is stacked.

- Two columns: Topics is in the right column and spans the rows of
  Today and All, with `align-self: start`. The grid rows are
  `auto auto 1fr`, so Topics does not stretch the Today row.
- One column: the topic index flows in columns of 17rem.
- One row (1200 or more): `section.today` owns the tracks
  `2rem minmax(12rem, 1fr) 10.5rem 4.5rem 8.5rem 5.5rem max-content`
  with a column gap of 0.75rem. Each child of the section spans all
  tracks. `div.cols`, `ol.entries`, and each `li.entry` use
  `subgrid` and have no side padding. `div.solution` spans all
  tracks in a row of its own.
- Two lines (720 to 1199): `div.cols` is not displayed. The entry
  is a grid with the tracks
  `2rem minmax(0, 1fr) 10.5rem 4.5rem 8.5rem`. Line 1: number,
  title, topic, level, status. Line 2: `span.sol` and `div.rate`
  both span all tracks of row 2. The solution button is at the left,
  under the title. The rating group is at the right end.
- Stacked (under 720): `div.cols` is not displayed. Lines in DOM
  order: number and title. Topic, level, and status, which wrap. The
  solution button. The rating group with three buttons of
  `minmax(0, 1fr)` and a padding of 0.25rem. Under 480 pixels the
  symbol sits above the word. A word in a rating button never wraps
  (`white-space: nowrap`).
- Every grid and flex child that holds text has `min-width: 0`.
  Titles and names use `overflow-wrap: anywhere`.
- The table sits in a wrapper with `overflow-x: auto`. The page body
  never scrolls sideways.

The width numbers are estimates. The one-row entry needs about 1040
pixels, and the left column at 1440 is 1064 pixels. Task 4 measures
this in the browser. If an entry overflows at 1440, the two-column
breakpoint goes up, and the plan records the change.
