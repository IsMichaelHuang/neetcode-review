---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["styles.css","src/render.js"]
---

# Surface brief: the review page

Scope: `index.html`, the only page. Mode: Operate.

## Task

The owner opens the page one time each day at a laptop, next to
neetcode.io. He reads what to solve now, solves it in the other tab,
returns, and rates the result. He starts the first problem in a few
seconds.

## Content

- the list for today, with three rating buttons for each problem
- the button for the old solution
- a summary for each topic
- the table of all 110 problems, with two filters
- the daily target, export, import, and the notices

## Constraints for this redesign

- Look and layout only. Each function, each rule, and each label
  meaning stays.
- The content security policy stays as it is, so the page uses system
  fonts and no image from another host.
- The page keeps a light scheme and a dark scheme that follow the
  system setting.
- The id of each control stays, because the keyboard focus depends
  on it.

## Direction contract

THESIS: The page is the yearbook of his own games. Each review is one
annotated entry, and one symbol says how it went. It refuses the dark
dashboard of cards and progress rings.

OWN-WORLD: An ultramarine band is the cover. Below it is ink on
paper: ruled tables with hairlines, no card, no rounded panel, no
shadow. Titles are in a serif face. Labels are bold sans capitals.
Each topic has a black square with a white code letter. Each rating
has a filled square with a symbol: "!" for Clean in green, "!?" for
Struggled in amber, "?" for Failed in red. The dark scheme keeps the
band and puts paper-white ink on a blue-black ground.

STORY: He reads row 1 of Today, opens the problem, returns, and
presses one symbol. The row then carries its annotation.

FIRST VIEWPORT: At 1440 by 900, the band is 64 pixels high. The name
is at the left. The daily target, Export, and Import are at the
right. The left two thirds hold the head "Today" with the date and
the done count, then one ruled row for each problem: number, title,
topic code and name, level, status, the solution button, and the
three rating buttons at the right end. The head "All problems" with
both filters and the first table rows follow on the same screen. The
right third holds the topic index: code, topic, reviewed count, and
weak count. The primary action is the group of rating buttons.

FORM: Informant Notation, candidate 5 of 7 on the grounded list.
seed:86b4cf2e101db3a4. The signature move is the annotation symbols
with the coded topic index. The signature interaction: a press on a
rating puts its symbol into the status of the row. Motion: a hover
changes the ground of a control in 150 milliseconds. Nothing moves
on load or on a press, because the page redraws after each action.

FINISH: `unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance`

## Unresolved

None.
