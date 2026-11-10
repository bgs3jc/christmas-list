# Status

Update this at the end of every session. Keep it short.

**Last updated:** 2026-11-10

## Where things stand

- **M1–M4 done; M5 (surprise protection) in progress.** Not launched to the family yet: Brady decides when it's finished. Live at https://bgs3jc.github.io/christmas-list/, deployed on every push to `main`. Real sign-in (Google, or an email link for April) and the Firestore database are on. The family list, people and homes are typed into the Firebase console (`docs/FIREBASE-SETUP.md`). The database started empty: the old sample data was prototype only.
- **Privacy is enforced by the server:** `firestore.rules` hides gifts, claims and overheard notes from the person they're about. Tested as each person against the local emulator (`npm run test:rules`). Brady publishes rule changes by pasting the file into the console.
- **Tested so far (2026-11-10):** the live database refuses all reads and writes from outside, and refuses an account someone creates for themselves; 16 rule checks as each person pass; a click-through of every gift and list flow on the emulator (`tests/site-flows.e2e.cjs`) passes, including that Kevin sees no trace of gifts or notes about him. Not yet tested on the real site as anyone but Brady: that's M5.
- **The plain sign-in page stays as is for now** (Brady: beautification, not critical). Its design round (the matching-pajamas idea), a real name and an icon are in BACKLOG. Sign-in emails land in spam; Brady decided April can check Junk.
- **The prototype still exists:** `realSignIn: false` in `src/config/features.ts` brings back browser storage, sample data and the "Viewing as" bar.
- **What the site does:**
  - **Home:** a screen print of Mom's house at dusk on Christmas Eve (flat inks, colored shadows), Santa's sleigh in a red hat flying behind the oak and chimney, "Add to my list", a snow globe per person, and "Download everything as a spreadsheet".
  - **My list:** "Gimme, gimme, gimme" (paste one link or many) and "An idea…" (a store, a brand or a hobby). Gold star your favorites. No prices, no claims shown.
  - **Shopping for [person]:** their list, then "Surprises & stockings", then "Overheard". A wish shows "Needs Santa" or "Santa's got it"; "I'll be Santa" covers it in one tap, and "You · Change" in the row undoes it. Notes and links show under every name; rows don't open. Gifts have no status and no price. A gift can have a link, notes for the family, and "to April's" if it ships somewhere (houses, not people: Allie and Kevin share one).
  - **Overheard:** one line per note, with "Make it a gift", which moves the note into the gift.
- **Design:** the house print on Home; a dusk band and the person's globe on every other page; quiet paper rows. One type scale and weight rules in `DESIGN.md`. Mockups on the canvas linked there (round 8 is current).
- **How the house print was made** (for future scenes, like personal globes): ChatGPT drew it from street photos plus the artist's prints; a local script reduced it to 16 flat inks, traced it to vectors and built a sky mask for the sleigh. See the 2026-10-28 entries in `DECISIONS.md`.
- **Design round 8 (2026-10-29):** the print now carries through: a dusk band on every page, the person's globe on a shelf beside the list (it follows you on shopping pages and catches each new gift), flat ink blocks for adding, a printed gift tag for Santa's list. See `DECISIONS.md`.
- **UX review (2026-10-29):** ten findings, all approved and built: rows show everything, undo in the row, phone rows wrap, one add-pop-up pattern, Overheard notes move into gifts, contrast, short Amazon links, feedback when adding. Details in `DECISIONS.md`.
- **Modern web pass (2026-10-29):** checked against Google Chrome's Modern Web Guidance. Layout follows the phone's text size, pop-ups don't close on a stray click, Save buttons are never greyed out, reduced motion per animation. Details in `DECISIONS.md`.
- **Lessons:** Brady's click-through finds what self-testing doesn't (bookkeeping nobody would keep up). Default to fewer states and fewer fields. When a fix is clear, build it. Mockups show only two widths: check the in-between widths (tablets, large text) before building. Brady prefers one row of choices over stacked blocks.

## Next steps

1. **M5, open:** the stricter rules (only real people, only known fields) are written and tested but **not published**: the live project still runs the M4 rules. Checked on the real site so far: the database refuses outsiders and self-made accounts. Brady won't do manual testing, so the plan is a one-time `gcloud auth login` in a session, letting Claude publish rules and test the real project as each person with temporary test accounts (deleted after). Not yet approved by Brady.
2. **Then:** Brady names what else must work before the family starts. Launch (M6) only when Brady says it's finished. At launch, April bookmarks the site in Safari, not "Add to Home Screen" (BACKLOG).
3. **Next, in a new chat:** the build plan below (from the 2026-11-10 pre-launch review). It doesn't depend on M5 and changes no database rules. Start with: "Read CLAUDE.md and docs/STATUS.md, then build the plan in STATUS, in order."
4. Brady's personal snow globe still needs a scene. Recipe: ask ChatGPT for the scene only (square, no glass, no base, no falling snow, flat silkscreen style, subject above the bottom quarter), then run the flat-ink pass. The scripts and how to run them are in `tools/print-pass/`.
5. **Watch once launched:** whether April manages the email link; if not, an email-and-password option is a small job (see DECISIONS, 2026-11-10).

