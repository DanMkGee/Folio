/* ==========================================================================
   job-description.js — Experience component behaviour.

   The markup is a real tab set (tablist / tab / tabpanel), which is what
   the design already is: five mutually exclusive states with prev/next
   controls. Using the actual pattern means the keyboard behaviour the
   arrows imply — Left/Right, Home/End — is what screen readers announce.

   Two jobs:
     1. Keep --panel-x in step with the active pill, so the panel and the
        arrows sit under it as it moves.
     2. Run the panel swap in the same direction as the change.
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

  /* The panel is positioned from the active pill's real offset rather than a
     computed constant. The pill widths animate, so this is re-read on every
     frame of the transition — otherwise the panel would jump to its final
     position while the pill was still growing. */
  function syncPanelX() {
    const pill = tabs[index];
    // Rect-based, not offsetLeft: the pills have no positioned ancestor inside
    // the component, so offsetLeft would be measured from <body> and pick up
    // the page's padding. This is always relative to the component itself.
    const x = pill.getBoundingClientRect().left - root.getBoundingClientRect().left;
    root.style.setProperty('--panel-x', `${Math.round(x * 100) / 100}px`);
  }

  function trackPanelX() {
    if (reduce.matches) {
      syncPanelX();
      return;
    }
    const started = performance.now();
    const duration = 520; // slightly past the CSS transition, to settle
    const step = (now) => {
      syncPanelX();
      if (now - started < duration) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function select(nextIndex, { focus = false } = {}) {
    const target = (nextIndex + tabs.length) % tabs.length;
    if (target === index) return;

    const direction = target > index ? 1 : -1;

    tabs[index].setAttribute('aria-selected', 'false');
    tabs[index].tabIndex = -1;
    panels[index].hidden = true;
    panels[index].removeAttribute('data-entering');

    index = target;

    tabs[index].setAttribute('aria-selected', 'true');
    tabs[index].tabIndex = 0;
    panels[index].hidden = false;

    // Direction of travel drives which way the incoming panel slides in.
    panels[index].style.setProperty('--dir', String(direction));
    // Restart the animation even when re-entering the same element.
    void panels[index].offsetWidth;
    panels[index].setAttribute('data-entering', '');

    updateArrows();
    trackPanelX();

    if (focus) tabs[index].focus();

    // On the mobile rail the pills scroll rather than cascade, so bring the
    // newly selected one into view.
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

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));

    tab.addEventListener('keydown', (event) => {
      const map = {
        ArrowLeft: index - 1,
        ArrowRight: index + 1,
        ArrowUp: index - 1,
        ArrowDown: index + 1,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!(event.key in map)) return;
      event.preventDefault();
      select(map[event.key], { focus: true });
    });
  });

  if (prev) prev.addEventListener('click', () => select(index - 1));
  if (next) next.addEventListener('click', () => select(index + 1));

  // The pills are sized in container-query units, so their offsets change
  // with the container, not just the viewport.
  if ('ResizeObserver' in window) {
    new ResizeObserver(syncPanelX).observe(root);
  } else {
    window.addEventListener('resize', syncPanelX);
  }

  // Webfonts change the pill label widths, which moves everything.
  if (document.fonts) document.fonts.ready.then(syncPanelX);

  updateArrows();
  syncPanelX();
})();
