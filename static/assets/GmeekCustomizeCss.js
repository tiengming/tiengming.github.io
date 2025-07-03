(function () {
  if (window.__TiengmingModernized) return;
  window.__TiengmingModernized = true;
  console.log("🍏 TiengmingModern 插件已启用");
  const themeColors = {
    light: {
      bgGradient: "linear-gradient(120deg, #f8f8f8, #fef2f2, #f4f0ff)",
    },
    dark: {
      bgGradient: "linear-gradient(120deg, #1e1e2f, #2a344b, #3c4d67)",
    },
  };

  function getTextColor(bgColor) {
    const match = bgColor.match(/\d+/g);
    if (!match || match.length < 3) return "#fff";
    const [r, g, b] = match.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#000" : "#fff";
  }

  // 🌠 注入背景容器
  const bg = document.createElement("div");
  bg.className = "herobgcolor";
  document.body.appendChild(bg);

  const bgStyle = document.createElement("style");
  bgStyle.textContent = `
    .herobgcolor {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      background-size: 600% 600%;
      animation: hueflow 30s ease infinite;
      transition: background 0.6s ease;
    }
    @keyframes hueflow {
      0% { filter: hue-rotate(0deg); background-position: 0% 50%; }
      50% { filter: hue-rotate(180deg); background-position: 100% 50%; }
      100% { filter: hue-rotate(360deg); background-position: 0% 50%; }
    }
  `;
  document.head.appendChild(bgStyle);

  function applyTheme() {
    const mode = document.documentElement.getAttribute("data-color-mode") || "light";
    bg.style.background = themeColors[mode]?.bgGradient || themeColors.light.bgGradient;

    document.querySelectorAll(".post-card").forEach(card => {
      const summary = card.querySelector(".post-summary");
      const title = card.querySelector(".post-title");
      if (summary) summary.style.color = mode === "dark" ? "#aaa" : "#444";
      if (title) title.style.color = mode === "dark" ? "#f0f0f0" : "#1c1c1e";
      const meta = card.querySelector(".post-meta");
      if (meta) meta.style.color = mode === "dark" ? "#bbb" : "#888";
    });
  }

  const observer = new MutationObserver(applyTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-color-mode"] });

  function rebuildCards() {
    const oldCards = document.querySelectorAll(".SideNav-item");
    oldCards.forEach((card, i) => {
      const title = card.querySelector(".listTitle")?.innerText || "未命名文章";
      const link = card.getAttribute("href");

      const labelNodes = [...card.querySelectorAll(".Label")];
      const time = labelNodes.find(el => /^\d{4}/.test(el.textContent.trim()))?.textContent.trim() || "";

      const tagElems = labelNodes
        .filter(el => el.textContent.trim() !== time)
        .map(el => {
          const tag = el.textContent.trim();
          const bg = el.style.backgroundColor || "#999";
          const color = getTextColor(bg);
          return `<span class="post-tag" style="background-color:${bg};color:${color}">${tag}</span>`;
        })
        .join("");

      const summary = `本篇内容涵盖主题「${labelNodes.map(x => x.textContent.trim()).join(" / ")}」，带你深入探索相关知识点。`;

      const newCard = document.createElement("a");
      newCard.href = link;
      newCard.className = "post-card";
      newCard.style.animationDelay = `${i * 60}ms`;
      newCard.innerHTML = `
        <div class="post-meta">
          ${tagElems}
          <span class="post-date">${time}</span>
        </div>
        <h2 class="post-title">${title}</h2>
        <p class="post-summary">${summary}</p>
      `;
      card.replaceWith(newCard);
    });
    applyTheme();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", rebuildCards);
  } else {
    rebuildCards();
  }

  // ✅ 插件加载完成，显示页面
  document.documentElement.removeAttribute("data-ui-pending");
})();
