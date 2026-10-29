(function () {
  'use strict';
  const toastNode = document.getElementById('toast');
  let toastTimer;
  function toast(message) {
    clearTimeout(toastTimer);
    toastNode.textContent = message;
    toastNode.classList.add('visible');
    toastTimer = setTimeout(() => toastNode.classList.remove('visible'), 4300);
  }
  const focusOrigins = new WeakMap();
  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    focusOrigins.set(dialog, document.activeElement);
    dialog.showModal();
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      const origin = focusOrigins.get(dialog);
      if (origin?.isConnected) origin.focus();
    });
    dialog.addEventListener('click', event => {
      if (event.target.closest('[data-close-dialog]')) dialog.close();
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      }
    });
  });

  const motionButton = document.querySelector('[data-motion]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('umhlanga-motion-paused') === 'true'; } catch { /* The preference still works for this visit. */ }
  function updateMotion() {
    const paused = userPaused || reduceMotion.matches;
    document.body.classList.toggle('motion-paused', paused);
    motionButton.textContent = reduceMotion.matches ? 'Reduced motion' : paused ? 'Play motion' : 'Pause motion';
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.disabled = reduceMotion.matches;
  }
  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('umhlanga-motion-paused', String(userPaused)); } catch { /* Optional persistence. */ }
    updateMotion();
  });
  reduceMotion.addEventListener('change', updateMotion);
  updateMotion();

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  const mobile = matchMedia('(max-width: 900px)');
  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) { closeMenu(true); return; }
    nav.classList.add('is-open');
    document.body.classList.add('menu-open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close menu');
    nav.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', event => {
    if (!nav.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeMenu(true);
    if (event.key === 'Tab') {
      const nodes = [...nav.querySelectorAll('a'), menuButton];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', event => { if (nav.classList.contains('is-open') && !event.target.closest('.site-header')) closeMenu(); });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  mobile.addEventListener('change', () => closeMenu());

  const config = window.BAKEHOUSE_CONFIG.business;
  if (config.addressConfirmed && config.streetAddress.trim()) {
    document.querySelectorAll('[data-business-address]').forEach(node => { node.textContent = config.streetAddress; });
    document.querySelectorAll('[data-address-note]').forEach(node => { node.textContent = 'Please confirm collection arrangements before travelling.'; });
  }
  const contactRoot = document.querySelector('[data-business-contact]');
  if (contactRoot) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
      const a = document.createElement('a'); a.href = `mailto:${config.email}`; a.textContent = config.email; contactRoot.append(a); contactRoot.hidden = false;
    }
    if (/^\+?[0-9 ()-]{7,25}$/.test(config.phone)) {
      const p = document.createElement('p'), a = document.createElement('a'); a.href = `tel:${config.phone.replace(/[^+\d]/g, '')}`; a.textContent = config.phone; p.append(a); contactRoot.append(p); contactRoot.hidden = false;
    }
  }
  window.BAKEHOUSE_UI = Object.freeze({toast, openDialog});
})();
