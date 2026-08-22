# Blue Projects Design System

## Company
Blue Projects is a "one-stop" engineering and project-management services provider covering the full project life cycle — from concept through commissioning and start-up. Disciplines under one roof: building & process design, project and commercial management, construction & HSE management, plus architectural, civil, process, packaging, utilities and automation engineering. Belgium-headquartered, ~25 offices, 40+ countries. Clients include PepsiCo, Kellogg, Kellanova, P&G, Mondelez, Cargill, ADM, Pfizer, Carlsberg, Molson Coors, Bridgestone, Barry Callebaut. Sectors: food & beverage, pharma, consumer products, agriculture, automotive, logistics.

Tagline (source site): **"Innovative projects solutions for a brighter tomorrow."**

## Sources
- Brand guide: `uploads/Blue Projects_Brand Guides_Logo 3.pdf` — logo construction, primary palette (blue #0659F0, white, navy #02163C + tint scale), typeface spec (Mozilla Text).
- Logo files: `uploads/Blue Projects_Logo 3 Final_Blue Projects Logo 3 A.svg` (horizontal wordmark), `..._Motif 3 A.svg` (arrow/chevron mark alone), PNG renders, mockup + development-sketch PDFs.
- Live site (fetched via search, not a connected codebase): blueprojects.com — homepage, About Us, Services (Project Management), Careers, individual project pages (e.g. PepsiCo high-bay logistics hub).
- Adobe Fonts briefs: Mozilla Headline, Mozilla Text (mapped to their free Google Fonts releases — see Fonts below).
- No Figma file or codebase was attached, so the component inventory below is an authored **standard set** sized to a corporate B2B engineering site, not an enumerated source inventory.

## Fonts
Adobe Fonts hosts Mozilla Headline / Mozilla Text as licensed webfonts; this project could not reach Adobe's CDN, so it uses the same families' **free Google Fonts variable releases** (`assets/fonts/MozillaHeadline-Variable.woff2`, `MozillaText-Variable.woff2`) — same typeface design, open-source distribution. **Flag for user:** if you have the licensed Adobe Fonts files, drop them into `assets/fonts/` and swap the `src` in `tokens/typography.css` — no other file changes needed. A monospace, `IBM Plex Mono`, is added for technical/coordinate labels (drawing numbers, stats, blueprint annotations) — not in the brand guide, added because the "technical blueprint" brief calls for a mono voice; flagged as an intentional addition.

## Index
- `styles.css` — root stylesheet, imports everything below.
- `tokens/colors.css`, `typography.css`, `spacing.css`, `motifs.css` — design tokens.
- `assets/logo/` — wordmark + motif SVG/PNG. `assets/fonts/` — webfont files.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand groups in the Design System tab).
- `components/core/` — Button, Badge, Tag, Input, Card, StatBlock, SectionHeading.
- `components/navigation/` — NavBar, Footer.
- `ui_kits/website/` — marketing-site recreation (`index.html`).
- `thumbnail.html` — project tile.

## Intentional additions
- `IBM Plex Mono` webfont — for technical annotation text (blueprint coordinate/spec labels), not specified in the brand guide.
- Full component set (Button, Badge, Tag, Input, Card, StatBlock, SectionHeading, NavBar, Footer) — authored from scratch; no Figma/codebase source defined an inventory.

## Content fundamentals
- **Voice:** first-person plural, confident, understated corporate register — "We are a one-stop engineering and project management services provider..." Sentences are long, technical, and precise rather than punchy; copy reads like a scope-of-work summary, not ad copy.
- **Casing:** Sentence case for headings and body; ALL CAPS reserved for eyebrows/labels (e.g. section tags, stat labels) with wide letter-spacing.
- **Point of view:** "We" for the company, clients referred to by name or sector ("Blue Projects has assisted Carlsberg with..."). No direct "you" address — this is a credentials-led B2B site, not a consumer pitch.
- **Vocabulary:** industry-specific and literal — EPCM, HSE, P&IDs, commissioning, start-up, tender, brownfield/greenfield. Avoid marketing fluff ("game-changing", "revolutionary"); let scale and client names do the persuading.
- **Numbers over adjectives:** the brand leans on hard facts — "25 offices", "40+ countries", "3,000,000 hours without a Lost Time Incident" — rather than superlatives.
- **No emoji** in on-site copy (social channels use them occasionally; the website/product voice does not).
- **Tagline as thesis statement:** "Innovative projects solutions for a brighter tomorrow" — used sparingly, as a section close, not a repeated slogan.

