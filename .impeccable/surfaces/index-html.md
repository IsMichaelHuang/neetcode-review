---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["styles.css","src/render.js"]
---

# Surface brief: the review page

Scope: `index.html`, the one HTML file. It shows four pages by hash
route: Today, Topics, Problems, and Settings. Mode: Operate.

## Task

The owner opens the page one time each day at a laptop, next to
neetcode.io. He reads what to solve now, solves it in the other tab,
returns, and rates the result. He starts the first problem in a few
seconds.

## Content

- Today: the list for today, with three rating buttons and the
  button for the old solution for each problem
- Topics: a summary for each topic
- Problems: the table of all 110 problems, with two filters
- Settings: the daily target, export, and import
- on each page: the menu and the notices

## Constraints for this redesign

- Look, layout, and the split into pages. Each function, each
  rule, and each label meaning stays.
- The content security policy stays as it is, so the page uses system
  fonts and no image from another host.
- The page keeps a light scheme and a dark scheme that follow the
  system setting.
- The id of each control stays, because the keyboard focus depends
  on it.

## Direction contract

THESIS: The page is a quiet pond. The work of today lies on one
clear sheet, and all other content recedes into the mist. It refuses
the dashboard of cards, progress rings, and alarm colors.

OWN-WORLD: A misty blue-green ground and a near-white sheet with
round corners. All text is in the system sans face, from regular to
semibold. Bold marks only the most overdue status. Each control is a pill. A rating is a small color dot and a
word: pine green for Clean, amber brown for Struggled, muted brick
for Failed. Each topic has a round chip with a code letter. No band
and no shadow. Lines are thin and soft. The dark scheme is the pond at night: a
green-black ground and a raised dark sheet.

STORY: He reads row 1 on the sheet, opens the problem, returns, and
presses one pill. The pill fills with its color, and the row says
"done".

FIRST VIEWPORT: The window is 1440 by 900. The name is at the left
in the pond accent color. The menu of four pills is at the right. Both are on
the ground. The pill of the current page has the sheet ground. Below,
one sheet holds the page. On Today the sheet holds the head "Today"
with the date and the done count, then one row for each problem:
number, title, topic chip and name, level, status, the solution
button, and the three rating pills at the right end. The primary
action is the group of rating pills.

FORM: Pond mist. The owner pinned the direction, so no roll ran.
seed: none (pinned). His words: "Go with the 'zen' vibe" and "I
like, pond mist". The signature move is the one sheet on the mist
ground, one for each page. The signature interaction: a press on a
rating pill fills it with its color. Motion: a hover changes the ground of a control
in 150 milliseconds. Nothing moves on load or on a press, because
the page redraws after each action.

FINISH: `unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance`

## Unresolved

None.
