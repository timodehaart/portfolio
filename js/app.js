/* ── Smooth scroll ── */
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();

/* ── Staggered entrance ── */
document.querySelectorAll('[data-enter]').forEach((el) => {
  const delay = parseFloat(el.dataset.enter) || 0;
  setTimeout(() => {
    el.style.transition = 'opacity 1.4s cubic-bezier(0.16,1,0.3,1)';
    el.style.opacity = '1';
  }, delay);
});

/* ── Scroll reveal ── */
const observer = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }),
  { threshold: 0.15 }
);
document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));

/* ── Nav toggle ── */
const toggle  = document.getElementById('menuToggle');
const overlay = document.getElementById('navOverlay');
const header  = document.querySelector('header');

toggle.addEventListener('click', () => {
  const open = overlay.classList.toggle('is-open');
  toggle.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  header.classList.toggle('menu-open', open);
});

/* ── Projects: load from JSON, render, handle detail ── */
async function initProjects() {
  const res  = await fetch('data/projects.json');
  const { slider, projects } = await res.json();

  const track = document.getElementById('sliderTrack');
  track.innerHTML = [...slider, ...slider].map(renderSlide).join('');

  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = projects.map(renderCard).join('');

  /* open detail on card click */
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-project-id]');
    if (!card) return;
    const project = projects.find((p) => p.id === card.dataset.projectId);
    if (project) openDetail(project);
  });
}

function renderSlide({ img, alt }) {
  return `<div class="slide-item"><img src="${img}" alt="${alt}" draggable="false"></div>`;
}

function renderCard({ id, title, tag, software, img, alt }) {
  return `
    <div class="project-item">
      <article class="project-card" data-project-id="${id}">
        <img class="project-card__img" src="${img}" alt="${alt}" draggable="false">
        <div class="project-card__title">
          <span class="project-card__tag">${tag}</span>
          <h3 class="project-card__name-hover">${title}</h3>
        </div>
      </article>
      <div class="project-card__label">
        <span class="project-card__name">${title}</span>
        <span class="project-card__software">${software}</span>
      </div>
    </div>`;
}

/* ── Project detail panel ── */
const detail = document.getElementById('projectDetail');

function openDetail({ title, tag, software, img, alt }) {
  detail.querySelector('.project-detail__title').textContent    = title;
  detail.querySelector('.project-detail__tag').textContent      = tag;
  detail.querySelector('.project-detail__software').textContent = software;
  const image = detail.querySelector('.project-detail__img img');
  image.src = img;
  image.alt = alt;
  detail.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  detail.classList.remove('is-open');
  document.body.style.overflow = '';
}

document.getElementById('detailClose').addEventListener('click', closeDetail);
detail.addEventListener('click', (e) => { if (e.target === detail) closeDetail(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

initProjects();