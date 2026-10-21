"use strict";
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = document.getElementById("page-loader");
  /* The loader dismisses itself via CSS; JS only cleans up and covers back/forward cache restores. */
  setTimeout(() => loader?.remove(), 2800);
  addEventListener("pageshow", e => { if (e.persisted) loader?.remove(); });
  if (reduced) { loader?.remove(); return; }
  document.documentElement.classList.add("motion-ready");
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); }
  }, { threshold: .06, rootMargin: "0px 0px 30px 0px" });
  const watch = () => document.querySelectorAll(".reveal,.project-card,.contributor-card").forEach(el => {
    if (!el.dataset.motion) { el.dataset.motion = "1"; io.observe(el); }
  });
  watch();
  const grid = document.getElementById("project-grid");
  if (grid) new MutationObserver(watch).observe(grid, { childList: true });
  const cg = document.getElementById("contributors-grid");
  if (cg) new MutationObserver(watch).observe(cg, { childList: true });
  const glow = document.getElementById("cursor-glow");
  if (glow && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let p = false, x = 0, y = 0;
    addEventListener("pointermove", e => {
      x = e.clientX; y = e.clientY;
      if (p) return; p = true;
      requestAnimationFrame(() => { p = false; glow.style.transform = "translate(" + x + "px," + y + "px)"; glow.style.opacity = "1"; });
    }, { passive: true });
  }
})();
