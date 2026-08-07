# Design system

Nothing here yet — this is where the system you build in Claude Design gets
written down, so the CSS and the documentation stay in step.

## How the design system connects to the code

Everything lives in [`css/tokens.css`](../css/tokens.css). That file currently
holds neutral placeholders; replacing its values is how a design lands on the
site. Nothing else needs to change.

The rule that keeps it maintainable: **no raw hex codes, font names, or pixel
values anywhere except `tokens.css`.** Every other stylesheet references a
variable. Break that rule and retheming stops being a one-file job.

## What to fill in

| Section | What to capture |
| --- | --- |
| Colour | Every colour with its role and hex. Light and dark values. Contrast ratios against their backgrounds — body text needs 4.5:1, large text 3:1. |
| Typography | Typefaces, weights loaded, the size scale, line heights, letter spacing, and which element uses which. |
| Spacing | The scale and the reasoning. Which step is the default gap between sections, between paragraphs. |
| Layout | Grid columns, gutters, max widths, breakpoints. |
| Components | Each one: what it looks like, its states (hover, focus, active, disabled), and when to use it. |
| Motion | Durations, easing curves, what animates and what doesn't. |

## Fonts

Self-host in [`assets/fonts/`](../assets/fonts/) rather than loading from
Google Fonts — one fewer network dependency, faster first paint, and no
third-party request from your visitors' browsers. Declare each face with
`@font-face` in `tokens.css` and set `font-display: swap`.

## Accessibility floor

Whatever the design, these hold:

- Text contrast at least 4.5:1 (3:1 for text 24px+ or 19px+ bold).
- Focus states are visible and never removed without a replacement.
- Colour is never the only thing distinguishing one state from another.
- Every image has an `alt` — empty `alt=""` if it's decorative.
- Animation respects `prefers-reduced-motion` (already handled in `reset.css`).
