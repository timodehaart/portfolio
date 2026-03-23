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
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); } }),
  { threshold: 0.15 }
);
document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

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

/* ── SPA pages ── */
const pageMain   = document.getElementById('pageMain');
const pageDetail = document.getElementById('pageDetail');

function showMain() {
  pageDetail.classList.remove('is-active');
  pageMain.style.display = '';
  lenis.scrollTo(0, { immediate: true });
}

function showDetail(project) {
  /* populate left panel */
  pageDetail.querySelector('.detail-tag').textContent   = project.tag;
  pageDetail.querySelector('.detail-title').textContent = project.title;
  pageDetail.querySelector('.detail-desc').textContent  = project.description;
  pageDetail.querySelector('.detail-year').textContent  = `( _©${project.year} )`;

  /* deliverables list */
  const delList = pageDetail.querySelector('.detail-deliverables');
  delList.innerHTML = project.deliverables
    .map((d) => `<li class="detail-meta__item">${d}</li>`)
    .join('');

  /* tools list */
  const toolList = pageDetail.querySelector('.detail-tools');
  toolList.innerHTML = project.tools
    .map((t) => `<li class="detail-meta__item">${t}</li>`)
    .join('');

  /* right image stack */
  const imgStack = pageDetail.querySelector('.detail-right');
  imgStack.innerHTML = project.images
    .map(({ src, alt }) => `<div class="detail-img"><img src="${src}" alt="${alt}" loading="lazy"></div>`)
    .join('');

  pageMain.style.display = 'none';
  pageDetail.classList.add('is-active');
  lenis.scrollTo(0, { immediate: true });
}

/* ── Projects: load from JSON, render cards + slider ── */
async function initProjects() {
  const res  = await fetch('data/projects.json');
  const { slider, projects } = await res.json();

  /* slider — duplicate for seamless loop */
  const track = document.getElementById('sliderTrack');
  track.innerHTML = [...slider, ...slider]
    .map(({ img, alt }) => `<div class="slide-item"><img src="${img}" alt="${alt}" draggable="false"></div>`)
    .join('');

  /* project grid */
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = projects.map(renderCard).join('');

  /* card click → detail view */
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-project-id]');
    if (!card) return;
    const project = projects.find((p) => p.id === card.dataset.projectId);
    if (project) showDetail(project);
  });

  /* back button */
  document.getElementById('detailBack').addEventListener('click', showMain);
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

initProjects();