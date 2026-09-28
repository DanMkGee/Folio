/* ==========================================================================
   hero.js — entrance reveal and scroll drift.

   Two behaviours, both decorative, both scoped to .js so the page is fully
   readable without them:

   1. Reveal — elements rise and fade as they enter the viewport. Uses
      IntersectionObserver rather than a scroll handler so it costs nothing
      while idle, and unobserves each element once it has played.

   2. Drift — the hero lines move at slightly different rates as you scroll
      past, so the block loosens rather than sliding as one slab. Written to
      a custom property and applied in a single rAF per frame.
   ========================================================================== */

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Reveal ---------------------------------------------------------- */

  const revealables = [...document.querySelectorAll('.reveal')];

  if (reduce.matches || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    // Stagger is per-group: each element carries its own delay so a group
    // entering together cascades, rather than every element on the page
    // sharing one clock.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
    );

    // Anything already at or above the fold is shown outright rather than
    // observed. An observer only fires when an element ENTERS the viewport,
    // so on a page that loads already scrolled — browser scroll restoration
    // on refresh, or a deep link like #cv — everything above the scroll
    // position would never intersect and would stay at opacity 0 for good.
    revealables.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-in');
      } else {
        io.observe(el);
      }
    });
  }

  /* ---- Scroll drift ----------------------------------------------------
     Each line gets a depth from data-drift; the hero's progress through the
     viewport scales it. Only runs while the hero is actually on screen.
     -------------------------------------------------------------------- */

  const hero = document.querySelector('[data-hero]');
  const drifters = hero ? [...hero.querySelectorAll('[data-drift]')] : [];

  if (hero && drifters.length && !reduce.matches) {
    let ticking = false;

    function apply() {
      ticking = false;
      const rect = hero.getBoundingClientRect();
      // 0 while the hero's top is at or below the viewport top, 1 once it has
      // scrolled a full viewport height past it.
      const progress = Math.min(1, Math.max(0, -rect.top / window.innerHeight));

      drifters.forEach((el) => {
        const depth = parseFloat(el.dataset.drift) || 0;
        el.style.setProperty('--drift', `${(progress * depth * -100).toFixed(2)}px`);
      });

      hero.style.setProperty('--hero-fade', (1 - progress * 0.3).toFixed(3));
    }

    // No visibility gate. An earlier version skipped the update whenever an
    // IntersectionObserver said the hero was off screen, which meant a stale
    // flag froze the drift at whatever it last computed. Clamping progress
    // already makes off-screen work free, so the gate only bought a branch
    // and cost correctness.
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    apply();
  }
  /* ---- In-page nav ------------------------------------------------------
     Handled here rather than left to the browser: with scroll-snap proximity
     on the page, a hash-driven smooth scroll gets pulled back to whichever
     boundary it started nearest and never reaches the target. An explicit
     scrollIntoView isn't subject to that.
     -------------------------------------------------------------------- */

  document.querySelectorAll('.sitenav__link[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: reduce.matches ? 'auto' : 'smooth',
        block: 'start',
      });
      // Keep the URL honest without letting the browser re-run its own scroll.
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  /* ---- Experience intro ------------------------------------------------
     Hybrid: the pills follow the scroll, the panel plays once.

     The scrub runs from the moment the cascade enters the viewport until it
     has risen to just under halfway up. Each pill's share is offset along
     that range, so they widen in sequence rather than together.

     At the top of the range the section is released and never re-armed —
     CTL takes its full width and the panel arrives, once.
     -------------------------------------------------------------------- */

  const jd = document.querySelector('[data-jd]');
  const rail = jd && jd.querySelector('[role="tablist"]');

  if (jd && rail && !reduce.matches) {
    const pills = [...jd.querySelectorAll('[role="tab"]')];
    const GROW = 16;        // design px at full scrub — a nudge, not a build
    const STAGGER = 0.1;    // each pill starts this much later in the range
    const RELEASE = 0.92;

    let armed = true;
    let ticking = false;
    jd.classList.add('jd--armed');

    function apply() {
      ticking = false;
      const top = rail.getBoundingClientRect().top;
      const span = window.innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (window.innerHeight - top) / span));

      if (armed) {
        pills.forEach((pill, i) => {
          const local = Math.min(1, Math.max(0, (p - i * STAGGER) / 0.45));
          pill.style.setProperty('--grow', (local * GROW).toFixed(2));
        });

        if (p >= RELEASE) {
          armed = false;
          jd.classList.remove('jd--armed');
          // Let the pills settle back to their exact resting widths, so the
          // cascade lands on the artwork's 1488 rather than a nudged version.
          pills.forEach((pill) => pill.style.setProperty('--grow', '0'));
        }
      }
    }

    function onScroll() {
      if (ticking || !armed) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    apply();
  }
})();
