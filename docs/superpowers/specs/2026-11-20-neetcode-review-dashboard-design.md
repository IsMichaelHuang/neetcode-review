# NeetCode review dashboard: design

Date: 2026-11-20. Owner: Michael. Status: approved.

## Intent

Michael solved 110 NeetCode problems. He wants to keep them fresh
for coding assessments.

The dashboard makes him redo his old problems on a schedule. A problem
that goes badly comes back soon. A problem that goes well comes back
later. The result is that he can solve them from memory.

## Goals

- Show every problem from his submissions repository on one page.
- Show a short list of problems to redo today.
- Let him rate each redo, and use the rating to set the next date.
- Show which topics are weak.
- Open from a bookmark, with no login and no server.

## Non-goals

- No code editor and no test runner. He solves on neetcode.io.
- No sync between devices. Ratings stay in one browser.
- No automatic detection of a new submission. He must click a rating
  after each redo, so detection saves no step.
- No countdown timer, no streaks, no charts.
- No problems that he did not solve yet.

## Anti-goals

- The page must not show his old solution before he asks for it. A
  visible solution turns a redo into reading.
- The page must not lose ratings without a warning.
- The page must not grow into a study platform. It is one page.

## Constraints

- Source of problems: the public repository
  `IsMichaelHuang/neetcode-submissions-aquuq6h3`. NeetCode owns the
  content of that repository. This project never writes to it.
- Path format in that repository:
  `<topic folder>/<problem id>/submission-<n>.<ext>`.
  Today the topic folders are `Data Structures & Algorithms` (108
  problems) and `SQL` (2 problems).
- The folder name is the NeetCode problem id. The same id is in the
  problem URL. Examples: `duplicate-integer`, `two-integer-sum`,
  `course-schedule`, `sql-customers-without-orders`.
- One problem can have files in two languages. `duplicate-integer`
  has `submission-3.py` and `submission-4.java`.
- The repository does not say which submissions passed.
- The repository has no real solve dates. One bulk sync on 2026-03-29
  added 104 submissions. The schedule cannot use "oldest first".
- The repository has no topic and no difficulty. The public list
  `.problemSiteData.json` in `neetcode-gh/leetcode` has both. Only 51
  of the 110 folder names match that list. 56 more algorithm
  problems need a hand-written name map. `find-the-town-judge` is
  not in the list. It and the 2 SQL problems need manual entries.
- The GitHub API allows 60 requests each hour without a login.
- Every file: 400 lines maximum, 80 characters for each line. Data
  fixtures are exempt.
- All development follows the procedure of the owner: a plan first,
  tests first, a plan review, and a review of each task.

## Approaches

1. GitHub Pages, ratings in the browser. Plain HTML and JavaScript in
   a new repository. Smallest build. Ratings stay in one browser.
2. GitHub Pages, ratings in a file in a GitHub repository. Works on
   all devices. Needs a pasted access token and more code.
3. Local tool on the Mac. Private. He must start it each time.

Michael picked approach 1. It is the smallest build and it opens from
a bookmark. A later move to approach 2 changes only the save step.

Two ideas were dropped. A page in the portfolio mixes a study tool
into a public portfolio. A page in the submissions repository risks a
conflict with the NeetCode sync.

## What Michael decided

- The dashboard covers the problems in his submissions repository.
- The rotation uses his ratings, not a fixed cycle.
- The page lives on GitHub Pages and keeps ratings in the browser.

All other items in this document are proposals from Claude.

## Design

### What he sees

```
NeetCode Review                 Daily target [4]   Export   Import

Today, Fri, Nov 20                              1 of 4 done
 1. Course Schedule      Graphs        Medium    2 days overdue
    [Open on NeetCode]   [Show my old solution]
    How did it go?   [Clean]  [Struggled]  [Failed]
 2. Coin Change          1-D DP        Medium    new
    ...

Topics
 Graphs             7 of 12 reviewed    3 weak
 Trees             11 of 11 reviewed    0 weak
 ...

All problems     Topic [All v]   Status [All v]
 Problem          Topic    Difficulty   Last rating   Next due
```

- "Open on NeetCode" goes to `https://neetcode.io/problems/<id>` in a
  new tab.
  This rule covers the SQL problems too. The builder opens three of
  these links by hand to make sure that the pattern is correct.
- "Show my old solution" loads the file with the highest submission
  number, in any language, and shows it below the row. It stays
  hidden until he clicks. A link to the problem folder on GitHub
  sits next to the code, for the other submissions.
- A problem that he rated today stays in the list for today. Its row
  shows the rating as done. He can pick a different rating on the
  same day, and the new rating replaces the old one.
- If the last rating of a problem is Struggled or Failed, its topic
  counts it as weak.

### Ratings and the schedule

Each problem has a step on this ladder of days: 1, 3, 7, 14, 30, 60.

| Rating    | New step                           | Example           |
|-----------|------------------------------------|-------------------|
| Failed    | First step                         | Back in 1 day     |
| Struggled | Same step, but at least the second | New: back in 3    |
| Clean     | One step up, at least the third    | New: back in 7    |

The next date is today plus the days of the new step. The last step
is 60 days. "Today" is the local calendar date of the browser.

### The list for today

1. Count the problems that he rated today. The open slots are the
   daily target minus that count.
