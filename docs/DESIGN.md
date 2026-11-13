# Design

**Status: working direction (M3).** Still open to refinement as Brady clicks through the prototype.

## Direction (M3: quiet paper, one snow globe)

Round-one plaid "Christmas morning" pages were busy. The direction now:

- **Calm by default.** Cream paper, ink text. Lists are separated by lines and space, not boxes or tinted panels. Hierarchy comes from type size and weight, not color.
- **One main action per screen** in plaid red; everything else is an outlined or underlined button. Extra options open on click ("Someone else", "Change").
- **The print carries through (Round 8, concept A).** Every page but Home opens with a band of the print's dusk sky (cobalt, then violet, magenta and orange in flat pulls). Home and every other page share one paper. The person's snow globe sits on a shelf beside the list on wide screens, overlapping the band a little; on shopping pages it stays in view while you scroll, and each new gift drops into it. Under 960px the shopping globe becomes a slim bar at the top.
- **My list's two add buttons are flat blocks of ink** (red for "Gimme, gimme, gimme", cobalt for "An idea…"), no shadows. Side by side on laptops (1190px and wider), icon above the words, so "Gimme, gimme, gimme" stays on one line; stacked on narrower screens, where two can't fit it, with icon and words starting from the left edge so the two blocks line up. On a phone the name gets one line where it fits (it does at 390px with text at 120%; larger text wraps it). Santa's list is a flat printed gift tag on a gold string.
- **One festive moment per page.** Home: a screen print of the family house at dusk on Christmas Eve (flat inks, colored shadows), with the headline on its sky. Shopping pages: the person's snow globe, with gifts piling up at the bottom (one wrapped present per gift). Your own page: your globe just snows. Santa's sack: a flat-ink sack full of presents (the approved drawing, colors from the theme), with each person's small globe beside their heading.
- **Quiet rows.** Status pill, name, who; notes and links in small type under the name, always in view (nothing opens). Every gift shows "Change" after the giver's name (anyone can fix any gift they can see); if two people claimed one wish, both names show, one per line. On phones the name gets the whole width and status and who go on the line under it. Two states for a wish: "Needs Santa" (grey, dashed circle) and "Santa's got it" (green, full circle), shape and word with the color. Gifts themselves have no status: if it's on the page, someone's getting it. Nothing else in a row gets color.
- **Everything lines up with the heading's rule.** Rows start and end where the rule under their heading does; underlined buttons have no side padding, so the word itself is the edge. A quiet word after a name ("· stocking") keeps its dot when it wraps.
- **Pages say who sees what.** Shopping pages name who can't see the page and who can, each section has one small line saying what goes in it, and the gift pop-up opens with who will see the gift.
- **Questions stay in the page.** "Are you sure?" replaces the pop-up's buttons ("Keep it" / "Yes, …"); never the browser's own box.
- **Words name the family.** Say April, Allie and Kevin (from the database), or "the family", never "everyone", "anyone" or "the others".
- **The fun is in small touches:** the gift pile, the wording ("Gimme, gimme, gimme"), the Naughty/Nice tag. No stamps, plaid strips, emoji or handwriting fonts.
- **Quiet nods** to the family's favorite Christmas movies remain welcome, small enough that only the family notices.

Mockups (private canvas, Brady's account): https://claude.ai/artifact/BkG8hdVD8inaaT2mk3BX2B. Round 8, concept A, is what's built (rounds 4 and 5 still show the row and pop-up basics); Round 8's concept B was not chosen. Round 9, concept A ("Santa's sack", by person, with April's phone view) is built (2026-11-10). The canvas also holds a private note with family details; those stay out of this public repo.

## Tokens and fonts

`src/theme/theme.css` is the source of truth. Main colors: paper `#FBF5EA`, ink `#2B1D1A`, faded ink `#5E4E48`, plaid red `#A82A30` (main button, "new"), pine `#2F5D46` (wrapped, private). Gold and the globe colors appear only in illustrations.

- Display: Gloock. Body: Nunito Sans. No handwriting fonts.
- Contrast: text at least 4.5:1 on paper (`--ink-faint` is the lightest text allowed); text-box edges at least 3:1 (`--field-border`).
- One type scale, 13 14 16 18 24 30 40 px (tokens `--text-xs` to `--text-3xl`). Weights: 400 for secondary text, 600 for names and labels, 700 for buttons and pills. No other sizes or weights in components.
- Shapes: the print's hard edges. Corners are 4px (buttons, text boxes, status labels, Home's button) and 6px (pop-ups). Pop-ups have a 1.5px ink edge and no shadow. Nothing lifts on hover, and hover looks apply only where there's a mouse (on a phone a tapped button would stay dark). Every button and link is at least 44px tall. Globes have a thin edge on the glass in the globe's shadow color, so the snowy bottom doesn't melt into the paper.
- Motion: at most one slow ambient animation per screen (falling snow), plus one moment of feedback: a new gift dropping into the globe. Each animation turns itself off when the device asks for reduced motion (no global rule).
- Sizes in rem, breakpoints in em, components laid out by their own room (container queries), so the phone's text-size setting scales the site without breaking it.

## Known gaps


- Personal globes (pets, interests) need to come from the database. `SnowGlobe` takes a `scene` that replaces its tree; an image scene was tested and fits.
