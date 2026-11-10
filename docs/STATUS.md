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
  - **Shopping for [person]:** their list, then "Surprises & stockings", then "Overheard". A wish shows "Needs Santa" or "Santa's got it"; "I'll be Santa" covers it in one tap (and asks about shipping if you usually ship), and "Change" after any giver's name changes or undoes it. Notes and links show under every name; rows don't open. Gifts have no status and no price. A gift can have a link, notes for the family, and "to April's" if it ships somewhere (houses, not people: Allie and Kevin share one).
  - **Overheard:** one line per note, with "Make it a gift", which moves the note into the gift.
  - **Santa's sack:** everything you're getting, by person, and the boxes others are shipping to your house.
- **Design:** the house print on Home; a dusk band and the person's globe on every other page; quiet paper rows. One type scale and weight rules in `DESIGN.md`. Mockups on the canvas linked there (round 8 is current).
- **How the house print was made** (for future scenes, like personal globes): ChatGPT drew it from street photos plus the artist's prints; a local script reduced it to 16 flat inks, traced it to vectors and built a sky mask for the sleigh. See the 2026-10-28 entries in `DECISIONS.md`.
- **Design round 8 (2026-10-29):** the print now carries through: a dusk band on every page, the person's globe on a shelf beside the list (it follows you on shopping pages and catches each new gift), flat ink blocks for adding, a printed gift tag for Santa's list. See `DECISIONS.md`.
- **UX review (2026-10-29):** ten findings, all approved and built: rows show everything, undo in the row, phone rows wrap, one add-pop-up pattern, Overheard notes move into gifts, contrast, short Amazon links, feedback when adding. Details in `DECISIONS.md`.
- **Modern web pass (2026-10-29):** checked against Google Chrome's Modern Web Guidance. Layout follows the phone's text size, pop-ups don't close on a stray click, Save buttons are never greyed out, reduced motion per animation. Details in `DECISIONS.md`.
- **Pre-launch review (2026-11-10):** what would make December clearly better than the spreadsheets. Brady kept seven items and turned down the rest, including anything for wrapping night; both lists are in `DECISIONS.md`. **All seven are built** (see "Pre-launch build" below).
- **Lessons:** Brady's click-through finds what self-testing doesn't (bookkeeping nobody would keep up). Default to fewer states and fewer fields. When a fix is clear, build it. Mockups show only two widths: check the in-between widths (tablets, large text) before building. Brady prefers one row of choices over stacked blocks.

## Next steps

1. **M5, open:** the stricter rules (only real people, only known fields) are written and tested but **not published**: the live project still runs the M4 rules. Checked on the real site so far: the database refuses outsiders and self-made accounts. Brady won't do manual testing, so the plan is a one-time `gcloud auth login` in a session, letting Claude publish rules and test the real project as each person with temporary test accounts (deleted after). **Next, in a new chat**, with this prompt (sending it approves that plan):
   > Read CLAUDE.md and docs/STATUS.md, then let's do M5: an end-to-end test of the real live site as each person. I approve the plan in STATUS (Next steps, 1): I'll run `gcloud auth login` when you ask; you publish the stricter rules and test the real Firebase project with temporary test accounts. Before you change anything, tell me exactly what you'll publish, create and delete, and wait for my OK. Use made-up test addresses mapped to brady, april, allie and kevin by temporary `members` entries, and get their sign-in links from the admin API instead of email. The real database may already hold the family's lists: never change or delete a record you didn't create, give every test record an obvious test name, and record what's in the database before you start. On the live site, as each person, go through sign-in, My list, every shopping page, Santa's sack, the spreadsheet download, and every gift flow (I'll be Santa, the shipping question, Change, stocking, Take it off, Overheard and Make it a gift, pasting spreadsheet rows). Check that nobody sees a gift, claim or overheard note about themselves anywhere, and that the database itself refuses those reads when asked directly with that person's sign-in. Do April at phone width with larger text. Save the run as a script in tests/ we can rerun before launch. Afterwards, delete every test record, member entry and account, and show me the database matches the before snapshot. Report pass or fail in plain words, with screenshots of anything that failed. Fix bugs one commit at a time, but stop and ask before any rules change. Then wrap up.
2. **Then:** Brady names what else must work before the family starts. Launch (M6) only when Brady says it's finished. At launch, April bookmarks the site in Safari, not "Add to Home Screen" (BACKLOG).
3. **Brady: try the pre-launch build on the live site** (Santa's sack in the top bar; before/after of the new corners in the chat). Each look change in step 7 is one line to undo if it's not right.
4. Brady's personal snow globe still needs a scene. Recipe: ask ChatGPT for the scene only (square, no glass, no base, no falling snow, flat silkscreen style, subject above the bottom quarter), then run the flat-ink pass. The scripts and how to run them are in `tools/print-pass/`.
5. **Watch once launched:** whether April manages the email link; if not, an email-and-password option is a small job (see DECISIONS, 2026-11-10).

## Pre-launch build (done 2026-11-10)

All seven steps from the pre-launch review are built and live, one commit each. Details and small calls made on the way: `DECISIONS.md` (2026-11-10 entries).
1. **Two people on one wish:** both names show in the row, with "Two Santas on this one. One of you can tap Change, then Not getting it." The spreadsheet gets a row for each extra gift.
2. **Change anyone's gift:** every giver's name has Change. On someone else's gift the remove button reads "Take it off" and asks you to check with them first.
3. **List gifts can go in the stocking:** the pop-up asks "Where does it go?" for every gift; rows and the spreadsheet say "stocking".
4. **Santa's sack** (`#/sack`, flag `santasSack`, on): what you're getting, by person, with sizes, links and where each ships; "Landing at your place" first when boxes are headed to your house; "No longer on <Name>'s list" when a wish you claimed is taken off.
5. **Shipping in the same step as claiming:** after "I'll be Santa", people who have shipped before are asked "Shipping it to <House>?" with one Yes. Kevin, Allie and April (who order to their own houses) are never asked.
6. **Paste from a spreadsheet:** rows copied from a sheet paste into "Gimme, gimme, gimme"; a header row is skipped.
7. **Hard edges:** square-ish corners, an ink edge on pop-ups instead of a soft shadow, a flat "Add to my list", no hover lift. Before/after screenshots were shown in the chat.

Checked: the site click-through (`tests/site-flows.e2e.cjs`, now 35 checks, as Allie, Kevin, Brady and April) and the 20 rule checks pass; no change to `firestore.rules` or the data shapes, so nothing to publish. Review screenshots retaken, with `12-sack` and `13-phone-april-sack`.

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
