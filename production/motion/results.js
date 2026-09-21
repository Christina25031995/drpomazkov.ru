/* ============================================================
 * MOTION / RESULTS (Block 03 — «Результат», Before/After)
 * Divider grab/release polish (drag math itself stays untouched —
 * it's already precise), masked text replacement when the selected
 * procedure changes, and a drawn underline on the procedure index.
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION, gsap = M && M.gsap;
  if (!M || !M.ready || M.reduced) return;

  var stage = document.getElementById('ba-stage');
  var divider = document.getElementById('ba-divider');
  var rail = document.getElementById('ba-rail');

  // ---- divider grab / release polish ----
  if (stage && divider) {
    var grip = divider.querySelector('.ba-divider-grip');
    stage.addEventListener('pointerdown', function () {
      if (grip) gsap.fromTo(grip, { scale: 1 }, { scale: 1.18, duration: 0.18, ease: 'power2.out' });
    });
    window.addEventListener('pointerup', function () {
      if (grip) gsap.to(grip, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
  }

  // ---- procedure index: drawn underline on hover (desktop) ----
  if (rail && !M.isMobile()) {
    rail.querySelectorAll('button').forEach(function (btn) {
      var line = document.createElement('i');
      line.className = 'ba-rail-underline';
      line.style.cssText = 'position:absolute; left:0; bottom:0; height:1px; width:100%; background:currentColor; transform:scaleX(0); transform-origin:left center; pointer-events:none;';
      btn.style.position = 'relative';
      btn.appendChild(line);
      var tween = gsap.to(line, { scaleX: 1, duration: 0.35, ease: 'power2.out', paused: true });
      btn.addEventListener('pointerenter', function () { tween.play(); });
      btn.addEventListener('pointerleave', function () { tween.reverse(); });
    });
  }

  // ---- masked text replacement when the procedure changes ----
  // This file loads after app.js's initial (synchronous) render, so
  // the first event it can ever see is already a real user change —
  // no "skip the first one" guard needed.
  var metaEls = ['ba-title', 'ba-term', 'ba-task', 'ba-did', 'ba-result']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  document.addEventListener('pmz:results-step', function () {
    if (!metaEls.length) return;
    gsap.fromTo(metaEls, { y: 8, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.03 });
  });
})();
