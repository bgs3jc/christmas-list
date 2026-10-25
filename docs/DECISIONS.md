# Decisions

Newest at the bottom. Each entry: what we decided, and why.

**2026-10-24: Host on GitHub Pages with Firebase as the database.** Mom and sister don't have Claude accounts, so a Claude Artifact won't work. GitHub Pages is free but static; Firebase's free tier stores the shared data. Chosen over Google Sheet + Apps Script because Claude can push and deploy everything directly. Supabase was rejected because free projects pause after about a week of inactivity.

**2026-10-24: Real sign-in, not a name picker.** The surprise is the point. A name picker can be misclicked, and the hidden data could be read from the browser. Firebase Auth plus security rules keep each person's gifts away from them on the server.

**2026-10-25: Google sign-in for Brady, Allie and Kevin; email-link sign-in for April.** April's email is @me.com (Apple). Sign in with Apple needs a paid developer account. April signs in once per device and then uses a bookmark.

**2026-10-25: Desktop browsers first.** Must not break on phones, because links get texted, but phone polish is out of scope for v1.

**2026-10-25: Vite + React + TypeScript.** Common, well-documented and fast to build. TypeScript catches mistakes as code changes across many sessions.

**2026-10-25: Feature test.** Every feature must beat a Google Sheet and add something Giftster doesn't. See principles in `CLAUDE.md`.

**2026-10-25: Public repo.** Required for free GitHub Pages. No emails or family data in the repo.

**2026-10-25: Push straight to `main`, no pull requests.** Brady doesn't review code line by line, so merging was a rubber stamp. The real check is trying the live site. Git history keeps every change reversible. Revisit at family launch.

**2026-10-25: Design direction (provisional).** Snow globes for the home screen; a "Christmas morning" look for list and shopping pages. Chosen over a movie-theatre concept and round-one generic styles because it's built from the family's own traditions. Not locked: fonts, colors and layouts get refined in M3. See `DESIGN.md`.

**2026-10-25: Not building "tag says / really from".** Deciding which gifts say "From: Santa" happens late, at wrapping time, so tracking it weeks ahead isn't practical. The "guess what's in the box" bubble was dropped too: random, no value.

**2026-10-25: Styles: one theme file plus a CSS file per component.** Tokens are CSS variables in `src/theme/theme.css`. Each component has its own `.module.css` file, so styles can't leak between features. No styling library: plain CSS is easiest for Brady to read.

**2026-10-25: Deploy only from a passing build.** GitHub Actions builds (including the TypeScript check) on every push to `main`; the deploy job runs only if the build succeeds.

**2026-10-25: Design direction: quiet paper, one snow globe.** Replaces the plaid "Christmas morning" look, which Brady found busy. Cream paper and ink; lists separated by lines and space, not boxes; one red main button per screen; pine for done. The only illustration is the person's snow globe: on a shopping page, gifts pile up inside it as they're planned, bought and wrapped. Round 3 mockups were rejected as busy and shopper-only.

**2026-10-25: One display font, Gloock.** Body text is Nunito Sans. Caprasimo and Caveat are dropped.

**2026-10-25: Two kinds of wish: "Gimme, gimme, gimme" and "Maybe an idea…".** From Brady's sketch. A specific item is claimed once. A "Maybe" (a store, brand or kind of thing) stays open, and several people can each add a gift under it, seeing what's already planned so nobody doubles up. Easier for April than naming exact products.

**2026-10-25: Paste-anything intake.** Paste one link or a whole list; each line becomes an item, named from the link, with any text after the link kept as the note. Runs in the browser, no server. Full auto-fill (photo, price) stays in the backlog.

**2026-10-25: Stockings are a place, not a section of their own.** Every gift goes "under the tree" or in the "stocking". No Santa pile: which gifts say "From: Santa" is decided at wrapping time.

**2026-10-25: Naughty/Nice is decoration that Brady sets.** Nobody changes it on the site. In the prototype it lives in the sample data; from M4 Brady edits it in the database. Not a nudge to make a list: everyone's an adult.

**2026-10-25: Personal details stay out of code.** Pets and inside jokes go in the database. Prototype globes are a generic tree scene; personal scenes come later.

**2026-10-25: Prototype "Viewing as" switch.** Until sign-in exists (M4), a bar at the top lets Brady act as anyone. The data layer already hands each person only what they're allowed to see, matching the M5 rules.

**2026-10-25: No prices from the person adding, no manual ranking.** Typing prices onto your own list felt tacky. Shoppers enter what they paid when they claim something; pulling prices from links is in the backlog. Order is just favorites (stars) first, then newest last; no arrows or dragging.

**2026-10-25: Wishes of the "Maybe an idea…" kind are tagged "Idea" in lists.**
