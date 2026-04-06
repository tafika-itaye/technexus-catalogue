/**
 * TechNexus Splash Screen
 * Shows on first visit, dismisses for 7 days via cookie.
 * Drop <script src="splash.js" defer></script> before </body> in every HTML page.
 */
(function () {
  'use strict';

  const COOKIE_NAME  = 'tn_splash_dismissed';
  const DAYS_HIDDEN  = 7;
  const WA_NUMBER    = '265889941700';
  const EMAIL        = 'technexus_mw@proton.me';

  /* ── helpers ─────────────────────────────────────────── */
  function getCookie(name) {
    return document.cookie.split('; ').reduce(function (acc, pair) {
      var parts = pair.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1] || '') : acc;
    }, null);
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
  }

  function buildWaLink(msg) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function buildMailLink(subject, body) {
    return 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body='    + encodeURIComponent(body);
  }

  /* ── skip if already dismissed ───────────────────────── */
  if (getCookie(COOKIE_NAME) === '1') return;

  /* ── inject styles ───────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');

    #tn-splash {
      position: fixed; inset: 0; z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Inter', sans-serif;
      /* rich dark-blue grid background matching brand */
      background-color: #080f1c;
      background-image:
        linear-gradient(rgba(30,80,160,.18) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30,80,160,.18) 1px, transparent 1px);
      background-size: 44px 44px;
      overflow: hidden;
    }

    /* radial glow behind card */
    #tn-splash::before {
      content: '';
      position: absolute;
      width: 680px; height: 680px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(30,100,220,.22) 0%, transparent 70%);
      pointer-events: none;
    }

    #tn-splash-card {
      position: relative;
      background: linear-gradient(145deg, rgba(10,22,46,.95) 0%, rgba(7,15,32,.98) 100%);
      border: 1px solid rgba(55,110,210,.35);
      border-radius: 18px;
      padding: 52px 44px 44px;
      max-width: 520px;
      width: calc(100% - 32px);
      box-shadow:
        0 0 0 1px rgba(30,80,200,.1),
        0 24px 80px rgba(0,0,0,.6),
        inset 0 1px 0 rgba(255,255,255,.05);
      text-align: center;
      animation: tn-rise .55s cubic-bezier(.22,.68,0,1.2) both;
    }

    @keyframes tn-rise {
      from { opacity:0; transform: translateY(28px) scale(.97); }
      to   { opacity:1; transform: translateY(0)    scale(1);   }
    }

    /* top badge row */
    #tn-splash-badges {
      display: flex; flex-wrap: wrap; gap: 8px;
      justify-content: center;
      margin-bottom: 28px;
    }
    #tn-splash-badges span {
      font-size: 10px; font-weight: 500; letter-spacing: .08em;
      text-transform: uppercase; color: rgba(150,185,255,.7);
      border: 1px solid rgba(80,130,255,.25);
      border-radius: 20px; padding: 4px 11px;
    }

    /* wordmark */
    #tn-splash h1 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2.4rem, 8vw, 3.4rem);
      font-weight: 800; letter-spacing: -.02em;
      color: #fff; margin: 0 0 4px;
      line-height: 1;
    }
    #tn-splash-line {
      width: 48px; height: 3px;
      background: linear-gradient(90deg, #2563eb, #60a5fa);
      border-radius: 2px;
      margin: 12px auto 18px;
    }

    /* tagline */
    #tn-splash h2 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(.9rem, 3vw, 1.05rem);
      font-weight: 600; letter-spacing: .04em;
      color: #4e9af1; margin: 0 0 14px;
    }
    #tn-splash p {
      font-size: .875rem; font-weight: 300; line-height: 1.65;
      color: rgba(180,205,255,.65); margin: 0 0 10px;
    }

    /* pill tags */
    #tn-splash-tags {
      display: flex; flex-wrap: wrap; gap: 8px;
      justify-content: center; margin: 22px 0 32px;
    }
    #tn-splash-tags span {
      font-size: 11px; font-weight: 500;
      color: rgba(160,200,255,.75);
      border: 1px solid rgba(60,110,220,.3);
      border-radius: 50px; padding: 5px 14px;
      background: rgba(30,70,180,.12);
    }

    /* CTA buttons */
    #tn-splash-ctas {
      display: flex; flex-direction: column; gap: 12px;
      margin-bottom: 28px;
    }
    #tn-splash-ctas a {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 14px 24px;
      border-radius: 10px;
      font-size: .92rem; font-weight: 500; text-decoration: none;
      transition: transform .15s, box-shadow .15s, filter .15s;
      cursor: pointer;
    }
    #tn-splash-ctas a:hover { transform: translateY(-2px); filter: brightness(1.08); }
    #tn-splash-ctas a:active { transform: translateY(0); }

    #tn-btn-trial {
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: #fff;
      box-shadow: 0 4px 20px rgba(37,211,102,.3);
    }
    #tn-btn-demo {
      background: linear-gradient(135deg, #1e4fc2 0%, #1d3b9a 100%);
      color: #fff;
      box-shadow: 0 4px 20px rgba(37,82,255,.25);
    }

    /* svg icons inside buttons */
    #tn-splash-ctas a svg { flex-shrink: 0; }

    /* skip link */
    #tn-splash-skip {
      font-size: .78rem; color: rgba(120,155,210,.5);
      cursor: pointer; text-decoration: underline;
      text-underline-offset: 3px; background: none; border: none;
      padding: 0; transition: color .2s;
    }
    #tn-splash-skip:hover { color: rgba(160,195,255,.75); }

    /* footer info */
    #tn-splash-meta {
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid rgba(55,100,200,.2);
      font-size: .75rem; color: rgba(100,140,200,.5);
      line-height: 1.7;
    }
    #tn-splash-meta a { color: rgba(130,175,255,.55); text-decoration: none; }

    /* dismiss animation */
    #tn-splash.tn-hide {
      animation: tn-fade-out .35s ease forwards;
    }
    @keyframes tn-fade-out {
      to { opacity:0; pointer-events:none; }
    }

    @media (min-width: 500px) {
      #tn-splash-ctas { flex-direction: row; }
      #tn-splash-ctas a { flex: 1; }
    }
  `;
  document.head.appendChild(style);

  /* ── build HTML ──────────────────────────────────────── */
  var waTrialUrl = buildWaLink(
    'Hi TechNexus! I\'d like to sign up for the early trial. Please send me details.'
  );
  var demoMailUrl = buildMailLink(
    'Demo Request — TechNexus',
    'Hi TechNexus team,\n\nI\'d like to book a product demo.\n\nName: \nCompany / Organisation: \nPhone: \nPreferred date/time: \n\nThank you.'
  );
  /* also offer demo via WhatsApp as fallback */
  var demoWaUrl = buildWaLink(
    'Hi TechNexus! I\'d like to book a demo. Could you suggest a convenient time?'
  );

  var overlay = document.createElement('div');
  overlay.id = 'tn-splash';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'TechNexus — Welcome');

  overlay.innerHTML = `
    <div id="tn-splash-card">

      <div id="tn-splash-badges">
        <span>PPDA Registered</span>
        <span>MANePS Active</span>
        <span>MRA Compliant</span>
      </div>

      <h1>TechNexus</h1>
      <div id="tn-splash-line"></div>
      <h2>IT Solutions &middot; Language Services &middot; Equipment Supply</h2>
      <p>Pan-African supplier serving Malawi, Mozambique, Zambia &amp; Southern Africa.</p>
      <p style="font-size:.78rem;color:rgba(120,160,255,.45);margin-top:6px;">
        Hardware &middot; Software &middot; Medical &middot; Language &middot; PC Assembly
      </p>

      <div id="tn-splash-tags">
        <span>ICT Hardware</span>
        <span>PC Assembly</span>
        <span>Software Dev</span>
        <span>Language Services</span>
        <span>Medical Supplies</span>
      </div>

      <div id="tn-splash-ctas">
        <a id="tn-btn-trial" href="${waTrialUrl}" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Sign up for Early Trial
        </a>
        <a id="tn-btn-demo" href="${demoMailUrl}" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          Book a Demo
        </a>
      </div>

      <button id="tn-splash-skip">Continue to site &rarr;</button>

      <div id="tn-splash-meta">
        <strong style="color:rgba(160,195,255,.6)">www.technexusmw.com</strong><br>
        +265 889 941 700 &nbsp;&middot;&nbsp; Blantyre, Malawi<br>
        <a href="${demoWaUrl}" target="_blank" rel="noopener">WhatsApp us</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:${EMAIL}">technexus_mw@proton.me</a>
      </div>

    </div>
  `;

  /* ── dismiss logic ───────────────────────────────────── */
  function dismiss() {
    setCookie(COOKIE_NAME, '1', DAYS_HIDDEN);
    overlay.classList.add('tn-hide');
    setTimeout(function () { overlay.remove(); }, 360);
  }

  /* dismiss on skip button */
  overlay.addEventListener('click', function (e) {
    if (e.target.id === 'tn-splash-skip') dismiss();
  });

  /* dismiss on CTA click (user engaged — no need to show again) */
  overlay.addEventListener('click', function (e) {
    var btn = e.target.closest('#tn-btn-trial, #tn-btn-demo');
    if (btn) setTimeout(dismiss, 400);
  });

  /* dismiss on Escape */
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', handler); }
  });

  /* ── mount ───────────────────────────────────────────── */
  document.body.insertBefore(overlay, document.body.firstChild);
})();
