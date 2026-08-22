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

  const revealables = [...document.querySelectorAll('.reveal, .xp__rule')];

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
    revealables.forEach((el) => io.observe(el));
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
  /* ---- Undulating squiggles --------------------------------------------
     The Adobe mark's three marks were removed from the SVG so they can be
     drawn live. Each is a travelling sine down a vertical axis, described by
     data-w = "cx, y0, y1, amplitude, wavelength, phase". The phase offsets
     are what stagger them.

     Points are joined through their midpoints with quadratic segments, which
     smooths the sampled sine into something closer to a drawn line than a
     polyline would be.
     -------------------------------------------------------------------- */

  const wiggles = [...document.querySelectorAll('[data-wiggle] path')].map((el) => {
    const [cx, y0, y1, amp, wave, phase] = el.dataset.w.split(',').map(Number);
    return { el, cx, y0, y1, amp, wave, phase };
  });

  function drawWiggle(w, t) {
    const span = w.y1 - w.y0;
    const steps = Math.max(8, Math.round(span * 2.2));
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const y = w.y0 + (span * i) / steps;
      // Taper the amplitude at both ends so the stroke starts and finishes
      // on its axis instead of being lopped off mid-swing.
      // Clamped: (PI * i) / steps can overshoot PI by a float epsilon at the
      // last step, and a negative base with a fractional exponent is NaN.
      const taper = Math.max(0, Math.sin((Math.PI * i) / steps)) ** 0.6;
      const x = w.cx + Math.sin((y / w.wave) * Math.PI * 2 + w.phase + t) * w.amp * taper;
      pts.push([x, y]);
    }
    let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += `Q${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)} ${mx.toFixed(2)},${my.toFixed(2)}`;
    }
    const last = pts[pts.length - 1];
    d += `L${last[0].toFixed(2)},${last[1].toFixed(2)}`;
    w.el.setAttribute('d', d);
  }

  if (wiggles.length) {
    // Draw once regardless, so the marks are present even when motion is off.
    wiggles.forEach((w) => drawWiggle(w, 0));

    if (!reduce.matches) {
      let running = true;
      const start = performance.now();

      // Only animate while the mark is on screen — this is the one thing here
      // that would otherwise run a rAF forever.
      if ('IntersectionObserver' in window) {
        const holder = document.querySelector('[data-wiggle]');
        new IntersectionObserver(([e]) => {
          const was = running;
          running = e.isIntersecting;
          if (running && !was) requestAnimationFrame(tick);
        }).observe(holder);
      }

      function tick(now) {
        if (!running) return;
        const t = ((now - start) / 1000) * 1.6;
        wiggles.forEach((w) => drawWiggle(w, t));
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }
})();
