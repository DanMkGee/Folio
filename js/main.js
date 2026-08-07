/* ==========================================================================
   main.js — site-wide behaviour.

   Plain ES modules, no build step, no dependencies. Loaded with `defer`,
   so the DOM is ready by the time this runs.
   ========================================================================== */

/**
 * Theme toggle.
 *
 * The OS preference is the default (handled in CSS). This only takes over
 * once the visitor makes an explicit choice, which is then remembered.
 * Wire it up by adding `data-theme-toggle` to a button.
 */
const THEME_KEY = 'folio-theme';

function applyStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.dataset.theme = stored;
  }
}

function toggleTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = document.documentElement.dataset.theme || (prefersDark ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';

  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
}

/**
 * Marks the current page's nav link with aria-current, so it can be styled
 * and is announced correctly by screen readers.
 */
function markCurrentNavLink() {
  const here = window.location.pathname.replace(/\/$/, '') || '/';

  document.querySelectorAll('.site-nav a[href]').forEach((link) => {
    const target = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    if (target === here) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

function init() {
  applyStoredTheme();
  markCurrentNavLink();

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', toggleTheme);
  });
}

init();
