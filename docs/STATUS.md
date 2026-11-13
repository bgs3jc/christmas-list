# Status

Update this at the end of every session. Keep it short.

**Last updated:** 2026-11-13 (UI polish chat: polish pass, who-sees-what wording, in-page "are you sure?")

## Where things stand

- **M1–M5 done.** Not launched to the family yet: Brady decides when (M6). Live at https://bgs3jc.github.io/christmas-list/, deployed on every push to `main`. Sign-in is your email and the **family password** (April, Allie, Kevin), or Google (Brady); the email link is gone. The Firestore database is on. The family list, people and homes are typed into the Firebase console (`docs/FIREBASE-SETUP.md`). The database started empty: the old sample data was prototype only.
- **Privacy is enforced by the server:** `firestore.rules` hides gifts, claims and overheard notes from the person they're about. Tested as each person against the local emulator (`npm run test:rules`). Brady publishes rule changes by pasting the file into the console.
- **Tested on the real site (2026-11-10), all passing:**
  - **As April, Allie and Kevin** (`TARGET=live-family tests/live-site.e2e.cjs`, 166 checks): signing in with the family password (and a wrong one), staying signed in, My list, every shopping page, every gift flow, Santa's sack, spreadsheets, nothing about yourself on any page, and the database refusing it when asked directly with each person's sign-in. Cleanup left the database exactly as it was.
  - **From outside** (`tests/live/outside.cjs`, 41 checks): the database refuses everyone not signed in or not on the family list, nobody can make a new account with a family email, and the sign-in page works on desktop and April's phone.
  - **Brady's own view** is covered on the emulator (`tests/live-site.e2e.cjs`, 240 checks as all four), since a test can't do Google sign-in. Plus `tests/site-flows.e2e.cjs` (35) and the rule checks (23).
- **The rules are published** (2026-11-10), including the stricter field checks from the start of M5.
- **The first real wish is on the live site:** April sent Brady a request; Claude added it to her list as an idea, signed in as her (her words, nothing added).
- **Set in the console (checked 2026-11-10):** Brady's globe is the swordsman. Nobody has a Naughty/Nice tag yet; Brady is setting everyone to Nice (Next steps 2).
- **The plain sign-in page stays as is for now** (Brady: beautification, not critical). Its design round (the matching-pajamas idea), a real name and an icon are in BACKLOG.
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
- **UI polish pass (2026-11-13), live:** twelve small fixes (44px tap targets, rows lined up with their headings, phone wrapping, pop-up text boxes that grow) plus four bigger ones Brady picked: "are you sure?" inside the pop-up, shopping pages that say who sees what, an edge on the globes' glass, one link per person in Santa's sack. One commit each; before/after screenshots at https://claude.ai/artifact/Hr4G6PQFKJEU3xLsMDZ4XN (private). Details in `DECISIONS.md` (2026-11-13). No change to `firestore.rules` or the data shapes, so nothing to publish.
- **Lessons:** Brady's click-through finds what self-testing doesn't (bookkeeping nobody would keep up). Default to fewer states and fewer fields. When a fix is clear, build it. Mockups show only two widths: check the in-between widths (tablets, large text) before building. Brady prefers one row of choices over stacked blocks.

## Next steps

1. **Brady: launch (M6) when ready** (April is already using it: her text, 2026-11-12). The UI polish pass is done. Send the launch email below to April, Allie and Kevin, each at the address they sign in with.
   - **Allie and Kevin: the family password, not "Sign in with Google".** Google sign-in replaces their password account (their emails are Gmail), and the family password then stops working for them. Brady's email doesn't say this; if it happens, delete their account in Authentication > Users and Claude makes it again. Details in `FIREBASE-SETUP.md`.
   - **April:** a Safari bookmark is the safe choice. "Add to Home Screen" should work too (she'd type the password once more there), but it's untested on a real iPhone.
2. **Brady: Naughty or Nice.** Firebase console > **Firestore** > **Data** tab > `people` > click a person (`allie`, `april`, `brady`, `kevin`). If there's no `santasList` field: **+ Add field**, Field `santasList`, Type `string`, Value `nice`, **Add**. If there is one: hover its value, click the pencil, change it, **Update**. The choices are `nice`, `fence` (on the fence) and `naughty`, all lowercase. Each person sees their own tag on My list. The site can't change it (the rules refuse), only the console.
3. **Optional, any time:** switch off **Email link** in the console (Authentication > Sign-in method > Email/Password). Nothing uses it now.
4. **Watch once launched:** whether everyone gets in on their own devices, and what they find confusing. Feedback goes in BACKLOG.
5. Future globe scenes: ask ChatGPT for the scene only (square, no glass, no base, no falling snow, flat silkscreen style, subject above the bottom quarter), then run the flat-ink pass in `tools/print-pass/`.

## The launch email (Brady's, 2026-11-10)

The real password is never written in this repo (it's public): Brady fills it in when sending.

> Hello family,
>
> Here's the site I've been casually building and hope y'all like it: https://bgs3jc.github.io/christmas-list/
>
> **Signing in**
>
> * Use the email address I sent this to when logging in.
> * The family password is easy to remember: [the family password]
> * You only need to sign-in once per device. If your browser offers to save the password, say yes.
>
> **How it works**
>
> * My list is your wish list. "Gimme, gimme, gimme" is for specific things (paste a link if you have one). "An idea…" is for... you got it... an idea, where Santa picks. You can also star your favorites (so Allie can star everything on her list).
> * Pick someone's name to shop for them. "I'll be Santa" claims something off their list. "Add a gift" is for surprises and stocking stuffers. "Overheard" is for things you hear them mention.
> * Santa's sack shows everything you're getting for people.
>
> It should be intuitive once you check it out, and don't worry, you won't see what's been claimed from your list, or any gifts/notes about you. April, I already added your scarf thing you sent the other day.
>
> If anything's confusing or broken, or you want a personal walkthrough, let me know.
>
> Ho ho ho!
> Brady

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
| M4 ✅ | Firebase + sign-in | Brady has set up Firebase; Google + email-link sign-in work (email link replaced by the family password in M5); data in Firestore. Hiding rules written and emulator-tested here too |
| M5 ✅ | Surprise protection | Verified on the real site by signing in as each person; rules tightened (field checks) |
| M6 (next) | Family launch | April, Allie and Kevin signed in on their devices; feedback captured in BACKLOG |

## Open questions

- App name: undecided. "The Family List" is a placeholder.
- Does anyone who doesn't sign in get gifts through the site (a partner, the pets' stockings)? Brady hasn't said; see BACKLOG.
- April's iPhone may sign her out after about a week without a visit (Safari clears a site's saved data). With the family password she just types it again (Safari can fill it in if she saved it).
