/* ============================================================
 * MOTION / ROUTER (mobile)
 * Nav reveal on first scroll past the hero, and a quiet clip/opacity
 * transition on the newly-active view. Purely additive on top of
 * app.js's existing instant CSS show/hide — if this script fails,
 * the router still works exactly as before, just without the polish.
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION, gsap = window.gsap;
  if (!M || !M.ready || M.reduced) return;
  if (!M.isMobile()) return;

  var navEl = document.getElementById('mb-nav');
  // Initialized from the actual current state (set by app.js's own
  // initial render, which already ran by the time this file loads),
  // not from a blind guess — so the first real navigation this file
  // sees is correctly recognized as a change, not mistaken for it.
  var navHiddenNow = navEl ? getComputedStyle(navEl).opacity === '0' : true;
  var wasNavHidden = navHiddenNow;
  var lastView = (document.body.dataset.mview || 'home') + '|' + (document.body.dataset.msub || 'doctor');

  var VIEW_SELECTORS = {
    home: ['#hero'],
    results: ['#results'],
    case: ['#cases'],
    approach: { doctor: ['#approach', '#path'], journey: ['.mj-wrap'], explains: ['#explains'] }
  };

  function activeEls(view, sub) {
    var entry = VIEW_SELECTORS[view];
    if (!entry) return [];
    var sels = Array.isArray(entry) ? entry : (entry[sub] || []);
    var els = [];
    sels.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) els.push(el);
    });
    return els;
  }

  document.addEventListener('pmz:view-change', function (e) {
    var d = e.detail;

    // nav reveal: quiet 8-12px settle, once, the first time it appears
    if (navEl && wasNavHidden && !d.navHidden) {
      gsap.fromTo(navEl, { y: 10 }, { y: 0, duration: 0.35, ease: 'power2.out' });
    }
    wasNavHidden = d.navHidden;

    // view content: quiet clip/opacity transition on change
    var key = d.view + '|' + d.sub;
    if (key === lastView) return;
    lastView = key;
    if (d.sheetOpen) return; // the sheet covers it — nothing to reveal underneath

    var els = activeEls(d.view, d.sub);
    if (!els.length) return;
    gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.03 });
  });
})();
