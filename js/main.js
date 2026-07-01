/* ================================================================
   YAIPROPERY — MAIN SCRIPT (Vanilla JS ES6)
   --------------------------------------------------------------
   MODUL:
   1. Preloader        — loading ringan
   2. Navbar           — scroll state + mobile toggle
   3. SmoothScroll     — anchor links dengan offset
   4. ScrollAnimation  — Intersection Observer (fade/scale)
   5. Counter          — animasi angka statistik
   6. TestimonialSlider— auto-play + manual nav
   7. BackToTop        — tombol kembali ke atas
   8. ActiveNav        — highlight menu sesuai section
   ================================================================ */

(function () {
  'use strict';

  /* ==============================================================
     UTILITIES
     ============================================================== */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ==============================================================
     1. PRELOADER
     ============================================================== */
  const Preloader = {
    init() {
      const el = $('#preloader');
      if (!el) return;

      window.addEventListener('load', () => {
        setTimeout(() => el.classList.add('is-hidden'), 300);
      });

      // Fallback jika 'load' terlalu lama
      setTimeout(() => el.classList.add('is-hidden'), 2500);
    },
  };


  /* ==============================================================
     2. NAVBAR — scroll state + mobile toggle
     ============================================================== */
  const Navbar = {
    init() {
      this.header   = $('#header');
      this.hamburger = $('#hamburger');
      this.nav      = $('#nav');

      if (!this.header) return;

      this.bindScroll();
      this.bindToggle();
    },

    bindScroll() {
      let ticking = false;

      const onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.header.classList.toggle('is-scrolled', window.scrollY > 50);
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    },

    bindToggle() {
      if (!this.hamburger) return;

      this.hamburger.addEventListener('click', () => {
        const isOpen = this.nav.classList.toggle('is-open');
        this.hamburger.classList.toggle('is-active', isOpen);
        this.hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);
      });

      // Tutup menu saat link diklik
      $$('.nav__link', this.nav).forEach((link) => {
        link.addEventListener('click', () => this.close());
      });

      // Tutup saat klik overlay
      document.addEventListener('click', (e) => {
        if (
          this.nav.classList.contains('is-open') &&
          !this.nav.contains(e.target) &&
          !this.hamburger.contains(e.target)
        ) {
          this.close();
        }
      });

      // Tutup dengan Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.nav.classList.contains('is-open')) {
          this.close();
        }
      });
    },

    close() {
      this.nav.classList.remove('is-open');
      this.hamburger.classList.remove('is-active');
      this.hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    },
  };


  /* ==============================================================
     3. SMOOTH SCROLL — anchor dengan offset header
     ============================================================== */
  const SmoothScroll = {
    init() {
      $$('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href === '#' || href.length < 2) return;

          const target = $(href);
          if (!target) return;

          e.preventDefault();
          const headerH = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--header-h')
          ) || 76;

          const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;

          window.scrollTo({
            top,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        });
      });
    },
  };


  /* ==============================================================
     3b. HERO PARALLAX — subtle parallax on hero background
     ============================================================== */
  const HeroParallax = {
    init() {
      this.hero = $('.hero');
      if (!this.hero || prefersReducedMotion) return;

      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            const maxOffset = 80;
            const offset = Math.min(scrolled * 0.3, maxOffset);
            this.hero.style.backgroundPositionY = `calc(50% - ${offset}px)`;
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
    },
  };


  /* ==============================================================
     4. SCROLL ANIMATION — Intersection Observer
     ============================================================== */
  const ScrollAnimation = {
    init() {
      const items = $$('[data-animate]');
      if (!items.length) return;

      // Jika reduced motion, tampilkan langsung
      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = entry.target.dataset.delay || 0;
              setTimeout(() => entry.target.classList.add('is-visible'), delay);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
      );

      items.forEach((el) => observer.observe(el));
    },
  };


  /* ==============================================================
     5. COUNTER — animasi angka statistik
     ============================================================== */
  const Counter = {
    init() {
      const counters = $$('[data-counter]');
      if (!counters.length) return;

      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        counters.forEach((el) => this.setFinal(el));
        return;
      }

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animate(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach((el) => observer.observe(el));
    },

    animate(el) {
      const target = parseInt(el.dataset.counter, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutExpo untuk feel premium
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString('id-ID') + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString('id-ID') + suffix;
        }
      };

      requestAnimationFrame(step);
    },

    setFinal(el) {
      const target = parseInt(el.dataset.counter, 10) || 0;
      const suffix = el.dataset.suffix || '';
      el.textContent = target.toLocaleString('id-ID') + suffix;
    },
  };


  /* ==============================================================
     6. TESTIMONIAL SLIDER
     ============================================================== */
  const TestimonialSlider = {
    init() {
      this.slider = $('#testimonialSlider');
      if (!this.slider) return;

      this.track   = $('#sliderTrack', this.slider);
      this.slides  = $$('.slider__slide', this.slider);
      this.prevBtn = $('#sliderPrev', this.slider);
      this.nextBtn = $('#sliderNext', this.slider);
      this.dotsWrap = $('#sliderDots', this.slider);

      this.current = 0;
      this.total = this.slides.length;
      this.autoplayDelay = 5000;
      this.autoplayId = null;

      if (!this.total) return;

      this.createDots();
      this.bindEvents();
      this.startAutoplay();
    },

    rebuild() {
      this.stopAutoplay();
      if (this.track) this.track.style.transform = 'translateX(0)';
      if (this.dotsWrap) this.dotsWrap.innerHTML = '';
      this.current = 0;
      this.slides = $$('.slider__slide', this.slider);
      this.total = this.slides.length;
      if (!this.total) return;
      this.createDots();
      this.startAutoplay();
    },

    createDots() {
      const frag = document.createDocumentFragment();

      this.slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Tampilkan testimoni ${i + 1}`);
        if (i === 0) dot.classList.add('is-active');

        dot.addEventListener('click', () => {
          this.goTo(i);
          this.restartAutoplay();
        });

        frag.appendChild(dot);
      });

      this.dots = $$('.slider__dot', frag);
      this.dotsWrap.appendChild(frag);
    },

    bindEvents() {
      this.prevBtn.addEventListener('click', () => {
        this.prev();
        this.restartAutoplay();
      });
      this.nextBtn.addEventListener('click', () => {
        this.next();
        this.restartAutoplay();
      });

      // Pause saat hover
      this.slider.addEventListener('mouseenter', () => this.stopAutoplay());
      this.slider.addEventListener('mouseleave', () => this.startAutoplay());

      // Swipe support untuk touch device
      let startX = 0;

      this.slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });

      this.slider.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? this.prev() : this.next();
          this.restartAutoplay();
        }
      }, { passive: true });

      // Keyboard arrow saat slider ter-focus
      this.slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { this.prev(); this.restartAutoplay(); }
        if (e.key === 'ArrowRight') { this.next(); this.restartAutoplay(); }
      });
    },

    goTo(index) {
      this.current = (index + this.total) % this.total;
      this.track.style.transform = `translateX(-${this.current * 100}%)`;

      this.dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === this.current);
      });
    },

    next() { this.goTo(this.current + 1); },
    prev() { this.goTo(this.current - 1); },

    startAutoplay() {
      if (prefersReducedMotion) return;
      this.stopAutoplay();
      this.autoplayId = setInterval(() => this.next(), this.autoplayDelay);
    },

    stopAutoplay() {
      if (this.autoplayId) clearInterval(this.autoplayId);
    },

    restartAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    },
  };


  /* ==============================================================
     7. BACK TO TOP
     ============================================================== */
  const BackToTop = {
    init() {
      this.btn = $('#backToTop');
      if (!this.btn) return;

      let ticking = false;

      const onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.btn.classList.toggle('is-visible', window.scrollY > 400);
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });

      this.btn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      });
    },
  };


  /* ==============================================================
     8. ACTIVE NAV — highlight menu sesuai section aktif
     ============================================================== */
  const ActiveNav = {
    init() {
      const links = $$('.nav__link');
      if (!links.length || !('IntersectionObserver' in window)) return;

      const map = new Map();
      links.forEach((link) => {
        const id = link.getAttribute('href');
        if (id && id.startsWith('#')) {
          const section = $(id);
          if (section) map.set(section, link);
        }
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              links.forEach((l) => l.classList.remove('is-active'));
              const link = map.get(entry.target);
              if (link) link.classList.add('is-active');
            }
          });
        },
        { threshold: 0.4, rootMargin: '-80px 0px -50% 0px' }
      );

      map.forEach((_, section) => observer.observe(section));
    },
  };


  /* ==============================================================
     9. FOOTER YEAR
     ============================================================== */
  const FooterYear = {
    init() {
      const el = $('#year');
      if (el) el.textContent = new Date().getFullYear();
    },
  };


  /* ==============================================================
     BRAND CHANGE — re-init components when brand switches
     ============================================================== */
  document.addEventListener('brandChanged', function () {
    ScrollAnimation.init();
    TestimonialSlider.rebuild();
  });

  /* ==============================================================
     INIT — jalankan saat DOM siap
     ============================================================== */
  function init() {
    Preloader.init();
    Navbar.init();
    HeroParallax.init();
    SmoothScroll.init();
    ScrollAnimation.init();
    Counter.init();
    TestimonialSlider.init();
    BackToTop.init();
    ActiveNav.init();
    FooterYear.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
