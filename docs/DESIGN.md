# Design

**Status: provisional.** The direction below was chosen from mockups in M1. The mockups are rough, not production-grade, so treat every color, font and layout here as a starting point to refine, not a locked spec.

Mockups (private canvas, Brady's account): https://claude.ai/artifact/BkG8hdVD8inaaT2mk3BX2B
The canvas also holds a private note with the family details that inspired the design. Those details stay out of this public repo.

## Direction

- **Home: snow globes.** Each person gets a snow globe with their own illustrated world (pets, interests), sitting under a night sky where Santa's sleigh slowly crosses. Your own globe never hints at what's coming to you.
- **Lists and shopping pages: Christmas morning.** Warm daylight, matching-pajama plaid, paper and handwritten tags. A wish list reads like a letter to Santa.
- **Quiet nods** to the family's favorite Christmas movies, small enough that only people who know will notice.

## Known gaps (fix in M3)

- The shopping page is hard to follow. It needs a real rethink of layout and hierarchy, not just polish.
- The home and shopping pages use different display fonts. Pick one system.
- Kevin's globe: Patriots / Drake Maye theme (no team logos), not a dog.
- Brady's globe is a placeholder.

## Starting tokens

These go into the theme file as CSS variables in M2, then get refined.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FBF5EA` | Page background |
| `--ink` | `#2B1D1A` | Main text |
| `--ink-muted` | `#5E4E48` | Secondary text |
| `--plaid-red` | `#A82A30` | Primary accent, main buttons |
| `--pine` | `#2F5D46` | Claimed / done states |
| `--night` | `#1D3461` | Home sky, home buttons |
| `--night-deep` | `#0B1530` | Top of the sky |
| `--snow` | `#EEF3F8` | Home ground |
| `--gold` | `#E9B949` | Small highlights only |
| `--tag` | `#F3E3C6` | Gift tags |
| `--letter-ink` | `#1F3B6E` | Handwritten letter text |

Fonts (Google Fonts):
- Display: Caprasimo (lists) and Gloock (home). Choose one in M3.
- Body: Nunito Sans.
- Handwriting accents only: Caveat. Never for anything April has to read to get a task done.

Motion:
- At most one or two ambient animations per screen, slow (the sleigh takes about 48 seconds to cross).
- Turn all ambient motion off when the device asks for reduced motion.
