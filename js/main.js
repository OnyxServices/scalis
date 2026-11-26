/* ============================================================
   SCALIS — interactions (v2.0)
   Vanilla JS: parallax, scramble text, spotlight cards, counters
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- nav scroll + progress + parallax watermarks ---------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  const heroWatermark = document.getElementById("heroWatermark");
  const footerWord = document.getElementById("footerWord");

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 24);
    
    if (progress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? (y / max) * 100 + "%" : "0%";
    }

    if (!prefersReduced) {
      if (heroWatermark) {
        heroWatermark.style.transform = `translate3d(${y * -0.18}px, 0, 0)`;
      }
      if (footerWord) {
        const rect = footerWord.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          const offset = (window.innerHeight - rect.top) * 0.12;
          footerWord.style.transform = `translate3d(${-offset}px, 0, 0)`;
        }
      }
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      mobileMenu.querySelectorAll("a").forEach((a, i) => {
        a.style.transitionDelay = open ? `${0.12 + i * 0.06}s` : "0s";
      });
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- text scramble effect ---------- */
  const glyphs = "0123456789/+-*#<>";
  function scrambleText(el) {
    if (prefersReduced || el.dataset.scrambled) return;
    el.dataset.scrambled = "1";
    const original = el.textContent;
    let frame = 0;
    const totalFrames = 18;

    const timer = setInterval(() => {
      el.textContent = original
        .split("")
        .map((char, idx) => {
          if (char === " " || char === "—") return char;
          if (idx < (frame / totalFrames) * original.length) return original[idx];
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join("");

      frame++;
      if (frame > totalFrames) {
        el.textContent = original;
        clearInterval(timer);
      }
    }, 28);
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal, .step");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            if (e.target.classList.contains("scramble")) {
              scrambleText(e.target);
            }
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (!Number.isFinite(target)) return;
    if (prefersReduced) {
      el.textContent = target.toLocaleString("es-ES");
      return;
    }
    const dur = 1600;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("es-ES");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- cursor glow & spotlight cards ---------- */
  const glow = document.getElementById("cursorGlow");
  if (glow && finePointer && !prefersReduced) {
    let gx = -100, gy = -100, tx = gx, ty = gy;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });
    (function loop() {
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(loop);
    })();
  } else if (glow) {
    glow.remove();
  }

  if (finePointer) {
    document.querySelectorAll(".spotlight").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }, { passive: true });
    });
  }

  /* ---------- magnetic buttons & tilt cards ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
        btn.style.transform = "translate(0,0)";
        setTimeout(() => (btn.style.transition = ""), 500);
      });
    });

    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateY(${px * 5}deg) rotateX(${py * -5}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
        card.style.transform = "none";
        setTimeout(() => (card.style.transition = ""), 600);
      });
    });
  }

  /* ---------- toast & interactive phone reveal ---------- */
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
  }

  const bigPhone = document.getElementById("bigPhone");
  if (bigPhone) {
    bigPhone.addEventListener("click", () => {
      const phone = bigPhone.dataset.phone || "600 000 000";
      bigPhone.textContent = phone;
      bigPhone.classList.add("revealed");
      if (navigator.clipboard) {
        navigator.clipboard.writeText(phone).catch(() => {});
        showToast(`Teléfono copiado: ${phone}`);
      } else {
        showToast(`Llámanos al ${phone}`);
      }
    });
  }

  /* ---------- form ---------- */
  const form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#f-name");
      const phone = form.querySelector("#f-phone");
      let ok = true;
      [name, phone].forEach((f) => {
        if (!f.value.trim()) {
          f.style.borderBottomColor = "#ff5d5d";
          ok = false;
        } else {
          f.style.borderBottomColor = "";
        }
      });
      if (!ok) {
        showToast("Falta tu nombre o teléfono");
        return;
      }
      form.reset();
      showToast("¡Recibido! Te llamamos en breve.");
    });
  }

  /* ---------- smooth anchor offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });
})();