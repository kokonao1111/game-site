/* ============================================================
   main.js — Bright me up!! アニメーション & インタラクション
   ============================================================ */
(function () {
  'use strict';

  /* ── 0. Viewport helpers ──────────────────────────────── */
  const isTouchDevice = () => window.matchMedia('(hover:none)').matches;
  const isTablet      = () => window.innerWidth >= 640;

  /* ──────────────────────────────────────────
     1. Custom Cursor (desktop only)
  ────────────────────────────────────────── */
  if (!isTouchDevice()) {
    const dot  = Object.assign(document.createElement('div'), { className: 'cursor-dot' });
    const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
    document.body.append(dot, ring);

    let mx = -200, my = -200, rx = -200, ry = -200;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a,button,[role="button"],.cloud')) ring.classList.add('hovered');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a,button,[role="button"],.cloud')) ring.classList.remove('hovered');
    });

    (function lerpRing() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(lerpRing);
    })();
  }

  /* ──────────────────────────────────────────
     2. Hero-top width tracking (follows phone width)
  ────────────────────────────────────────── */
  const heroTop = document.querySelector('.hero-top');
  const heroAudioBtn = document.querySelector('#hero-audio-btn');
  function syncHeroTopWidth() {
    const phone = document.querySelector('.phone');
    if (!heroTop || !phone) return;
    const w = phone.getBoundingClientRect().width;
    heroTop.style.width = w + 'px';
    heroTop.style.left  = phone.getBoundingClientRect().left + 'px';
    heroTop.style.transform = 'none';
  }
  syncHeroTopWidth();
  window.addEventListener('resize', syncHeroTopWidth, { passive: true });

  if (heroAudioBtn) {
    heroAudioBtn.addEventListener('click', () => {
      const heroVideo = document.querySelector('.hero-art video');
      if (!heroVideo) return;
      heroVideo.muted = false;
      heroVideo.play().catch(() => {});
      heroAudioBtn.setAttribute('aria-pressed', 'true');
      heroAudioBtn.style.display = 'none';
    });
  }

  /* ──────────────────────────────────────────
     3. Loader → reveal
  ────────────────────────────────────────── */
  setTimeout(() => {
    document.body.classList.add('loaded');
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.style.transition = 'opacity 0.12s linear';
      loader.style.opacity    = '0';
      setTimeout(() => loader.remove(), 150);
    }
    const heroVideo = document.querySelector('.hero-art video');
    if (heroVideo) {
      heroVideo.currentTime = 0;
      heroVideo.play().catch(() => {});
    }
    checkReveal();
  }, 7000);

  /* ──────────────────────────────────────────
     4. Scroll Reveal
  ────────────────────────────────────────── */
  function markRevealTargets() {
    const targets = [
      { sel: '.story-header',           cls: 'reveal',       delay: 0   },
      { sel: '.story-image',            cls: 'reveal-scale', delay: 80  },
      { sel: '.story-layout .story-image-tablet', cls: 'reveal-scale', delay: 0 },
      { sel: '.story-body',             cls: 'reveal',       delay: 140 },
      { sel: '.story-body-mobile',      cls: 'reveal',       delay: 140 },
      { sel: '.howto-photo',            cls: 'reveal-scale', delay: 60  },
      { sel: '.venue-body',             cls: 'reveal',       delay: 60  },
    ];
    targets.forEach(({ sel, cls, delay }) => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.dataset.revealDone) return;
        el.dataset.revealDone = '1';
        el.classList.add(cls);
        el.style.transitionDelay = delay + 'ms';
      });
    });
    // Howto items — staggered reveal-left
    document.querySelectorAll('.howto-item').forEach((el, i) => {
      if (el.dataset.revealDone) return;
      el.dataset.revealDone = '1';
      el.classList.add('reveal-left');
      el.style.transitionDelay = (i * 100) + 'ms';
    });
  }

  function checkReveal() {
    const vh = window.innerHeight;
    document.querySelectorAll('.reveal,.reveal-scale,.reveal-left,.reveal-right').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.93) el.classList.add('is-visible');
    });
  }

  markRevealTargets();
  window.addEventListener('scroll', checkReveal, { passive: true });
  window.addEventListener('resize', () => { markRevealTargets(); checkReveal(); }, { passive: true });

  /* ──────────────────────────────────────────
     5. Particle system (hero area)
  ────────────────────────────────────────── */
  function initParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const canvas = Object.assign(document.createElement('canvas'), { className: 'particle-canvas' });
    hero.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let W, H;
    const COLORS = ['#ff7bb0','#ffb3d9','#5ce2c5','#ffe55d','#a8f5e5','#ff4fa3'];

    const resize = () => { W = canvas.width = hero.offsetWidth; H = canvas.height = hero.offsetHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x  = Math.random() * W;
        this.y  = init ? Math.random() * H : H + 10;
        this.r  = 2 + Math.random() * 4;
        this.vy = -(0.28 + Math.random() * 0.65);
        this.vx = (Math.random() - 0.5) * 0.35;
        this.alpha    = 0;
        this.maxAlpha = 0.3 + Math.random() * 0.35;
        this.fadeIn   = true;
        this.color    = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.wobble   = Math.random() * Math.PI * 2;
        this.wobbleS  = 0.018 + Math.random() * 0.028;
      }
      update() {
        this.wobble += this.wobbleS;
        this.x += this.vx + Math.sin(this.wobble) * 0.38;
        this.y += this.vy;
        this.alpha += this.fadeIn ? 0.011 : -0.006;
        if (this.alpha >= this.maxAlpha) this.fadeIn = false;
        if (this.y < -10 || this.alpha <= 0) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const COUNT = Math.min(42, window.innerWidth < 640 ? 24 : 42);
    const particles = Array.from({ length: COUNT }, () => new Particle());
    (function loop() { ctx.clearRect(0,0,W,H); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); })();
  }
  initParticles();

  /* ──────────────────────────────────────────
     6. Hero video parallax
  ────────────────────────────────────────── */
  const heroVideo = document.querySelector('.hero-art video');
  if (heroVideo) {
    window.addEventListener('scroll', () => {
      if (window.innerWidth < 480) return; // skip on small mobile
      heroVideo.style.transform = `translateY(${window.scrollY * 0.16}px)`;
    }, { passive: true });
  }

  /* ──────────────────────────────────────────
     7. Cloud 3D tilt (pointer devices only)
  ────────────────────────────────────────── */
  if (!isTouchDevice()) {
    document.querySelectorAll('.cloud').forEach(cloud => {
      cloud.addEventListener('mousemove', e => {
        const r  = cloud.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / r.width;
        const dy = (e.clientY - r.top  - r.height / 2) / r.height;
        cloud.style.transform = `translateY(-7px) scale(1.05) perspective(420px) rotateX(${dy * 12}deg) rotateY(${-dx * 12}deg)`;
      });
      cloud.addEventListener('mouseleave', () => { cloud.style.transform = ''; });
    });
  }

  /* ──────────────────────────────────────────
     8. Cloud blink timing randomisation
  ────────────────────────────────────────── */
  document.querySelectorAll('.cloud-img').forEach(el => {
    el.style.animationDuration = `${(6 + Math.random() * 6).toFixed(2)}s`;
    el.style.animationDelay   = `${(Math.random() * 4).toFixed(2)}s`;
  });

  /* ──────────────────────────────────────────
     9. Howto intersection observer stagger
  ────────────────────────────────────────── */
  const howtoItems = document.querySelectorAll('.howto-item');
  if (howtoItems.length) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        howtoItems.forEach((item, i) => setTimeout(() => item.classList.add('is-visible'), i * 120));
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(howtoItems[0]);
  }

  /* ──────────────────────────────────────────
     10. Nav scroll-spy
  ────────────────────────────────────────── */
  const navLinks = document.querySelectorAll('.nav-bottom a');
  const sectionIds = ['story','howto','venue'];
  window.addEventListener('scroll', () => {
    const mid = window.scrollY + window.innerHeight * 0.5;
    let active = -1;
    sectionIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && mid >= el.offsetTop) active = i;
    });
    navLinks.forEach((l, i) => {
      l.style.color = i === active ? 'var(--col-pink-3)' : '';
    });
  }, { passive: true });

  /* ──────────────────────────────────────────
     11. Intro animation (hero fades in after loader)
  ────────────────────────────────────────── */
  window.addEventListener('load', () => {
    const heroArt = document.querySelector('.hero-art');
    if (heroArt) {
      heroArt.style.cssText += 'opacity:0;transform:scale(0.9) translateY(12px);transition:opacity 0.7s 3.5s ease,transform 0.7s 3.5s ease;';
      requestAnimationFrame(() => { heroArt.style.opacity = '1'; heroArt.style.transform = ''; });
    }
    document.querySelectorAll('.float-pair').forEach((fp, i) => {
      fp.style.cssText += `opacity:0;transition:opacity 0.5s ${3.7 + i * 0.15}s ease;`;
      requestAnimationFrame(() => { fp.style.opacity = '1'; });
    });
  });

})();