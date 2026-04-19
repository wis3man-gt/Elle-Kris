/* Stat count-up on scroll (why-us + about-stats) */

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const countUp = (el) => {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix || "";
  const duration = 2400;
  const start = performance.now();

  const tick = (now) => {
    const raw = Math.min((now - start) / duration, 1);
    const progress = easeOutCubic(raw);
    if (raw < 1) {
      el.textContent = Math.floor(progress * target) + suffix;
      requestAnimationFrame(tick);
    } else {
      el.textContent = target + suffix;
    }
  };

  requestAnimationFrame(tick);
};

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelectorAll(".why-us__stat-num").forEach(countUp);
        statsObserver.disconnect();
      }
    });
  },
  { threshold: 0.1 },
);

const whyUsSection = document.querySelector(".why-us");
if (whyUsSection) statsObserver.observe(whyUsSection);

const aboutStatsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelectorAll(".about-stats__num").forEach(countUp);
        aboutStatsObserver.disconnect();
      }
    });
  },
  { threshold: 0.3 },
);

const aboutStats = document.querySelector(".about-stats");
if (aboutStats) aboutStatsObserver.observe(aboutStats);

/* Services: staggered card entrance on scroll */

const serviceCards = document.querySelectorAll(".services__card");

const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll(".services__card");
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add("is-visible"), i * 80);
        });
        cardObserver.disconnect();
      }
    });
  },
  { threshold: 0.05 },
);

const servicesGrid = document.querySelector(".services__grid");
if (servicesGrid) cardObserver.observe(servicesGrid);

/* Logos strip: slow marquee on logo hover */

const logosTrack = document.querySelector(".logos-strip__track");
const logos = document.querySelectorAll(".logos-strip__logo");

if (logosTrack && logos.length && typeof logosTrack.animate === "function") {
  const BASE_RATE = 1;
  const HOVER_RATE = 0.18;
  const RATE_EASE = 0.16;

  logosTrack.classList.add("is-enhanced");

  const logosAnimation = logosTrack.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
    {
      duration: 28000,
      easing: "linear",
      iterations: Infinity,
    },
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
    logo.addEventListener("mouseenter", () => setPlaybackRate(HOVER_RATE));
    logo.addEventListener("mouseleave", () => setPlaybackRate(BASE_RATE));
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      logosAnimation.pause();
      return;
    }

    logosAnimation.play();
    logosAnimation.updatePlaybackRate(targetRate);
  });
}

/* Copy phone to clipboard */

const phoneWrapper = document.querySelector(".nav__phone-wrapper");
const phoneLink = document.getElementById("phone-copy");
const tooltip = document.querySelector(".nav__tooltip");

const phoneWrapperMobile = document.querySelector(".nav__mobile-phone-wrapper");
const phoneLinkMobile = document.getElementById("phone-copy-mobile");
const tooltipMobile = document.querySelector(".nav__mobile-tooltip");

