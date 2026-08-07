# Folio — Daniel Gee

Personal site: public CV, plus a password-gated portfolio section. Static HTML,
CSS and JavaScript — no build step, no dependencies, no Node.js required.

- **Repository:** https://github.com/DanMkGee/Folio
- **Local folder:** `~/Desktop/Other/DanMkGee Folio`
- **Hosting:** Vercel (not yet connected)
- **Design system:** [`docs/design-system.md`](docs/design-system.md)

---

## Preview it locally

```bash
./serve.sh
```

Then open http://localhost:8000. Stop with Ctrl+C.

> **One local/production difference:** Vercel strips `.html` from URLs
> (`cleanUrls`). The local Python server doesn't, so use `/portfolio.html`
> locally and `/portfolio` in your links. Write links without the extension —
> those are the ones that matter in production.

**Portfolio password:** `preview` — set in `js/main.js`. See the security note
below.

---

## Pages

| File | URL | What it is |
| --- | --- | --- |
| `index.html` | `/` | Hero, statement, marquee, CV timeline, tools |
| `portfolio.html` | `/portfolio` | Lock gate, then a 6-card project grid |
| `contact.html` | `/contact` | Details and an enquiry form |

## Folder structure

```
DanMkGee Folio/
├── index.html · portfolio.html · contact.html
├── robots.txt              Search engine directives
├── vercel.json             Clean URLs, caching, security headers
├── serve.sh                Local preview server
│
├── css/
│   ├── reset.css           Browser normalisation. No design here.
│   ├── tokens.css          ★ THE DESIGN SYSTEM. Colour, type, spacing, motion.
│   ├── base.css            Element defaults, wired to tokens
│   └── main.css            The 7 components + page layouts
│
├── js/
│   └── main.js             Hero weight, lock gate, contact form. No dependencies.
│
├── assets/
│   ├── logo/logo.svg       The mark. Replace in place — everything points here.
│   ├── fonts/              Self-hosted WOFF2 (3 families, 8 files, 468 KB)
│   ├── images/             Photography and project imagery
│   ├── icons/              (the brand has no icon system by design)
│   └── documents/          CV, PDFs
│
├── work/                   Case studies → /work/project-name
│
└── docs/                   Notes and templates. Never deployed.
    ├── design-system.md    ★ Read this before changing the design
    └── page-template.html  Copy this to create a new page
```

### Where things go

| I want to… | Edit |
| --- | --- |
| Change colours, fonts, spacing | `css/tokens.css` |
| Restyle a component | `css/main.css` |
| Add a page | Copy `docs/page-template.html` |
| Change the portfolio password | `PORTFOLIO_PASSWORD` in `js/main.js` |
| Change where the contact form sends | `CONTACT_ADDRESS` in `js/main.js` |
| Add a project | `portfolio.html` — copy a `<li>` in `.portfolio-grid` |

---

## Before launch

Tracked in full in [`docs/design-system.md`](docs/design-system.md). The short
version:

- [ ] Replace `hello@danielgee.studio` and `@danielgee` with real details
- [ ] Replace the placeholder CV roles and the six placeholder projects
- [ ] Replace `assets/logo/logo.svg` with the final mark
- [ ] Swap the three `example.com` canonical URLs + `robots.txt` sitemap host
- [ ] Confirm the BN Hamburg Hand licence covers webfont embedding
- [ ] Decide on the one contrast failure (coral card labels, 2.9:1)

### ⚠ The portfolio lock is not security

The password lives in `js/main.js` and the project markup is in the page before
unlocking — anyone who opens dev tools can read both. It's a "not ready yet"
sign over placeholder content, and the page is `noindex`.

**Before real client work goes behind it,** move the check server-side: Vercel's
Deployment Protection, or a serverless function that only returns the content
after checking a secret.

---

## Saving your work

The Desktop folder and GitHub are two copies of the same thing.

```bash
git add -A && git commit -m "Describe what changed" && git push
```

```bash
git pull
```

Pull before you start, push when you stop.

---

## Deploying to Vercel

Not connected yet. When you're ready:

1. Go to [vercel.com/new](https://vercel.com/new).
2. Install the **Vercel GitHub App** and grant it access to `DanMkGee/Folio`.
3. Import the repo. Set **Framework Preset** to **Other** — there's no build
   step, so leave Build Command empty and Output Directory as the root.
4. Deploy.

Every push to `main` then deploys automatically, and every pull request gets its
own preview URL.

**When your domain goes live**, add it under Project → Settings → Domains, then
update the canonical URLs listed above.
