/* ============================================================
 * MOTION / GLOBAL
 * Library registration, reduced-motion handling, breakpoint split
 * via gsap.matchMedia(), page-visibility pausing, and small
 * cross-cutting entrances (cookie banner, legal pages, generic
 * image micro-hover). Section-specific motion lives in its own
 * motion/*.js file and reads MOTION.* helpers from here.
 * ============================================================ */
window.MOTION = (function () {
  'use strict';

  var gsap = window.gsap;
  var ready = !!gsap;
  if (ready) {
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);
    if (window.DrawSVGPlugin) gsap.registerPlugin(window.DrawSVGPlugin);
  }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Central place every section script registers cleanup for, so a
  // breakpoint change (matchMedia) or route change can tear down
  // ScrollTriggers/timelines without leaking duplicates.
  var cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  function runCleanup() {
    cleanups.forEach(function (fn) { try { fn(); } catch (e) {} });
    cleanups = [];
  }

  var mm = ready ? gsap.matchMedia() : null;

  // Pause a rAF/interval-driven callback while the tab is hidden or
  // the element itself is off-screen — used by the approach particle
  // interaction hook so it never runs work nobody can see.
  function pauseWhenHidden(el, cb) {
    var io = null;
    var visible = true;
    var active = function () { return visible && !document.hidden; };
    if (window.IntersectionObserver && el) {
      io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }, { rootMargin: '80px' });
      io.observe(el);
    }
    document.addEventListener('visibilitychange', function () { if (active()) cb(true); else cb(false); });
    return { isActive: active, disconnect: function () { if (io) io.disconnect(); } };
  }

  function safeKill(tween) { if (tween && tween.kill) tween.kill(); }

  // ---- quiet, non-blocking entrances that don't need a whole file ----
  function cookieBannerEntrance() {
    var el = document.getElementById('cookie-banner');
    if (!el) return;
    var mo = new MutationObserver(function () {
      if (el.hidden) return;
      if (!ready || reduced) return;
      gsap.fromTo(el, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    });
    mo.observe(el, { attributes: true, attributeFilter: ['hidden'] });
  }

  function legalPageEntrance() {
    var page = document.querySelector('.lg-page');
    if (!page || !ready || reduced) return;
    gsap.fromTo(page, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
  }

  // Very restrained image micro-hover: scale ~1 -> 1.015, desktop only.
  function imageMicroHover(selector) {
    if (!ready || reduced) return;
    if (window.innerWidth <= 900) return;
    document.querySelectorAll(selector).forEach(function (img) {
      var tween = gsap.to(img, { scale: 1.015, duration: 0.6, ease: 'power2.out', paused: true });
      img.style.transformOrigin = '50% 50%';
      img.addEventListener('pointerenter', function () { tween.play(); });
      img.addEventListener('pointerleave', function () { tween.reverse(); });
    });
  }

  return {
    gsap: gsap,
    ready: ready,
    reduced: reduced,
    isMobile: function () { return window.innerWidth <= 900; },
    matchMedia: mm,
    onCleanup: onCleanup,
    runCleanup: runCleanup,
    pauseWhenHidden: pauseWhenHidden,
    safeKill: safeKill,
    cookieBannerEntrance: cookieBannerEntrance,
    legalPageEntrance: legalPageEntrance,
    imageMicroHover: imageMicroHover
  };
})();

window.MOTION.cookieBannerEntrance();
window.MOTION.legalPageEntrance();
