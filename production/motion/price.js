/* ============================================================
 * MOTION / PRICE (Block 08 — «Стоимость»)
 * Calm on purpose: one line draws across once, rows stagger in
 * gently. No counters, no spinning numbers.
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION, gsap = window.gsap, ST = window.ScrollTrigger;
  if (!M || !M.ready || M.reduced || !ST || M.isMobile()) return;

  var section = document.getElementById('price');
  var list = section && section.querySelector('.pr-list');
  if (!section || !list) return;

  // The list's own border-top is the "line" — draw a matching
  // overlay across it once, independent of the row content below.
  var lineEl = document.createElement('i');
  lineEl.style.cssText = 'display:block; height:1px; background:rgba(27,26,24,0.2); transform:scaleX(0); transform-origin:left center;';
  list.style.borderTop = 'none';
  list.insertBefore(lineEl, list.firstChild);

  var rows = list.querySelectorAll('.pr-row');
  gsap.set(rows, { opacity: 0, y: 6 });

  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 78%', once: true } })
    .to(lineEl, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' })
    .to(rows, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.06 }, '-=0.25');
})();
