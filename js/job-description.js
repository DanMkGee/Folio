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

  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  const prev = root.querySelector('[data-jd-prev]');
  const next = root.querySelector('[data-jd-next]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  if (index < 0) index = 0;

  /* ---- Panel position ---------------------------------------------------
     BRANCH: centred variant. --panel-x is a constant in CSS here, so there's
     nothing to compute — the panel and its arrows stay in the middle of the
     component and only the content changes. On main this function measures
     the selected pill instead.
     -------------------------------------------------------------------- */

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

  tabs.forEach((t, n) => {
    t.tabIndex = n === index ? 0 : -1;
  });
})();
