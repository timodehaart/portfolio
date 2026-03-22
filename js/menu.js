const toggle = document.getElementById('menuToggle');
const overlay = document.getElementById('navOverlay');
const header = document.querySelector('header');

toggle.addEventListener('click', () => {
  const isOpen = overlay.classList.toggle('is-open');
  toggle.classList.toggle('is-open', isOpen);
  toggle.setAttribute('aria-expanded', isOpen);
  overlay.setAttribute('aria-hidden', !isOpen);
  header.classList.toggle('menu-open', isOpen);
});