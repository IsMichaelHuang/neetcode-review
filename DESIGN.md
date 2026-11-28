---
name: NeetCode Review
description: One sheet for each page on a misty ground, with pills and dots.
colors:
  paper: "#e9f0ef"
  sheet: "#fbfdfc"
  ink: "#1d2b2e"
  ink-2: "#4d5f62"
  rule: "#d6e0de"
  edge: "#6f7f80"
  accent: "#2c6769"
  clean: "#256a4c"
  struggled: "#7c5512"
  failed: "#a23f3c"
  paper-dark: "#131c1d"
  sheet-dark: "#1b2728"
  ink-dark: "#e4ecea"
  ink-2-dark: "#a3b3b2"
  rule-dark: "#2c3a3b"
  edge-dark: "#7f9192"
  accent-dark: "#7fc0bf"
  clean-dark: "#78c79d"
  struggled-dark: "#e0b164"
  failed-dark: "#ea928b"
typography:
  name:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.2
  section-head:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
  entry-title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 500
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
  code-letter:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1
  code:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  pill: "999px"
  round: "50%"
  sheet: "1.25rem"
  box: "0.75rem"
spacing:
  pad: "1rem"
  pad-wide: "2rem"
  sheet-pad: "1.5rem"
  entry-y: "1rem"
  index-column: "18.5rem"
  content-max: "76rem"
  settings-max: "36rem"
components:
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "1.5rem"
  menu-link:
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.75rem"
  menu-link-current:
    backgroundColor: "{colors.sheet}"
  button:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.875rem"
  rating-button-clean:
    textColor: "{colors.clean}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.875rem 0.375rem 0.75rem"
  rating-button-clean-pressed:
    backgroundColor: "{colors.clean}"
    textColor: "{colors.sheet}"
  rating-dot:
    backgroundColor: "{colors.clean}"
    rounded: "{rounded.round}"
    size: "0.625rem"
  topic-code:
    textColor: "{colors.ink}"
    typography: "{typography.code-letter}"
    rounded: "{rounded.round}"
    size: "1.375rem"
  notice:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.box}"
    padding: "0.875rem 1rem"
  solution-box:
    backgroundColor: "{colors.paper}"
    typography: "{typography.code}"
    rounded: "{rounded.box}"
    padding: "0.875rem 1rem"
---

# Design System: NeetCode Review

## Overview

Creative North Star: "Pond Mist"

The site is one Operate surface for one owner. It has four pages in one
HTML file: Today, Topics, Problems, and Settings. He sits at a laptop
with another site open beside it. He reads what to solve, solves it
elsewhere, comes back, and presses one rating.

The look is a quiet pond. The ground is a misty blue-green. Each page
shows one section on one near-white sheet with round corners. The name,
the menu, and the notices sit on the ground. The dark scheme is the pond
at night: a green-black ground and a raised dark sheet. Both schemes
follow the system setting. The site uses system fonts only.

Key Characteristics:
- One sheet on the ground for each page.
- Each control and each menu link is a pill. Each small mark is a circle.
- A rating is a color dot and a word.
- Color is rare: one accent and three rating colors.
- Thin lines in a soft tone separate rows. No band, no shadow, no gradient.
- Fixed sizes in rem from a short scale. No fluid type.
- No authored motion. Hover is a tint in 150 milliseconds.

## Colors

The palette is a mist ground, a sheet, two inks, two line tones, one
accent, and three rating colors. Ten tokens exist in each scheme. A test
in `tests/contrast.test.js` checks the contrast in both schemes.

