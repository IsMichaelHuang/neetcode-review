# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The page has one user: the owner of this repository. He is a software
developer who prepares for coding assessments.

He sits at a laptop. The review page is in one tab or window, and
neetcode.io is in another. He opens the page one time each day. His
first question is: what do I solve now?

## Product Purpose

The owner solved 110 NeetCode problems. The page makes him solve them
again on a schedule, so that he can write each solution from memory.

Each day the page gives a short list. After each problem he rates his
own result. A problem that went badly returns soon. A problem that
went well returns later.

Success: he opens the page, and he starts the first problem in a few
seconds. After the session, each rating is saved.

## Positioning

The list is his own. It comes from the repository that holds his own
NeetCode submissions, and the schedule comes from his own ratings. A
fixed study list from another product cannot do both.

## Operating Context

One session has these steps:

1. He opens the page and reads the list for today.
2. He opens the first problem on neetcode.io in a second tab.
3. He solves the problem there, from memory.
4. He returns to the page and rates the result.
5. He goes to the next problem.

If he is stuck, he can show his old solution on the page. The page
never shows it before he asks.

Sometimes he also reads the topic summary and the table of all
problems, to see where he is weak.

## Capabilities and Constraints

Functions:

- A list for today. It picks due problems first and new problems after, and
  shows them from Easy to Hard.
- Three ratings: Clean, Struggled, and Failed.
- A daily target from 1 to 10 problems.
- A button that shows his old solution for one problem.
- A summary for each topic, and a table of all problems with a topic
  filter and a status filter.
- Export and import of the ratings as a file.
- Notices for stale data, a failed save, damaged data, and no export
  in the last 14 days.

Terms: a problem is new, due, done, or later. If the last rating of
a problem is Struggled or Failed, the problem counts as weak in its
topic.

Technical constraints:

- The page is static: HTML, CSS, and JavaScript modules. It has no
  dependency and no build step. GitHub Pages serves it.
- A content security policy allows scripts, styles, and images from
  the site itself only. It allows no inline style and no font file.
- Ratings live in the browser storage. The page has no server and no
  account.
- All text from outside reaches the screen as plain text.
- Each file has 400 lines at most, and each line has 80 characters at
  most. Tests come before code.
- The repository is public. No file says how an assessment went, and
  no file names his weak problems.

## Brand Commitments

The name of the page is "NeetCode Review". The page is a personal
tool. It is not a product of NeetCode, and it does not use the logo
or the look of NeetCode.

The voice is plain and short. Labels say what a control does.

## Evidence on Hand

- Real data: 110 problems in `data/problems.json`, with title, topic,
  and difficulty.
- The live page: https://ismichaelhuang.github.io/neetcode-review/
- No logo, no illustration, and no photo exists. Future work must not
  invent testimonials, numbers of users, or results.

## Product Principles

1. The next problem comes first. Other content waits below it.
2. The old solution stays hidden until he asks for it.
3. No rating is lost without a notice.
4. The site stays small: four pages. It does not grow into a study platform.
5. A rating is an honest report. Each rating shows as a word, and
   color is a second signal only.

## Accessibility & Inclusion

- Each control works with the keyboard and shows a clear focus mark.
- Text contrast is 4.5 to 1 or more.
- No meaning depends on color alone.
- The page body does not scroll sideways at a width of 375 pixels.
  The table of all problems scrolls sideways inside its own frame.
- Each control has a name that a screen reader can read.
