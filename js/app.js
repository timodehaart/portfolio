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

overlay.querySelectorAll('.nav-list a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    overlay.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', false);
    header.classList.remove('menu-open');
    if (target) lenis.scrollTo(target, { duration: 1.4 });
  });
});

/* ─────────────────────────────────────
   Resume modal
───────────────────────────────────── */
const resumeModal      = document.getElementById('resumeModal');
const resumeFrame      = document.getElementById('resumeFrame');
const resumePreviewBtn = document.getElementById('resumePreviewBtn');
const resumeCloseBtn   = document.getElementById('resumeCloseBtn');
const resumeBackdrop   = document.getElementById('resumeBackdrop');

const RESUME_PDF = './img/resume/resume.pdf';
const RESUME_PREVIEW = './img/resume/resume.png';

function openResumeModal() {
  resumeFrame.src = RESUME_PREVIEW;
  resumeModal.classList.add('is-open');
  lenis.stop();
  document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
  resumeModal.classList.remove('is-open');
  resumeFrame.src = '';
  lenis.start();
  document.body.style.overflow = '';
}

resumePreviewBtn?.addEventListener('click', openResumeModal);
resumeCloseBtn?.addEventListener('click', closeResumeModal);
resumeBackdrop?.addEventListener('click', closeResumeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && resumeModal.classList.contains('is-open')) {
    closeResumeModal();
  }
});

/* ── SPA pages ── */
const pageMain   = document.getElementById('pageMain');
const pageDetail = document.getElementById('pageDetail');

let allProjects = [];

/* ── More-projects strip slider ── */
let stripOffset  = 0;   // current card index offset
let stripVisible = 3;   // how many cards are visible (recalculated on resize)
let stripTotal   = 0;

function getStripVisible() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function updateStripArrows(others) {
  const prev = document.getElementById('morePrev');
  const next = document.getElementById('moreNext');
  if (!prev || !next) return;
  prev.disabled = stripOffset <= 0;
  next.disabled = stripOffset + stripVisible >= others.length;
}

function setStripOffset(offset, others) {
  const strip = document.getElementById('moreProjectsStrip');
  if (!strip) return;
  stripVisible = getStripVisible();
  const cardWidth = strip.children[0]
    ? strip.children[0].getBoundingClientRect().width
    : 0;
  const gap = 24;
  strip.style.transform = `translateX(calc(-${offset} * (${cardWidth}px + ${gap}px)))`;
  stripOffset = offset;
  updateStripArrows(others);
}

function buildMoreStrip(others, currentProject) {
  const strip = document.getElementById('moreProjectsStrip');
  strip.innerHTML = others.map(renderCard).join('');
  strip.style.transform = 'translateX(0)';
  stripOffset = 0;
  stripTotal  = others.length;
  stripVisible = getStripVisible();

  /* wire card clicks */
  strip.querySelectorAll('[data-project-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const p = allProjects.find((x) => x.id === card.dataset.projectId);
      if (p) showDetail(p);
    });
  });

  /* arrow buttons */
  const prev = document.getElementById('morePrev');
  const next = document.getElementById('moreNext');

  // remove old listeners by cloning
  const newPrev = prev.cloneNode(true);
  const newNext = next.cloneNode(true);
  prev.parentNode.replaceChild(newPrev, prev);
  next.parentNode.replaceChild(newNext, next);

  newPrev.addEventListener('click', () => {
    if (stripOffset > 0) setStripOffset(stripOffset - 1, others);
  });
  newNext.addEventListener('click', () => {
    if (stripOffset + getStripVisible() < others.length) setStripOffset(stripOffset + 1, others);
  });

  updateStripArrows(others);
}

/* ── Show/hide pages ── */
function showMain(pushState = true) {
  pageDetail.classList.remove('is-active');
  pageMain.style.display = '';
  lenis.scrollTo(0, { immediate: true });
  if (pushState) history.pushState({ view: 'main' }, '');
}

function showDetail(project, pushState = true) {
  /* title */
  pageDetail.querySelector('.detail-title').textContent = project.title;

  /* description (right panel) */
  pageDetail.querySelector('.detail-desc').textContent = project.description;

  /* stripe meta rows */
  const meta = document.getElementById('detailMeta');
  meta.innerHTML = [
    { label: 'Deliverables', value: project.deliverables.join(', ') },
    { label: 'Tools',        value: project.tools.join(', ')        },
  ].map(({ label, value }) => `
    <div class="detail-meta__row">
      <span class="detail-meta__label">${label}</span>
      <span class="detail-meta__value">${value}</span>
    </div>
  `).join('');

  /* right image/video stack */
  const imgStack = pageDetail.querySelector('.detail-right');
  imgStack.querySelectorAll('.detail-img').forEach((n) => n.remove());

  project.images.forEach(({ src, alt, type }) => {
    const div = document.createElement('div');
    div.className = 'detail-img';

    if (type === 'video') {
      /* autoplay, muted, looping — no controls needed for a showcase reel */
      div.classList.add('detail-img--video');
      div.innerHTML = `
        <video autoplay muted loop playsinline controls>
          <source src="${src}" type="video/mp4">
        </video>`;
    } else {
      div.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy">`;
    }

    imgStack.appendChild(div);
  });

  /* more projects strip */
  const others = allProjects.filter((p) => p.id !== project.id);
  buildMoreStrip(others, project);

  pageMain.style.display = 'none';
  pageDetail.classList.add('is-active');
  lenis.scrollTo(0, { immediate: true });

  if (pushState) history.pushState({ view: 'detail', projectId: project.id }, '');
}

/* ── Browser back/forward ── */
window.addEventListener('popstate', (e) => {
  if (!e.state || e.state.view === 'main') {
    showMain(false);
  } else if (e.state.view === 'detail') {
    const project = allProjects.find((p) => p.id === e.state.projectId);
    if (project) showDetail(project, false);
  }
});

/* ── Projects: load from JSON ── */
async function initProjects() {
  const res  = await fetch('data/projects.json');
  const { slider, projects } = await res.json();
  allProjects = projects;

  history.replaceState({ view: 'main' }, '');

  /* slider */
  const track = document.getElementById('sliderTrack');
  track.innerHTML = slider
    .map(({ img, alt }) => `<div class="slide-item"><img src="${img}" alt="${alt}" draggable="false"></div>`)
    .join('');

  const embla = EmblaCarousel(
    document.getElementById('sliderEmbla'),
    { loop: true, dragFree: true, align: 'start', watchDrag: false },
    [EmblaCarouselAutoScroll({ speed: 1.4, stopOnInteraction: false, stopOnMouseEnter: false })]
  );

  /* project grid */
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = projects.map(renderCard).join('');

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-project-id]');
    if (!card) return;
    const project = projects.find((p) => p.id === card.dataset.projectId);
    if (project) showDetail(project);
  });
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