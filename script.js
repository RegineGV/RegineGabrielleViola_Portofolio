const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.filter.active')?.classList.remove('active');
  button.classList.add('active');
  const filter = button.dataset.filter;
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.category !== filter;
  });
}));

// Reveal selected content as it enters the viewport; skip motion when requested by the device.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('has-motion');
  const revealGroups = [
    ['.about-grid > *', 80],
    ['.skill-cloud .skill-pill', 45],
    ['.work-heading > *', 90],
    ['.filter-row', 0],
    ['.project-card', 85],
    ['.journey-grid > *', 100],
    ['.recognition-grid > *', 100],
    ['.contact-inner > *', 70],
  ];
  const revealItems = new Set();
  revealGroups.forEach(([selector, stagger]) => {
    document.querySelectorAll(selector).forEach((item, index) => {
      item.dataset.reveal = '';
      item.style.setProperty('--reveal-delay', String(Math.min(index, 6) * stagger) + 'ms');
      revealItems.add(item);
    });
  });
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
}
