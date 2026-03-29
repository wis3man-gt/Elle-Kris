/* ── Why Us: stat count-up on scroll ─────────────────── */

const statNums = document.querySelectorAll('.why-us__stat-num');

const countUp = (el) => {
  const target = +el.dataset.target;
  const duration = 1500;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };

  requestAnimationFrame(tick);
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      statNums.forEach(countUp);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const whyUsSection = document.querySelector('.why-us');
if (whyUsSection) statsObserver.observe(whyUsSection);

/* ── Services: staggered card entrance on scroll ─────── */

const serviceCards = document.querySelectorAll('.services__card');

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cards = entry.target.querySelectorAll('.services__card');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('is-visible'), i * 80);
      });
      cardObserver.disconnect();
    }
  });
}, { threshold: 0.1 });

const servicesGrid = document.querySelector('.services__grid');
if (servicesGrid) cardObserver.observe(servicesGrid);

/* ── Copy Phone to Clipboard ────────────────────────── */

const phoneWrapper = document.querySelector('.nav__phone-wrapper');
const phoneLink = document.getElementById('phone-copy');
const tooltip = document.querySelector('.nav__tooltip');

if (phoneWrapper && phoneLink && tooltip) {
  const handleCopy = (e) => {
    e.preventDefault();
    const phoneNumber = phoneLink.innerText.replace(/\s+/g, '');
    
    navigator.clipboard.writeText(phoneNumber).then(() => {
      const originalText = tooltip.innerText;
      tooltip.innerText = 'Copied!';
      tooltip.classList.add('is-copied');
      
      setTimeout(() => {
        tooltip.innerText = originalText;
        tooltip.classList.remove('is-copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  phoneWrapper.addEventListener('click', handleCopy);
}

/* ── Projects: fade-up items on scroll ───────────────── */

const projectObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      projectObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.projects__item').forEach(item => {
  projectObserver.observe(item);
});

/* ── Projects CTA: constant-speed comet ─────────────────── */

const ctaWrap = document.querySelector('.projects__cta-wrap');
const ctaEl   = document.querySelector('.projects__cta');

if (ctaWrap && ctaEl) {
  const comet = document.createElement('div');
  comet.className = 'projects__comet';
  ctaWrap.appendChild(comet);

  const DURATION  = 7000; // ms per lap
  const COMET_W   = 80;   // px  (5rem @ 16px)
  const COMET_H   = 3;    // px

  let geo = {};

  function updateGeo() {
    const cr = ctaEl.getBoundingClientRect();
    const wr = ctaWrap.getBoundingClientRect();
    geo = {
      w:  cr.width,
      h:  cr.height,
      r:  cr.height / 2,          // pill radius clamped to half-height
      ox: cr.left - wr.left,
      oy: cr.top  - wr.top,
    };
  }

  updateGeo();
  window.addEventListener('resize', updateGeo);

  // Returns { x, y, a } at fraction pct (0–1) along the pill border.
  // Travels: top-left → top-right → right cap → bottom-right → bottom-left → left cap
  function pillPoint(pct, w, h, r) {
    const straight = w - 2 * r;
    const curve    = Math.PI * r;
    const total    = 2 * straight + 2 * curve;
    let d = ((pct % 1) + 1) % 1 * total;

    // Top edge → right
    if (d < straight) {
      return { x: r + d, y: 0, a: 0 };
    }
    d -= straight;

    // Right cap clockwise (top → bottom)
    if (d < curve) {
      const t  = d / curve;
      const ca = -Math.PI / 2 + t * Math.PI;
      return { x: (w - r) + r * Math.cos(ca), y: h / 2 + r * Math.sin(ca), a: t * Math.PI };
    }
    d -= curve;

    // Bottom edge ← left
    if (d < straight) {
      return { x: w - r - d, y: h, a: Math.PI };
    }
    d -= straight;

    // Left cap clockwise (bottom → top)
    const t  = d / curve;
    const ca = Math.PI / 2 + t * Math.PI;
    return { x: r + r * Math.cos(ca), y: h / 2 + r * Math.sin(ca), a: Math.PI + t * Math.PI };
  }

  let t0 = null;

  function tick(ts) {
    if (!t0) t0 = ts;
    const pct = ((ts - t0) % DURATION) / DURATION;
    const { x, y, a } = pillPoint(pct, geo.w, geo.h, geo.r);

    // Place the head (right end of comet) at the border point; tail extends backward
    comet.style.transform =
      `translate(${x + geo.ox - COMET_W}px,${y + geo.oy - COMET_H / 2}px) rotate(${a}rad)`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
