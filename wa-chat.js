/**
 * TechNexus — WhatsApp In-Page Chat Widget
 * Opens a chat panel on the same page. No redirect to WhatsApp app.
 * Intercepts all wa.me links and the FAB button.
 */
(function () {
  'use strict';

  const WA_NUMBER = '265889941700';
  const GREETING = 'Hello TechNexus! I found you on your website and would like to enquire about your services.';

  // ----- Build widget HTML -----
  function buildWidget() {
    const d = document.createElement('div');
    d.id = 'tn-wa-widget';
    d.innerHTML = `
<div id="tn-wa-backdrop" aria-hidden="true"></div>
<div id="tn-wa-panel" role="dialog" aria-modal="true" aria-label="Chat with TechNexus on WhatsApp" hidden>
  <div id="tn-wa-header">
    <div id="tn-wa-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
    </div>
    <div id="tn-wa-info">
      <div id="tn-wa-name">TechNexus Support</div>
      <div id="tn-wa-status"><span id="tn-wa-dot" aria-hidden="true"></span> Typically replies within hours</div>
    </div>
    <button id="tn-wa-close" aria-label="Close chat">&times;</button>
  </div>
  <div id="tn-wa-body">
    <div id="tn-wa-bubble-wrap">
      <div class="tn-wa-bubble tn-wa-bubble-in">
        <span>👋 Hi! How can we help you today?</span>
        <span class="tn-wa-time">TechNexus</span>
      </div>
    </div>
  </div>
  <div id="tn-wa-compose">
    <textarea id="tn-wa-input" rows="2" placeholder="Type a message..." aria-label="Your message"></textarea>
    <button id="tn-wa-send" aria-label="Send via WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
    </button>
  </div>
  <div id="tn-wa-footer">
    <svg viewBox="0 0 24 24" fill="#25D366" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
    Message sends via WhatsApp
  </div>
</div>`;
    document.body.appendChild(d);
    injectStyles();
    bindEvents();
  }

  // ----- CSS -----
  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
#tn-wa-widget { font-family: 'Inter','Segoe UI',system-ui,sans-serif; }
#tn-wa-backdrop {
  display: none; position: fixed; inset: 0; background: rgba(0,0,0,.35);
  z-index: 10000; backdrop-filter: blur(2px);
}
#tn-wa-backdrop.open { display: block; }
#tn-wa-panel {
  position: fixed; bottom: 96px; right: 24px;
  width: 340px; max-width: calc(100vw - 32px);
  background: #f0f2f5; border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,.25), 0 2px 8px rgba(0,0,0,.15);
  z-index: 10001; overflow: hidden;
  transform: translateY(20px) scale(.96); opacity: 0;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s;
  display: flex; flex-direction: column;
}
#tn-wa-panel.open {
  transform: translateY(0) scale(1); opacity: 1;
}
#tn-wa-header {
  background: #075E54; padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
}
#tn-wa-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: #128C7E; display: flex; align-items: center;
  justify-content: center; color: #fff; flex-shrink: 0;
}
#tn-wa-info { flex: 1; }
#tn-wa-name { color: #fff; font-weight: 600; font-size: .9rem; }
#tn-wa-status { color: rgba(255,255,255,.75); font-size: .72rem; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
#tn-wa-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #25D366; display: inline-block;
  animation: tn-pulse 2s infinite;
}
@keyframes tn-pulse {
  0%,100% { opacity: 1; } 50% { opacity: .4; }
}
#tn-wa-close {
  background: transparent; border: none; color: rgba(255,255,255,.8);
  font-size: 1.4rem; cursor: pointer; line-height: 1;
  padding: 4px 6px; border-radius: 50%;
  transition: background .15s, color .15s;
}
#tn-wa-close:hover { background: rgba(255,255,255,.15); color: #fff; }
#tn-wa-body { flex: 1; padding: 16px; overflow-y: auto; max-height: 200px; }
#tn-wa-bubble-wrap { display: flex; flex-direction: column; gap: 8px; }
.tn-wa-bubble {
  max-width: 85%; padding: 10px 14px; border-radius: 12px;
  font-size: .84rem; line-height: 1.5; position: relative;
}
.tn-wa-bubble-in {
  background: #fff; border-radius: 0 12px 12px 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,.1); align-self: flex-start;
  display: flex; flex-direction: column; gap: 4px;
}
.tn-wa-bubble-out {
  background: #d9fdd3; border-radius: 12px 0 12px 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,.1); align-self: flex-end;
  display: flex; flex-direction: column; gap: 4px;
}
.tn-wa-time { font-size: .65rem; color: #8a9299; text-align: right; }
#tn-wa-compose {
  background: #fff; border-top: 1px solid #e9edef;
  padding: 10px 12px; display: flex; gap: 8px; align-items: flex-end;
}
#tn-wa-input {
  flex: 1; border: none; outline: none; resize: none;
  font-size: .85rem; font-family: inherit; color: #3b4a54;
  line-height: 1.4; max-height: 100px;
  background: transparent;
}
#tn-wa-input::placeholder { color: #8a9299; }
#tn-wa-send {
  width: 40px; height: 40px; border-radius: 50%;
  background: #25D366; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  transition: background .15s, transform .1s;
}
#tn-wa-send:hover { background: #1da851; transform: scale(1.07); }
#tn-wa-footer {
  background: #f0f2f5; border-top: 1px solid #e9edef;
  padding: 8px 14px; font-size: .68rem; color: #8a9299;
  display: flex; align-items: center; gap: 5px; justify-content: center;
}
@media(max-width:400px){
  #tn-wa-panel { bottom: 88px; right: 12px; width: calc(100vw - 24px); }
}
[data-theme="dark"] #tn-wa-compose,
[data-theme="dark"] #tn-wa-footer { background: #1c222b; border-color: #2a313a; }
[data-theme="dark"] #tn-wa-body { background: #12181f; }
[data-theme="dark"] .tn-wa-bubble-in { background: #2a313a; color: #e6edf3; }
[data-theme="dark"] #tn-wa-input { color: #e6edf3; }
    `;
    document.head.appendChild(s);
  }

  // ----- Open / Close -----
  function openPanel(prefill) {
    const panel = document.getElementById('tn-wa-panel');
    const back  = document.getElementById('tn-wa-backdrop');
    const inp   = document.getElementById('tn-wa-input');
    if (!panel) return;
    if (prefill && inp) inp.value = prefill;
    panel.removeAttribute('hidden');
    requestAnimationFrame(() => {
      panel.classList.add('open');
      back.classList.add('open');
    });
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  }

  function closePanel() {
    const panel = document.getElementById('tn-wa-panel');
    const back  = document.getElementById('tn-wa-backdrop');
    if (!panel) return;
    panel.classList.remove('open');
    back.classList.remove('open');
    setTimeout(() => panel.setAttribute('hidden', ''), 250);
  }

  function sendMessage() {
    const inp = document.getElementById('tn-wa-input');
    if (!inp) return;
    const msg = inp.value.trim() || GREETING;
    const url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);

    // Show outgoing bubble
    const wrap = document.getElementById('tn-wa-bubble-wrap');
    if (wrap) {
      const b = document.createElement('div');
      b.className = 'tn-wa-bubble tn-wa-bubble-out';
      b.innerHTML = '<span>' + msg.replace(/</g,'&lt;') + '</span><span class="tn-wa-time">You · now</span>';
      wrap.appendChild(b);
      b.scrollIntoView({ behavior: 'smooth' });
    }
    inp.value = '';

    // Open WhatsApp after short delay so user sees the bubble
    setTimeout(() => window.open(url, '_blank', 'noopener'), 600);
  }

  // ----- Event binding -----
  function bindEvents() {
    // Close button
    document.getElementById('tn-wa-close').addEventListener('click', closePanel);
    // Backdrop
    document.getElementById('tn-wa-backdrop').addEventListener('click', closePanel);
    // Send button
    document.getElementById('tn-wa-send').addEventListener('click', sendMessage);
    // Enter key (shift+enter = newline)
    document.getElementById('tn-wa-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // Intercept WAB button in FAB cluster
    document.addEventListener('click', function (e) {
      // FAB WhatsApp button
      const fab = e.target.closest('.wa-fab');
      if (fab && fab.href && fab.href.includes('wa.me')) {
        e.preventDefault();
        openPanel(GREETING);
        return;
      }
      // Header / footer wa.me links
      const waLink = e.target.closest('a[href*="wa.me"]');
      if (waLink) {
        e.preventDefault();
        openPanel(GREETING);
        return;
      }
    }, true);

    // Quick Enquiry "Send via WhatsApp" button — override sendQE
    window._tnWaOpen = function (prefill) { openPanel(prefill || GREETING); };
  }

  // Override sendQE to use the panel
  function patchSendQE() {
    if (typeof window.sendQE !== 'function') return;
    var _orig = window.sendQE;
    window.sendQE = function () {
      var n = document.getElementById('qeName');
      var o = document.getElementById('qeOrg');
      var s = document.getElementById('qeService');
      var m = document.getElementById('qeMsg');
      if (!n || !n.value.trim()) {
        if (n) { n.focus(); n.style.borderColor = 'red'; setTimeout(function () { n.style.borderColor = ''; }, 2000); }
        return;
      }
      var t = 'TechNexus Enquiry\nName: ' + n.value.trim();
      if (o && o.value.trim()) t += '\nOrg: ' + o.value.trim();
      if (s && s.selectedIndex > 0) t += '\nService: ' + s.value;
      if (m && m.value.trim()) t += '\nMessage: ' + m.value.trim();
      openPanel(t);
    };
  }

  // ----- Init -----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { buildWidget(); patchSendQE(); });
  } else {
    buildWidget();
    patchSendQE();
  }
})();
