(() => {
  "use strict";
  const root = document.documentElement;
  const toast = document.getElementById("toast");

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  };

  const views = [...document.querySelectorAll(".view")];
  const navItems = [...document.querySelectorAll(".nav__item")];
  navItems.forEach((item) => item.addEventListener("click", () => {
    const target = item.dataset.view;
    navItems.forEach((button) => button.classList.toggle("is-active", button === item));
    views.forEach((view) => { const active = view.id === target; view.hidden = !active; view.classList.toggle("is-visible", active); });
  }));

  const graph = document.getElementById("graph");
  const levels = [0, 1, 2, 0, 3, 2, 1, 4, 2, 3, 0, 1, 2, 4, 3, 2, 1, 0];
  for (let i = 0; i < 91; i += 1) {
    const cell = document.createElement("i");
    cell.dataset.level = levels[(i * 7 + i % 5) % levels.length];
    graph.appendChild(cell);
  }

  document.getElementById("newRepo").addEventListener("click", () => showToast("Repository creation flow opened"));
  document.getElementById("themeToggle").addEventListener("click", () => {
    root.classList.toggle("soft-glow");
    showToast(root.classList.contains("soft-glow") ? "Soft glow enabled" : "Full glow enabled");
  });

  const bindRange = (id, output, suffix, transform = (value) => value) => {
    const input = document.getElementById(id);
    const out = document.getElementById(output);
    const sync = () => {
      const value = Number(input.value);
      out.textContent = transform(value) + suffix;
      if (id === "blur") root.style.setProperty("--blur", value + "px");
      if (id === "opacity") root.style.setProperty("--glass-opacity", value / 100);
      if (id === "glow") root.style.setProperty("--glow", value / 100);
    };
    input.addEventListener("input", sync);
    sync();
  };

  bindRange("blur", "blurValue", "px");
  bindRange("opacity", "opacityValue", "%");
  bindRange("glow", "glowValue", "%");

  const style = document.createElement("style");
  style.textContent = ".soft-glow .ambient { opacity: .35; filter: blur(110px); }";
  document.head.appendChild(style);
})();
