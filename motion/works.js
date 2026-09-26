/* ============================================================
 * MOTION / WORKS (Block 04 — «Кейсы», «Не всегда нужно делать больше»)
 * Scroll-triggered entrance (replaces the old blind CSS animation),
 * a decision-path line connecting the A/B/C options, and a two-line
 * masked reveal on the thesis headline.
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION, gsap = window.gsap, ST = window.ScrollTrigger;
  if (!M || !M.ready || M.reduced || !ST || M.isMobile()) return;

  var article = document.querySelector('.cs-rise');
  if (article) {
    article.style.animation = 'none'; // defer to ScrollTrigger below
    gsap.fromTo(article, { opacity: 0, y: 14 }, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: article, start: 'top 82%', once: true }
    });
  }

  // ---- decision path: the existing A/B/C guide line draws downward ----
  var options = document.querySelector('.cs-options');
  if (options) {
    gsap.set(options, { transformOrigin: 'top center' });
    gsap.fromTo(options, { scaleY: 0 }, {
      scaleY: 1, duration: 0.8, ease: 'power2.inOut',
      scrollTrigger: { trigger: options, start: 'top 75%', once: true }
    });
  }

  // ---- thesis reveal: line 1 clean, small pause, then line 2 ----
  var title = document.querySelector('.cs-title');
  if (title && title.children.length >= 2) {
    var line1 = title.children[0], line2 = title.children[1];
    var mask = document.createElement('span');
    mask.style.cssText = 'display:block; overflow:hidden;';
    line2.parentNode.insertBefore(mask, line2);
    mask.appendChild(line2);

    gsap.set(line1, { opacity: 0, y: 10 });
    gsap.set(line2, { yPercent: 100 });

    gsap.timeline({ scrollTrigger: { trigger: title, start: 'top 78%', once: true } })
      .to(line1, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
      .to(line2, { yPercent: 0, duration: 0.55, ease: 'power3.out' }, '+=0.15');
  }
})();
