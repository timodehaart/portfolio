// ─── Lenis Smooth Scroll ───────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// ─── Page Entrance (staggered fade-up) ────────────────────────────────────
const entranceEls = document.querySelectorAll('[data-enter]');

window.addEventListener('DOMContentLoaded', () => {
  entranceEls.forEach((el) => {
    const delay = parseFloat(el.dataset.enter) || 0;

    setTimeout(() => {
      el.style.transition = 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.opacity = '1';
    }, delay);
  });
});


// ─── Scroll Reveal (IntersectionObserver) ─────────────────────────────────
const revealEls = document.querySelectorAll('[data-reveal]');

revealEls.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(36px)';
  el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => observer.observe(el));