# Backlog

Ideas parked until v1 works. Each one must pass the feature test in `CLAUDE.md`. Add new ideas at the bottom with a one-line why.

- **Santa's balance:** shows whether gift counts are even across recipients, so no pile looks smaller on Christmas morning. (Spending can't be compared: prices are no longer entered.)
- **Reveal day:** after Christmas, unlock the hidden view so everyone sees who got what.
- **Link auto-fill:** paste a product link and pull in title, image and price. Feasible free via a Cloudflare Worker reading the page's product tags; Amazon often blocks it.
- **Import Brady's spreadsheet:** one-time import from CSV.
- **Phone polish:** a proper phone layout.
- **Side-eye notes:** shoppers can leave a hidden, teasing note on someone's wish list item. Fun, but felt forced in the mockup; revisit only with a better form.
- **Personal snow globes:** each person's scene (pets, interests) drawn from the database, since the code is public. The globe already has a `scene` slot; scenes can be made like the house print (ChatGPT, then the flat-ink pass).
- **Prices for shoppers:** the owner doesn't type prices. Pull them from links (with link auto-fill), so shoppers see a price before clicking through.
- **In-page confirm and undo:** "Take off my list" and "Not getting it" use the browser's own confirm box, which says "bgs3jc.github.io says". A short "Undo" in the page would be friendlier. Low priority: it's clear as is.
- **Changing someone else's gift:** only your own gifts show Change now. If the family wants to fix each other's (say, April records what Kevin is getting), add it back for everyone.
- **"What I'm getting":** everything you're Santa for, grouped by person, with where each ships. The list you actually shop from in December; today it takes three pages to assemble. A view, not bookkeeping. Recommended next after M4 (or before, it's small).
- **A real name and a home-screen icon:** "The Family List" is a placeholder; an icon cropped from the print makes April's bookmark look like an app. Do with M4's sign-in page, designed in the print.