2. Fill the slots with problems that are due, most overdue first.
3. Fill the remaining slots with new problems in the start order.
4. If more problems are due than slots, show the number that waits.

The daily target is a setting from 1 to 10. The default is 4. At 4
each day, the first pass through 110 problems takes 28 days.

### Start order for new problems

Medium first, then Hard, then Easy. Assessments use Medium problems
most. He remembers Easy problems best, so they wait. Inside one
difficulty level, the order rotates through the topics, so two
problems in a row have different topics. A problem with no known
difficulty goes last.

### Data

- `data/problems.json` holds one entry for each known problem: id,
  title, topic, difficulty. A script builds it one time from the
  NeetCode list and the name map. The file is committed.
- The name map links 56 unmatched folder names to their entries in
  the NeetCode list. Title, topic, and difficulty then come from
  the list. `find-the-town-judge` gets a manual entry: title "Find
  the Town Judge", topic "Graphs", difficulty "Easy". All 108
  algorithm problems must have a real topic and a real difficulty.
- The 2 SQL problems get the topic "SQL" and the difficulty
  "Unknown". Their titles come from the folder names.
- On each load, the page asks the GitHub API for the file tree of the
  submissions repository. That is one request. The page keeps the
  last good answer in the browser.
- A folder that is not in `problems.json` still shows. Its title comes
  from the folder name, and its topic is "Unknown". New problems that
  he solves on NeetCode appear this way without a code change.
- If the API request fails, the page uses the last good answer. If
  there is none, it uses `problems.json` alone and shows a notice.
- Old solutions load from `raw.githubusercontent.com`. That host is
  outside the 60 request limit.

### Saved ratings

The browser `localStorage` holds one JSON object: a format version,
the daily target, and for each rated problem its history of dates
and ratings. A problem has one history entry for each day at most.
A new rating removes history entries with a later date. Such entries
exist only after the clock of the device moved back.

The page computes the step and the next date from the history each
time. A changed rating on the same day then needs no undo logic.

The storage key starts with `neetcode-review:`. Other pages on the
same `github.io` address then cannot overwrite it. The page supports
current desktop and phone browsers only.

If the browser cannot read the saved ratings, the page does not
write them. An empty state then cannot replace the saved history.
The page tries the read again before each change. If a read or a
write fails, the page shows a notice, and the change stays on screen
until the next successful read.

Export downloads that object as a file. Import reads such a file and
makes sure that the shape is valid. If the shape is valid, import
asks before it replaces the current ratings. If the shape is bad,
import shows a message and changes nothing.

### Safety

- The page puts all remote text on screen as plain text, never as
  HTML. This covers titles, folder names, and solution code.
- The page holds no token and no secret.
- Each path segment is URL-encoded, because the topic folder has
  spaces and an ampersand.

### Stack

- Plain HTML, CSS, and JavaScript modules. No framework, no build
  step, and no runtime dependency.
- Tests use the test runner that ships with Node (`node --test`).
  The schedule, the list for today, the start order, the data merge,
  and the import validation are pure functions with tests.
- GitHub Pages serves the `main` branch root.
- Local project folder: `~/projects/personal/neetcode-review`.
  GitHub repository: `IsMichaelHuang/neetcode-review`, public.

## Acceptance criteria

Each criterion gives the start state, then the action, then the
result.

1. Start: the submissions repository as it is today. Action: the
   page loads. Result: all 110 problems show with a title. The 108
   algorithm problems show a real topic and a real difficulty. The 2
   SQL problems show the topic "SQL".
2. Start: no ratings. Action: the page loads. Result: today lists 4
   new problems, Medium first, with no two neighbors from one topic.
3. Start: a new problem. Action: he rates it Failed, Struggled, or
   Clean. Result: the next date is 1, 3, or 7 days from today.
4. Start: a problem on the 14 day step. Action: he rates it. Result:
   Clean gives 30 days, Struggled gives 14 days, Failed gives 1 day.
5. Start: 3 problems due and a target of 4. Action: the page loads.
   Result: today lists the 3 due problems first, then 1 new problem.
6. Start: a rated problem. Action: he reloads the page. Result: the
   rating, the next date, and the done count for today are the same.
7. Start: a problem row. Action: the page loads. Result: the old
   solution is not in the page. It shows only after he clicks the
   button.
8. Start: a cached file tree and a failed API request. Action: the
   page loads. Result: the problems still show and a notice explains
   the stale data.
9. Start: an exported file and a clean browser. Action: he imports
   the file. Result: all ratings and the daily target return.
10. Start: a file with a bad shape. Action: he imports it. Result:
    the page keeps the current ratings and shows an error.
11. Start: a folder that is not in `problems.json`. Action: the page
    loads. Result: the problem shows with the topic "Unknown".
12. Start: a new problem that he rated Clean today. Action: he picks
    Failed on the same day. Result: the next date is 1 day from
    today, the row stays in the list, and the done count is the same.

## Left to the builder

- The visual style, the colors, and the exact button labels.
- The split of the code into files, inside the file limits.
- The key names in `localStorage` and in `problems.json`.
- How long the page keeps the cached file tree before a new request.

## Needs Michael

- A go-ahead to create the public GitHub repository, push, and turn
  on GitHub Pages. This comes after the hand-off report.
