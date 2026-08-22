/* ==========================================================================
   Blue Projects — homepage behaviour
   No framework, no build step, no CDN. Every module below degrades to a
   working page if it never runs.

   1. Nav        — mobile disclosure + current-section marking
   2. Reveals    — one IntersectionObserver for the whole page
   3. Stats      — count-up, fired by the same observer
   4. Consult    — details → slot (calendar + times) → schedule
   5. Pin        — sticky horizontal scroll for Featured Projects
   6. Scroll     — wheel inertia with an elastic edge (pointer: fine only)
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------------------------
     1. Navigation
     ---------------------------------------------------------------------- */

  function initNav() {
    var nav = $('[data-nav]');
    var toggle = $('[data-nav-toggle]');
    var links = $('#nav-links');
    if (!nav || !toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    /* Close the mobile menu after a jump, or it covers the target. */
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    /* Mark the section currently under the nav. */
    var map = {};
    $$('[data-navlink]').forEach(function (link) {
      var id = link.getAttribute('data-navlink');
      var section = document.getElementById(id);
      if (section) map[id] = { link: link, section: section };
    });

    var ids = Object.keys(map);
    if (!ids.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.id;
          if (!map[id]) return;
          if (entry.isIntersecting) {
            ids.forEach(function (other) { map[other].link.classList.remove('is-current'); });
            map[id].link.classList.add('is-current');
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    ids.forEach(function (id) { observer.observe(map[id].section); });
  }

  /* ------------------------------------------------------------------------
     2 + 3. Reveals and stat count-up
     ---------------------------------------------------------------------- */

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(target)) return;

    var suffix = el.getAttribute('data-count-suffix') || '';
    var decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);

    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    var duration = 900;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      /* Matches --ease-blueprint closely enough for a numeric ramp: fast in,
         long settle. No overshoot — the brand doesn't bounce. */
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }

    el.textContent = (0).toFixed(decimals) + suffix;
    requestAnimationFrame(frame);
  }

  function initReveals() {
    var items = $$('[data-reveal]');
    var stats = $$('[data-count-to]');

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          $$('[data-count-to]', entry.target).forEach(countUp);
          if (entry.target.hasAttribute('data-count-to')) countUp(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach(function (el) { observer.observe(el); });

    /* Stats that aren't inside a [data-reveal] still need counting. */
    stats.forEach(function (el) {
      if (!el.closest('[data-reveal]')) observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     4. Consultation picker
     Three steps: details, slot, submit. The slot step is a single collapsed
     field; opening it reveals a month grid beside that day's times, and it
     collapses again once both halves of the slot are answered.
     ---------------------------------------------------------------------- */

  function initConsult() {
    var form = $('[data-consult-form]');
    if (!form) return;

    var nameField = $('[data-consult-name]', form);
    var emailField = $('[data-consult-email]', form);
    var emailError = $('[data-consult-email-error]', form);
    var trigger = $('[data-slot-trigger]', form);
    var panel = $('[data-slot-panel]', form);
    var slotValue = $('[data-slot-value]', form);
    var grid = $('[data-cal-grid]', form);
    var monthOut = $('[data-cal-month]', form);
    var prevBtn = $('[data-cal-prev]', form);
    var nextBtn = $('[data-cal-next]', form);
    var timesWrap = $('[data-consult-times]', form);
    var timesTitle = $('[data-times-title]', form);
    var hint = $('[data-consult-time-hint]', form);
    var submit = $('[data-consult-submit]', form);
    var done = $('[data-consult-done]');
    var steps = $$('.consult__step', form);

    var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var MON_LONG = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    var SLOTS = ['09:00', '09:30', '10:30', '11:00', '13:30', '14:00', '15:00', '16:00'];
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var HORIZON = 12; /* months bookable ahead */

    var chosenDate = null;
    var chosenTime = null;
    var emailTouched = false;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    /* Earliest bookable day is the next working day, never today. */
    var earliest = new Date(today);
    earliest.setDate(earliest.getDate() + 1);

    var lastMonth = new Date(today.getFullYear(), today.getMonth() + HORIZON, 1);
    var view = new Date(earliest.getFullYear(), earliest.getMonth(), 1);

    function isWorkday(d) { return d.getDay() !== 0 && d.getDay() !== 6; }
    function sameDay(a, b) {
      return a && b && a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }
    function longDate(d) {
      return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
    }
    function bookable(d) { return isWorkday(d) && d >= earliest; }

    /* Deterministic stand-in for real availability: the same date always
       offers the same slots. */
    function slotOpen(date, i) {
      return (date.getDate() * 3 + i * 7) % 5 !== 0;
    }

    /* --- Open / close ---------------------------------------------------- */
    function isOpen() { return panel.classList.contains('is-open'); }

    function openPanel() {
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      /* Land focus on the selected day, or the first day that can be booked. */
      var focusTarget = $('.cal__day.is-selected', grid) || $('.cal__day:not(:disabled)', grid);
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    }

    function closePanel(refocus) {
      if (!isOpen()) return;
      panel.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      if (refocus) trigger.focus({ preventScroll: true });
    }

    trigger.addEventListener('click', function () {
      if (isOpen()) closePanel(false);
      else openPanel();
    });

    /* Clicking away or pressing Escape closes it, as a disclosure should. */
    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (!panel.contains(e.target) && !trigger.contains(e.target)) closePanel(false);
    });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closePanel(true); }
    });

    /* --- Calendar --------------------------------------------------------- */
    function buildCalendar() {
      monthOut.textContent = MON_LONG[view.getMonth()] + ' ' + view.getFullYear();

      prevBtn.disabled =
        view.getFullYear() === earliest.getFullYear() && view.getMonth() === earliest.getMonth();
      nextBtn.disabled =
        view.getFullYear() === lastMonth.getFullYear() && view.getMonth() === lastMonth.getMonth();

      var first = new Date(view.getFullYear(), view.getMonth(), 1);
      var lead = (first.getDay() + 6) % 7; /* Monday-first */
      var days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      var cells = Math.ceil((lead + days) / 7) * 7; /* whole weeks only */

      grid.innerHTML = '';

      for (var i = 0; i < cells; i++) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal__day';

        var dayNum = i - lead + 1;
        if (dayNum < 1 || dayNum > days) {
          /* Padding cell — kept in the grid so the columns stay aligned. */
          btn.className += ' cal__day--out';
          btn.disabled = true;
          btn.tabIndex = -1;
          btn.setAttribute('aria-hidden', 'true');
          grid.appendChild(btn);
          continue;
        }

        var d = new Date(view.getFullYear(), view.getMonth(), dayNum);
        var free = bookable(d);

        btn.textContent = String(dayNum);
        btn.disabled = !free;
        btn.tabIndex = -1;
        btn.setAttribute('data-day', dayNum);
        btn.setAttribute(
          'aria-label',
          longDate(d) + (free ? '' : ' — unavailable')
        );

        if (sameDay(d, today)) btn.classList.add('is-today');
        if (sameDay(d, chosenDate)) {
          btn.classList.add('is-selected');
          btn.setAttribute('aria-current', 'date');
        }
        if (free) {
          btn.addEventListener('click', pickDay(d));
        }
        grid.appendChild(btn);
      }

      /* One tab stop into the grid; arrow keys move within it. */
      var entry = $('.cal__day.is-selected', grid) || $('.cal__day:not(:disabled)', grid);
      if (entry) entry.tabIndex = 0;
    }

    /* Marks the selection in place rather than rebuilding the grid. Rebuilding
       would detach the button mid-click, and the outside-click handler would
       then see a target that is no longer inside the panel and close it. */
    function pickDay(d) {
      return function (e) {
        chosenDate = d;
        chosenTime = null;

        $$('.cal__day', grid).forEach(function (c) {
          c.classList.remove('is-selected');
          c.removeAttribute('aria-current');
          if (!c.disabled) c.tabIndex = -1;
        });
        e.currentTarget.classList.add('is-selected');
        e.currentTarget.setAttribute('aria-current', 'date');
        e.currentTarget.tabIndex = 0;

        buildTimes();
        render();

        var firstTime = $('.time:not(:disabled)', timesWrap);
        if (firstTime) firstTime.focus({ preventScroll: true });
      };
    }

    function shift(months) {
      view = new Date(view.getFullYear(), view.getMonth() + months, 1);
      buildCalendar();
      var entry = $('.cal__day:not(:disabled)', grid);
      if (entry) entry.focus({ preventScroll: true });
    }

    prevBtn.addEventListener('click', function () { shift(-1); });
    nextBtn.addEventListener('click', function () { shift(1); });

    /* Arrow keys walk the grid, stepping over unavailable days and rolling
       into the next or previous month at the edges. */
    grid.addEventListener('keydown', function (e) {
      var days = $$('.cal__day', grid);
      var i = days.indexOf(document.activeElement);
      if (i === -1) return;

      var step = 0;
      if (e.key === 'ArrowRight') step = 1;
      else if (e.key === 'ArrowLeft') step = -1;
      else if (e.key === 'ArrowDown') step = 7;
      else if (e.key === 'ArrowUp') step = -7;
      else return;

      e.preventDefault();

      var n = i + step;
      while (n >= 0 && n < days.length && days[n].disabled) n += step > 0 ? 1 : -1;

      if (n >= 0 && n < days.length) {
        days.forEach(function (c) { c.tabIndex = -1; });
        days[n].tabIndex = 0;
        days[n].focus({ preventScroll: true });
        return;
      }

      /* Ran off the end of the month — page across if there's somewhere to go. */
      if (step > 0 && !nextBtn.disabled) shift(1);
      else if (step < 0 && !prevBtn.disabled) shift(-1);
    });

    /* --- Times ------------------------------------------------------------ */
    function buildTimes() {
      timesWrap.innerHTML = '';

      if (!chosenDate) {
        timesTitle.textContent = 'Select a date';
        if (hint) hint.textContent = 'Working days only · 30 minutes · CET';
        return;
      }

      timesTitle.textContent = DOW[chosenDate.getDay()] + ' ' + chosenDate.getDate() + ' ' + MON[chosenDate.getMonth()];

      var open = 0;
      SLOTS.forEach(function (slot, i) {
        var btn = document.createElement('button');
        var free = slotOpen(chosenDate, i);
        btn.type = 'button';
        btn.className = 'time';
        btn.textContent = slot;
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', 'false');
        btn.disabled = !free;
        btn.setAttribute('aria-label', slot + ' CET' + (free ? '' : ' — unavailable'));
        if (free) {
          open++;
          btn.tabIndex = open === 1 ? 0 : -1;
          btn.addEventListener('click', function () { pickTime(btn, slot); });
        }
        timesWrap.appendChild(btn);
      });

      if (hint) {
        hint.textContent = open + ' of ' + SLOTS.length + ' slots open on '
          + longDate(chosenDate) + ' · CET';
      }
    }

    function pickTime(btn, slot) {
      $$('.time', timesWrap).forEach(function (c) {
        c.classList.remove('is-selected');
        c.setAttribute('aria-checked', 'false');
        if (!c.disabled) c.tabIndex = -1;
      });
      btn.classList.add('is-selected');
      btn.setAttribute('aria-checked', 'true');
      btn.tabIndex = 0;
      chosenTime = slot;
      render();

      /* The slot is complete, so the picker folds away and the field carries
         the answer — the collapse the layout is built around. */
      closePanel(true);
    }

    /* Roving arrow keys down the time column. */
    timesWrap.addEventListener('keydown', function (e) {
      var items = $$('.time', timesWrap).filter(function (el) { return !el.disabled; });
      var i = items.indexOf(document.activeElement);
      if (i === -1) return;
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = items[i + 1];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = items[i - 1];
      if (e.key === 'Home') next = items[0];
      if (e.key === 'End') next = items[items.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus({ preventScroll: true });
    });

    /* --- Field value, validation, step state ------------------------------ */
    function emailValid() { return EMAIL.test(emailField.value.trim()); }

    function render() {
      if (chosenDate && chosenTime) {
        slotValue.textContent = longDate(chosenDate) + ' · ' + chosenTime + ' CET';
        trigger.classList.add('is-filled');
      } else if (chosenDate) {
        slotValue.textContent = longDate(chosenDate) + ' — choose a time';
        trigger.classList.add('is-filled');
      } else {
        slotValue.textContent = 'Select a date and time';
        trigger.classList.remove('is-filled');
      }
      sync();
    }

    function sync() {
      var hasName = nameField.value.trim().length > 1;
      var hasEmail = emailValid();
      var showEmailError = emailTouched && emailField.value.trim() !== '' && !hasEmail;

      emailField.classList.toggle('is-error', showEmailError);
      if (emailError) emailError.hidden = !showEmailError;

      steps[0].classList.toggle('is-done', hasName && hasEmail);
      steps[1].classList.toggle('is-done', !!(chosenDate && chosenTime));

      submit.disabled = !(hasName && hasEmail && chosenDate && chosenTime);
    }

    nameField.addEventListener('input', sync);
    emailField.addEventListener('input', sync);
    emailField.addEventListener('blur', function () { emailTouched = true; sync(); });

    /* --- Submit ----------------------------------------------------------- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      emailTouched = true;
      sync();
      if (submit.disabled) return;

      var ref =
        'BP-' +
        String(chosenDate.getFullYear()).slice(2) +
        String(chosenDate.getMonth() + 1).padStart(2, '0') +
        String(chosenDate.getDate()).padStart(2, '0') +
        '-' +
        chosenTime.replace(':', '');

      $('[data-done-name]', done).textContent = nameField.value.trim();
      $('[data-done-email]', done).textContent = emailField.value.trim();
      $('[data-done-date]', done).textContent =
        longDate(chosenDate) + ' · ' + chosenTime + ' CET · 30 min';
      $('[data-done-ref]', done).textContent = ref;

      form.hidden = true;
      done.hidden = false;
      done.setAttribute('tabindex', '-1');
      done.focus({ preventScroll: true });
    });

    var reset = $('[data-consult-reset]', done);
    if (reset) {
      reset.addEventListener('click', function () {
        done.hidden = true;
        form.hidden = false;
        nameField.value = '';
        emailField.value = '';
        emailTouched = false;
        chosenDate = null;
        chosenTime = null;
        view = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
        steps.forEach(function (s) { s.classList.remove('is-done'); });
        buildCalendar();
        buildTimes();
        render();
        nameField.focus();
      });
    }

    buildCalendar();
    buildTimes();
    render();
  }
  /* ------------------------------------------------------------------------
     5. Pinned horizontal scroll
     The section is given a tall height; its stage sticks for that whole
     height and the track translates on X in step with scroll progress.
     Below 900px, or with reduced motion, CSS turns the same markup into an
     ordinary swipeable rail and this module stands down.
     ---------------------------------------------------------------------- */

  function initPin() {
    var section = $('[data-pin]');
    if (!section) return;

    var stage = $('.pin__stage', section);
    var viewport = $('[data-pin-viewport]', section);
    var track = $('[data-pin-track]', section);
    var bar = $('[data-pin-bar]', section);
    var indexOut = $('[data-pin-index]', section);
    var totalOut = $('[data-pin-total]', section);
    var cards = $$('.project', track);
    if (!stage || !track || !cards.length) return;

    if (totalOut) totalOut.textContent = String(cards.length).padStart(2, '0');

    var canPin = window.matchMedia('(min-width: 901px)');
    var distance = 0;
    var active = false;
    var ticking = false;

    function navHeight() {
      var nav = $('[data-nav]');
      return nav ? nav.offsetHeight : 0;
    }

    function unpin() {
      active = false;
      section.style.height = '';
      track.style.transform = '';
      /* Hand over to the same rail styling the mobile breakpoint uses,
         otherwise the stage stays sticky and the later cards are unreachable. */
      section.classList.add('is-unpinned');
    }

    function measure() {
      /* A stage taller than the screen would have its lower half cut off while
         pinned — short, wide windows get the rail instead. */
      var roomy = window.innerHeight - navHeight() >= 640;
      if (!canPin.matches || reduceMotion || !roomy) return unpin();

      /* Reset before measuring, or we'd measure our own transform. */
      section.classList.remove('is-unpinned');
      track.style.transform = 'translate3d(0,0,0)';
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);

      if (distance <= 0) return unpin();

      active = true;
      section.style.height = stage.offsetHeight + distance + 'px';
      update();
    }

    function update() {
      ticking = false;
      if (!active) return;

      var rect = section.getBoundingClientRect();
      var sectionTop = rect.top + window.scrollY;
      var start = sectionTop - navHeight();
      var p = (window.scrollY - start) / distance;
      p = Math.min(Math.max(p, 0), 1);

      track.style.transform = 'translate3d(' + -(p * distance) + 'px,0,0)';

      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';

      /* Read the counter off progress rather than off card geometry: the
         track ends with the last card flush right, so several cards are on
         screen at p=1 and "nearest card" would never reach 04. */
      if (indexOut) {
        var i = Math.round(p * (cards.length - 1)) + 1;
        indexOut.textContent = String(i).padStart(2, '0');
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    /* Re-measure once webfonts land — card text reflows and the track's
       width with it. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(function () {});
    }
    window.addEventListener('load', measure);

    if (canPin.addEventListener) canPin.addEventListener('change', measure);
    else if (canPin.addListener) canPin.addListener(measure);

    measure();
  }

  /* ------------------------------------------------------------------------
     6. Inertial scrolling with an elastic edge

     The wheel stops scrolling the page directly. Instead it feeds a target,
     and each frame the real scroll position eases toward it — that lag is the
     inertia. Past either end of the document the position keeps running while
     the scroll itself can't, and the leftover is applied to .page as a damped
     translate: the bounce.

     Two deliberate limits:
     · Touch is left alone. It already has native momentum and rubber-banding,
       and taking that over always feels worse than the real thing.
     · prefers-reduced-motion opts out entirely — this is motion for its own
       sake, which is exactly what that setting is about.

     Native scrolling stays the source of truth throughout (the script only
     ever calls window.scrollTo), so sticky positioning, the pinned projects
     track and the scrollbar all keep working untouched. The transform is only
     ever set at the very top or bottom of the document, where nothing is
     mid-pin.
     ---------------------------------------------------------------------- */

  function initSmoothScroll() {
    var page = $('[data-page]');
    if (!page) return;
    if (reduceMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var EASE = 0.12;      /* how hard the position chases the target */
    var SPRING = 0.18;    /* how hard an overscrolled target is pulled back */
    var LIMIT = 150;      /* furthest the position may run past an edge */
    var GIVE = 0.55;      /* fraction of that travel the content actually moves */

    var target = window.scrollY;
    var current = target;
    var running = false;
    var selfScroll = false;

    document.documentElement.classList.add('has-smooth');

    function maxScroll() {
      return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    /* Asymptotic damping — the further it's pushed, the less it gives, so the
       edge never feels loose. */
    function give(x) {
      var abs = Math.abs(x);
      return (x < 0 ? -1 : 1) * ((abs * LIMIT) / (abs + LIMIT)) * GIVE;
    }

    function frame() {
      var max = maxScroll();
      var inside = Math.min(Math.max(target, 0), max);

      /* Once the wheel stops feeding it, the target springs back in bounds. */
      target += (inside - target) * SPRING;
      current += (target - current) * EASE;

      var scrollTo = Math.min(Math.max(current, 0), max);
      if (Math.abs(scrollTo - window.scrollY) >= 0.5) {
        selfScroll = true;
        window.scrollTo(0, scrollTo);
      }

      var overshoot = give(current - scrollTo);
      if (Math.abs(overshoot) > 0.05) {
        page.classList.add('is-bouncing');
        page.style.transform = 'translate3d(0,' + (-overshoot).toFixed(2) + 'px,0)';
      } else if (page.style.transform) {
        page.style.transform = '';
        page.classList.remove('is-bouncing');
      }

      if (Math.abs(target - current) > 0.1 || Math.abs(current - scrollTo) > 0.1) {
        requestAnimationFrame(frame);
      } else {
        running = false;
        current = target = window.scrollY;
      }
    }

    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }

    /* An inner scroller that still has room to move in this direction keeps
       the event — the time column, and the project rail on small screens. */
    function scrollableUnder(node, delta) {
      while (node && node !== document.body && node.nodeType === 1) {
        var style = getComputedStyle(node);
        var scrolls = /(auto|scroll)/.test(style.overflowY + style.overflow);
        if (scrolls && node.scrollHeight > node.clientHeight) {
          var room = delta > 0
            ? node.scrollHeight - node.clientHeight - node.scrollTop > 1
            : node.scrollTop > 1;
          if (room) return true;
        }
        node = node.parentNode;
      }
      return false;
    }

    window.addEventListener(
      'wheel',
      function (e) {
        if (e.ctrlKey) return; /* pinch-zoom */
        if (scrollableUnder(e.target, e.deltaY)) return;

        e.preventDefault();

        var delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 16;
        else if (e.deltaMode === 2) delta *= window.innerHeight;

        var max = maxScroll();
        target = Math.min(Math.max(target + delta, -LIMIT), max + LIMIT);
        start();
      },
      { passive: false }
    );

    /* Background tabs get no animation frames, so a loop that was mid-flight
       when the tab was hidden never finishes: `running` would stay true, and
       start() would then refuse to re-arm, leaving the wheel dead on return.
       Coming back resets to wherever the page actually is. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      running = false;
      current = target = window.scrollY;
      page.style.transform = '';
      page.classList.remove('is-bouncing');
    });

    /* Anything that scrolls the page without us — scrollbar, keyboard, focus —
       is adopted rather than fought. */
    window.addEventListener(
      'scroll',
      function () {
        if (selfScroll) { selfScroll = false; return; }
        if (running) return;
        current = target = window.scrollY;
      },
      { passive: true }
    );

    /* In-page anchors ease through the same loop, so every jump on the page
       shares one feel. */
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      var dest = document.getElementById(id);
      if (!dest) return;

      e.preventDefault();

      var nav = $('[data-nav]');
      var offset = (nav ? nav.offsetHeight : 0) + 24;
      target = Math.min(
        Math.max(dest.getBoundingClientRect().top + window.scrollY - offset, 0),
        maxScroll()
      );
      start();

      if (history.replaceState) history.replaceState(null, '', '#' + id);
      /* Keep the keyboard where the click sent it. */
      dest.setAttribute('tabindex', '-1');
      dest.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------------------------------
     Boot
     ---------------------------------------------------------------------- */

  function init() {
    var year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());

    initNav();
    initReveals();
    initConsult();
    initPin();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
