# Design

**Status: working direction (M3).** Still open to refinement as Brady clicks through the prototype.

## Direction (M3: quiet paper, one snow globe)

Round-one plaid "Christmas morning" pages were busy. The direction now:

- **Calm by default.** Cream paper, ink text. Lists are separated by lines and space, not boxes or tinted panels. Hierarchy comes from type size and weight, not color.
- **One main action per screen** in plaid red; everything else is an outlined or underlined button. Extra options open on click ("Someone else", "Change").
- **One festive moment per page.** Home: the night sky with Santa's sleigh. Shopping pages: the person's snow globe, with gifts piling up at the bottom (ribbon = wrapped, plain box = bought, dotted = planned). Your own page: your globe just snows.
- **Quiet rows.** One line each: status pill, name, who. Details open on click. Status colors: open grey, planned amber, bought green, wrapped red; each with its own shape and word. Nothing else in a row gets color except a navy truck while something ships.
- **The fun is in small touches:** the gift pile, the wording ("Gimme, gimme, gimme"), the Naughty/Nice tag. No stamps, plaid strips, emoji or handwriting fonts.
- **Quiet nods** to the family's favorite Christmas movies remain welcome, small enough that only the family notices.

Mockups (private canvas, Brady's account): https://claude.ai/artifact/BkG8hdVD8inaaT2mk3BX2B. Rounds 4 and 5 are current; the building-blocks board shows every piece. The canvas also holds a private note with family details; those stay out of this public repo.

## Tokens and fonts

`src/theme/theme.css` is the source of truth. Main colors: paper `#FBF5EA`, ink `#2B1D1A`, faded ink `#5E4E48`, plaid red `#A82A30` (main button, "new"), pine `#2F5D46` (wrapped, private). Gold and the globe colors appear only in illustrations.

- Display: Gloock. Body: Nunito Sans. No handwriting fonts.
- Motion: at most one slow ambient animation per screen (falling snow); off when the device asks for reduced motion.

## Known gaps

- Personal globes (pets, interests) need to come from the database.
