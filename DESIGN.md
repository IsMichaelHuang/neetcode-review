---
name: NeetCode Review
description: Ink on paper under an ultramarine band, with rating symbols.
colors:
  paper: "#ffffff"
  ink: "#14110f"
  ink-2: "#4a4744"
  rule: "#c9c7c2"
  cover: "#1d3fbf"
  on-cover: "#ffffff"
  clean: "#177043"
  struggled: "#8a5200"
  failed: "#b71c1c"
  focus: "#1d3fbf"
  paper-dark: "#0f1320"
  ink-dark: "#f2f0ea"
  ink-2-dark: "#b9b6ae"
  rule-dark: "#3a4058"
  clean-dark: "#5fd08f"
  struggled-dark: "#f0b24a"
  failed-dark: "#ff8f85"
  focus-dark: "#9db4ff"
typography:
  name:
    fontFamily: "Charter, Palatino, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  section-head:
    fontFamily: "Charter, Palatino, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.1
  entry-title:
    fontFamily: "Charter, Palatino, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
  small:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.06em"
  code:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: "0"
spacing:
  pad: "1rem"
  pad-wide: "2rem"
  entry-y: "0.75rem"
  section-gap: "2.5rem"
  rail: "18.5rem"
  content-max: "76rem"
components:
  band:
    backgroundColor: "{colors.cover}"
    textColor: "{colors.on-cover}"
    height: "64px"
    padding: "0.75rem 1rem"
  button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.625rem"
  band-button:
    backgroundColor: "{colors.cover}"
    textColor: "{colors.on-cover}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.625rem"
  rating-button-clean:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.clean}"
    rounded: "{rounded.none}"
    height: "2.125rem"
  rating-button-clean-pressed:
    backgroundColor: "{colors.clean}"
    textColor: "{colors.paper}"
  rating-symbol:
    backgroundColor: "{colors.clean}"
    textColor: "{colors.paper}"
    size: "1.375rem"
  topic-code:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    size: "1.375rem"
  entry:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "0.625rem 0"
---

# Design System: NeetCode Review

## Overview

Creative North Star: "Informant Notation"

The page is one Operate surface. It is a daily review list for one owner.
He sits at a laptop with another site open beside it. The window is often
700 to 900 pixels wide. He reads what to solve, solves it elsewhere, comes
back, and presses one rating.

The look is a yearbook of his own games. An ultramarine band is the cover.
Below it is ink on paper with hairline rules. Each review is one annotated
entry. One filled square with a symbol says how it went. The page has no
card, no panel, no image, and no icon.

The page uses system fonts only. The content security policy allows no
font file, no image from another host, and no inline style. The page
follows the system light or dark setting.

Key Characteristics:
- One band, one ink, one paper. Color marks only the band and the ratings.
- Rules do the work of structure. A 3 pixel rule ends a section head.
  A 1 pixel rule ends a row.
- A rating symbol always has its word next to it.
- Square corners everywhere. No shadow. No gradient.
- Fixed sizes in rem from a short scale. No fluid type.
- No authored motion. Hover is a tint in 150 milliseconds.

## Colors

The palette is ink, paper, one blue, and three rating colors. Each color
has a light value and a dark value. The tokens sit in two `:root` blocks
in `styles.css`. Tests in `tests/contrast.test.js` check contrast of text
and focus colors in both schemes.

