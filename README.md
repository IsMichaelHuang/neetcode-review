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
per line. It exits with an error on a broken limit. Both need `git`,
so they work only in a clone.

## Pages

The site has four pages in one HTML file. The part of the address
after `#` selects the page:

- `#/` shows Today, the list of problems to review, from Easy to Hard.
- `#/topics` shows the counts for each topic.
- `#/problems` shows the table of all problems, with two filters.
- `#/settings` holds the daily target, Export, and Import.

A change of page does not load the site again. A rating that the
browser did not save stays on screen.

## Keys

On the Today page, put the focus on a problem. Tab to its title link,
its Solution button, or one of its rating buttons. Then press 1, 2, or
3 to rate it: 1 is Clean, 2 is Struggled, and 3 is Failed. The key
rates only the problem that holds the focus. It does nothing when the
focus is outside a problem, in a field, or in a solution box. A held
key, and a key with Ctrl, Alt, or Cmd, do nothing. A rating by key is
the same as a click on that button, and a click on another button of
the same problem replaces it.

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

The page uses four keys in `localStorage`:

- `neetcode-review:state` holds your ratings and your daily target.
- `neetcode-review:exported` holds the date of your last export, as
  `YYYY-MM-DD`. It is not part of the export file.
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

If no export is dated within the last 14 days, the Today page shows a
notice. The page measures from your first rating when you have never
exported. A good Import also sets the date, because the file then
holds the ratings that are in the page. The date marks the start of
the download. The page cannot know that the browser saved the file.

On your first rating or your first Export in a page load, the page
asks the browser to keep the storage. This is a request, and the
browser can refuse it. It does not stop "clear site data" in the
settings of the browser, so an export is still the safe copy.

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