if (phoneWrapper && phoneLink && tooltip) {
  const defaultTooltipText = tooltip.textContent;
  let copyFeedbackTimeout = null;

  const handleCopy = (e) => {
    e.preventDefault();
    const phoneNumber = phoneLink.textContent.replace(/\s+/g, "");

    navigator.clipboard
      .writeText(phoneNumber)
      .then(() => {
        tooltip.textContent = "Copied!";

        if (document.activeElement === phoneLink) {
          phoneLink.blur();
        }

        clearTimeout(copyFeedbackTimeout);
        copyFeedbackTimeout = setTimeout(() => {
          tooltip.textContent = defaultTooltipText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  phoneWrapper.addEventListener("click", handleCopy);
}

/* Contact hero: copy phone numbers to clipboard */

document.querySelectorAll(".contact-hero__phone-wrapper").forEach((wrapper) => {
  const link = wrapper.querySelector(".contact-hero__phone");
  const tip = wrapper.querySelector(".contact-hero__tooltip");
  if (!link || !tip) return;

  const defaultText = tip.textContent;
  let feedbackTimeout = null;

  wrapper.addEventListener("click", (e) => {
    e.preventDefault();
    const number = link.textContent.replace(/\s+/g, "");

    navigator.clipboard
      .writeText(number)
      .then(() => {
        tip.textContent = "Copied!";
        wrapper.classList.add("is-copied");
        wrapper.classList.remove("is-post-copy");
        clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
          wrapper.classList.remove("is-copied");
          wrapper.classList.add("is-post-copy");
          setTimeout(() => { tip.textContent = defaultText; }, 250);
        }, 1000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  });

  wrapper.addEventListener("mouseleave", () => {
    wrapper.classList.remove("is-post-copy");
  });
});

if (phoneWrapperMobile && phoneLinkMobile && tooltipMobile) {
  let copyFeedbackTimeoutMobile = null;

  const handleCopyMobile = (e) => {
    e.preventDefault();
    const phoneNumber = phoneLinkMobile.textContent.replace(/\s+/g, "");

    navigator.clipboard
      .writeText(phoneNumber)
      .then(() => {
        tooltipMobile.classList.add("is-visible");

        clearTimeout(copyFeedbackTimeoutMobile);
        copyFeedbackTimeoutMobile = setTimeout(() => {
          tooltipMobile.classList.remove("is-visible");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  phoneWrapperMobile.addEventListener("click", handleCopyMobile);
}

/* Steps: staggered fade-up entrance on scroll */

const stepsTrack = document.querySelector(".svc-steps__track");

if (stepsTrack) {
  const stepsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target
            .querySelectorAll(".svc-steps__card, .svc-steps__connector")
            .forEach((el, i) => {
              setTimeout(() => el.classList.add("is-visible"), i * 70);
            });
          stepsObserver.disconnect();
        }
      });
    },
    { threshold: 0.1 },
  );

  stepsObserver.observe(stepsTrack);
}

/* Projects: fade-up items on scroll */

const projectObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        projectObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".projects__item").forEach((item) => {
  projectObserver.observe(item);
});

document.querySelectorAll(".proj-card").forEach((card) => {
  projectObserver.observe(card);
});

/* Project card sliders — infinite clone-based loop */

document.querySelectorAll(".proj-card").forEach((card) => {
  const track = card.querySelector(".proj-card__track");
  const origSlides = Array.from(card.querySelectorAll(".proj-card__slide"));
  const prevBtn = card.querySelector(".proj-card__arrow--prev");
  const nextBtn = card.querySelector(".proj-card__arrow--next");

  if (!track || !origSlides.length || !prevBtn || !nextBtn) return;

  const total = origSlides.length;

  /* Prepend and append clones for seamless wrap-around */
  const prependFrag = document.createDocumentFragment();
  origSlides.forEach((s) => prependFrag.appendChild(s.cloneNode(true)));
  track.insertBefore(prependFrag, origSlides[0]);

  const appendFrag = document.createDocumentFragment();
  origSlides.forEach((s) => appendFrag.appendChild(s.cloneNode(true)));
  track.appendChild(appendFrag);

  const allSlides = Array.from(track.querySelectorAll(".proj-card__slide"));

  /* Start at first real slide (after prepended clones) */
  let current = total;
  let isAnimating = false;
  let step = 0; /* cached — recomputed after layout and on resize */

  const computeStep = () => {
    step =
      allSlides.length > 1
        ? allSlides[1].offsetLeft - allSlides[0].offsetLeft
        : allSlides[0].offsetWidth;
  };

  const goTo = (index, animate) => {
    track.style.transition = animate ? "transform 0.4s ease" : "none";
    if (!animate) void track.offsetWidth; /* flush so transition:none takes effect */
    track.style.transform = `translateX(${-index * step}px)`;
  };

  track.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    /* After sliding into clone range, jump silently to the real position */
    if (current >= total * 2) {
      current = total;
      goTo(current, false);
    } else if (current < total) {
      current = total * 2 - 1;
      goTo(current, false);
    }
    isAnimating = false;
  });

  prevBtn.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    current--;
    goTo(current, true);
  });

  nextBtn.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    current++;
    goTo(current, true);
  });

  /* Debounced resize: recalculate step after viewport settles.
     Resets isAnimating in case a mid-animation resize cancelled transitionend. */
  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        computeStep();
        isAnimating = false;
        goTo(current, false);
      }, 150);
    },
    { passive: true },
  );

  /* Double rAF: first frame commits styles, second frame gives mobile browsers
     time to resolve flex-basis percentages before we measure offsetLeft */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      computeStep();
      goTo(current, false);
    });
  });
});

/* Mobile nav: burger + accordion */

const mainNav = document.getElementById("main-nav");
const burgerBtn = document.getElementById("nav-burger");
const mobilePanel = document.getElementById("nav-mobile");

if (mainNav && burgerBtn && mobilePanel) {
  const openMenu = () => {
    mainNav.classList.add("is-open");
    burgerBtn.setAttribute("aria-expanded", "true");
    mobilePanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    mainNav.classList.remove("is-open");
    navOffset = 0;
    mainNav.style.transform = "translateY(0)";
    burgerBtn.setAttribute("aria-expanded", "false");
    mobilePanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  burgerBtn.addEventListener("click", () => {
    mainNav.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mainNav.classList.contains("is-open"))
      closeMenu();
  });
}

