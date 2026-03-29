/* Why Us: stat count-up on scroll */

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
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      statNums.forEach(countUp);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const whyUsSection = document.querySelector('.why-us');
if (whyUsSection) statsObserver.observe(whyUsSection);

/* Services: staggered card entrance on scroll */

const serviceCards = document.querySelectorAll('.services__card');

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
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

/* Logos strip: slow marquee on logo hover */

const logosTrack = document.querySelector('.logos-strip__track');
const logos = document.querySelectorAll('.logos-strip__logo');

if (logosTrack && logos.length && typeof logosTrack.animate === 'function') {
  const BASE_RATE = 1;
  const HOVER_RATE = 0.18;
  const RATE_EASE = 0.16;

  logosTrack.classList.add('is-enhanced');

  const logosAnimation = logosTrack.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-50%)' }
    ],
    {
      duration: 28000,
      easing: 'linear',
      iterations: Infinity
    }
  );

  let targetRate = BASE_RATE;
  let rateFrame = null;

  const syncPlaybackRate = () => {
    const currentRate = logosAnimation.playbackRate;
    const nextRate = currentRate + (targetRate - currentRate) * RATE_EASE;

    if (Math.abs(targetRate - nextRate) < 0.01) {
      logosAnimation.updatePlaybackRate(targetRate);
      rateFrame = null;
      return;
    }

    logosAnimation.updatePlaybackRate(nextRate);
    rateFrame = requestAnimationFrame(syncPlaybackRate);
  };

  const setPlaybackRate = (rate) => {
    targetRate = rate;
    if (rateFrame === null) rateFrame = requestAnimationFrame(syncPlaybackRate);
  };

  logos.forEach((logo) => {
    logo.addEventListener('mouseenter', () => setPlaybackRate(HOVER_RATE));
    logo.addEventListener('mouseleave', () => setPlaybackRate(BASE_RATE));
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      logosAnimation.pause();
      return;
    }

    logosAnimation.play();
    logosAnimation.updatePlaybackRate(targetRate);
  });
}

/* Copy phone to clipboard */

const phoneWrapper = document.querySelector('.nav__phone-wrapper');
const phoneLink = document.getElementById('phone-copy');
const tooltip = document.querySelector('.nav__tooltip');

if (phoneWrapper && phoneLink && tooltip) {
  const defaultTooltipText = tooltip.textContent;
  let copyFeedbackTimeout = null;

  const handleCopy = (e) => {
    e.preventDefault();
    const phoneNumber = phoneLink.textContent.replace(/\s+/g, '');

    navigator.clipboard.writeText(phoneNumber).then(() => {
      tooltip.textContent = 'Copied!';

      if (document.activeElement === phoneLink) {
        phoneLink.blur();
      }

      clearTimeout(copyFeedbackTimeout);
      copyFeedbackTimeout = setTimeout(() => {
        tooltip.textContent = defaultTooltipText;
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  phoneWrapper.addEventListener('click', handleCopy);
}

/* Projects: fade-up items on scroll */

const projectObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      projectObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.projects__item').forEach((item) => {
  projectObserver.observe(item);
});

/* Mobile nav: burger + accordion */

const mainNav = document.getElementById('main-nav');
const burgerBtn = document.getElementById('nav-burger');
const mobilePanel = document.getElementById('nav-mobile');

if (mainNav && burgerBtn && mobilePanel) {
  const openMenu = () => {
    mainNav.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    mobilePanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mainNav.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    mobilePanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    mainNav.querySelectorAll('.nav__mobile-item.is-expanded').forEach((el) => {
      el.classList.remove('is-expanded');
      el.querySelector('.nav__mobile-sub')?.setAttribute('aria-hidden', 'true');
    });
  };

  burgerBtn.addEventListener('click', () => {
    mainNav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  mobilePanel.querySelectorAll('.nav__mobile-row').forEach((row) => {
    row.addEventListener('click', () => {
      const item = row.closest('.nav__mobile-item');
      const wasExpanded = item.classList.contains('is-expanded');

      mobilePanel.querySelectorAll('.nav__mobile-item').forEach((i) => {
        i.classList.remove('is-expanded');
        i.querySelector('.nav__mobile-sub')?.setAttribute('aria-hidden', 'true');
      });

      if (!wasExpanded) {
        item.classList.add('is-expanded');
        item.querySelector('.nav__mobile-sub')?.setAttribute('aria-hidden', 'false');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) closeMenu();
  });
}
