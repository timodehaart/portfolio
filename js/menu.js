const toggle = document.getElementById('menuToggle');
const overlay = document.getElementById('navOverlay');
 
toggle.addEventListener('click', () => {
  const isOpen = overlay.classList.toggle('is-open');
  toggle.classList.toggle('is-open', isOpen);
  toggle.setAttribute('aria-expanded', isOpen);
  overlay.setAttribute('aria-hidden', !isOpen);
});
