# Status

Update this at the end of every session. Keep it short.

**Last updated:** 2026-10-25

## Where things stand

- **M1 and M2 done.** Live at https://bgs3jc.github.io/christmas-list/, deployed on every push to `main`.
- **M3 in progress: first clickable prototype is live.** It runs on browser storage with made-up sample data. A "Viewing as" bar at the top stands in for sign-in until M4.
  - **My list:** Brady's sketch. Two big buttons: "Gimme, gimme, gimme" (something specific; paste one link or a whole list) and "Maybe an idea…" (a store, brand or kind of thing). Reorder with arrows, star top picks, edit or remove. No claims are shown.
  - **Shopping for [person]:** what's new since you last looked, still open, their hints (several gifts can go under each), taken care of, not on their list (tree or stocking), and Overheard ideas. "I'll get it", "Someone else", and a change dialog for who, how far along and price.
  - **Home:** sleeps until Christmas, plus a snow globe per person with their gift pile.
  - **Naughty/Nice tag:** set by someone else, shown on your own list.
  - Two browser tabs as two people stay in sync, a preview of M4's live updates.
- **Design direction changed** to "quiet paper, one snow globe" (see `DESIGN.md`, `DECISIONS.md`). Mockups are on the canvas linked in `DESIGN.md`, rounds 4 and 5.

## Next steps

1. Brady clicks through the prototype as each person and notes what's off.
2. Redesign the list rows: gather two or three professional sites that show lists cleanly and borrow from them. Rows live in one style file (`src/shared/ui/List.module.css`), so this is a contained change.
3. Brady sketches the shopping page the way he sketched "My list", if the current one doesn't feel right.
4. Tidy wording and form fields from his notes, then call M3 done and start M4 (Firebase + sign-in).

## Milestones to v1

One chat each. M1–M3 are firm; the order and scope after that can change as we learn. Target: in the family's hands by early December.

| # | Milestone | Done when |
|---|-----------|-----------|
| M1 | Design direction | Brady picks one of 2–3 mockup styles; theme tokens recorded |
| M2 | App scaffold + deploy | Empty themed app is live on GitHub Pages via GitHub Actions |
| M3 | Clickable prototype | Wish lists, gifts, claims and ideas work on browser storage; Brady has clicked through it |
| M4 | Firebase + sign-in | Brady has set up Firebase; Google + email-link sign-in work; data in Firestore |
| M5 | Surprise protection | Security rules hide recipients' gifts; verified by testing as each person |
| M6 | Family launch | April, Allie and Kevin signed in on their devices; feedback captured in BACKLOG |

## Open questions

- Is April's @me.com address tied to a Google account? (Doesn't block anything; email-link sign-in works either way.)
- App name: undecided. "The Family List" is a placeholder.
- Personal snow globes (pets, interests) need a home in the database, since the code is public. Decide how in M4.
