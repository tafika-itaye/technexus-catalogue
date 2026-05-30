/**
 * TechNexus - security.js
 * Provides:
 *   1. Cookie/analytics consent banner
 *   2. Client-side enquiry form rate limiting
 *   3. Mobile navigation toggle
 *
 * Included on every page via:
 *   <script src="/security.js" defer></script>
 */

(function () {
  'use strict';

  /* -------------------------------------------
     1. COOKIE CONSENT BANNER
     Storage key: tn_consent  ('granted' | 'denied')
  ------------------------------------------- */

  var CONSENT_KEY = 'tn_consent';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  function applyConsent(value) {
    if (value === 'granted') {
      if (!document.getElementById('tn-ga-script')) {
        var s = document.createElement('script');
        s.id = 'tn-ga-script';
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-JZG3NK1DGM';
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-JZG3NK1DGM', { anonymize_ip: true });
      }
    }
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'tn-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');

    var inner = document.createElement('div');
    inner.className = 'tn-cb-inner';

    var p = document.createElement('p');
    p.className = 'tn-cb-text';
    p.textContent = 'We use anonymised analytics (Google Analytics, IP anonymised) to understand how visitors use our site. No advertising cookies. No data sold. ';
    var link = document.createElement('a');
    link.href = '/privacy.html';
    link.textContent = 'Privacy Policy';
    p.appendChild(link);
    p.appendChild(document.createTextNode('.'));

    var btns = document.createElement('div');
    btns.className = 'tn-cb-btns';

    var deny = document.createElement('button');
    deny.id = 'tn-consent-deny';
    deny.type = 'button';
    deny.textContent = 'Decline analytics';

    var accept = document.createElement('button');
    accept.id = 'tn-consent-accept';
    accept.type = 'button';
    accept.className = 'tn-cb-primary';
    accept.textContent = 'Accept analytics';

    btns.appendChild(deny);
    btns.appendChild(accept);
    inner.appendChild(p);
    inner.appendChild(btns);
    banner.appendChild(inner);

    var style = document.createElement('style');
    style.textContent =
      '#tn-consent-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
        'background:rgba(10,18,32,.97);border-top:1px solid rgba(126,184,247,.2);' +
        'padding:14px 16px;font-family:inherit}' +
      '.tn-cb-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;' +
        'flex-wrap:wrap;gap:12px;justify-content:space-between}' +
      '.tn-cb-text{font-size:.8rem;color:#c8d6e8;margin:0;flex:1 1 320px;line-height:1.6}' +
      '.tn-cb-text a{color:#7eb8f7}' +
      '.tn-cb-btns{display:flex;gap:8px;flex-shrink:0}' +
      '#tn-consent-deny,#tn-consent-accept{padding:8px 16px;border-radius:6px;' +
        'border:1px solid rgba(126,184,247,.35);background:transparent;' +
        'color:#c8d6e8;font-size:.8rem;cursor:pointer;white-space:nowrap}' +
      '.tn-cb-primary{background:#7eb8f7!important;color:#0a1220!important;' +
        'border-color:#7eb8f7!important;font-weight:700}' +
      '#tn-consent-deny:hover{background:rgba(255,255,255,.08)}' +
      '.tn-cb-primary:hover{opacity:.9}';

    document.head.appendChild(style);
    document.body.appendChild(banner);

    document.getElementById('tn-consent-accept').addEventListener('click', function () {
      setConsent('granted');
      applyConsent('granted');
      banner.remove();
    });

    document.getElementById('tn-consent-deny').addEventListener('click', function () {
      setConsent('denied');
      banner.remove();
    });
  }

  function initConsent() {
    var existing = getConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildBanner);
      } else {
        buildBanner();
      }
    }
  }

  initConsent();


  /* -------------------------------------------
     2. CLIENT-SIDE RATE LIMITING FOR FORMS
     Max 3 submissions per 5-minute window.
  ------------------------------------------- */

  var RATE_KEY = 'tn_form_rate';
  var MAX_SUBMISSIONS = 3;
  var WINDOW_MS = 5 * 60 * 1000;

  function getRateData() {
    try {
      var raw = localStorage.getItem(RATE_KEY);
      if (!raw) return { timestamps: [] };
      return JSON.parse(raw);
    } catch (e) {
      return { timestamps: [] };
    }
  }

  function saveRateData(data) {
    try { localStorage.setItem(RATE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function isRateLimited() {
    var data = getRateData();
    var now = Date.now();
    data.timestamps = data.timestamps.filter(function (t) {
      return now - t < WINDOW_MS;
    });
    saveRateData(data);
    return data.timestamps.length >= MAX_SUBMISSIONS;
  }

  function recordSubmission() {
    var data = getRateData();
    var now = Date.now();
    data.timestamps = data.timestamps.filter(function (t) {
      return now - t < WINDOW_MS;
    });
    data.timestamps.push(now);
    saveRateData(data);
  }

  function attachRateLimiting() {
    if (typeof window.sendQE === 'function') {
      var originalSendQE = window.sendQE;
      window.sendQE = function () {
        if (isRateLimited()) {
          alert('Too many enquiries submitted. Please wait a few minutes before trying again.');
          return;
        }
        recordSubmission();
        originalSendQE.apply(this, arguments);
      };
    }

    var form = document.getElementById('enquiryForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        if (isRateLimited()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          var msg = document.getElementById('tn-rate-msg');
          if (!msg) {
            msg = document.createElement('p');
            msg.id = 'tn-rate-msg';
            msg.style.cssText = 'color:#f87171;font-size:.82rem;margin-top:8px';
            msg.textContent = 'Too many enquiries submitted. Please wait a few minutes before trying again.';
            form.appendChild(msg);
            setTimeout(function () { if (msg) msg.remove(); }, 10000);
          }
        } else {
          recordSubmission();
        }
      }, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachRateLimiting);
  } else {
    attachRateLimiting();
  }


  /* -------------------------------------------
     3. MOBILE NAVIGATION TOGGLE
     Toggles .nav-open on <header>.
     CSS in styles.css handles show/hide and
     the hamburger-to-X animation.
  ------------------------------------------- */

  function initMobileNav() {
    var btn = document.querySelector('.ham-btn');
    if (!btn) return;

    var header = btn.closest('header');
    if (!header) return;

    btn.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    // Close on nav link click
    var nav = header.querySelector('nav');
    if (nav) {
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          header.classList.remove('nav-open');
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-label', 'Open menu');
        }
      });
    }

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (header.classList.contains('nav-open') && !header.contains(e.target)) {
        header.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }

})();
