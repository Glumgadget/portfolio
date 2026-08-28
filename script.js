/* =============================================================
   GLUMGADGET PORTFOLIO — script.js
   GSAP-powered entrance + ScrollTrigger reveals.
   Kept deliberately lean: animations highlight information,
   they don't fight it.
   ============================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     0. Guard: if GSAP didn't load, fail gracefully.
     --------------------------------------------------------- */
  if (typeof gsap === 'undefined') {
    console.warn('[glumgadget] GSAP not loaded — animations disabled.');
    document.querySelectorAll('.hero-stagger, .reveal-section')
      .forEach(el => { el.style.opacity = '1'; });
    return;
  }

  /* Register ScrollTrigger plugin */
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* Respect users who asked for reduced motion */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. HERO — staggered fade-in on page load
        Targets every element with .hero-stagger in DOM order.
     --------------------------------------------------------- */
  const heroItems = gsap.utils.toArray('.hero-stagger');

  if (prefersReduced) {
    gsap.set(heroItems, { opacity: 1, y: 0 });
  } else {
    gsap.set(heroItems, { opacity: 0, y: 24 });

    const heroTl = gsap.timeline({ delay: 0.25 });

    heroTl.to(heroItems, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      stagger: 0.12,            // subtle, professional stagger
    });
  }

  /* ---------------------------------------------------------
     2. SCROLLTRIGGER — reveal sections & project cards
        Uses a single reusable pattern: fade + lift.
     --------------------------------------------------------- */
  if (typeof ScrollTrigger !== 'undefined' && !prefersReduced) {

    /* 2a. Section-level reveals (headers, terms box, archive card) */
    gsap.utils.toArray('.reveal-section').forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',     // when top of element hits 85% of viewport
            toggleActions: 'play none none none',
            once: true,           // play once, don't replay on scroll-up
          },
        }
      );
    });

    /* 2b. Project cards — staggered reveal within each grid */
    gsap.utils.toArray('.project-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out',
          delay: (i % 2) * 0.08,   // tiny column offset for visual rhythm
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    });

    /* 2c. Nav border intensifies as user scrolls past hero */
    const nav = document.getElementById('nav');
    if (nav) {
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'bottom top',
        onEnter:    () => nav.classList.add('nav-scrolled'),
        onLeaveBack: () => nav.classList.remove('nav-scrolled'),
      });
    }
  }

  /* ---------------------------------------------------------
     3. SMOOTH SCROLL for in-page anchors
        Native CSS handles this, but we intercept clicks to
        offset for the fixed nav height.
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = 64; // matches h-16 in nav
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: top,
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    });
  });

  /* ---------------------------------------------------------
     4. Current year in footer
     --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     5. ScrollTrigger refresh on full asset load
        (catches font swap reflows)
     --------------------------------------------------------- */
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

})();
