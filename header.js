/* ============================================================
   header.js — Hamburger Menu Toggle
   ============================================================ */
(function () {
  'use strict';

  const btn      = document.getElementById('hamburger-btn');
  const menu     = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('menu-backdrop');

  if (!btn || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent scroll
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  }

  // Toggle on button click
  btn.addEventListener('click', toggleMenu);

  // Close on backdrop click
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });

  // Close when a drawer link is clicked
  menu.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      // Small delay so navigation feels intentional
      setTimeout(closeMenu, 120);
    });
  });

  // Close if viewport becomes desktop-sized (e.g. rotation)
  const mq = window.matchMedia('(min-width: 640px)');
  mq.addEventListener('change', e => {
    if (e.matches) closeMenu();
  });

})();