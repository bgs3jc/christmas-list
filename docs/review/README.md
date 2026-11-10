# Review pack (2026-11-10, retaken after the pre-launch build)

Screenshots of the live site's code with made-up sample data, so a review can start from evidence instead of driving a browser. Taken on the local emulator (`npm run dev:emulators`, which loads the same sample data). Retake them if the pages change: restart the emulators for fresh data, then `node tools/review/take-screenshots.cjs <folder>` and convert the PNGs to WebP.

| File | Who's looking | What it shows |
|---|---|---|
| `01-sign-in` | anyone | The plain sign-in page (design round parked in BACKLOG) |
| `02-home` | Brady | The house print, "Add to my list", a snow globe per person, spreadsheet download, sign out |
| `03-my-list` | Brady | Two add blocks, "Dear Santa" list with gold stars, Santa's list tag. No claims ever shown here |
| `04-add-gimme` | Brady | Adding something specific: paste one link or many, or describe it |
| `05-add-idea` | Brady | Adding an idea: a store, brand or hobby; several people can each add a gift under it |
| `06-shopping-allie` | Brady | Allie's list with Needs Santa / Santa's got it, "Surprises & stockings", "Overheard". Every gift has Change |
| `07-add-gift` | Brady | The gift pop-up: link or name, who's getting it, tree or stocking, shipping, notes |
| `08-shopping-april` | Brady | A short list, as April's usually is |
| `09`–`11-phone-april-*` | April | iPhone at larger text: Home, her own list, shopping for Allie |
| `12-sack` | Brady | Santa's sack: what he's getting, by person, with sizes, links and where each ships |
| `13-phone-april-sack` | April | Santa's sack on her phone: "Landing at your place" first (boxes Brady is shipping to her), then by person |

## How it works, in brief

- **Wishes** are written by their owner: "Gimme" (one exact thing, claimed once) or "An idea" (open; several gifts can go under it). Gold star = favorite.
- **Gifts** are for someone else: claimed from their list ("I'll be Santa", one tap) or added as a surprise. A gift has who's getting it, under the tree or in the stocking, optional shipping to a house (houses, not people), a link and notes. No price, no bought/wrapped status (both removed on purpose: see DECISIONS).
- **Overheard** notes are about someone; "Make it a gift" turns one into a gift.
- **What you never see:** gifts, claims or notes about yourself. Enforced by `firestore.rules`.
- **Santa's sack** pulls together what *you* are getting for everyone, and what's being shipped to your house.
- **Not built:** anything for wrapping night or Christmas morning, prices.
