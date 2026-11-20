# NeetCode Review

A page that puts solved NeetCode problems on a review schedule.

Each day the page shows a short list of problems to review. You open
a problem on NeetCode, solve it again, and rate how it went: Clean,
Struggled, or Failed. The rating sets the next review date. The page
has no server and no dependencies. It is plain HTML, CSS, and
JavaScript.

## Run it on your computer

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

```
npm test
npm run limits
```

`npm test` runs the unit tests with the Node test runner. `npm run
limits` checks that each file has at most 400 lines and 80 characters
per line.

## Where your ratings live

The page keeps your ratings in the `localStorage` of your browser. It
sends them nowhere. Other pages on the same `github.io` address share
that storage, so they can read your ratings.

## Back up your ratings

Press Export to download `neetcode-review-ratings.json`. Press Import
to load a file back in. The page asks you before it replaces your
current ratings.

## Rebuild `data/problems.json`

The file lists each problem with its title, topic, and difficulty.
To rebuild it:

1. Refresh `tests/fixtures/tree.json` from the file list of your
   submissions repository.
2. Run `node scripts/build-problems.mjs`. It downloads the problem
   list from the NeetCode repository.
3. Run `npm test`.

## How Pages serves the site

GitHub Pages serves the files in this repository as they are. There is
no build step. Each push to the main branch updates the site.
