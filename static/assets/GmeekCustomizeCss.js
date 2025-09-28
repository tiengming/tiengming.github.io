(function () {
  // 移除重复执行保护，改为基于DOM状态检查
  const isAlreadyProcessed = document.querySelector('.post-card') !== null;
  if (isAlreadyProcessed) {
    console.log("🍏 TiengmingModern 检测到已处理的DOM，跳过重复执行");
    return;
  }

  console.log("🍏 TiengmingModern 插件启动中... https://code.buxiantang.top/");

  const themeColors = {
    light: {
      bgGradient: "linear-gradient(135deg, #f4f4f4, #fef2f2, #f4f0ff)",
      cardBg: "rgba(255,255,255,0.25)",
      cardBorder: "1px solid rgba(255,255,255,0.2)",
      title: "#1c1c1e",
      meta: "#888"
    },
    dark: {
      bgGradient: "linear-gradient(135deg, #1a1a2b, #222c3a, #2e3950)",
      cardBg: "rgba(32,32,32,0.3)",
      cardBorder: "1px solid rgba(255,255,255,0.08)",
      title: "#eee",
      meta: "#bbb"
    }
  };

  function getEffectiveMode() {
    const raw = document.documentElement.getAttribute("data-color-mode");
    if (raw === "light" || raw === "dark") return raw;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getTextColor(bg) {
    const rgb = bg.match(/\d+/g);
    if (!rgb) return "#fff";
    const [r, g, b] = rgb.map(Number);
    const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return l > 0.6 ? "#000" : "#fff";
  }

  // 标签点击处理函数
  window.handleTagClick = function(event, tagName) {
    event.preventDefault();
    event.stopPropagation();
    const tagUrl = `tag.html#${encodeURIComponent(tagName)}`;
    window.location.href = tagUrl;
  };

  // 初始化背景和样式
  function initializeBackground() {
    const existingBg = document.querySelector('.herobgcolor');
    if (existingBg) existingBg.remove();

    const bg = document.createElement("div");
    bg.className = "herobgcolor";
    document.body.appendChild(bg);

    const existingStyle = document.querySelector('#tiengming-modern-styles');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement("style");
    style.id = 'tiengming-modern-styles';
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
      }
      .post-tag {
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 4px;
        padding: 2px 6px;
        margin-right: 4px;
        font-size: 0.8em;
        display: inline-block;
      }
      .post-tag:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
    return bg;
  }

  const bg = initializeBackground();

  function applyTheme() {
    const mode = getEffectiveMode();
    const theme = themeColors[mode];

    if (bg) bg.style.background = theme.bgGradient;

    document.querySelectorAll(".post-card").forEach(card => {
      card.style.background = theme.cardBg;
      card.style.border = theme.cardBorder;
      card.style.backdropFilter = "blur(16px)";
      card.style.webkitBackdropFilter = "blur(16px)";
      card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";

      const title = card.querySelector(".post-title");
      const meta = card.querySelector(".post-meta");

      if (title) title.style.color = theme.title;
      if (meta) meta.style.color = theme.meta;
    });

    ["#header", "#footer"].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.color = mode === "dark" ? "#ddd" : "";
    });
  }

  // 主题监听器
  if (document.documentElement.getAttribute("data-color-mode") === "auto") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  }

  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-mode"]
  });



  function rebuildCards() {
    // 根据CSS结构，正确的选择器应该是 .SideNav-item
    let sideNavItems = document.querySelectorAll(".SideNav-item");
    
    if (sideNavItems.length === 0) {
      console.log("🍏 未找到 .SideNav-item 元素，延迟重试...");
      setTimeout(rebuildCards, 1000);
      return;
    }

    console.log(`🍏 开始处理 ${sideNavItems.length} 个卡片`);

    sideNavItems.forEach((card, i) => {
      const title = card.querySelector(".listTitle")?.innerText || "未命名文章";
      const link = card.getAttribute("href");
      const labels = [...card.querySelectorAll(".Label")];
      const time = labels.find(el => /^\d{4}/.test(el.textContent.trim()))?.textContent.trim() || "";

      const tags = labels.filter(el => el.textContent.trim() !== time).map(el => {
        const tag = el.textContent.trim();
        const bg = el.style.backgroundColor || "#999";
        const fg = getTextColor(bg);
        return `<span class="post-tag" style="background-color:${bg};color:${fg}" data-tag="${tag}" onclick="handleTagClick(event, '${tag}')">${tag}</span>`;
      }).join("");

      const newCard = document.createElement("a");
      newCard.href = link;
      newCard.className = "post-card";
      newCard.style.animationDelay = `${i * 60}ms`;
      newCard.innerHTML = `
        <div class="post-meta">${tags}<span class="post-date">${time}</span></div>
        <h2 class="post-title">${title}</h2>
      `;
      card.replaceWith(newCard);
    });

    applyTheme();
    console.log("🍏 卡片处理完成");
  }

  // 增强的DOM准备检查
  function whenReady(callback) {
    if (document.readyState === 'complete') {
      setTimeout(callback, 100);
    } else if (document.readyState === 'interactive') {
      setTimeout(callback, 300);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(callback, 200);
      });
      window.addEventListener('load', function() {
        setTimeout(callback, 100);
      });
    }
  }

  // 执行主逻辑
  whenReady(() => {
    rebuildCards();
    window.__TiengmingModernized = true;
    console.log("🍏 TiengmingModern 插件加载完成");
  });

  // 页面可见性监听
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      setTimeout(() => {
        const needsReprocessing = !document.querySelector('.post-card') && 
                                 document.querySelector('.SideNav-item');
        if (needsReprocessing) {
          console.log("🍏 检测到需要重新处理的DOM");
          rebuildCards();
        }
      }, 200);
    }
  });

})();
