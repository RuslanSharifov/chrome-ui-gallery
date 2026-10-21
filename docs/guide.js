"use strict";
(() => {
  document.querySelectorAll(".code .copy").forEach(btn => btn.addEventListener("click", async () => {
    const text = btn.parentElement.querySelector("code").textContent;
    try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
    catch { btn.textContent = "Press Ctrl+C"; }
    setTimeout(() => (btn.textContent = "Copy"), 1600);
  }));
  const links = [...document.querySelectorAll(".toc a")];
  const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) {
      links.forEach(a => a.classList.remove("active"));
      const a = map.get(e.target.id); a?.classList.add("active");
      a?.scrollIntoView({ block: "nearest", inline: "center" });
    }
  }, { rootMargin: "-20% 0px -70% 0px" });
  document.querySelectorAll(".guide-block").forEach(s => io.observe(s));
})();
