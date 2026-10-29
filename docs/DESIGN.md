# Design

**Status: working direction (M3).** Still open to refinement as Brady clicks through the prototype.

## Direction (M3: quiet paper, one snow globe)

Round-one plaid "Christmas morning" pages were busy. The direction now:

- **Calm by default.** Cream paper, ink text. Lists are separated by lines and space, not boxes or tinted panels. Hierarchy comes from type size and weight, not color.
- **One main action per screen** in plaid red; everything else is an outlined or underlined button. Extra options open on click ("Someone else", "Change").
- **One festive moment per page.** Home: a screen print of the family house at dusk on Christmas Eve (flat inks, colored shadows), with the headline on its sky. Shopping pages: the person's snow globe, with gifts piling up at the bottom (one wrapped present per gift). Your own page: your globe just snows.
- **Quiet rows.** One line each: status pill, name, who. Details open on click. Two states for a wish: "Needs a Santa" (grey, dashed circle) and "Santa's got it" (green, full circle), shape and word with the color. Gifts themselves have no status: if it's on the page, someone's getting it. Nothing else in a row gets color.
- **The fun is in small touches:** the gift pile, the wording ("Gimme, gimme, gimme"), the Naughty/Nice tag. No stamps, plaid strips, emoji or handwriting fonts.
- **Quiet nods** to the family's favorite Christmas movies remain welcome, small enough that only the family notices.

Mockups (private canvas, Brady's account): https://claude.ai/artifact/BkG8hdVD8inaaT2mk3BX2B. Rounds 4 and 5 are current; the building-blocks board shows every piece. The canvas also holds a private note with family details; those stay out of this public repo.

## Tokens and fonts

`src/theme/theme.css` is the source of truth. Main colors: paper `#FBF5EA`, ink `#2B1D1A`, faded ink `#5E4E48`, plaid red `#A82A30` (main button, "new"), pine `#2F5D46` (wrapped, private). Gold and the globe colors appear only in illustrations.

- Display: Gloock. Body: Nunito Sans. No handwriting fonts.
- One type scale, 13 14 16 18 24 30 40 px (tokens `--text-xs` to `--text-3xl`). Weights: 400 for secondary text, 600 for names and labels, 700 for buttons and pills. No other sizes or weights in components.
- Motion: at most one slow ambient animation per screen (falling snow); off when the device asks for reduced motion.

## Known gaps


- Personal globes (pets, interests) need to come from the database. `SnowGlobe` takes a `scene` that replaces its tree; an image scene was tested and fits.
