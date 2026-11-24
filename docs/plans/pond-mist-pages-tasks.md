# Pond Mist and Pages: Tasks

This file belongs to `pond-mist-pages.md`. The design is in
`pond-mist-design.md`.

## Tasks

### Task 0: Setup (main agent)

- [ ] On `feature/page-redesign`: run `npm test` and
      `npm run limits`, then commit the five files with the review
      fixes that are in the working tree.
- [ ] Create `feature/pond-mist` from `feature/page-redesign`.
- [ ] Save this plan under `docs/plans/`: `pond-mist-pages.md` (all
      sections but the two below), `pond-mist-design.md` (the two
      design sections), `pond-mist-pages-tasks.md` (the tasks).
      Commit.

### Task 1: Dots in place of symbols (dev agent)

**Files:** `src/labels.js`, `src/h.js`, the three render files,
`styles.css`, `README.md`, `tests/labels.test.js`,
`tests/static.test.js`, the three render test files.

- [ ] Tests first. `RATING_SYMBOL` and `SYM_CLASS` are gone, and
      `DOT_CLASS` gives `dot-<rating>`. Each place that had a
      `span.sym` now has a `span.dot dot-<rating>` with
      `aria-hidden="true"` and no text. The word next to it is
      unchanged. A `lastRating` of "constructor" or "__proto__"
      gives no dot. The header has the class `top`. No element has
      a text that equals "!", "!?", or "?".
- [ ] Named changes. `render.test.js`: "header.cover holds..." reads
      `top`, and "every span.sym and span.code is hidden" reads
      `dot`. `render.today.test.js` and `render.lists.test.js`: each
      assertion on a symbol text or on `sym sym-<rating>` becomes
      the dot assertion above. `static.test.js`: "at 480 pixels a
      rating symbol is a flush block" is deleted, and "the band
      aligns with the page through --wide" reads `.top`.
- [ ] `styles.css`: rename `.sym` to `.dot` and `.cover` to `.top`,
      and make the dot a square of 0.625rem. No other style change.
      Task 2 makes it a circle.
- [ ] The README says that a rating has a color dot and a word.
- [ ] Red run, code, green run, `npm run limits`, commit.

### Task 2: The Pond mist style sheet (dev agent)

**Files:** `styles.css`, `tests/contrast.test.js`,
`tests/static.test.js`.

- [ ] `contrast.test.js`, named changes. `NAMES` is the ten tokens.
      The design file test reads `docs/plans/pond-mist-design.md`
      and expects ten rows. The pair `on-cover` on `cover` and "the
      band color is the same in both schemes" are deleted. "focus on
      paper has contrast 3 or more in both schemes" reads `accent`
      on `paper` and on `sheet`. The mix tests use `sheet` as the
      ground.
- [ ] Contrast pairs, in both schemes. 4.5 or more: `ink`, `ink-2`,
      `accent`, and each rating color on `paper` and on `sheet`.
      Each rating color on its 11 percent and 20 percent mix with
      `sheet`. `ink` on the 8 and 14 percent mixes of `ink` with
      `sheet`. `ink` on the 18 and 28 percent mixes of `accent`
      with `sheet`. `ink` on the 60 percent mix of `sheet` with
      `paper`.
      3 or more: `edge` and `accent` on `paper` and on `sheet`, and
      `edge` on the 8 and 14 percent mixes of `ink` with `sheet`.
- [ ] `static.test.js`, named changes. "no rounded corner, even as a
      longhand" becomes: each `border-radius` is `999px`, `50%`,
      `1.25rem`, or `0.75rem`. The size test uses the new scale.
      The `--wide` test is deleted. New: `serif` appears only as a
      part of `sans-serif`, and `forced-color-adjust: none` appears.
      These stay as they are: the zero weak count, the 720 to
      1199.98 query, the two subgrid tests at 1200 pixels, the
      bottom space of `main`, and every ban.
- [ ] Edit `styles.css` to "Design: Pond mist". Keep each rule that
      the design does not name. Examples: `.sr`, `noscript`,
      `.sol:empty`, and `.table-wrap`. Also the `nowrap` cells, the
      index grid, the filters, and the three entry layouts. Read the
      sketch `c.css` for the feel. Do not start a browser.
- [ ] Red run, code, green run, `npm run limits`, commit.

### Task 3: Verify the look (main agent)

- [ ] `npm test`, `npm run limits`, and
      `git diff --exit-code main -- index.html`.
- [ ] A script reads the page at 1700, 1440, 1200, 1199, 900, 720,
      719, 480, and 375 pixels in both schemes: no sideways scroll
      of the body, no overlap in an entry, no wrapped word in a
      rating button. Drive each state of the page.
- [ ] Send layout faults to one dev agent as one task, tests first
      where a rule changes.
- [ ] Run the impeccable documenter with the choice "overwrite". It
      wraps at 80 characters and stays under 400 lines. A dev agent
      updates the README and the surface brief with the new
      direction contract. Write the four answers for this part.

### Task 4: Page table (dev agent)

Branch `feature/pages`, from `feature/pond-mist`.

**Files:** create `src/pages.js`, `tests/pages.test.js`.

- [ ] Tests first: `pageOf` for `""`, `"#/"`, each page hash,
      `"#topics"`, `"#/Topics"`, `"#/topics/"`, `"#/constructor"`,
      `"#/__proto__"`, and `undefined`. `titleOf` for each page and
      for an unknown id. `PAGES` and each item are frozen. Each
      `hash` and each `id` is distinct.
- [ ] Red run, code, green run, `npm run limits`, commit.

