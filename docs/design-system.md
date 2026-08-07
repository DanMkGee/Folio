# Design system — Daniel Gee

Ported from the *Daniel Gee Design System* export (Claude Design, 7 Aug 2026).
Token values are unchanged; this documents what landed where, and the handful
of decisions the export left open.

## Where it lives

| File | Holds |
| --- | --- |
| [`css/tokens.css`](../css/tokens.css) | Every colour, typeface, size, space, border and duration. Plus `@font-face`. |
| [`css/reset.css`](../css/reset.css) | Browser normalisation. No design decisions. |
| [`css/base.css`](../css/base.css) | Element defaults wired to tokens. |
| [`css/main.css`](../css/main.css) | The 7 components and the page layouts. |

The rule that keeps this maintainable: **no raw hex codes, font names or pixel
values outside `tokens.css`.** Everything else references a variable.

## Foundations

**Palette** — near-monochrome. `--ink-950` #000000 through `--ink-500` #555358,
on `--paper` #F3F7F0 (a warm off-white, not pure white), with `--white` for card
surfaces. Two accents used sparingly: `--coral` #FB6376 for CTAs, focus rings
and ticker asterisks, `--periwinkle` #9297C4 for tag fills only. Maximum one
accent per surface.

**Type** — three faces:

- **BN Hamburg Hand** (display) — huge, tight, uppercase-leaning. `--display-1`
  clamps up to 9rem.
- **PT Serif Caption** (body) — a serif built for small sizes. All running copy,
  never headlines.
- **JetBrains Mono** (meta) — dates, tags, labels. Quiet and small.

**Spacing** — 4px base, 4 → 128px, no half-steps.

**Surfaces** — flat colour only. No gradients, blur, glass or soft shadows.
Borders are solid black hairlines (1/2/3px). The only elevation cue is a hard
offset black shadow on hover, paired with a 2–3px translate.

**Corners** — square everywhere except `Tag`, the system's one pill shape. That
contrast is deliberate.

**Motion** — minimal. Only the marquee animates, at constant linear speed. No
scroll fades, no page transitions.

## Components

All seven from the export, ported from JSX to CSS classes with the same values:

| Component | Class | Variants |
| --- | --- | --- |
| Button | `.btn` | `--primary` `--secondary` `--accent` `--ghost`, `--sm` `--lg` |
| Tag | `.tag` | `--accent` `--secondary` `--invert` |
| Input | `.field` | text, email, textarea |
| Card | `.card` | — |
| Divider | `.divider` | `--thick` `--heavy` `--inset` |
| Marquee | `.marquee` | `--invert` |
| NavLink | `.nav-link` | `[aria-current="page"]` |

## Fonts

All three are **self-hosted** in [`assets/fonts/`](../assets/fonts/) — no Google
Fonts request, no third-party dependency, nothing to break if a CDN goes down.

BN Hamburg Hand was converted from the supplied OTFs to WOFF2: same outlines,
1.28 MB down to 394 KB across five weights. PT Serif Caption and JetBrains Mono
are the latin subsets only.

**Thermal Variable.** The system originally specified Adobe Thermal Variable for
display, which isn't embeddable. If you get Typekit access or the files, swap the
`--font-display` stack in `tokens.css` — that's the only change needed. Note that
the hero weight animation is currently snapped to five static weights; a variable
font would let it interpolate smoothly, so remove the snapping in
[`js/main.js`](../js/main.js) at the same time.

**Licensing.** BN Hamburg Hand is now served publicly from this repo. Worth
confirming your licence covers webfont embedding before launch — desktop licences
often don't.

## Decisions the export didn't cover

The export was five React screens; a shipping site needs a few things it didn't
specify. These are the additions:

1. **Responsive breakpoints.** The JSX used fixed column counts (`repeat(3,1fr)`,
   `1fr 2fr`). Added at 900px and 640px, collapsing in reading order.
2. **Reduced motion.** The marquee stops and the hero weight sits at 400 for
   anyone with `prefers-reduced-motion` set.
3. **Contact form delivery.** No server exists, so submitting composes a mail
   draft. See the comment in `contact.html` to swap in a real endpoint.
4. **Marquee accessibility.** The loop needs items duplicated; the second copy is
   `aria-hidden` so screen readers don't hear everything twice.

## Open items

**The lock gate is not security.** It's a front-end check — the password is in
`js/main.js` and the project markup is in the page before unlocking. Anyone who
opens dev tools sees everything. That's fine for the placeholder content that's
there now, and the page is `noindex`.

Before real client work goes behind it, move the check server-side. Cheapest path
on Vercel is the built-in password protection (Project → Settings → Deployment
Protection, a Pro feature); otherwise a serverless function that returns the
project data only after checking a secret.

**Placeholder content to replace:**

- `hello@danielgee.studio` and `@danielgee` in `contact.html` — and
  `CONTACT_ADDRESS` in `js/main.js`
- The three CV roles ("Studio Placeholder", "Agency Placeholder")
- All six portfolio projects
- `assets/logo/logo.svg` — replace in place, everything points at this one file
- `assets/images/profile-placeholder.jpg` — supplied but not yet used anywhere
- The `example.com` canonical URLs in all three pages, and in `robots.txt`

**One contrast failure.** The card category label sets coral on white, which is
**2.9:1** — below the 4.5:1 needed for small text. Everything else passes
(`--text-secondary` on paper is 7.0:1). Options: darken the coral for that one
use, set the label in `--ink-500`, or keep coral and accept it. Your call — it's
a deliberate-looking part of the card design, so I've left it as the export
specified rather than quietly changing it.

**Still to come:** the black-and-white sketches. `.card__media` is a flat
`--ink-900` block until real art lands, and images grayscale by default.
