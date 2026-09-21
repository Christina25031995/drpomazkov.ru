/* ============================================================
 * MOTION / REQUESTS (Block 02 — «Ваш запрос»)
 * Desktop: the scroll-scrubbed crossfade math in app.js is left
 * fully untouched — it's already the right model for a pinned/
 * scrubbed section, nothing to add here.
 * Mobile: adds a small depth difference between photo and text
 * while swiping the horizontal rail.
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION;
  if (!M || !M.ready || M.reduced) return;

  var rail = document.getElementById('mq-rail');
  if (rail && M.isMobile()) {
    rail.addEventListener('scroll', function () {
      var slides = rail.children;
      var w = rail.clientWidth;
      for (var i = 0; i < slides.length; i++) {
        var offset = (rail.scrollLeft - i * w) / w; // -1..0..1 relative position
        var img = slides[i].querySelector('img');
        var text = slides[i].querySelector('.mq-slide-text');
        if (img) img.style.transform = 'translateX(' + (offset * -18) + 'px)';
        if (text) text.style.transform = 'translateX(' + (offset * -8) + 'px)';
      }
    }, { passive: true });
  }
})();
