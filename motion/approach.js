/* ============================================================
 * MOTION / APPROACH
 * The cinematic peak of the site: thesis line-reveal, the
 * professional-path line, the patient-journey line (desktop scroll
 * + mobile pager), and the mobile subnav's drawn underline.
 *
 * Note: an earlier version of this file also drew a stroke across
 * the particle figure itself — removed after review, since it read
 * as clutter on top of an already-complex composition. The stroke
 * system stays out of this specific visual.
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION, gsap = window.gsap, ST = window.ScrollTrigger;
  if (!M || !M.ready || M.reduced) return;

  /* ---- 1. Approach thesis: two lines, small pause between (desktop) ---- */
  var h2 = document.querySelector('.ap5-h2');
  if (h2 && h2.children.length >= 2 && ST && !M.isMobile()) {
    Array.prototype.forEach.call(h2.children, function (span) {
      var mask = document.createElement('span');
      mask.style.cssText = 'display:block; overflow:hidden;';
      span.parentNode.insertBefore(mask, span);
      mask.appendChild(span);
      gsap.set(span, { yPercent: 105 });
    });
    var lines = h2.querySelectorAll(':scope > span > span');
    gsap.timeline({ scrollTrigger: { trigger: h2, start: 'top 80%', once: true } })
      .to(lines[0], { yPercent: 0, duration: 0.6, ease: 'power3.out' })
      .to(lines[1], { yPercent: 0, duration: 0.6, ease: 'power3.out' }, '+=0.12');
  }

  /* ---- 2. Professional path: line draws as the section scrolls in ---- */
  var track = document.querySelector('.pp-track');
  if (track && ST && !M.isMobile()) {
    var cols = track.querySelectorAll('.pp-col');
    gsap.set(cols, { opacity: 0.35, y: 6 });
    ST.create({
      trigger: track,
      start: 'top 85%',
      end: 'bottom 60%',
      scrub: 0.4,
      onUpdate: function (self) {
        var n = cols.length;
        var reach = self.progress * n;
        cols.forEach(function (col, i) {
          var on = reach > i;
          gsap.to(col, { opacity: on ? 1 : 0.35, y: on ? 0 : 6, duration: 0.3, overwrite: 'auto' });
        });
      }
    });
  }

  /* ---- 4. Patient journey — desktop: line travels down as you scroll ---- */
  var journeyList = document.querySelector('.pj-list');
  if (journeyList && ST && !M.isMobile()) {
    var nums = journeyList.querySelectorAll('.pj-num');
    gsap.set(nums, { color: 'rgba(27,26,24,0.5)' });
    ST.create({
      trigger: journeyList,
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: 0.4,
      onUpdate: function (self) {
        var reach = self.progress * nums.length;
        nums.forEach(function (n, i) {
          n.style.color = reach > i ? '#8a6a3c' : 'rgba(27,26,24,0.5)';
        });
      }
    });
  }

  /* ---- 5. Patient journey — mobile pager: masked step replacement ---- */
  // Loads after app.js's initial render, so the first event seen
  // here is already a real user step change.
  document.addEventListener('pmz:journey-step', function () {
    var body = document.querySelector('.mj-body');
    if (!body) return;
    gsap.fromTo(body, { opacity: 0.3, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  });

  /* ---- 6. Mobile subnav: drawn underline instead of instant swap ---- */
  var subnav = document.getElementById('mb-subnav');
  if (subnav) {
    var subLines = [];
    var buildSubLines = function () {
      if (subLines.length) return;
      subnav.querySelectorAll('button').forEach(function (btn) {
        var line = document.createElement('i');
        line.style.cssText = 'position:absolute; left:14px; right:14px; bottom:0; height:2px; background:#8a6a3c; transform:scaleX(0); transform-origin:left center;';
        btn.style.position = 'relative';
        btn.appendChild(line);
        subLines.push(line);
      });
    };
    document.addEventListener('pmz:view-change', function (e) {
      if (!e.detail.showSubnav) return;
      buildSubLines();
      var subs = ['doctor', 'journey', 'explains'];
      var idx = subs.indexOf(e.detail.sub);
      subLines.forEach(function (line, i) {
        gsap.to(line, { scaleX: i === idx ? 1 : 0, duration: 0.3, ease: 'power2.out' });
      });
    });
  }
})();
