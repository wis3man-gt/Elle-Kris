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