/* Nav: slide with scroll — pixel-for-pixel with scroll speed */

let navOffset = 0;
let navHideDistance = 0;

const computeNavHideDistance = () => {
  /* nav must be at translateY(0) when we measure — reset first */
  mainNav.style.transform = "translateY(0)";
  navOffset = 0;
  const rect = mainNav.getBoundingClientRect();
  navHideDistance = rect.top + rect.height;
};

if (mainNav) {
  computeNavHideDistance();
  window.addEventListener("resize", computeNavHideDistance, { passive: true });

  let lastScrollY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      if (mainNav.classList.contains("is-open")) return;

      const y = window.scrollY;
      const delta = y - lastScrollY;
      lastScrollY = y;

      if (y <= 0) {
        navOffset = 0;
      } else {
        navOffset = Math.min(0, Math.max(-navHideDistance, navOffset - delta));
      }

      mainNav.style.transform = `translateY(${navOffset}px)`;
    },
    { passive: true },
  );
}

/* Video performance: only play when in viewport */

const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {
          /* Autoplay might be blocked by browser until user interaction */
        });
      } else {
        video.pause();
      }
    });
  },
  { threshold: 0.05 },
);

document.querySelectorAll("video:not(.hero__video)").forEach((video) => {
  videoObserver.observe(video);
});

/* Contact form: AJAX submit — no redirect, files as real attachments */

const contactFormEl = document.getElementById("contact-form-el");
const contactFormError = document.getElementById("contact-form-error");
const contactSuccessToast = document.getElementById("contact-success-toast");

let toastDismissTimer = null;

const showContactToast = () => {
  if (!contactSuccessToast) return;
  clearTimeout(toastDismissTimer);
  contactSuccessToast.hidden = false;
  toastDismissTimer = setTimeout(() => {
    contactSuccessToast.hidden = true;
  }, 6000);
};

const resetContactForm = () => {
  if (!contactFormEl) return;
  const submitBtn = contactFormEl.querySelector(".contact-form__submit");
  contactFormEl.reset();
  submitBtn.disabled = false;
  submitBtn.textContent = "Request Your Estimate";
  if (contactFormError) contactFormError.hidden = true;
  if (contactSuccessToast) {
    clearTimeout(toastDismissTimer);
    contactSuccessToast.hidden = true;
  }
};

if (contactFormEl) {
  /* Restore clean form state when page is pulled from bfcache */
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) resetContactForm();
  });

  contactFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactFormEl.querySelector(".contact-form__submit");
    const originalLabel = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    if (contactFormError) contactFormError.hidden = true;

    try {
      const res = await fetch(contactFormEl.action, {
        method: "POST",
        body: new FormData(contactFormEl),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        showContactToast();
        contactFormEl.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.errors?.map((err) => err.message).join(" ") ||
          "Something went wrong. Please try again.";
        if (contactFormError) {
          contactFormError.textContent = msg;
          contactFormError.hidden = false;
        }
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    } catch {
      if (contactFormError) {
        contactFormError.textContent =
          "Network error. Please check your connection and try again.";
        contactFormError.hidden = false;
      }
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}

/* Contact page: pin form exactly 3.5 rem below the phone row */

const contactPhones = document.querySelector(".contact-hero__phones");
const contactFormContainer = document.querySelector(".contact-form-container");
const contactHero = document.querySelector(".contact-hero");

const cfServicePlaceholder = document.querySelector(
  "#cf-service option[disabled][value='']"
);
if (cfServicePlaceholder) {
  const mq = window.matchMedia("(max-width: 48rem)");
  const updatePlaceholder = (e) => {
    cfServicePlaceholder.textContent = e.matches
      ? "What type of service are you\nlooking for?"
      : "What type of service are you looking for?";
  };
  updatePlaceholder(mq);
  mq.addEventListener("change", updatePlaceholder);
}

if (contactPhones && contactFormContainer && contactHero) {
  const GAP_REM = 3.5;

  const pinFormBelowPhones = () => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const gap = GAP_REM * rem;
    const phonesBottom = contactPhones.getBoundingClientRect().bottom;
    const heroBottom = contactHero.getBoundingClientRect().bottom;
    const heroMarginBottom = parseFloat(getComputedStyle(contactHero).marginBottom);
    contactFormContainer.style.marginTop = phonesBottom + gap - heroBottom - heroMarginBottom + "px";
  };

  pinFormBelowPhones();
  window.addEventListener("resize", pinFormBelowPhones);
}
