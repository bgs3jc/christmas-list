# M5 finish plan: family password, then the real-site test

Written 2026-11-10. Finishes M5 so Brady can decide on launch. Brady does no testing; Claude does it all from a cloud chat.

## Why this plan

- **Sign-in gets easier.** Your email plus one family password, typed once per device. No email to find in Junk, no "open it on the same device", and when April's iPhone signs her out after a week away (Safari clears site data), she just types it again.
- **Strangers still get nothing.** The database only answers people who prove who they are. A password does that; an email alone wouldn't (Brady asked for email-only; see DECISIONS 2026-11-10 for why not). Inside the family it runs on trust, like email-only would.
- **Claude can test the real site from the cloud.** The existing live test needs admin access to make test people, and cloud sessions can't get it (the network proxy blocks Google admin calls). With the family password, a test signs in as April, Allie and Kevin like any visitor and checks everything as them. Brady's own view is covered by the emulator run, which tests all four.

## Who does what, in order

| # | Who | Step |
|---|---|---|
| 1 | Brady | Pick the family password: a phrase only the family would know, 12+ characters (a family in-joke beats a famous movie line). |
| 2 | Brady | Open a new chat (regular model, christmas-list repo) and paste the starter prompt below, with the password and April's, Allie's and Kevin's emails filled in. |
| 3 | Claude | Build sign-in with email + family password; Google stays as a second option (Brady uses it). The email link goes. Update the rules to accept password sign-ins, and the tests. Run the rule checks, `tests/site-flows.e2e.cjs` and `tests/live-site.e2e.cjs` on the emulator. Push. |
| 4 | Claude | Create password accounts for April, Allie and Kevin on the real project (Firebase's public sign-up, from the chat; nothing is emailed to them). |
| 5 | Brady | Publish the rules: Firebase console > Firestore > Rules, paste all of `firestore.rules`, Publish (1 minute). Reply "published". This also publishes the stricter rules waiting since M5 started. |
| 6 | Claude | Run the live test as April, Allie and Kevin on the real site, clean up, and run `tests/live/outside.cjs`. Report what passed. |
| 7 | Claude | Wrap up: STATUS (M5 done), DECISIONS, FIREBASE-SETUP (how to add a person now). Push. |
| 8 | Brady | Decide on launch (M6). At launch, tell each person the link, "your email and the family password", and have April bookmark it in Safari (not "Add to Home Screen"). |

If Brady says no to the family password: keep the email link and run the existing live test from Brady's computer instead (STATUS, Next steps 1).

## Build details (for step 3)

**Sign-in page** (`src/features/sign-in/`): "Your email", "Family password" (a password field the browser can save), one main "Sign in" button. Under it, "Sign in with Google" as a secondary button. Remove the email-link screens ("Check your email", "Almost in", "Send a new link"). One error for a wrong email or password: "That email and family password don't match. Check both and try again." (never say which one is wrong). Too many tries: "Too many tries. Wait a few minutes and try again." The "This list is just for the family" page stays. Copy through the writing-quality skill.

**Data layer** (`src/data/firebase-store.ts`, `backend.ts`, `index.ts`): add `signInWithPassword(email, password)` (Firebase `signInWithEmailAndPassword`), with problems `wrong-password` (codes `auth/invalid-credential`, `auth/wrong-password`, `auth/user-not-found`, `auth/invalid-email`) and `too-many` (`auth/too-many-requests`). Remove the email-link functions and their start-up handling.

**Rules** (`firestore.rules`): `signedIn()` accepts a verified email **or** a password sign-in:
`request.auth != null && (request.auth.token.email_verified == true || request.auth.token.firebase.sign_in_provider == 'password')`.
Safe because every family email gets its account before its members entry, so nobody else can claim one. Write that rule into FIREBASE-SETUP ("Add a person": account first, then members). New rule checks: a password account with a family email is family; a password account with any other email is refused; an unverified non-password account is still refused.

**Tests:** emulator sign-in helpers switch to email + password (create accounts with the auth emulator's sign-up). `tests/live-site.e2e.cjs` gets a family mode: `TARGET=live-family`, reading `FAMILY_PASSWORD` and `FAMILY_EMAILS` (`april=…,allie=…,kevin=…`) from the environment, never writing them to disk or logs. It signs in as those three, skips the admin steps (no test accounts, no members entries), snapshots by combining what the three can see (together they see every wish, gift and note), marks everything it makes "TEST M5", deletes only what it made, and checks the combined view matches the snapshot. Never print real records.

**Accounts (step 4):** Identity Toolkit `accounts:signUp` with the web API key, one per email. If an email already has an account (say, Allie already tried Google), stop and tell Brady: that account has to be deleted in the console (Authentication > Users) before it can get the password.

## Starter prompt (step 2)

Fill in the four blanks in the chat, never in the repo:

```text
Read CLAUDE.md, docs/STATUS.md and docs/M5-PLAN.md, then carry out the plan from step 3. I've said yes to the family password.

Family password: ____
April's email: ____
Allie's email: ____
Kevin's email: ____

These stay in this chat: never write them to the repo, a file or a log. Tell me exactly when to publish the rules (step 5), and nothing else needs me until you report the live test results.
```
