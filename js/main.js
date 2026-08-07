/* ==========================================================================
   main.js — site behaviour.

   Plain JavaScript, no dependencies, no build step. Loaded with `defer`,
   so the DOM is parsed by the time this runs.
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---- Nav ---------------------------------------------------------------
   Marks the current page so the coral underline shows and screen readers
   announce it.
   ---------------------------------------------------------------------- */

function markCurrentNavLink() {
  const here = window.location.pathname.replace(/(index)?\.html$/, '').replace(/\/$/, '') || '/';

  document.querySelectorAll('.nav-link').forEach((link) => {
    const target =
      new URL(link.href, window.location.origin).pathname
        .replace(/(index)?\.html$/, '')
        .replace(/\/$/, '') || '/';

    if (target === here) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ---- Hero -------------------------------------------------------------
   The design system's hero animates its display weight from regular to
   black as the section scrolls away. Thermal Variable would interpolate
   this continuously; BN Hamburg Hand ships five static weights, so the
   value is snapped to the nearest one it actually has — otherwise the
   browser rounds unpredictably and the type jumps.
   ---------------------------------------------------------------------- */

const HERO_WEIGHTS = [300, 400, 500, 700, 900];

function nearestWeight(value) {
  return HERO_WEIGHTS.reduce((closest, weight) =>
    Math.abs(weight - value) < Math.abs(closest - value) ? weight : closest
  );
}

function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  // A weight that lurches under the reader is the same problem as motion.
  if (prefersReducedMotion.matches) {
    hero.style.setProperty('--hero-weight', '400');
    return;
  }

  let queued = false;

  function update() {
    queued = false;

    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.8)));

    hero.style.setProperty('--hero-weight', nearestWeight(400 + progress * 500));
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---- Portfolio lock gate ----------------------------------------------
   IMPORTANT: this is a front-end gate, not security. The password is in
   this file, which anyone can read, and the project markup is in the page
   before it's unlocked. It's a "not ready yet" sign over placeholder
   content — nothing more.

   Before real client work goes behind it, move the check server-side:
   Vercel's built-in password protection, or a serverless function that
   returns the content only after checking a secret. See
   docs/design-system.md.
   ---------------------------------------------------------------------- */

const PORTFOLIO_PASSWORD = 'preview';
const UNLOCK_KEY = 'folio-portfolio-unlocked';

function initLockGate() {
  const gate = document.querySelector('[data-lock-gate]');
  const grid = document.querySelector('[data-portfolio]');
  if (!gate || !grid) return;

  const form = gate.querySelector('[data-lock-form]');
  const error = gate.querySelector('[data-lock-error]');
  const input = form.querySelector('input[type="password"]');

  function unlock() {
    gate.hidden = true;
    grid.hidden = false;
  }

  // Stay unlocked across pages for the rest of the browser session.
  if (sessionStorage.getItem(UNLOCK_KEY) === 'true') {
    unlock();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (input.value.trim().toLowerCase() === PORTFOLIO_PASSWORD) {
      sessionStorage.setItem(UNLOCK_KEY, 'true');
      unlock();
      return;
    }

    error.hidden = false;
    input.value = '';
    input.focus();
  });
}

/* ---- Contact form -----------------------------------------------------
   A static site has no server to post to. This composes a mail-client
   draft instead, so the form works today without an account anywhere.
   Replace with a real endpoint when you want submissions to land in an
   inbox automatically — see the comment in contact.html.
   ---------------------------------------------------------------------- */

const CONTACT_ADDRESS = 'hello@danielgee.studio';

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = data.get('name');
    const subject = `Project enquiry from ${name}`;
    const body = `${data.get('message')}\n\n—\n${name}\n${data.get('email')}`;

    window.location.href = `mailto:${CONTACT_ADDRESS}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  });
}

/* ---- Marquee ----------------------------------------------------------
   The CSS loop assumes the track is exactly two identical runs of items,
   so translateX(-50%) lands back where it started. This just warns if the
   markup drifts out of that shape — it doesn't change anything.
   ---------------------------------------------------------------------- */

function checkMarquee() {
  document.querySelectorAll('.marquee__track').forEach((track) => {
    if (track.children.length % 2 !== 0) {
      console.warn(
        'Marquee track has an odd number of items; the -50% loop will jump. ' +
          'Duplicate the full set and mark the copy aria-hidden.'
      );
    }
  });
}

function init() {
  markCurrentNavLink();
  initHero();
  initLockGate();
  initContactForm();
  checkMarquee();
}

init();
