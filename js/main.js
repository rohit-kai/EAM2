/* =========================================================
   AURELIA - main.js
   Navbar scroll state, mobile drawer, counters, reveals
   ========================================================= */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------
     1. Sticky navbar - glassmorphism on scroll
     --------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const scrollCue = document.getElementById("scrollCue");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (navbar) {
      navbar.classList.toggle("is-scrolled", y > 40);
    }

    if (scrollCue) {
      scrollCue.classList.toggle("is-hidden", y > 80);
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  /* ---------------------------------------------
     2. Mobile slide-out menu
     --------------------------------------------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  const scrim = document.getElementById("navScrim");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
  }

  if (scrim) {
    scrim.addEventListener("click", function () {
      setMenu(false);
    });
  }

  if (menu) {
    menu.addEventListener("click", function (e) {
      const link = e.target.closest("a");
      if (link) setMenu(false);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      setMenu(false);
    }
  });

  // Reset drawer state when returning to desktop widths
  const desktop = window.matchMedia("(min-width: 901px)");
  const handleBreakpoint = function (e) {
    if (e.matches) setMenu(false);
  };
  if (desktop.addEventListener) desktop.addEventListener("change", handleBreakpoint);
  else if (desktop.addListener) desktop.addListener(handleBreakpoint);

  /* ---------------------------------------------
     3. Animated counters (IntersectionObserver)
     --------------------------------------------- */
  const counters = Array.prototype.slice.call(document.querySelectorAll(".counter"));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-target"), 10) || 0;

    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }

    const duration = 1700;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (c) {
        counterObserver.observe(c);
      });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------------------------------------------
     4. Subtle reveal-on-scroll
     --------------------------------------------- */
  const reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reveals.length) {
    if ("IntersectionObserver" in window && !prefersReduced) {
      const revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
      );
      reveals.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* ---------------------------------------------
     5. Active nav link for in-page sections
     --------------------------------------------- */
  const sectionLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__menu .nav__link[href^="#"]')
  );

  if (sectionLinks.length && "IntersectionObserver" in window) {
    const map = {};
    sectionLinks.forEach(function (link) {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (section) map[id] = link;
    });

    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            document
              .querySelectorAll(".nav__menu .nav__link")
              .forEach(function (l) {
                l.classList.remove("is-active");
              });
            const active = map[entry.target.id];
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    Object.keys(map).forEach(function (id) {
      sectionObserver.observe(document.getElementById(id));
    });
  }

  /* ---------------------------------------------
     6. Footer year
     --------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
