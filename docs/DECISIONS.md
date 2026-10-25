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
