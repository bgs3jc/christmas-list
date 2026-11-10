# Firebase setup

What lives in the Firebase console (project `family-christmas`) and how to change it. The site's code is public; everything here is private to the console. **Never put emails in this repo.**

## One-time setup (done 2026-11-05)

- Firestore database, production mode, US location.
- Sign-in methods: Google, and Email/Password. (Email link was on until 2026-11-10; the site no longer uses it, so it can be switched off: Authentication > Sign-in method > Email/Password > uncheck **Email link**.)
- Authentication > Settings > **User account linking**: **Link accounts that use the same email** (Firebase's default; checked 2026-11-10). Keep it that way: it's what allows only one account per email, which the family password relies on.
- Authorized domain: `bgs3jc.github.io`.
- A web app, whose public settings are in `src/data/firebase-config.ts`.

## The rules

`firestore.rules` in this repo is the source of truth. To publish it (or any later change):

1. Firebase console > **Firestore** > **Rules** tab.
2. Delete everything there, paste in the whole of [`firestore.rules`](https://github.com/bgs3jc/christmas-list/blob/main/firestore.rules), click **Publish**.

Claude tests rule changes with `npm run test:rules` before you publish them.

## How people sign in (since 2026-11-10)

- **April, Allie and Kevin:** their email and the **family password** (one password, the same for everyone; it lives only in Brady's head and the browser's saved passwords, never in this repo). Each has an Email/Password account, made by Claude through Firebase's public sign-up. Nothing was emailed to them.
- **Brady:** Sign in with Google.
- **Why a shared password is safe enough:** the database answers only emails on the `members` list, and each of those emails already has an account, so nobody else can make one with it. Inside the family it runs on trust.
- **Allie and Kevin: use the family password, not Google.** Their emails are Gmail. If one of them clicks "Sign in with Google", Firebase swaps their password account for a Google one (Google is trusted for Gmail addresses). They still get in with Google, but the family password stops working for them until their account is remade (delete it in Authentication > Users, then Claude makes it again).

## The family (typed in by hand)

Done 2026-11-05. How the console works, for adding more later:

- **A new collection:** Firestore > **Data** tab > **+ Start collection** in the left column. Type the collection's name (say `people`), **Next**.
- **A document:** type the **Document ID** yourself (never click Auto-ID). Then **Field** is the field's name, **Type** stays **string**, and the value goes in the box under it, labeled "String". **+ Add field** for each extra field. **Save**.
- **More documents in a collection:** select the collection in the middle column, then **+ Add document** at its top.
- Names are case-sensitive and the console won't catch typos: `homeId` and `personId` have a capital I.

**`homes`**: the houses gifts can ship to. Field `name` is how it's said.

| Document ID | name |
|---|---|
| `brady` | `Brady's` |
| `april` | `April's` |
| `allie` | `Allie's` |

**`people`**: who's in the family. `homeId` is one of the homes above. `globeScene` is the picture in their snow globe (`two-cats`, `tabby`, `quarterback` or `swordsman`; leave it out for the plain tree). `santasList` is optional: `nice`, `fence` or `naughty`.

| Document ID | name | homeId | globeScene |
|---|---|---|---|
| `brady` | `Brady` | `brady` | `swordsman` |
| `april` | `April` | `april` | `two-cats` |
| `allie` | `Allie` | `allie` | `tabby` |
| `kevin` | `Kevin` | `allie` | `quarterback` |

**`members`**: who may sign in. One document per email. The Document ID is the email, **all lowercase**. One field, `personId`, says which person it is.

| Document ID | personId |
|---|---|
| your Gmail | `brady` |
| April's @me.com | `april` |
| Allie's Gmail | `allie` |
| Kevin's Gmail | `kevin` |

Someone with two emails gets two documents with the same `personId`.

## Later changes

- **Add a person, in this order:**
  1. **Their sign-in account first.** Either they sign in with Google once, or (for the family password) ask Claude to make an Email/Password account for their email with the family password. Check it's there: Authentication > **Users**.
  2. **Then** a `members` document for their email, a `people` document, and a `homes` document if they have a new house.

  Never add a `members` entry for an email that has no account yet: until it has one, anyone could make that account with any password and be let in as that person.
- **Change the family password:** ask Claude; each account's password has to be changed while signed in as them (or deleted and remade). Nobody else's sign-in changes.
- **Naughty or nice:** change `santasList` on their `people` document.
- **A new globe picture:** Claude adds the picture to the code and tells you its name; you set `globeScene`.

## Good to know

- Stay on the free Spark plan. Four people use a tiny fraction of its daily limits.
