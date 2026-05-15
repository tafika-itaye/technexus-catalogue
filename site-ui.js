/* TechNexus — shared UI script
 * 1. Dark-mode theme toggle with localStorage + prefers-color-scheme
 * 2. Reveal-on-scroll animation via IntersectionObserver
 * Load with `<script src="site-ui.js" defer></script>` (root)
 *           `<script src="../site-ui.js" defer></script>` (PT/NY)
 */
(function () {
  'use strict';

  // ---------------- Theme ----------------
  var THEME_KEY = 'tn_theme';
  var html = document.documentElement;

  function applyTheme(t) {
    if (t === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    }
  }
  // Apply before DOM-ready to avoid flash
  initTheme();

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.theme-toggle');
    if (!t) return;
    var cur = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  // ---------------- Reveal animations ----------------
  function initReveal() {
    var targets = document.querySelectorAll(
      '.card, .gcard, .scard, .stack-item, .sh, .hero, .badges-strip, .compliance'
    );
    if (!targets.length) return;
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0.01 });
    targets.forEach(function (el) { io.observe(el); });

    // Safety net: force-reveal anything still hidden after 2s (e.g. if IO misses)
    setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();

// ── Hamburger mobile nav toggle ──────────────────────────────────────────────
(function () {
  var btn = document.querySelector('.ham-btn');
  var hdr = document.querySelector('header');
  if (!btn || !hdr) return;

  btn.addEventListener('click', function () {
    var isOpen = hdr.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // close on nav link click (mobile UX)
  document.querySelectorAll('nav a').forEach(function (a) {
    a.addEventListener('click', function () {
      hdr.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // close on outside click
  document.addEventListener('click', function (e) {
    if (hdr.classList.contains('nav-open') && !hdr.contains(e.target)) {
      hdr.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ── Sticky header scroll-glass ───────────────────────────────────────────────
(function () {
  var hdr = document.querySelector('header');
  if (!hdr) return;
  var threshold = 60;

  function onScroll() {
    if (window.scrollY > threshold) {
      hdr.classList.add('header-scrolled');
    } else {
      hdr.classList.remove('header-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();