## Build plan (2026-11-10 pre-launch review)

Brady approved all seven steps. Build them in this order, one commit each, straight to `main`. Why each exists is in `DECISIONS.md` (2026-11-10 review entries). Mockup for step 4: Round 9 on the canvas in `DESIGN.md`, boards "A · Santa's sack" (desktop, Brady) and "April's phone".

**Rules for the whole plan**
- No change to `firestore.rules` or to the shapes in `src/data/types.ts`. If a step seems to need one, stop and ask Brady.
- Steps 1–3 must stay tiny: only the files named. If one grows past that, stop and say so.
- No new illustrations drawn in code (hand-written SVG never matched the print). No pills, cards, shadows or gradients on anything new. Reuse `Shelf`, `ListSection`, `Rows`, `Row`, `TitleNote`, `NoteLine`, `Button`, `SnowGlobe`.
- Run user-facing words through the writing-quality skill. Keep the wording given here unless it reads wrong on the page.
- After every step: `npm run build`, then `npm run dev:emulators` in the background and `node tests/site-flows.e2e.cjs`. Add the checks named in each step to that file (it runs as Allie, then Kevin; add an April sign-in where a step needs one: `april@example.com`). `npm run test:rules` must still pass at the end, unchanged.
- At the end: retake the review screenshots (`docs/review/`), add `12-sack` (Brady, desktop) and `13-phone-april-sack`, update this file, `DECISIONS.md` and `DESIGN.md`, and tell Brady in plain words what changed.

**Step 1 (tiny). Two people on one wish both show.** File: `src/features/shopping/ShoppingPage.tsx` (and `src/features/export/toSpreadsheet.ts`).
- Today a "Gimme" wish row shows only `under[0]`; a second gift on the same wish is saved but invisible.
- When `under.length > 1` on a `specific` wish: show every giver in the row's aside (each through the existing `giver()`), and one note line under the title: "Two Santas on this one. One of you can tap Change, then Not getting it."
- Spreadsheet: add a row for each extra gift, as idea wishes already do.
- Test: with the emulator's REST address already in the test file, add a second gift for `w-allie-1` from another giver; check both names and the note show on Allie's page for Kevin, and that Allie's own list shows nothing new.

**Step 2 (tiny). Change anyone's gift.** Files: `ShoppingPage.tsx`, `GiftDialog.tsx`.
- `giver()` shows "Change" after every giver's name, not only "You". The rules and `canChangeGift` already allow it.
- In the pop-up, when the gift isn't yours, the remove button reads "Take it off" and the confirm reads: `Take off "<title>"? It's <Name>'s gift, so check with them first.`
- Test: as Kevin, change the note on April's "Lip balm trio" for Allie; check the note is saved and `updatedBy` is `kevin`.

**Step 3 (tiny). A gift from someone's list can go in the stocking.** Files: `GiftDialog.tsx`, `ShoppingPage.tsx`, `toSpreadsheet.ts`.
- Show "Where does it go?" for list gifts too (remove the `!setup.fromList` condition and the `setup.fromList ? 'tree' : place` override). "I'll be Santa" still saves `tree` in one tap.
- Show `· stocking` after the name on list rows and on gifts under an idea, as surprise rows already do.
- Spreadsheet: for a stocking gift from the list, the Section reads "List (stocking)".
- Test: as Allie, claim Kevin's "Wireless earbuds", then Change, Stocking, Save; check `place` is `stocking` and the row says "stocking".

**Step 4 (medium). "Santa's sack": what you're getting, and what's landing at your house.** Behind a new flag `santasSack` in `src/config/features.ts`.
- Route `#/sack` (`src/shared/router.ts`), page in `src/features/sack/SackPage.tsx`, link "Santa's sack" in `SiteHeader` right after "My list".
- `GiftDialog` moves from `src/features/shopping/` to `src/shared/` (with the styles it uses), because features may not import each other's files. No behavior change.
- Data, in `src/data/index.ts`, one hook `useSack()`:
  - `landing`: gifts where `shipTo` is your house and the giver isn't you, oldest first. (Gifts for you are never readable, so none can appear.)
  - `groups`: one per other person, in the top bar's order, each with the gifts where you're the giver, oldest first, and each gift's wish if it still exists.
