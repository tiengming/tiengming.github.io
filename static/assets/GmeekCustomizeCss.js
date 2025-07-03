(function () {
  if (window.__TiengmingModernized) return;
  window.__TiengmingModernized = true;

  console.log("🍏 TiengmingModern 插件已启用");

  // 注入所有样式
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --accent: #007aff;
      --font: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif;
      --bg: #fefefe;
      --text: #1c1c1e;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
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
      background: #fff;
      border-radius: 20px;
      padding: 20px 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
      transition: all 0.25s ease;
      text-decoration: none;
      color: inherit;
      animation: fadeUp 0.5s ease both;
    }

    .post-card:hover {
      transform: translateY(-3px) scale(1.012);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }

    .post-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 13px;
      margin-bottom: 10px;
      color: #888;
    }

    .post-tag {
      background: #f1f1f4;
      border-radius: 999px;
      padding: 3px 10px;
      font-weight: 500;
      color: #444;
    }

    .post-date {
      background: transparent;
      color: #999;
      font-weight: 400;
    }

    .post-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .post-summary {
      font-size: 14.5px;
      color: #444;
    }

    .avatar {
      transition: transform 0.3s ease;
    }

    .avatar:hover {
      transform: scale(1.1) rotate(5deg);
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 600px) {
      body { padding: 16px; }
    }

    /* 🌌 动态背景样式，根据 data-theme 切换 */
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

    .herobgcolor[data-theme="light"] {
      background: linear-gradient(120deg, #007aff, #ff5e62, #4c84ff, #ff857a);
    }

    .herobgcolor[data-theme="dark"] {
      background: linear-gradient(120deg, #1e1e2f, #004777, #00c2b2, #2e3a59);
    }

    @keyframes hueflow {
      0% { filter: hue-rotate(0deg); background-position: 0% 50%; }
      50% { filter: hue-rotate(180deg); background-position: 100% 50%; }
      100% { filter: hue-rotate(360deg); background-position: 0% 50%; }
    }
  `;
  document.head.appendChild(style);

  // 创建动态背景
  const bg = document.createElement("div");
  const getTheme = () =>
    document.documentElement.getAttribute("data-color-mode") || "light";

  bg.className = "herobgcolor";
  bg.setAttribute("data-theme", getTheme());
  document.body.appendChild(bg);

  const themeObserver = new MutationObserver(() => {
    const mode = getTheme();
    bg.setAttribute("data-theme", mode);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-mode"]
  });

  // 重构卡片内容
  const rebuildCards = () => {
    const oldCards = document.querySelectorAll(".SideNav-item");
    oldCards.forEach((card, i) => {
      const title = card.querySelector(".listTitle")?.innerText || "未命名文章";
      const link = card.getAttribute("href");
      const tags = [...card.querySelectorAll(".Label")].map(x => x.textContent.trim());
      const time = tags.find(t => /^\d{4}/.test(t)) || "";
      const tagElems = tags.filter(t => t !== time).map(t => `<span class="post-tag">${t}</span>`).join("");

      const summary = `本篇内容涵盖主题「${tags.join(" / ")}」，带你深入探索相关知识点。`;

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
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", rebuildCards);
  } else {
    rebuildCards();
  }
})();
