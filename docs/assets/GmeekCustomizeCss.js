(function () {
  if (window.__TiengmingModernized) return;
  window.__TiengmingModernized = true;

  console.log("🍏 TiengmingModern 插件已启用");

  const themeColors = {
    light: {
      bgGradient: "linear-gradient(120deg, #f8f8f8, #fef2f2, #f4f0ff)",
      cardBg: "#ffffff",
      cardText: "#1c1c1e",
      summaryText: "#444",
      metaText: "#888",
    },
    dark: {
      bgGradient: "linear-gradient(120deg, #1e1e2f, #2a344b, #3c4d67)",
      cardBg: "#2b2b2f",
      cardText: "#f0f0f0",
      summaryText: "#aaa",
      metaText: "#bbb",
    },
  };

  const fontStack = `-apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif`;

  const style = document.createElement("style");
  style.textContent = `
    :root {
      --accent: #007aff;
      --font: ${fontStack};
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font);
      max-width: 960px;
      padding: 24px;
      margin: auto;
      line-height: 1.6;
      position: relative;
      z-index: 0;
    }
    .post-card {
      display: flex;
      flex-direction: column;
      border-radius: 20px;
      padding: 20px 24px;
      margin-bottom: 20px;
      transition: all 0.25s ease;
      text-decoration: none;
      animation: fadeUp 0.5s ease both;
    }
    .post-card:hover {
      transform: translateY(-3px) scale(1.012);
    }
    .post-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 13px;
      margin-bottom: 10px;
    }
    .post-tag {
      border-radius: 999px;
      padding: 3px 10px;
      font-weight: 500;
      display: inline-block;
      margin-right: 6px;
    }
    .post-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .post-summary {
      font-size: 14.5px;
    }
    .avatar {
      transition: transform 0.3s ease;
    }
    .avatar:hover {
      transform: scale(1.1) rotate(5deg);
    }
    .SideNav {
      border-radius: 12px;
      overflow: hidden;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 600px) {
      body { padding: 16px; }
    }
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
  document.head.appendChild(style);

  const bg = document.createElement("div");
  bg.className = "herobgcolor";
  document.body.appendChild(bg);

  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-mode"],
  });

  function getTextColor(bgColor) {
    const match = bgColor.match(/\d+/g);
    if (!match || match.length < 3) return "#fff";
    const [r, g, b] = match.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#000" : "#fff";
  }

  function applyTheme() {
    const mode = document.documentElement.getAttribute("data-color-mode") || "light";
    const theme = themeColors[mode] || themeColors.light;
    bg.style.background = theme.bgGradient;

    const cards = document.querySelectorAll(".post-card");
    cards.forEach(card => {
      card.style.background = theme.cardBg;
      card.style.color = theme.cardText;
      const summary = card.querySelector(".post-summary");
      const title = card.querySelector(".post-title");
      if (summary) summary.style.color = theme.summaryText;
      if (title) title.style.color = theme.cardText;
      const meta = card.querySelector(".post-meta");
      if (meta) meta.style.color = theme.metaText;
    });
  }

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

  document.readyState === "loading"
    ? window.addEventListener("DOMContentLoaded", rebuildCards)
    : rebuildCards();
})();
