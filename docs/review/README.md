# Review pack (2026-11-10)

Screenshots of the live site's code with made-up sample data, so a review can start from evidence instead of driving a browser. Taken on the local emulator (`npm run dev:emulators`, which loads the same sample data). Retake them if the pages change.

| File | Who's looking | What it shows |
|---|---|---|
| `01-sign-in` | anyone | The plain sign-in page (design round parked in BACKLOG) |
| `02-home` | Brady | The house print, "Add to my list", a snow globe per person, spreadsheet download, sign out |
| `03-my-list` | Brady | Two add blocks, "Dear Santa" list with gold stars, Santa's list tag. No claims ever shown here |
| `04-add-gimme` | Brady | Adding something specific: paste one link or many, or describe it |
| `05-add-idea` | Brady | Adding an idea: a store, brand or hobby; several people can each add a gift under it |
| `06-shopping-allie` | Brady | Allie's list with Needs Santa / Santa's got it, "Surprises & stockings", "Overheard" |
| `07-add-gift` | Brady | The gift pop-up: link or name, who's getting it, tree or stocking, shipping, notes |
| `08-shopping-april` | Brady | A short list, as April's usually is |
| `09`–`11-phone-april-*` | April | iPhone at larger text: Home, her own list, shopping for Allie |

## How it works, in brief

- **Wishes** are written by their owner: "Gimme" (one exact thing, claimed once) or "An idea" (open; several gifts can go under it). Gold star = favorite.
- **Gifts** are for someone else: claimed from their list ("I'll be Santa", one tap) or added as a surprise. A gift has who's getting it, under the tree or in the stocking, optional shipping to a house (houses, not people), a link and notes. No price, no bought/wrapped status (both removed on purpose: see DECISIONS).
- **Overheard** notes are about someone; "Make it a gift" turns one into a gift.
- **What you never see:** gifts, claims or notes about yourself. Enforced by `firestore.rules`.
- **Not built:** anything that pulls together what *you* are getting for everyone ("What I'm getting", BACKLOG), anything for wrapping night or Christmas morning, prices.
