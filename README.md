# Folio — Dan McGee

Personal portfolio site. Static HTML, CSS and JavaScript — no build step, no
dependencies, no Node.js required.

- **Repository:** https://github.com/DanMkGee/Folio
- **Local folder:** `~/Desktop/Other/DanMkGee Folio`
- **Hosting:** Vercel (not yet connected)

---

## Preview it locally

```bash
./serve.sh
```

Then open http://localhost:8000. Stop with Ctrl+C.

You can also just double-click `index.html` to open it in a browser. The
server is only needed because absolute paths like `/css/main.css` don't
resolve from the filesystem.

> **One local/production difference:** Vercel strips `.html` from URLs
> (`cleanUrls`). The local Python server doesn't, so use `/about.html`
> locally and `/about` in your links. Write links without the extension —
> they're correct in production, which is what matters.

---

## Folder structure

```
DanMkGee Folio/
├── index.html              Home page — served at /
├── robots.txt              Search engine directives
├── vercel.json             Hosting config: clean URLs, caching, security headers
├── serve.sh                Local preview server
│
├── css/
│   ├── reset.css           Browser normalisation. Don't put design here.
│   ├── tokens.css          ★ THE DESIGN SYSTEM. Colour, type, spacing, motion.
│   ├── base.css            Element defaults, wired to tokens
│   └── main.css            Layout and components
│
├── js/
│   └── main.js             Theme toggle, nav state. Plain JS, no dependencies.
│
├── assets/
│   ├── logo/               Logo files
│   ├── images/             Photography, project imagery, og-image.png
│   ├── icons/              UI icons
│   ├── fonts/              Self-hosted web fonts
│   └── documents/          CV, PDFs
│
├── work/                   Project case studies → /work/project-name
│
└── docs/                   Notes and templates. Never deployed.
    ├── design-system.md    Design system documentation
    └── page-template.html  Copy this to create a new page
```

### Where things go

| I want to… | Edit |
| --- | --- |
| Change colours, fonts, spacing | `css/tokens.css` |
| Style a component or layout | `css/main.css` |
| Add a new page | Copy `docs/page-template.html` to the root or `work/` |
| Add an image | `assets/images/` |
| Change what the home page says | `index.html` |

---

## The design system

`css/tokens.css` is the single source of truth. Every colour, typeface, size
and spacing value is defined there as a CSS custom property, and every other
stylesheet references those variables.

That means the whole site can be restyled by editing one file — but only as
long as the rule holds: **no raw hex codes, font names or pixel values outside
`tokens.css`.**

Current values are neutral placeholders. See
[`docs/design-system.md`](docs/design-system.md).

---

## Saving your work

The Desktop folder and GitHub are two copies of the same thing. Git keeps
them in sync.

**Save local changes up to GitHub:**

```bash
git add -A && git commit -m "Describe what changed" && git push
```

**Pull down changes made elsewhere (e.g. edited on github.com):**

```bash
git pull
```

**See what's changed since your last save:**

```bash
git status
```

Get into the habit of `git pull` before you start and `git push` when you
stop. That's the whole workflow.

---

## Deploying to Vercel

Not connected yet. When you're ready:

1. Go to [vercel.com/new](https://vercel.com/new).
2. Install the **Vercel GitHub App** and grant it access to `DanMkGee/Folio`.
3. Import the repo. Set **Framework Preset** to **Other** — there's no build
   step, so leave Build Command empty and Output Directory as the root.
4. Deploy.

After that, every push to `main` deploys automatically, and every pull request
gets its own preview URL.

**When your domain goes live**, add it under Project → Settings → Domains,
then update these three placeholders:

- `index.html` — the `<link rel="canonical">` URL
- `docs/page-template.html` — same
- `robots.txt` — the `Sitemap:` host
