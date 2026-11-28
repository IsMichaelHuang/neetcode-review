# Keep the Ratings Safe Implementation Plan

## Context

The ratings live only in the `localStorage` of one browser. A browser
can remove that storage, and an export is the only safe copy. The
owner needs two things: a request that the browser keeps the storage,
and a notice when no export exists from the last 14 days.

**Goal:** The browser is asked to keep the storage. The Today page
shows a notice when no export exists from the last 14 days.

**Non-goals:** No change to the export file or to `validate`. No
change to `index.html`, the styles, or the content security policy.

## Decisions

- Persist. `main.js` asks one time for each page load, on the first
  rating or the first Export, never on load. Firefox can show a
  prompt, and a prompt with no user action is noise. `askPersist`
  keeps a flag, calls `win?.navigator?.storage?.persist?.()` in a
  `try`, wraps the result in `Promise.resolve(...).catch(() => {})`,
  never waits for it, and shows nothing for a refusal.
- Date key. The last export date lives in the key
  `neetcode-review:exported` as `YYYY-MM-DD`. It is not in the state
  object. A good Import sets the date to today, because the file then
  holds the ratings in the page. A cancelled or failed Import does
  not.
- `store.js`: `loadExported(storage)` returns a real date or null,
  also when `getItem` throws. `saveExported(storage, date)` returns
  true or false and never touches `STORAGE_KEY`.
- `config.js`: `EXPORTED_KEY`, `BACKUP_DAYS = 14`, and
  `NOTICES.backup`.
- `app.js`:
  - `exported` is read in `init`, and in `refresh` before its early
    return. It keeps the later of the stored and the in-memory date.
  - `markExported()` does nothing while `readFailed`, because the
    export then holds the empty state. Otherwise it sets the in-memory
    date to today and calls `saveExported`. The in-memory date clears
    the notice for the session even when the save fails.
  - `view().backupDue` is false while `readFailed` or with no
    ratings. Else `since` is the export date, or the oldest rating
    date when no export exists. It is true when
    `daysBetween(since, today) > 14` or `since > today`.
- `main.js` `onExport`: download, then `askPersist()`, then
  `app.markExported()`, then paint. If `download` throws, nothing is
  marked. `onRate` also calls `askPersist()`.
- `render.js` `noteList`: on the Today page only, a notice with
  `role: "status"` when `view.backupDue`.

## Acceptance criteria

1. A start asks the browser for nothing. Two ratings ask it one time.
2. A missing `navigator`, `storage`, or `persist`, a throw, and a
   rejection change nothing for the user.
3. With no ratings, with an export 14 days ago, and after a failed
   read, the notice does not show.
4. With an export 15 days ago, with a first rating 15 days ago and no
   export, and with an export date in the future, the notice shows.
5. An Export marks the date after the download starts, and a throw in
   the download marks nothing.
6. A good Import sets the date. A cancelled or failed Import does not.

## Tasks

- [x] Task 1: `store.js` and `config.js`, tests first.
- [x] Task 2: `app.js`, tests first in `tests/app.backup.test.js`.
- [x] Task 3: `render.js`, tests first in
      `tests/render.backup.test.js`.
- [x] Task 4: `main.js`, tests first in `tests/main.test.js`. The fake
      DOM gets `click` and `remove`. `helpers.js` gets
      `fakeNavigator`.
- [x] Task 5: README storage keys and backup sections, and the notices
      line in PRODUCT.md.

## Risks

- One extra key. Revert, and the page ignores the key.
- The date marks the start of a download, not a saved file.
- The persist request can be refused. It does not stop "clear site
  data".

## Review log

Four reviewers and one re-review read the plan. Main changes:

- Persist on the first user action, not on load, because of the
  Firefox prompt.
- No mark while `readFailed`.
- The notice counts from the oldest rating when no export exists.
- A good Import sets the date.
- The tests live in separate files, because `render.test.js` and
  `app.rate.test.js` are near 400 lines.

## Rollback

Revert the merge commit. No saved ratings change.

## Verification

- `npm test` and `npm run limits` pass.
- Browser: store a rating dated 15 days ago, open Today, see the
  notice, press Export, and see the notice go away.

## Four questions

1. Regressions. The owner sees the notice on the first load after
   this change if his oldest rating is more than 14 days old. The
   page cannot know about an export from before the date key
   existed. One Export clears it. This is the intended result. The
   notice list still uses `same()`, so a paint with no change does
   not replace the notices.
2. Security. None found. Other pages on the same `github.io` origin
   can write the date key and hide the notice. They can also change
   the ratings, so the key adds no new risk. The page reads the key
   only through `isRealDate`, and it writes only a date it made.
3. Efficiency. None found. `backupDue` walks all histories once for
   each paint. The list has about 110 problems, so the cost is small.
4. More tests. Done: Export and Import ran in a real browser (idea
   3), with the user's OK. See "Browser pass".

## Browser pass

The pass ran on a merge of all four branches, with test data of two
problems and four entries.

- Export: pass. The file downloads as `neetcode-review-ratings.json`.
  Its bytes match the saved state, and it has no date field. The
  date key gets today, and the Today notice goes away.
- Import, cancelled: pass. The prompt shows, and nothing changes.
- Import, a file that is not JSON: pass. The error shows, and nothing
  changes.
- Import, the exported file: pass. The prompt shows. The ratings and
  the target match the file, and the date key gets today.

A script set the file on the input and answered the prompt, because
the tools cannot drive the file dialog of the system.
