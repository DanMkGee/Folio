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
    const target = Math.max(0, Math.min(tabs.length - 1, nextIndex));
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

    updateArrows();
    syncPanelX();

    // On the mobile rail the pills scroll rather than cascade.
    tabs[index].scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reduce.matches ? 'auto' : 'smooth',
    });
  }

  function updateArrows() {
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === tabs.length - 1;
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

  tabs.forEach((t, n) => {
    t.tabIndex = n === index ? 0 : -1;
  });
  updateArrows();
  syncPanelX();
})();
