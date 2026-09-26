/* ============================================================
 * MOTION / BOOKING
 * The site "becomes quiet" entering this section: a precise line
 * introduces the booking panel, step content masks in on each
 * change, and a selected date/time gets a quick drawn-outline
 * flash instead of a bare instant fill-swap.
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION, gsap = window.gsap, ST = window.ScrollTrigger;
  if (!M || !M.ready || M.reduced) return;

  /* ---- desktop: section entry line ---- */
  var consultation = document.getElementById('consultation');
  var bkPanel = document.querySelector('.bk-panel');
  if (consultation && bkPanel && ST && !M.isMobile()) {
    var line = document.createElement('i');
    line.style.cssText = 'display:block; position:absolute; left:0; right:0; top:0; height:1px; background:#1b1a18; transform:scaleX(0); transform-origin:left center;';
    bkPanel.style.position = 'relative';
    bkPanel.insertBefore(line, bkPanel.firstChild);
    gsap.set(bkPanel, { opacity: 0, y: 10 });

    ScrollTrigger.create({
      trigger: consultation, start: 'top 70%', once: true,
      onEnter: function () {
        gsap.timeline()
          .to(bkPanel, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
          .to(line, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, '-=0.15');
      }
    });
  }

  /* ---- mobile: sheet becomes quiet on open ---- */
  var sheet = document.getElementById('mb-sheet');
  if (sheet) {
    var wasOpen = false;
    document.addEventListener('pmz:view-change', function (e) {
      var open = e.detail.sheetOpen;
      if (open && !wasOpen) {
        gsap.fromTo(sheet, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
      }
      wasOpen = open;
    });
  }

  /* ---- step content masks in on change (desktop + mobile) ---- */
  function watchFlow(flowGetter, contentId) {
    var lastStep = null;
    var tries = 0;
    var attach = function () {
      var flow = flowGetter();
      if (!flow) { if (tries++ < 20) setTimeout(attach, 100); return; }
      flow.onChange(function () {
        var content = document.getElementById(contentId);
        if (!content) return;
        if (flow.state.step === lastStep) return; // same step, e.g. `copied` toggling
        lastStep = flow.state.step;
        gsap.fromTo(content, { opacity: 0.4, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
      });
    };
    attach();
  }
  watchFlow(function () { return window.PMZ_BOOKING_DESKTOP; }, 'bk-content');
  watchFlow(function () { return window.PMZ_BOOKING_MOBILE; }, 'mb-tab-content');

  /* ---- selected date/time: quick drawn-outline flash on click ---- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('.bk-day, .mb-day, .bk-slot, .mb-slot');
    if (!el || el.disabled) return;
    var flash = document.createElement('span');
    flash.style.cssText = 'position:absolute; inset:0; border:1px solid currentColor; opacity:0.9; pointer-events:none;';
    var prevPosition = getComputedStyle(el).position;
    if (prevPosition === 'static') el.style.position = 'relative';
    el.appendChild(flash);
    gsap.fromTo(flash, { opacity: 0.9, scale: 1 }, {
      opacity: 0, scale: 1.06, duration: 0.35, ease: 'power1.out',
      onComplete: function () { flash.remove(); }
    });
  });
})();
