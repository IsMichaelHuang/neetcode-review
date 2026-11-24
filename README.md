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
per line. Both need `git`, so they work only in a clone.

## Pages

The site has four pages in one HTML file. The part of the address
after `#` selects the page:

- `#/` shows Today, the list of problems to review.
- `#/topics` shows the counts for each topic.
- `#/problems` shows the table of all problems, with two filters.
- `#/settings` holds the daily target, Export, and Import.

A change of page does not load the site again. A rating that the
browser did not save stays on screen.

## Design

`PRODUCT.md` says who the page is for and what it must do.
`DESIGN.md` records the look: the colors, the type, the layout for
each window width, and the rules for controls.

Each topic has a code letter. The letters follow the alphabetical
order of the topics, so a new topic shifts the letters of the topics
after it.

Each rating has a color dot and its word. The word is always there, so
the color is never the only sign.

## Where your ratings live

The page keeps your ratings in the `localStorage` of your browser. It
sends them nowhere. Other pages on the same `github.io` address share
that storage, so they can read your ratings.

## Storage keys

The page uses three keys in `localStorage`:

- `neetcode-review:state` holds your ratings and your daily target.
- `neetcode-review:state.bad` holds a copy of saved data that was
  damaged.
- `neetcode-review:tree` holds the cached file list.

## If the page says your data was damaged

The page keeps a copy of the damaged text before it starts again.
To get your ratings back:

1. Open the developer tools of your browser.
2. Copy the value of `neetcode-review:state.bad`.
3. Repair the JSON and save it as a file.
4. On the Settings page, choose that file under "Import ratings".

## If the page says changes could not be saved

Your changes stay on screen only. If you close the page, you lose
them. If the notice stays after a reload, free browser storage for
the site. You can also remove the key `neetcode-review:state` by hand,
after you copy its value. An export made while this notice shows
holds only what is on screen.

## The clock rule

A rating removes entries of the same problem that have a later date.
Such entries exist only after the clock of your device moved back.

## Back up your ratings

Both controls are on the Settings page. Press Export to download
`neetcode-review-ratings.json`. Choose a file under "Import ratings"
to load it back in. The page asks you before it replaces your
current ratings.

## Rebuild `data/problems.json`

The file lists each problem with its title, topic, and difficulty.
To rebuild it:

1. Refresh `tests/fixtures/tree.json` from the file list of your
   submissions repository:

   ```
   gh api \
     "repos/IsMichaelHuang/neetcode-submissions-aquuq6h3"\
"/git/trees/main?recursive=1" \
     --jq '[.tree[] | {path, type}]' > tests/fixtures/tree.json
   ```

2. Run `node scripts/build-problems.mjs`. It downloads the problem
   list from the NeetCode repository.
3. Run `npm test`.

## How Pages serves the site

GitHub Pages serves the `main` branch from the repository root. In
the settings, open Pages and choose "Deploy from a branch". There is
no build step. Each push to the main branch updates the site.