### Primary
- Cover Ultramarine (#1d3fbf): the band behind the name and the tools.
  Text on it is on-cover white (#ffffff). The blue is the same in the dark
  scheme. In the light scheme it is also the focus outline color.
- Focus Periwinkle (#9db4ff, dark scheme only): the focus outline on the
  dark ground.

### Secondary
- Clean Green (#177043, dark #5fd08f): the Clean rating.
- Struggled Amber (#8a5200, dark #f0b24a): the Struggled rating.
- Failed Red (#b71c1c, dark #ff8f85): the Failed rating, the weak count,
  and error text.

### Neutral
- Paper (#ffffff, dark #0f1320): the page ground. The dark ground is a
  blue-black.
- Ink (#14110f, dark #f2f0ea): text, entry rules, control borders, and the
  topic code square.
- Quiet Ink (#4a4744, dark #b9b6ae): the date, the level, the word "none",
  the word "new", and the legend.
- Index Rule (#c9c7c2, dark #3a4058): the hairlines of the topic index.

### Named Rules
The Hex Home Rule. A hex color appears only in the two `:root` blocks.
Every other rule uses `var(...)` or `color-mix(...)`.

The Word First Rule. Color is a second signal. A state always has a word.

The Band Only Rule. The blue fills the band and nothing else on paper.

## Typography

Display Font: Charter with Iowan Old Style, Palatino, Georgia, and serif
as fallback.
Body Font: system-ui with the platform sans fallbacks.
Label and Mono Font: labels use the body face in bold capitals. Old
solutions use ui-monospace with Menlo and Consolas as fallback.

Character: a serif for names and titles gives the page a printed feel.
Bold sans capitals label the columns and the fields. Numbers use
tabular figures.

### Hierarchy
- Section head (serif, 700, 1.875rem, 1.1): Today, Topics, All problems.
- Name (serif, 700, 1.5rem, 1.2): "NeetCode Review" in the band.
- Entry title (serif, 700, 1.1875rem): a problem title in Today. The done
  count uses the same size in sans bold.
- Body (sans, 400, 1rem, 1.4): table titles and base text.
- Small (sans, 400, 0.875rem): buttons, topic names, level, status, index
  rows, and table cells.
- Label (sans, 700, 0.75rem, 0.06em, capitals): column heads, field
  labels, table heads, and the topic code letter.
- Code (mono, 400, 0.875rem): the old solution inside a bordered box.

### Named Rules
The Short Scale Rule. Only these sizes exist in rem: 0.75, 0.875, 1,
1.1875, 1.5, and 1.875. A test reads the sizes in `styles.css`.

The Native Weight Rule. Weights run 400, 600, 700, 800, and 900. The
urgency classes use 600 to 900 to show how late a problem is. A system
face can show 800 and 900 as 700. The status text carries the meaning.

## Layout

The page is one grid on `main#app`. A gutter, a content column of at most
76rem, a gap, a rail column, and a second gutter make the columns. The
side pad is 1rem under 720 pixels and 2rem from 720 pixels. The band
spans all columns. Its text lines up with the page content through
`--wide`, which is 76rem and 96rem at 1440 pixels or more. Space below
the page is 3rem on `main`. Sections have a top margin of 2.5rem.

Four layouts depend on the viewport width.
- 1440 pixels or more: two columns. Today and All problems sit at the
  left. The topic index sits at the right in a rail of 18.5rem with a
  gap of 1.5rem. An entry is one row.
- 1200 to 1439 pixels: one column in the order Today, Topics, All
  problems. An entry is one row. The topic index flows in columns of
  18.5rem.
- 720 to 1199 pixels: one column. An entry has two lines. Line 1 holds
  the number, the title, the level, and the status. Line 2 holds the
  topic, the solution button, and the three rating buttons.
- Under 720 pixels: one column. An entry is stacked. The three rating
  buttons share the width in equal tracks. Under 480 pixels the rating
  symbol sits above its word.

The direction contract gives the topic index the right third of a 1440
pixel screen. The built rail is 18.5rem, about one fifth. The narrower
rail gives the entry title more width.

At 1200 pixels or more, the Today section owns seven tracks:
`1.5rem minmax(12rem, 1fr) 9rem 3.75rem 9rem 5rem max-content`. The column
heads, the list, and each entry use a subgrid on those tracks. A shown
solution spans all tracks in a row of its own.

Measured numbers from the browser pass. At exactly 1440 pixels the title
track is 206 pixels. The longest title has 57 characters and takes three
lines. It takes two lines at 1200 and at 720 pixels, and one line at 900
pixels. The rating group is 311 pixels at 1440. The index name track is
185 pixels at 1440.

Text children have `min-width: 0`. Titles and names wrap anywhere. A rating
word never wraps.

Open item: at 375 pixels the table of all problems scrolls sideways inside
its wrapper, and one column is cut at the screen edge. The design review
left this open. The owner decides the fix.

Spacing rhythm: 0.25rem inside buttons, 0.375rem and 0.5rem between small
parts, 0.75rem between an entry and its rule, 2.5rem between sections.

## Elevation & Depth

The page is flat. It has no shadow and no gradient. Rules, borders, and
the band show structure. Fills show state. Nothing floats, and nothing
overlaps.

### Named Rules
The Flat Paper Rule. Do not add `box-shadow`, a gradient, or a blur. When one
appears, a test in `tests/static.test.js` fails the build.

## Shapes

Every corner is square. Controls set `border-radius: 0`. A test fails on
any other radius, even as a longhand. Borders carry the form.
- Section head: a 3 pixel rule in ink below it.
- Entry and table row: a 1 pixel rule in ink.
- Index row: a 1 pixel rule in Index Rule.
- Control on paper: a 1 pixel border in ink.
- Control on the band: a 2 pixel border in on-cover.
- Rating button: a 2 pixel border in its rating color.
- Notice: a 1 pixel border in ink. Old solution box: a 1 pixel border in
  ink, at most 24rem high, with its own scroll.

The recurring forms are two small squares. The topic code is 1.375rem. The
rating symbol is 1.375rem, and 1.875rem inside a rating button from 480
pixels.

## Components

### Band
- A flat ultramarine bar at least 64 pixels high. The name is at the
  left. The daily target, Export, and Import ratings are at the right.
- The tools wrap on narrow windows. The target field is on a paper
  ground with ink text. The buttons are clear with white text and a 2 pixel
  white border. The file button follows the same look.

### Buttons and fields
- Shape: square. Padding 0.25rem 0.625rem. Text 0.875rem. Border 1 pixel
  in ink. Ground is paper.
- Hover: the ground becomes a 10 percent mix of the control color into its
  ground, in 150 milliseconds with ease-out.
- Active: a 20 percent mix. No other state change exists.
- Focus: a 3 pixel outline in the focus color with a 2 pixel offset. On the
  band the outline is on-cover.
- Selects and the number input keep their native arrows. The number input
  is 4.5rem wide and bold. No control is ever disabled.

### Rating buttons
- Three buttons in one group: Clean, Struggled, Failed. Each has a symbol
  square and its word. "!" is Clean, "!?" is Struggled, "?" is Failed.
- Look: a 2 pixel border and the word in the rating color. The symbol
  square is filled with the rating color and holds the symbol in paper.
- Pressed: the whole button fills with the rating color. The word turns
  paper. The symbol square turns paper with the symbol in the rating
  color. A pressed button does not change on hover.
- From 480 pixels the symbol block touches the border, and the word has
  0.5rem of space at the right. Under 480 pixels the symbol sits above the
  word.
- Under `forced-colors: active` a pressed button has a 4 pixel border.

### Entry
- One ordered list item for each problem. Parts: number, title as a link,
  topic code and name, level, status, a Solution button, and the rating
  group.
- The status shows urgency by weight. Due today is 600. One to two days is
  700. Three to six days is 800. Seven or more days is 900. A new entry is
  Quiet Ink. A done entry is bold in its rating color with its symbol.
- A press on a rating puts its symbol in the status of the row.

### Topic index
- One row for each topic: code square, name, "reviewed of total", and the
  weak count in Failed Red. A zero weak count has `opacity: 0` and still
  reads aloud.
- Topic code letters follow the alphabetical order of the topics. The
  letters run A to Z, then AA, AB, and so on.

### Table of all problems
- A ruled table with capital label heads. Only the title cell wraps. The
  table has a minimum width of 36rem inside a wrapper that scrolls
  sideways. The last rating shows its symbol and word. A missing value
  shows "none" in Quiet Ink.

### Notice and error
- A notice is a ruled box with 1 pixel ink border. An error is bold in
  Failed Red.

### Old solution
- Hidden until the owner asks. Then a bordered monospace box that spans the
  entry. A link to other submissions follows it.

## Do's and Don'ts

### Do:
- Do show a rating as a symbol and a word. The words are Clean,
  Struggled, and Failed.
- Do keep topic code letters in the alphabetical order of the topics.
- Do put every color in the two `:root` blocks and use `var(...)` after
  that.
- Do keep the sizes of the short scale.
- Do keep hover as a 10 percent tint in 150 milliseconds and active as a
  20 percent tint.
- Do keep `transition: none` under `prefers-reduced-motion: reduce`.
- Do give each new class a selector. A test in `tests/styles.test.js`
  checks it.
- Do keep each control reachable by keyboard with the 3 pixel focus
  outline.
- Do keep text contrast at 4.5 to 1 or more in both schemes.

### Don't:
- Do not use a radius, a shadow, or a gradient.
- Do not add `@font-face`, `@keyframes`, a font file, an image, or an
  inline style. The content security policy blocks them.
- Do not add authored motion. The page redraws after each action, so
  nothing moves on load or on a press.
- Do not use color as the only signal for a state.
- Do not use the ultramarine for a fill on paper.
- Do not add `!important`.
- Do not turn the page into cards, rings, or a dashboard.
- Do not use the look or the logo of NeetCode.
