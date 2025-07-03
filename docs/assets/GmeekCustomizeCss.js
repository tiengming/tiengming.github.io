(function () {
  if (window.__TiengmingModernized) return;
  window.__TiengmingModernized = true;
  console.log("🍏 TiengmingModern 插件已启用");

  const themeColors = {
    light: {
      bgGradient: "linear-gradient(120deg, #f8f8f8, #fef2f2, #f4f0ff)",
      cardBg: "rgba(255,255,255,0.15)",
      text: "#1c1c1e",
      summary: "#444",
      meta: "#888",
      cardBorder: "1px solid rgba(255,255,255,0.15)"
    },
    dark: {
      bgGradient: "linear-gradient(120deg, #1e1e2f, #2a344b, #3c4d67)",
      cardBg: "rgba(32,32,32,0.2)",
      text: "#f0f0f0",
      summary: "#aaa",
      meta: "#bbb",
      cardBorder: "1px solid rgba(255,255,255,0.08)"
    }
  };

  function getTextColor(bg) {
    const rgb = bg.match(/\d+/g);
    if (!rgb || rgb.length < 3) return "#fff";
    const [r, g, b] = rgb.map(Number);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? "#000" : "#fff";
  }

  const bg = (() => {
    const el = document.createElement("div");
    el.className = "herobgcolor";
    document.body.appendChild(el);
    const style = document.createElement("style");
    style.textContent = `
      .herobgcolor {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        z-index: -1;
        background-size: 600% 600%;
        animation: hueflow 30s ease infinite;
        transition: background 0.6s ease;
      }
      @keyframes hueflow {
        0% { filter: hue-rotate(0deg); background-position: 0% 50%; }
        50% { filter: hue-rotate(180deg); background-position: 100% 50%; }
        100% { filter: hue-rotate(360deg); background-position: 0% 50%; }
      }`;
    document.head.appendChild(style);
    return el;
  })();

  function applyTheme() {
    const mode = document.documentElement.getAttribute("data-color-mode") || "light";
    const theme = themeColors[mode] || themeColors.light;
    bg.style.background = theme.bgGradient;

    document.querySelectorAll(".post-card").forEach(card => {
      card.style.background = theme.cardBg;
      card.style.backdropFilter = "blur(16px)";
      card.style.webkitBackdropFilter = "blur(16px)";
      card.style.border = theme.cardBorder;
      card.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.1)";
    });

    document.querySelectorAll(".post-card").forEach(card => {
      card.style.background = theme.cardBg;
      card.style.backdropFilter = "blur(16px)";
      card.style.webkitBackdropFilter = "blur(16px)";
      card.style.border = theme.cardBorder;
      const title = card.querySelector(".post-title");
      const summary = card.querySelector(".post-summary");
      const meta = card.querySelector(".post-meta");
      if (title) {
        title.style.color = theme.text;
        title.style.textShadow = "0 1px 1px rgba(0,0,0,0.2)";
      }
      if (summary) {
        summary.style.color = theme.summary;
        summary.style.textShadow = "0 1px 1px rgba(0,0,0,0.2)";
      }
      if (meta) meta.style.color = theme.meta;
    });
  }

  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-color-mode"]
  });

  function rebuildCards() {
    document.querySelectorAll(".SideNav-item").forEach((card, i) => {
      const title = card.querySelector(".listTitle")?.innerText || "未命名文章";
      const link = card.getAttribute("href");
      const labelNodes = [...card.querySelectorAll(".Label")];
      const time = labelNodes.find(el => /^\d{4}/.test(el.textContent.trim()))?.textContent.trim() || "";

      const tagElems = labelNodes.filter(el => el.textContent.trim() !== time).map(el => {
        const tag = el.textContent.trim();
        const bg = el.style.backgroundColor || "#999";
        const fg = getTextColor(bg);
        return `<span class="post-tag" style="background-color:${bg};color:${fg}">${tag}</span>`;
      }).join("");

      const summary = `本篇内容涵盖主题「${labelNodes.map(x => x.textContent.trim()).join(" / ")}」，带你深入探索相关知识点。`;

      const newCard = document.createElement("a");
      newCard.href = link;
      newCard.className = "post-card";
      newCard.style.animationDelay = `${i * 60}ms`;
      newCard.innerHTML = `
        <div class="post-meta">${tagElems}<span class="post-date">${time}</span></div>
        <h2 class="post-title">${title}</h2>
        <p class="post-summary">${summary}</p>
      `;
      card.replaceWith(newCard);
    });
    applyTheme();
  }

  document.readyState === "loading"
    ? window.addEventListener("DOMContentLoaded", rebuildCards)
    : rebuildCards();

  document.documentElement.removeAttribute("data-ui-pending");
})();
