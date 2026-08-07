# Blue Projects

An example site for **Blue Projects**, a company Daniel did the branding for.
Lives inside the folio repo and deploys with it, served at `/blue-projects`.

Nothing designed yet — this is the folder structure only.

## It's a separate brand

Blue Projects has its own identity, unrelated to the folio's. So it keeps its
own stylesheets and assets, and shares nothing but the repo and the deploy:

```
blue-projects/
├── index.html          → /blue-projects
├── css/                Blue Projects' own tokens and styles
├── js/
├── assets/
│   ├── brand/          Logo, marks, brand files
│   ├── fonts/          Self-hosted webfonts
│   └── images/
└── docs/               Brand notes, design system documentation
```

**Don't reach for `/css/tokens.css` from here** — that's the folio's design
system, and pulling it in would leak one brand into the other. Blue Projects
gets its own `blue-projects/css/tokens.css` when the brand lands.

## Preview

From the repo root:

```bash
./serve.sh
```

Then open http://localhost:8000/blue-projects/.

## Still to come

- [ ] Brand assets — logo, fonts, palette
- [ ] Design system → `blue-projects/css/tokens.css`
- [ ] Decide the page set (what does this example site need to show?)
- [ ] Whether it's linked from the folio, or a standalone URL to share
