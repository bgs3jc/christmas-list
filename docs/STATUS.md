# Status

Update this at the end of every session. Keep it short.

**Last updated:** 2026-10-29

## Where things stand

- **M1, M2 and M3 done, plus a fresh-eyes UX review.** Live at https://bgs3jc.github.io/christmas-list/, deployed on every push to `main`. The prototype runs on browser storage with made-up sample data; a "Viewing as" bar stands in for sign-in until M4.
- **What the prototype does now:**
  - **Home:** a screen print of Mom's house at dusk on Christmas Eve (flat inks, colored shadows), Santa's sleigh in a red hat flying behind the oak and chimney, "Add to my list", a snow globe per person, and "Download everything as a spreadsheet".
  - **My list:** "Gimme, gimme, gimme" (paste one link or many) and "An idea…" (a store, a brand or a hobby). Gold star your favorites. No prices, no claims shown.
  - **Shopping for [person]:** their list, then "Surprises & stockings", then "Overheard". A wish shows "Needs Santa" or "Santa's got it"; "I'll be Santa" covers it in one tap, and "You · Change" in the row undoes it. Notes and links show under every name; rows don't open. Gifts have no status and no price. A gift can have a link, notes for the family, and "to April's" if it ships somewhere (houses, not people: Allie and Kevin share one).
  - **Overheard:** one line per note, with "Make it a gift", which moves the note into the gift.
- **Design:** quiet paper for lists; the house print and globes in its inks. One type scale and weight rules in `DESIGN.md`. Mockups on the canvas linked there (round 7 is the serigraph work).
- **How the house print was made** (for future scenes, like personal globes): ChatGPT drew it from street photos plus the artist's prints; a local script reduced it to 16 flat inks, traced it to vectors and built a sky mask for the sleigh. See the 2026-10-28 entries in `DECISIONS.md`.
- **UX review (2026-10-29):** ten findings, all approved and built: rows show everything, undo in the row, phone rows wrap, one add-pop-up pattern, Overheard notes move into gifts, contrast, short Amazon links, feedback when adding. Details in `DECISIONS.md`.
- **Lessons from earlier sessions:** Brady's click-through found what self-testing didn't: bookkeeping (prices, tracking, statuses) nobody would keep up. Default to fewer states and fewer fields. When asked "what are the options", give them; when a fix is clear, just build it.

## Next steps

1. **Brady clicks through the review changes** on the live site, as April on a phone especially, and notes anything that feels off.
2. **M4 in its own chat:** "Read CLAUDE.md and docs/STATUS.md, then let's do M4." Brady needs about 20 minutes to create the Firebase project. M4 replaces `src/data/store.ts` with Firebase; nothing outside `src/data/` should change. Sign-in replaces the "Viewing as" bar; `globeScene` moves to the database.
3. Brady's personal snow globe still needs a scene. Recipe: ask ChatGPT for the scene only (square, no glass, no base, no falling snow, flat silkscreen style, subject above the bottom quarter), then run the flat-ink pass. The scripts and how to run them are in `tools/print-pass/`.

## Milestones to v1

One chat each. M1–M3 are firm; the order and scope after that can change as we learn. Target: in the family's hands by early December.

| # | Milestone | Done when |
|---|-----------|-----------|
| M1 | Design direction | Brady picks one of 2–3 mockup styles; theme tokens recorded |
| M2 | App scaffold + deploy | Empty themed app is live on GitHub Pages via GitHub Actions |
| M3 ✅ | Clickable prototype | Wish lists, gifts, claims and ideas work on browser storage; Brady has clicked through it |
| M4 | Firebase + sign-in | Brady has set up Firebase; Google + email-link sign-in work; data in Firestore |
| M5 | Surprise protection | Security rules hide recipients' gifts; verified by testing as each person |
| M6 | Family launch | April, Allie and Kevin signed in on their devices; feedback captured in BACKLOG |

## Open questions

- Is April's @me.com address tied to a Google account? (Doesn't block anything; email-link sign-in works either way.)
- App name: undecided. "The Family List" is a placeholder.
- Brady's globe scene: undecided.
- Prices for shoppers: owners don't type them, and shoppers no longer enter what they paid. Pull prices from links later (see BACKLOG)?
