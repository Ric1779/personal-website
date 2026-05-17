(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const dock = document.querySelector(".profile-dock[data-dock-enabled]");
  if (!dock) return;

  const panel = dock.querySelector(".profile-dock-panel");
  const items = [...dock.querySelectorAll(".profile-dock-item")];
  if (!panel || !items.length) return;

  const maxScale = parseFloat(dock.dataset.magnification) || 1.4;
  const distance = parseFloat(dock.dataset.distance) || 200;
  const spring = 0.18;
  const baseSize =
    parseFloat(getComputedStyle(dock).getPropertyValue("--dock-item-size")) ||
    parseFloat(dock.dataset.baseSize) ||
    50;

  const current = items.map(() => 1);
  const target = items.map(() => 1);
  let active = false;
  let rafId = null;

  function applyItemLayout(item, scale) {
    const extra = baseSize * (scale - 1);
    const inset = extra / 2;
    item.style.transform = `scale(${scale})`;
    item.style.marginLeft = `${inset}px`;
    item.style.marginRight = `${inset}px`;
  }

  function setTargets(clientX) {
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const d = clientX - center;
      const clamped = Math.max(-distance, Math.min(distance, d));
      const t = 1 - Math.abs(clamped) / distance;
      target[i] = 1 + (maxScale - 1) * t;
    });
  }

  function resetTargets() {
    target.fill(1);
  }

  function tick() {
    let moving = false;
    items.forEach((item, i) => {
      const diff = target[i] - current[i];
      if (Math.abs(diff) > 0.002) {
        current[i] += diff * spring;
        moving = true;
      } else {
        current[i] = target[i];
      }
      applyItemLayout(item, current[i]);
    });

    if (moving || active) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function start() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  panel.addEventListener("mousemove", (e) => {
    active = true;
    setTargets(e.pageX);
    start();
  });

  panel.addEventListener("mouseleave", () => {
    active = false;
    resetTargets();
    start();
  });
})();