- Layout: `Shelf` with your own globe exactly as on My list (no gift pile, not following), heading "Santa's sack", line under it "Everything you're getting, for everyone, and where it's headed."
- Section order: "Landing at your place" comes first when it has gifts and is left out completely when it has none. Then "For <Name>" for each person, always shown.
- "Landing at your place": line under the heading "Boxes the others are shipping to you." Each row: the gift's name, then under it "From <Giver>, for <Recipient>". No buttons.
- "For <Name>": a small `SnowGlobe` (size 56, their scene, no gifts) beside the heading, and a quiet link "<Name>'s page" to their shopping page. Each row:
  - Title, then `· stocking` and `· to <House>` as on shopping pages.
  - Under it, in this order where they exist: `For "<idea wish title>"` when the wish is an idea; the wish's notes; your own gift notes; the store link (the gift's link, else the wish's).
  - If the gift has a `wishItemId` but the wish is gone: plain text "No longer on <Name>'s list". Text, not a pill.
  - "Change" opens `GiftDialog` for that gift.
  - No gifts for someone: "Nothing yet." and a link "See <Name>'s list".
- Phones and large text: no shelf globe; the heading, then the sections. Rows wrap like the shopping rows. Check at 390px with larger text, and at the in-between widths (700–1000px).
- Tests: as Brady (sign in `brady@example.com`): "Gooseneck pour-over kettle" is under "For Allie" with "to April's" and "Matte black"; no "Landing" heading. As April: "Landing at your place" lists the kettle as "From Brady, for Allie". As Kevin: the page has no trace of gifts for Kevin. Then, as Allie, take "Gooseneck pour-over kettle" off her list and check Brady's sack says "No longer on Allie's list".

**Step 5 (small). Shipping in the same step as claiming.** Files: `src/data/index.ts`, `ShoppingPage.tsx`.
- Shipping is mostly Brady's: the others order to their own house. So the site only asks people who have shipped before.
- New helper `usualShipTo(recipient)`: the `shipTo` of your most recent gift that has one and isn't the recipient's house, preferring gifts for people in the recipient's house, else any. Nothing stored anywhere new.
- Right after "I'll be Santa", if `usualShipTo` gives a house, the row shows under the name: "Shipping it to <House>?" with one quiet button "Yes". Yes saves `shipTo`. The question goes away on Yes, on leaving the page, or when another row is claimed. No "No" button.
- Never preselect shipping inside the pop-up.
- Tests: as Brady (who has shipped gifts in the sample data), claim Allie's "Platform clogs": the question names "April's"; Yes saves `shipTo: april`. As Kevin (no shipped gifts), claim something: no question.

**Step 6 (small). Paste rows copied from a spreadsheet.** File: `src/features/my-list/parsePaste.ts` only.
- A line with tabs is a spreadsheet row: split on tabs, drop empty cells. The link is the first cell that is a link; the name is the first cell that isn't; every other cell joins the note with ", ".
- Skip a first line whose cells are all header words (item, name, gift, what, link, url, price, notes, note, size, color, store).
- Lines without tabs behave exactly as today.
- Test: paste three tabbed rows (one header, one with a link, one without) into "Gimme, gimme, gimme"; check two wishes with the right names, links and notes.

**Step 7 (small, CSS only). Take the last generic-web-app looks out.** From a review of every page for template-looking design. The print's language is flat ink and hard edges; these are the pieces that don't speak it. Show Brady before and after screenshots; each is one line to undo.
- Pop-ups: no soft drop shadow (`--shadow-dialog: none`), a 1.5px ink edge, and square-ish corners (`--radius-lg: 6px`).
- Buttons and text boxes: `--radius-md: 4px`, matching My list's ink blocks.
- Status pills ("Needs Santa", "Santa's got it") and the "Give it a gold star" button: `border-radius: var(--radius-sm)` instead of fully round.
- Home: "Add to my list" becomes a flat block (`--radius-sm`, no bottom shadow), and the globes no longer lift on hover.
- The sign-in page picks up the same corners through the tokens; nothing else about it changes (its design round is parked). No wording changes: the review found none needed.

## Milestones to v1

One chat each. M1–M3 are firm; the order and scope after that can change as we learn. Target: in the family's hands by early December.

| # | Milestone | Done when |
|---|-----------|-----------|
| M1 | Design direction | Brady picks one of 2–3 mockup styles; theme tokens recorded |
| M2 | App scaffold + deploy | Empty themed app is live on GitHub Pages via GitHub Actions |
| M3 ✅ | Clickable prototype | Wish lists, gifts, claims and ideas work on browser storage; Brady has clicked through it |
| M4 ✅ | Firebase + sign-in | Brady has set up Firebase; Google + email-link sign-in work; data in Firestore. Hiding rules written and emulator-tested here too |
| M5 (in progress) | Surprise protection | Verified on the real site by signing in as each person; rules tightened (field checks) |
| M6 | Family launch | April, Allie and Kevin signed in on their devices; feedback captured in BACKLOG |

## Open questions

- Is April's @me.com address tied to a Google account? (Doesn't block anything; email-link sign-in works either way.)
- App name: undecided. "The Family List" is a placeholder.
- Brady's globe scene: undecided.
- Does anyone who doesn't sign in get gifts through the site (a partner, the pets' stockings)? Brady hasn't said; see BACKLOG.
- April's iPhone may sign her out after about a week without a visit (Safari clears a site's saved data). If it happens, she needs a fresh link from Junk each time; the password option in DECISIONS (2026-11-10) fixes it.
