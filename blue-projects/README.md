# Blue Projects

An example site for **Blue Projects**, a company Daniel did the branding for.
Lives inside the folio repo and deploys with it, served at `/blue-projects`.

Single-page homepage, built on the Blue Projects design system export.

## It's a separate brand

Blue Projects has its own identity, unrelated to the folio's. So it keeps its
own stylesheets and assets, and shares nothing but the repo and the deploy:

```
blue-projects/
├── index.html          → /blue-projects
├── css/
│   ├── tokens.css      Design-system tokens, ported verbatim
│   └── main.css        Page styles
├── js/main.js          Nav, reveals, slot picker, pinned scroll, inertial scroll
├── assets/
│   ├── brand/          Logo lockups + motif (SVG, PNG)
│   ├── fonts/          Mozilla Headline, Mozilla Text, IBM Plex Mono
│   └── images/         Project photography goes here — see "Still to come"
└── docs/
    └── design-system.md  The export's own readme: rules, caveats, sources
```

**Don't reach for `/css/tokens.css` from here** — that's the folio's design
system, and pulling it in would leak one brand into the other. Blue Projects
has its own `blue-projects/css/tokens.css`.

## Design system

Everything comes from the *Blue Projects Design System* export. `css/tokens.css`
is a verbatim port of its `tokens/` files; anything added on top is marked
`SITE ADDITION` with a reason. The rules the page is built to:

- Blue `#0659F0` carries the colour weight. Navy `#02163C` is text and small
  accents only — never a large fill, never the logo.
- 1px hairlines are the only structural device. No shadows, no gradients, no
  blur, no drafting-grid backgrounds.
- Cards are square-cornered and share edges, so their strokes read as one rule.
- Buttons are always pills, ALL CAPS, `.12em` tracking. Hover darkens toward
  navy; ghost buttons fill solid. Nothing lightens.
- Motion is precise, never bouncy: `--ease-blueprint`, 150ms micro-interactions,
  320–700ms reveals.

Two deliberate departures, both for reasons the system itself implies:

1. **The stats band is white, not blue.** The system's stat band is a blue fill,
   but here it sits directly beneath a blue hero and the two would merge into one
   block. Same content, inverted: blue numerals on white with hairline column rules.
2. **Hover "glow" is a hard ring, not a blurred shadow.** The brief asked for
   outline glows; the system forbids shadows. Emphasis is a second hairline
   offset from the first (`box-shadow: 0 0 0 1px …, 0 0 0 5px …`, no blur).

Headline copy is title case (`Engineering Complex Vision into Global Reality`)
as supplied. The system's own rule is sentence case for headings, with ALL CAPS
reserved for eyebrows — worth a look if the copy is still open.

## Interactions

| Behaviour | Where | Fallback |
| --- | --- | --- |
| Slot picker — name and email → **Book your slot** → schedule | Hero | Without JS, the box shows an email address instead of the picker |
| Inertial scrolling with an elastic edge | Whole page | Wheel input on a fine pointer only |
| Pinned horizontal scroll, eight project cards | Featured Projects | Below 900px, or with `prefers-reduced-motion`, becomes a swipeable snap rail |
| Stat count-up, scroll reveals, current-section nav marking | Throughout | Content renders visible; reveals are scoped to `.js` |

### The slot picker

Collapsed, the whole booking step is one field — that's what keeps the card
short. Selecting it opens a month grid beside that day's times; picking a date
fills the times column, and picking a time fills the field and folds the panel
away again. Escape or a click outside also closes it.

Nothing is hardcoded to a date. The grid runs from the next working day to
twelve months out, with weekends and past days disabled, today ringed and the
chosen day filled. Slot availability is derived from the date, so the same date
always shows the same slots — a stand-in for whatever the real scheduling
backend ends up exposing.

Email validation marks an invalid field in **navy**, not red: the palette is two
hues by design and there is no semantic error colour to reach for.

### Inertial scrolling

The wheel no longer scrolls the page directly. It feeds a target, and each frame
the real position eases toward it — that lag is the inertia. Past either end of
the document the position keeps running while the scroll can't, and the leftover
is applied to the `.page` wrapper as a damped translate: the elastic bounce. A
flick settles in about a second; the edge gives ~17px on a light push and tops
out around 41px however hard it's thrown.

Native scrolling stays the source of truth throughout — the script only ever
calls `window.scrollTo` — so sticky positioning, the pinned projects track, the
scrollbar and keyboard scrolling all keep working. The transform is only ever
applied at the very top or bottom of the document, nowhere near the pin.

It deliberately stands down for **touch** (native momentum and rubber-banding
are better than anything worth reimplementing) and for **`prefers-reduced-motion`**
(this is motion for its own sake, which is what that setting is about).

## Preview

From the repo root:

```bash
./serve.sh
```

Then open http://localhost:8000/blue-projects/.

## Still to come

- [ ] **Real project photography.** Every image slot is a labelled placeholder.
      This is the single biggest thing the page needs to look finished — the
      brand brief is explicitly photography-led. Drop files in `assets/images/`
      and replace `.project__image`.
- [ ] Licensed Adobe Fonts files, if the exact commercial license is wanted
      rather than the same families' open Google Fonts release. Drop them in
      `assets/fonts/` and swap the `src` in `css/tokens.css` — nothing else changes.
- [ ] Wire the consultation form to a real scheduling endpoint, and swap the
      placeholder slot availability in `js/main.js` (`slotOpen`) for real data.
      It's currently client-side only: it confirms, but nothing is sent anywhere.
- [ ] Timezone is a fixed `CET` label. If bookings go international it needs to
      be a real picker, and the slots need converting.
- [ ] Replace the placeholder copy on project cards 5–8.
- [ ] Real project detail pages behind the "View Project" buttons.
- [ ] Decide whether this is linked from the folio, or a standalone URL to share.