## Visual foundations
- **Palette:** primary Blue `#0659F0` on White, per the brand guide's own tint scale (75/50/25%). Blue carries nearly all color weight — hero, stat bands, footer, CTAs. Navy `#02163C` is secondary: body text and small accents only, never a large fill. Kept to two hues max — no tertiary color.
- **Type:** Mozilla Headline (display, geometric, slightly condensed) for headlines/stats; Mozilla Text for body and UI; IBM Plex Mono for technical labels/annotations. Display sizes are large and confident (40–76px), body stays readable (16–19px).
- **Imagery:** the brief calls for image-heavy, photography-led design — full-bleed real project/site photography (industrial facilities, construction, plant interiors) is the primary visual, not illustration. Since no photography was supplied, UI kit screens use labeled placeholders; treat photography as cool-toned, high-contrast, unstaged (real facilities, not stock lifestyle shots).
- **Backgrounds:** mostly white/`--surface-sunken` for content, Blue for emphasis bands (hero, stats, footer) as flat solid fills. Navy appears only as text color, never as a section fill or a logo color. No gradients, no glassmorphism, no drop-shadowed hero cards.
- **Animation:** technical/precise, never bouncy — `--ease-blueprint` (cubic-bezier(.2,.7,.2,1)), fast micro-interactions (150ms), content reveals at 320–700ms. Motifs suit a "drawing itself in" feel: lines extending, grid fading in, numbers counting up — not springs or overshoot.
- **Hover states:** Blue elements darken (toward Navy or black) on hover; ghost/outline buttons fill solid on hover. No lightening — this is a serious, engineered brand, not a playful one.
- **Press/active states:** subtle scale (0.98) with no color shift beyond hover's.
- **Borders:** 1px hairlines in full-strength blue (or white on blue) — the only structural device. No shadows, no gradients anywhere in the system.
- **Buttons:** always pill-shaped (fully rounded), ALL CAPS, wide-tracked (.12em) in Mozilla Text. This is fixed — no square or sentence-case buttons.
- **Logo:** only two lockups — blue wordmark on white, white wordmark on blue. **Never navy.** The motif mark is white on blue only.
- **No blueprint grid:** the drafting-grid background was trialled and removed. Do not reintroduce line-grid backgrounds; the technical feel comes from hairline strokes, mono labels, cut corners and flat blue fills instead.
- **Corners:** small radii only (2–8px, `--radius-sm/md/lg`) for surfaces and cards (buttons and tags excepted — those are pills) — the brand's geometry is angular (cut corners), not rounded. Avoid large radii or pill shapes except on true tags/badges.
- **Cards:** brutalist — square corners, **no shadow, no gradient, ever**. A single 1px hairline stroke in blue (on white) or white (on blue) defines the card; the image inside gets its own hairline inset, and metadata sits below in mono caps. Cards in a grid share edges (negative margins) so their strokes read as one continuous rule, like a drawing.
- **Transparency/blur:** none — the brand is flat, precise, drafting-paper clean; no frosted-glass panels.
- **Layout:** wide container (`--container-max: 1280px`), generous section spacing (`--space-8/9/10`), sticky top nav on scroll (Navy, blueprint-line bottom border).

## Iconography
No icon set was included in the brand materials. The technical/engineering register calls for a plain, geometric line-icon set: this system links **Lucide** (lucide.dev) from CDN as a substitution — flagged here — matched for its precise, uniform-stroke, non-decorative style, which reads as "technical drawing" rather than "consumer app." No emoji, no unicode glyphs, no icon font. Use icons only functionally (nav, list markers, stat context) — never as decoration filling empty space.

## Caveats
- No Adobe Fonts license/files, no Figma file, and no codebase were attached — fonts substituted with the same families' open Google Fonts release (flagged above), icons substituted with Lucide (flagged above), and components/UI kit are an authored best-guess sized to the brand brief plus public site content (via search, since the live site could not be directly fetched from this environment).
- No real photography was supplied — the UI kit uses placeholder image slots; this is the single biggest thing this system needs from the user to look "done," given the "image-heavy" brief.
- Ask: please share (1) real project/site photography, (2) the licensed Adobe Fonts files if you want the exact commercial license rather than the Google Fonts equivalent, (3) access to the live site or a Figma file if one exists, so components can be verified against real page structure rather than reconstructed from the brief + search snippets.
