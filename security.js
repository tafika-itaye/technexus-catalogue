/**
 * TechNexus — security.js
 * Provides:
 *   1. Cookie/analytics consent banner (GDPR)
 *   2. Client-side enquiry form rate limiting
 *
 * Drop this file in the repo root and add to every HTML page:
 *   <script src="/security.js" defer></script>
 * Place the call BEFORE your Google Analytics script tags so
 * GA is only initialised after consent is granted.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. COOKIE CONSENT BANNER
     Storage key: tn_consent  ('granted' | 'denied')
  ───────────────────────────────────────── */

  var CONSENT_KEY = 'tn_consent';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  function applyConsent(value) {
    // Control Google Analytics loading based on consent
    if (value === 'granted') {
      // Load GA only after consent
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
    // If denied, GA is simply never loaded — no action needed.
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'tn-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="tn-cb-inner">' +
        '<p class="tn-cb-text">We use anonymised analytics (Google Analytics, IP anonymised) to understand how visitors use our site. No advertising cookies. No data sold. ' +
        '<a href="/privacy.html">Privacy Policy</a>.</p>' +
        '<div class="tn-cb-btns">' +
          '<button id="tn-consent-deny" type="button">Decline analytics</button>' +
          '<button id="tn-consent-accept" type="button" class="tn-cb-primary">Accept analytics</button>' +
        '</div>' +
      '</div>';

    // Styles injected inline so no extra CSS file is needed
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
      // Already decided — apply without showing banner
      applyConsent(existing);
    } else {
      // Show banner after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildBanner);
      } else {
        buildBanner();
      }
    }
  }

  initConsent();


  /* ─────────────────────────────────────────
     2. CLIENT-SIDE RATE LIMITING FOR FORMS
     Limits: max 3 submissions per 5-minute window.
     Stored in localStorage (client-side only —
     a real backend would enforce server-side limits,
     but for this static WhatsApp-redirect form this
     prevents accidental rapid-fire submissions).
  ───────────────────────────────────────── */

  var RATE_KEY = 'tn_form_rate';
  var MAX_SUBMISSIONS = 3;
  var WINDOW_MS = 5 * 60 * 1000; // 5 minutes

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
    // Purge entries outside the window
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

  // Attach rate limiting to any WhatsApp-redirect form/button on the page
  function attachRateLimiting() {
    // Patch the sendQE function used on index.html
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

    // Patch the credentials.html enquiryForm submit handler
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
      }, true); // capture phase — runs before the existing submit handler
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachRateLimiting);
  } else {
    attachRateLimiting();
  }

})();
