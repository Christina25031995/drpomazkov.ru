/* ============================================================
 * MOTION / HERO
 * Opening sequence (stroke -> wipe -> media -> title -> controls),
 * subtle cinematic scale drift on the hero video, minimal desktop
 * cursor response. Everything here is purely additive visual
 * polish — the hero is fully correct with this script absent.
 * ============================================================ */
(function () {
  'use strict';
  var M = window.MOTION, gsap = M && M.gsap;
  if (!M) return;

  var hero = document.getElementById('hero');
  var veil = document.getElementById('hero-opening');
  var video = document.querySelector('.hero-video');
  var titleMask = document.querySelector('.hero-title-mask');
  var titleLine = document.querySelector('.hero-title-line');
  var sig = document.querySelector('.hero-sig');
  var eyebrow = document.querySelector('.hero-eyebrow');
  var ctaRow = document.querySelector('.hero-cta-row');
  var topbar = document.querySelector('.hero-topbar');
  var cue = document.querySelector('.hero-cue');
  if (!hero || !veil) return;

  if (!M.ready || M.reduced) {
    veil.hidden = true;
    return;
  }

  // Entrance state: hide what will be revealed so there's no flash of
  // fully-visible content before the sequence runs, but every element
  // keeps its normal layout box (no jump when it appears).
  var revealables = [topbar, eyebrow, ctaRow, cue].filter(Boolean);
  gsap.set(revealables, { opacity: 0 });
  gsap.set(veil, { opacity: 1 });
  if (titleMask && titleLine) {
    titleMask.classList.add('pmz-masking');
    gsap.set(titleLine, { yPercent: 105 });
  }
  if (sig) gsap.set(sig, { opacity: 0 });

  var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.to({}, { duration: 0.35 }); // brief held black field

  tl.to(veil, {
    clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
    duration: 0.55,
    ease: 'power3.inOut',
    onStart: function () { veil.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'; },
    onComplete: function () { veil.hidden = true; }
  }, '-=0.15');

  if (titleMask && titleLine) {
    tl.to(titleLine, { yPercent: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
      .add(function () { titleMask.classList.remove('pmz-masking'); });
  }
  if (sig) tl.to(sig, { opacity: 1, duration: 0.4 }, '-=0.25');

  tl.to(revealables, { opacity: 1, duration: 0.4, stagger: 0.08 }, '-=0.2');

  // Slow cinematic scale drift on the video, independent of the
  // opening sequence — runs for as long as the hero is on screen.
  if (video) {
    gsap.fromTo(video, { scale: 1 }, { scale: 1.025, duration: 14, ease: 'sine.inOut', repeat: -1, yoyo: true });
  }

  // Minimal cursor response, desktop only: content drifts a couple
  // px opposite the pointer — never a tilt, never 3D.
  if (!M.isMobile()) {
    var main = document.querySelector('.hero-main');
    if (main) {
      var qx = gsap.quickTo(main, 'x', { duration: 0.6, ease: 'power2.out' });
      var qy = gsap.quickTo(main, 'y', { duration: 0.6, ease: 'power2.out' });
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        qx(px * -6);
        qy(py * -4);
      });
      hero.addEventListener('pointerleave', function () { qx(0); qy(0); });
    }
  }
})();