### Task 5: Settings section and notice area (dev agent)

All sections still show on the one page after this task, in one
column. This task builds no menu. Task 6 adds it.

**Files:** `src/render.js`, `src/render-today.js`, `styles.css`,
`tests/render.test.js`, `tests/render.today.test.js`. Create
`src/render-settings.js`, `tests/render.settings.test.js`.

- [ ] Tests first. The root has `header.top`, `div.notes`, and
      `div.page`. `div.page` holds Today, Topics, the table, and
      Settings. After a second render the root holds the same three
      nodes. `target`, `export`, and `import` are inside
      `section.settings`, each with its hint and
      `aria-describedby`. Notices and the import error are inside
      `div.notes` and inside no `section`. A second render keeps
      the same `header` node and the same `div.notes` node. With
      the same notices, the `p.notice` nodes are the same nodes.
      With a new notice, they are new.
- [ ] Named changes in `render.test.js`: "header.top holds the h1
      and the target, export, import" expects the `h1` only in the
      header, and "the band labels..." reads the labels in Settings.
      The tests of the target, Export, and Import move to
      `render.settings.test.js` with each assertion.
- [ ] `styles.css`: rules for `.notes`, `.page`, `.settings`,
      `.setting`, and `.hint`. Remove `.tools`. Remove the 1440
      block with the rail, because the sections are no longer
      children of `main`.
- [ ] Red run, code, green run, `npm run limits`, commit.

### Task 6: One page at a time (dev agent)

**Files:** the four render files, `src/main.js`, `styles.css`, and
`PRODUCT.md`.

**Test files:** `tests/dom.js`, `tests/render.fixtures.js`,
`tests/styles.test.js`, `tests/static.test.js`, `tests/main.test.js`,
and the four render test files.

- [ ] Tests first. `draw(view, log, page)` takes a page. Each page
      has exactly one `section`, with its class. The heading of
      each page is the `h2` with the id `<id>-h` and
      `tabindex="-1"`. The menu has four links with the ids,
      hashes, and labels of `PAGES`. Only the current link has
      `aria-current="page"`, also for an unknown page id and after
      a second render with another page. `target`, `export`, and
      `import` exist on Settings only. A notice shows on each page.
      The import error shows on Settings only.
- [ ] Named changes. The table section has the class `problems` and
      the heading "Problems" with the id `problems-h`. In
      `render.test.js`: "a second render leaves one copy of each
      row" expects one `ol` with 2 `li` on Today and one `tbody` on
      Problems. "hostile data never becomes a class or a style of
      text" draws Today and Problems and sums the names. "every
      state has no id twice and no dangling reference" runs over
      all four pages. It sums its counts. "every span.dot and
      span.code is hidden" runs over all four pages. "each notice and the import
      error show as text" and "the import error is a p.error with
      the alert role" draw Settings. Table and filter tests draw
      Problems. Topic tests draw Topics. Each test in
      `render.settings.test.js` draws Settings.
      `styles.test.js` collects the tokens of all four pages. In
      `static.test.js` the subgrid tests stay.
- [ ] `tests/dom.js` gets `fakeWindow(hash)` with `location.hash`,
      `addEventListener`, a way to fire an event, and a record of
      `scrollTo` calls.
- [ ] `main.js`, basic part only: `start` takes `win`, and `paint`
      passes `pageOf(win.location.hash)` to `render`. Named changes
      in `main.test.js`: "a problems file that is not a list is
      ignored" starts at `#/problems`. "focus moves to the next
      control after a target change" starts at `#/settings`. It
      asserts the target value "3" in place of the text "0 of 3
      done". The other tests stay unchanged.
- [ ] `styles.css`: the styles of "Styles for the pages".
- [ ] `PRODUCT.md` principle 4 becomes: "The site stays small: four
      pages. It does not grow into a study platform."
- [ ] Red run, code, green run, `npm run limits`, commit.

### Task 7: Title, focus, and scroll (dev agent)

**Files:** `src/main.js`, `tests/main.test.js`.

- [ ] Tests first, with `fakeWindow`. A start at `#/topics` sets the
      title "Topics · NeetCode Review" and moves no focus. An
      unknown hash gives the title "NeetCode Review". The focus is
      on `nav-settings`. A `hashchange` to `#/settings` then draws
      Settings and sets the title. It calls `scrollTo(0, 0)` one
      time and leaves the focus on `settings-h`. A `hashchange` between two
      hashes of the same page moves no focus and does not scroll. A
      rating press does not scroll. A `visibilitychange` on
      `#/topics` stays on Topics. With storage that fails each
      write, a rating pressed on Today is still pressed after a
      change to Topics and back.
- [ ] Red run, code, green run, `npm run limits`, commit.

### Task 8: Verify and finish (main agent)

- [ ] `npm test`, `npm run limits`, and
      `git diff --exit-code main -- index.html`.
- [ ] The width script of Task 3, for each of the four pages, plus:
      no wrapped word in a menu link.
- [ ] In the browser: each hash, the menu by mouse and by keyboard,
      the Back button. Rate on Today, change pages, and return.
      Change the target on Settings, press "Today" at once, and
      read the list. Make sure that the focus lands on the heading.
- [ ] Run the impeccable detector one time. Run the impeccable
      finish reviewer with screenshots of each page. Send its fixes
      to one dev agent as one task. Get the verdict.
- [ ] Run the impeccable documenter with the choice "refresh". A dev
      agent updates the README and the surface brief for four pages.
- [ ] Write the four answers. Send the hand-off report.
