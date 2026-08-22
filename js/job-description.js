/* ==========================================================================
   job-description.js — Experience component behaviour.

   The markup is a real tab set (tablist / tab / tabpanel), which is what the
   design already is: five mutually exclusive states with prev/next controls.

   Expansion and selection are deliberately separate:
     - HOVER (or keyboard focus) expands a pill. CSS owns this entirely.
     - CLICK selects, which is the only thing that changes the panel.

   That split is why this uses the ARIA *manual activation* tab pattern —
   arrow keys move focus and expand, Enter/Space commits. Automatic
   activation would change the panel on every arrow press, which is the
   behaviour we're specifically avoiding.

   The one job left for JS: keep --panel-x under the selected pill. Hovering
   any pill collapses the selected one, so the whole row re-flows and the
   selected pill slides — sometimes by hundreds of pixels. The panel has to
   follow it.
   ========================================================================== */

(() => {
  const root = document.querySelector('[data-jd]');
  if (!root) return;

  const rail = root.querySelector('[role="tablist"]');
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  const prev = root.querySelector('[data-jd-prev]');
  const next = root.querySelector('[data-jd-next]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  if (index < 0) index = 0;

  /* ---- Panel position ---------------------------------------------------
     The panel sits under the selected pill. Measuring that pill is the wrong
     way to find it: hovering any other pill collapses the selected one, so
     the row re-flows and the selected pill slides — as far as 448px — which
     would drag the panel off the canvas.

     It doesn't need measuring. Every pill before the selected one is 240 wide
     and overlaps its neighbour by 40, so the selected pill's resting offset is
     always index x 200 design units. Expressed in --u it also scales for free,
     which is why nothing here watches for resize.
     -------------------------------------------------------------------- */

  function syncPanelX() {
    root.style.setProperty('--panel-x', `calc(${index * 200} * var(--u))`);
  }

  /* ---- Selection --------------------------------------------------------- */

  function select(nextIndex) {
    // Wraps rather than clamping. Clamping meant the right arrow was disabled
    // on load — CTL Comms is both the default and the last tab — so it looked
    // broken before you'd done anything.
    const target = (nextIndex + tabs.length) % tabs.length;
    if (target === index) return;

    tabs[index].setAttribute('aria-selected', 'false');
    panels[index].hidden = true;
    panels[index].removeAttribute('data-entering');

    index = target;

    tabs[index].setAttribute('aria-selected', 'true');
    panels[index].hidden = false;

    // Restart the entrance even when re-entering the same element.
    void panels[index].offsetWidth;
    panels[index].setAttribute('data-entering', '');

    syncPanelX();

    // On the mobile rail the pills scroll rather than cascade.
    tabs[index].scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reduce.matches ? 'auto' : 'smooth',
    });
  }

  /* ---- Focus (manual activation) ---------------------------------------
     Roving tabindex follows FOCUS, not selection, so a keyboard user can
     move across the pills and preview each expansion without committing.
     -------------------------------------------------------------------- */

  function focusTab(target) {
    const i = (target + tabs.length) % tabs.length;
    tabs.forEach((t, n) => {
      t.tabIndex = n === i ? 0 : -1;
    });
    tabs[i].focus();
  }

  tabs.forEach((tab, i) => {
    // Enter and Space fire click natively on a <button>, so committing from
    // the keyboard needs no extra handling.
    tab.addEventListener('click', () => select(i));

    tab.addEventListener('keydown', (event) => {
      const map = {
        ArrowLeft: i - 1,
        ArrowRight: i + 1,
        ArrowUp: i - 1,
        ArrowDown: i + 1,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!(event.key in map)) return;
      event.preventDefault();
      focusTab(map[event.key]);
    });
  });

  if (prev) prev.addEventListener('click', () => select(index - 1));
  if (next) next.addEventListener('click', () => select(index + 1));

  /* ---- Ink bleed --------------------------------------------------------
     Each pill is tagged with its distance from the one under the cursor, and
     CSS maps that to a filter. Capped at 4, which is the whole cascade.
     -------------------------------------------------------------------- */

  function setBleed(fromIndex) {
    tabs.forEach((tab, i) => {
      if (fromIndex === null) {
        tab.removeAttribute('data-dist');
        return;
      }
      const distance = Math.min(4, Math.abs(i - fromIndex));
      if (distance === 0) tab.removeAttribute('data-dist');
      else tab.setAttribute('data-dist', String(distance));
    });
  }

  // Delegated on the rail rather than bound per pill: mouseover bubbles, so
  // one listener covers moving between pills, and it doesn't miss the case
  // where the cursor crosses from one pill straight onto its neighbour.
  rail.addEventListener('mouseover', (event) => {
    const pill = event.target.closest('[role="tab"]');
    if (pill) setBleed(tabs.indexOf(pill));
  });

  rail.addEventListener('mouseleave', () => setBleed(null));

  tabs.forEach((tab, i) => {
    tab.addEventListener('focus', () => setBleed(i));
    tab.addEventListener('blur', () => setBleed(null));
  });

  // Hovering an arrow distorts the arrow and the title together.
  [prev, next].forEach((arrow) => {
    if (!arrow) return;
    arrow.addEventListener('mouseenter', () => root.setAttribute('data-arrow-hover', ''));
    arrow.addEventListener('mouseleave', () => root.removeAttribute('data-arrow-hover'));
  });

  tabs.forEach((t, n) => {
    t.tabIndex = n === index ? 0 : -1;
  });
  syncPanelX();
})();
