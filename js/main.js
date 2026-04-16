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
        clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
          tip.textContent = defaultText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
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
const contactFormSuccess = document.getElementById("contact-form-success");
const contactFormError = document.getElementById("contact-form-error");

const resetContactForm = () => {
  if (!contactFormEl) return;
  const submitBtn = contactFormEl.querySelector(".contact-form__submit");
  contactFormEl.reset();
  contactFormEl.hidden = false;
  submitBtn.disabled = false;
  submitBtn.textContent = "Request Your Estimate";
  if (contactFormSuccess) contactFormSuccess.hidden = true;
  if (contactFormError) contactFormError.hidden = true;
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
        contactFormEl.hidden = true;
        if (contactFormSuccess) contactFormSuccess.hidden = false;
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
    contactFormContainer.style.marginTop = phonesBottom + gap - heroBottom + "px";
  };

  pinFormBelowPhones();
  window.addEventListener("resize", pinFormBelowPhones);
}