### Primary
- Pond Accent (#2c6769, dark #7fc0bf): the name in the header, the number
  of an entry, the focus outline, and the underline of a link on hover.
  An 18 percent mix into the sheet is the ground of a topic code. A 28
  percent mix is the selection ground.

### Secondary
- Pine Green (#256a4c, dark #78c79d): the Clean rating.
- Amber Brown (#7c5512, dark #e0b164): the Struggled rating.
- Muted Brick (#a23f3c, dark #ea928b): the Failed rating, the weak count,
  and error text.

### Neutral
- Mist (#e9f0ef, dark #131c1d): the page ground and the ground of the old
  solution box.
- Sheet (#fbfdfc, dark #1b2728): the sheet of each page, a notice, the
  current menu link, the ground of each control, and the text on a
  pressed rating button.
- Ink (#1d2b2e, dark #e4ecea): text, links, and menu links.
- Quiet Ink (#4d5f62, dark #a3b3b2): labels, hints, column heads, the
  date, the level, the done count, the legend, "new", and "none".
- Rule (#d6e0de, dark #2c3a3b): the lines between rows.
- Edge (#6f7f80, dark #7f9192): the border of a control and the scrollbar
  thumb.

### Named Rules
The Hex Home Rule. A hex color appears only in the two `:root` blocks.
Every other rule uses `var(...)` or `color-mix(...)`.

The Word First Rule. Color is a second signal. A dot always has its word
next to it.

The One Color Variable Rule. A rating class sets `--c` to its rating
color. The dot, the word, and the button ground all read `--c`.

## Typography

Display Font and Body Font: system-ui with the platform sans fallbacks.
Mono Font: ui-monospace with SF Mono, Menlo, and Consolas as fallback.

Character: one sans face carries all text. Size and weight make the
order. Labels are in normal case with no letter spacing. Numbers use
tabular figures. The site has no serif face.

### Hierarchy
- Section head (600, 1.5rem, 1.2): Today, Topics, Problems, Settings.
- Name (600, 1.375rem, 1.2): "NeetCode Review" in the accent color.
- Entry title (500, 1.1875rem): a problem title in Today.
- Body (400, 1rem, 1.5): base text. Table titles and the done count use
  this size at weight 500.
- Small (400, 0.875rem): controls, menu links, hints, topic names, level,
  status, index rows, table cells, and the legend.
- Label (400, 0.8125rem, Quiet Ink): field labels, the column heads of
  Today, and table heads.
- Code letter (500, 0.75rem, line height 1): the letter in a topic code.
- Code (mono, 400, 0.875rem): the old solution.

### Named Rules
The Short Scale Rule. Only these sizes exist in rem: 0.75, 0.8125, 0.875,
1, 1.1875, 1.375, and 1.5. A test in `tests/static.test.js` reads the
sizes in `styles.css`.

The Four Weights Rule. Weights are 400, 500, 600, and 700. The status of
a due entry steps through them to show how late it is. The status text
carries the meaning.

## Layout

`main#app` has one content column of at most 76rem between two gutters.
A gutter is 1rem under 720 pixels and 2rem from 720 pixels. The header,
the notice area, and the page sit in that column. Space below is 3rem.
`html` has `scrollbar-gutter: stable`, so no page jumps sideways.
The header sits on the ground. The name is at the left, and the menu is
at the right on the same line. Below about 480 pixels the menu wraps
under the name and starts at the left edge.

A page shows one section, and the section is a sheet. The sheet has a top
margin of 1.5rem. The Settings sheet is at most 36rem wide. The topic
index flows in columns of 18.5rem with a gap of 2rem. It shows 3 columns
from 1200 pixels, 2 columns at 900, and 1 column at 480 and less.

An entry of Today depends on the window width.
- From 1200 pixels: an entry is one row.
- From 720 to 1199 pixels: an entry has two lines. Line 1 holds the
  number, the title, the level, and the status. Line 2 holds the topic,
  the Solution button, and the rating group.
- Under 720 pixels: an entry is stacked. The three rating buttons share
  the width in equal tracks with a gap of 0.25rem.
- Under 480 pixels: a rating button shows the dot above the word, with a
  gap of 0.25rem and a padding of 0.375rem 0.25rem.

From 1200 pixels the Today sheet owns seven tracks:
`1.5rem minmax(12rem, 1fr) 9rem 3.75rem 9rem 5rem max-content`. The column
heads, the list, and each entry use a subgrid on those tracks. The column
gap is 0.75rem. A shown solution spans all tracks in a row of its own.
From 720 to 1199 pixels an entry owns six tracks:
`1.5rem minmax(0, 1fr) max-content max-content 3.75rem 9rem`.

Measures in a browser, on all four pages, from 375 to 1700 pixels. The page
body never scrolls sideways. The rating group is 289 pixels wide from 720
pixels. The title track is 355 pixels at 1440, 275 at 1200, and 509 at a
width of 900 pixels. No word in a rating button, a status, or a menu link
wraps. No topic name in the index wraps. A long title breaks anywhere.

Spacing rhythm. Small parts have 0.375rem or 0.5rem between them. Columns
have 0.75rem. An entry has 1rem above and below. An index row has 0.5rem.
A table cell has 0.75rem.

Open items:
- At 375 pixels the table of all problems scrolls sideways inside its
  wrapper. The table has a minimum width of 36rem.
- The measures come from macOS and one browser engine. Other platforms
  use other system fonts, so the widths can differ.

## Elevation & Depth

The site is flat. It has no shadow and no gradient. Tone shows depth. The
sheet is lighter than the ground in the light scheme. In the dark scheme
the sheet is a raised tone above a darker ground. The solution box has
the ground tone, so it reads as a hollow in the sheet. Nothing floats.

### Named Rules
The Tone Not Shadow Rule. Do not add `box-shadow`, a gradient, or a blur.
A test in `tests/static.test.js` fails on each of them.

## Shapes

Every form is round. Four radius values exist, and a test fails on any
other value.
- Pill (999px): each button, select, number input, file button, and menu
  link.
- Circle (50%): the rating dot and the topic code.
- Sheet (1.25rem): the sheet of each page.
- Box (0.75rem): a notice and the old solution box.

Lines are thin and soft.
- Entry, index row, table row, and the column heads of Today: a 1 pixel
  line in Rule below. The last entry of Today has no line.
- Control: a 1 pixel border in Edge.
- Rating button, menu link, sheet, notice, and solution box: no border.
- A section head has no line under it.

## Components

### Sheet
- Each page section. Ground is Sheet. The radius is 1.25rem. The padding
  is 1.5rem from 720 pixels and 1rem under 720 pixels.
- The head holds the page heading. Today adds the date and the done
  count, Topics the legend, and Problems the two filters, at the right.

### Navigation
- Four hash routes: Today (`#/`), Topics (`#/topics`), Problems
  (`#/problems`), and Settings (`#/settings`).
- The menu is a row of four pill links with a gap of 0.25rem. A link has
  Ink text at 0.875rem, a padding of 0.375rem 0.75rem, and no underline.
- Hover: a 60 percent mix of Sheet into Mist, in 150 milliseconds.
- Current page: the ground is Sheet and the weight is 600.
- After a change of page the window scrolls to the top. The page heading
  takes the keyboard focus and shows no focus ring.

### Buttons and fields
- Shape: a pill. Padding 0.375rem 0.875rem. Text 0.875rem in Ink. Ground
  is Sheet. Border 1 pixel in Edge.
- Hover: an 8 percent mix of Ink into Sheet, in 150 milliseconds, ease-out.
- Active: a 14 percent mix. No other state change exists.
- Focus: a 2 pixel outline in the accent color with a 3 pixel offset.
- Selects and the number input keep their native arrows. The number input
  is 4.5rem wide at weight 500. The file input is 13.5rem wide.
- A label sits above its field on Settings. In the table filters it sits
  at the left of its field.
- Settings holds the daily target, Export, and Import ratings in one
  column with 1.5rem between them. Each has a hint line below it in
  Quiet Ink at 0.875rem.

### Rating buttons
- Three pills in one group: Clean, Struggled, Failed. Each has a dot and
  its word with a gap of 0.5rem.
- Look: no border. The ground is an 11 percent mix of the rating color
  into Sheet. The word is in the rating color, weight 600. Hover is 20%.
- Pressed: the pill fills with the rating color. The word and the dot
  turn Sheet. A pressed pill does not change on hover or on a press.
- Under `forced-colors: active` a rating button has a 1 pixel border and
  a pressed one has a 3 pixel border. The dot keeps its own color.
- Keys 1, 2, and 3 press the buttons of the entry that holds the focus.

### Entry
- One ordered list item for each problem. Parts: number, title link, topic
  code and name, level, status, Solution button, and the rating group.
- The number is in the accent color at weight 500.
- The title of a done entry is in Quiet Ink at weight 400.
- The status shows urgency by weight. Due today is 400. One to two days
  is 500. Three to six days is 600. Seven or more days is 700.
- A status of "new" is in Quiet Ink. A done entry shows the dot and
  "done" with the rating word, in the rating color at weight 600.

### Links
- Ink text with a 1 pixel underline and an offset of 3 pixels. The
  underline is a 50 percent mix of Ink into Sheet, at 3 to 1 or more on
  the sheet. It is softer than the Edge border of a control. On hover it
  takes the accent color. A visited link looks the same.

### Topic index
- One row for each topic: code circle, name, "reviewed of total", and the
  weak count in Muted Brick at weight 600. A zero weak count has
  `opacity: 0` and still reads aloud.
- The code circle has an 18 percent accent tint and an Ink letter. The
  letters follow the order of the topics: A to Z, then AA, AB, and so on.

### Table of all problems
- A table on the Problems sheet with label heads in normal case. Only the
  title cell wraps. A wrapper scrolls the table on a narrow window.
- The last rating shows its dot and word. A missing value shows "none"
  in Quiet Ink.

### Notice and error
- Notices have their own area between the header and the sheet, on every
  page. A notice is a Sheet box with a radius of 0.75rem and no border.
- An error is Muted Brick text at weight 600. The import error shows on
  Settings only.

### Old solution
- Hidden until the owner asks. Then a monospace box spans the entry. Its
  ground is Mist, and its radius is 0.75rem. It is at most 24rem high and
  has its own scroll. A link to other submissions follows it.

## Do's and Don'ts

### Do:
- Do show a rating as a dot and a word. The words are Clean, Struggled,
  and Failed.
- Do keep one sheet for each page. The name, the menu, and the notices
  sit on the ground.
- Do keep the named rules, the short scale, and the four radius values.
- Do keep `transition: none` under `prefers-reduced-motion: reduce`.
- Do give each class a selector. A test in `tests/styles.test.js` checks
  it.
- Do keep each control reachable by keyboard, with the focus outline.
- Do keep text contrast at 4.5 to 1 or more in both schemes.

### Don't:
- Do not add a band, a shadow, a gradient, or a blur.
- Do not add `@font-face`, `@import`, `@keyframes`, a font file, an
  image, or an inline style. The content security policy blocks them.
- Do not add authored motion. Nothing moves on load or on a press.
- Do not use a serif face, capitals for labels, or letter spacing.
- Do not add `!important`.
- Do not turn a page into cards, rings, or a dashboard with alarm colors.
- Do not use the look or the logo of NeetCode.
