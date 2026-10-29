# Print pass

Turns an AI-drawn picture into the site's screen-print look: flat inks, hard
edges, traced to clean vector shapes. Used for the house print and the snow
globe scenes. Not part of the app build.

Setup, once:

    python3 -m venv .venv && .venv/bin/pip install opencv-python-headless scikit-learn vtracer

## A snow globe scene

The globe shows the middle of a square scene (x 10–90%, y 6–86%). `scene.py`
can reframe the picture so a chosen view of it lands there:

    .venv/bin/python scene.py in.webp flat.png [view_x view_y view_size]
    .venv/bin/python trace.py flat.png scene.svg spline

`view_*` are fractions of the original: for a subject sitting too low, use
something like `0.05 0.06 0.9`. Then render the SVG at 736 px (any browser
or Playwright screenshot), shrink to 368 px and save as WebP (quality 88)
into `src/data/globe-scenes/`. Point the person's `globeScene` at it.

## The house print

The house used the same steps with the 16 inks shared across its versions,
plus `sky_mask.py` to build the mask the sleigh flies behind:

    .venv/bin/python sky_mask.py print.png sky-mask.png 0.62 0.58 0.62 0.45

The four numbers are two boxes (width, height as fractions) where enclosed
patches of sky, like gaps in the oak's crown, also count as sky. Check the
preview it writes next to the mask.
