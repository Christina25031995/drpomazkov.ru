/* ============================================================
 * MOTION / EXPLAINS (Block 09 — «Филипп объясняет»)
 * Editorial index: a quiet drawn underline marks the item on hover/
 * selection, the preview panel changes through a masked wipe rather
 * than a plain swap (ready for real video later — the effect is on
 * the container, not on placeholder content).
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION, gsap = window.gsap;
  if (!M || !M.ready || M.reduced) return;

  var list = document.getElementById('ex-list');
  var preview = document.querySelector('.ex-preview');
  if (!list) return;

  var items = list.querySelectorAll('.ex-item');
  items.forEach(function (btn) {
    var line = document.createElement('i');
    line.style.cssText = 'position:absolute; left:44px; right:0; bottom:0; height:1px; background:#c69a64; transform:scaleX(0); transform-origin:left center; pointer-events:none;';
    btn.style.position = 'relative';
    btn.appendChild(line);
    var tween = gsap.to(line, { scaleX: 1, duration: 0.35, ease: 'power2.out', paused: true });
    btn.addEventListener('pointerenter', function () { tween.play(); });
    btn.addEventListener('pointerleave', function () { tween.reverse(); });
  });

  if (preview) {
    // Loads after app.js's initial render, so the first event this
    // ever sees is already a real selection change.
    document.addEventListener('pmz:explains-step', function () {
      gsap.fromTo(preview, { opacity: 0.55 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      gsap.fromTo(preview, { x: 6 }, { x: 0, duration: 0.4, ease: 'power2.out' });
    });
  }
})();
