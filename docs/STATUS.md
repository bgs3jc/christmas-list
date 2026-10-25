# Status

Update this at the end of every session. Keep it short.

**Last updated:** 2026-10-25

## Where things stand

- **M1 done (provisional):** snow-globe home plus "Christmas morning" list pages. Starting tokens and known gaps are in `docs/DESIGN.md`; mockups and private family notes are on the canvas linked there.
- **M2 done:** live at https://bgs3jc.github.io/christmas-list/. The Vite + React + TypeScript app shows a themed "coming soon" gift tag (behind the `comingSoon` flag). Tokens live in `src/theme/theme.css`. Every push to `main` builds and deploys; a failed build doesn't deploy.
- **Next milestone:** M3 Clickable prototype. Redesign the shopping page first.
- **Lesson from M1:** round one was generic because it skipped family input and the design skill. `CLAUDE.md` now sets the bar.

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
- App name: undecided.
- Shopping page layout is hard to follow; redesign it before building it in M3.
- Page links in M3: GitHub Pages can't route paths like `/list/allie`, so use `#/list/allie` style links (simplest) unless there's a reason not to.
