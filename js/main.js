/* ── Nav: click-toggle dropdowns ─────────────────────── */

const navItems = document.querySelectorAll('.nav__item');

navItems.forEach(item => {
  const btn = item.querySelector('.nav__link');

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-active');

    navItems.forEach(i => i.classList.remove('is-active'));

    if (!isOpen) {
      item.classList.add('is-active');
    }
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('.nav__item')) {
    navItems.forEach(i => i.classList.remove('is-active'));
  }
});
