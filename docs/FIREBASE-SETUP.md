# Firebase setup

What lives in the Firebase console (project `family-christmas`) and how to change it. The site's code is public; everything here is private to the console. **Never put emails in this repo.**

## One-time setup (done 2026-11-05)

- Firestore database, production mode, US location.
- Sign-in methods: Google, and Email/Password with **Email link** on.
- Authorized domain: `bgs3jc.github.io`.
- A web app, whose public settings are in `src/data/firebase-config.ts`.

## The rules

`firestore.rules` in this repo is the source of truth. To publish it (or any later change):

1. Firebase console > **Firestore** > **Rules** tab.
2. Delete everything there, paste in the whole of [`firestore.rules`](https://github.com/bgs3jc/christmas-list/blob/main/firestore.rules), click **Publish**.

Claude tests rule changes with `npm run test:rules` before you publish them.

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

**`people`**: who's in the family. `homeId` is one of the homes above. `globeScene` is the picture in their snow globe (`two-cats`, `tabby` or `quarterback`; leave it out for the plain tree). `santasList` is optional: `nice`, `fence` or `naughty`.

| Document ID | name | homeId | globeScene |
|---|---|---|---|
| `brady` | `Brady` | `brady` | |
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

- **Add a person:** a `people` document, a `members` document for their email, and a `homes` document if they have a new house.
- **Naughty or nice:** change `santasList` on their `people` document.
- **A new globe picture:** Claude adds the picture to the code and tells you its name; you set `globeScene`.

## Good to know

- Sign-in emails come from `noreply@family-christmas-d65ce.firebaseapp.com`. They can land in Junk, so the site says to check there. Authentication > **Templates** lets you change the sender name.
- Stay on the free Spark plan. Four people use a tiny fraction of its daily limits.
