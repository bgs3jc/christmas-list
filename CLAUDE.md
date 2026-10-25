# CLAUDE.md

Context for any Claude session working in this repo. Read this first, then `docs/STATUS.md`.

## What this is

A private Christmas gift tool for one family: Brady, April (mom), Allie (sister) and Kevin (Allie's husband). More people can be added later. Brady is the product owner: an IT person, not a developer, building this with Claude to learn and to delight the family. Brady makes product and design decisions; Claude recommends, builds and pushes back.

Full product definition: `docs/PRODUCT.md`. Decisions already made: `docs/DECISIONS.md`. Ideas not yet built: `docs/BACKLOG.md`.

## Product principles (apply to every feature)

1. **Beat the spreadsheet.** A feature must do something a Google Sheet can't, or make it clearly easier. A prettier copy of a spreadsheet fails. No dashboards for their own sake.
2. **Don't rebuild Giftster.** Giftster-style basics (lists, hidden claims) are the minimum we need, not the point. The value is the family-specific layer: Santa gifts, stocking stuffers, off-list surprises, the idea log, personal touches.
3. **Protect the surprise.** A person must never see gifts meant for them, claims on their own list, or ideas logged about them. The database security rules enforce this, not just the UI.
4. **April is the least tech-savvy user.** If April can't do it without help, it's too complicated.
5. **Whimsical but clear.** Festive and delightful, never at the cost of clarity. Avoid generic "AI-made" design: default card grids, gradient blobs, ribbons-for-the-sake-of-ribbons, emoji as icons.

If a request or idea breaks a principle, say so plainly before building. Don't be a yes-man.

## Tech decisions (see DECISIONS.md for why)

- Vite + React + TypeScript, static site on GitHub Pages, deployed by GitHub Actions on push to `main`.
- Firebase (free Spark plan): Firestore for data; Auth with Google sign-in (Brady, Allie, Kevin) and email-link sign-in (April, who uses @me.com).
- Desktop browsers first. Must not break on phones, but phone polish is out of scope for now.

## Architecture rules (modularity is a hard requirement)

- **Feature folders:** each feature lives in `src/features/<name>/` with its own components, hooks and types. Features don't import from each other's internals; shared code goes in `src/shared/`.
- **One data layer:** all reads and writes go through `src/data/`. Components never call Firebase directly. This lets us run on browser storage for prototypes and swap to Firebase in one place.
- **Theme tokens:** colors, fonts, spacing and motion live in one theme file as CSS variables. No raw hex values in components.
- **Feature flags:** new or experimental features sit behind a flag in `src/config/features.ts` so they can ship dark or be turned off.
- Prefer small, plain code over clever abstractions. Brady should be able to read it with an explanation.

## Privacy

This repo is **public**. Never commit email addresses, Firebase admin credentials, or any family data. The Firebase web config (apiKey etc.) is designed to be public and is fine to commit; security comes from Firestore rules and the sign-in allowlist.

## Workflow

- Work on a branch, push, and let Brady merge via pull request. `main` is what's live.
- Keep commits small, with plain-English messages.
- **Before ending a session, update `docs/STATUS.md`** (what changed, what's next, open questions). Log any new decision in `docs/DECISIONS.md` and any parked idea in `docs/BACKLOG.md`.
- Keep this file short. It's a map, not a manual.

## Skills

- **ui-ux-pro-max** (`.claude/skills/ui-ux-pro-max/`): searchable design reference (styles, palettes, fonts, UX rules). Run from the repo root:
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`
  Treat results as reference, not authority. Its defaults lean toward generic SaaS/landing-page patterns; the design direction Brady chooses wins.
