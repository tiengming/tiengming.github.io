/* GM toc — 文章目录
   修复上游 articletoc.js 永不渲染的 bug：DOM ready 后立即构建，
   MutationObserver 仅作异步内容（如 MathJax）的兜底，且限时自动断开。
   ≥1200px 桌面侧栏粘性目录；以下为浮动按钮 + 抽屉面板。
   页面：post */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  GM.use({
    name: "toc",
    pages: ["post"],
    init: function () {
      var body = GM.$("#postBody");
      var root = GM.$("#toc-root");
      if (!body || !root) return;

      var heads = [];
      var lastActive = -1;
      var fab = null;
      var panel = null;
      var currentInner = "";

      function slugify(text, i) {
        var s = String(text || "")
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[<>:/\\|?*"#%&{}$!'@+`=\[\]^~]/g, "")
          .slice(0, 42);
        return encodeURIComponent(s) + "-" + (i + 1);
      }

      function linkListHTML() {
        var html = "";
        heads.forEach(function (h, i) {
          html +=
            '<li class="toc-' + h.tagName.toLowerCase() + '">' +
            '<a href="#' + h.id + '" data-i="' + i + '">' + escapeHTML(h.textContent || "") + "</a></li>";
        });
        return html;
      }

      function escapeHTML(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      }

      function render() {
        heads = GM.$$("h1,h2,h3,h4,h5,h6", body).filter(function (h) {
          return (h.textContent || "").trim().length > 0;
        });
        if (!heads.length) return false;

        heads.forEach(function (h, i) {
          if (!h.id) h.id = slugify(h.textContent, i);
        });

        var inner =
          '<p class="post-toc-title">目录</p><ul class="post-toc-list">' + linkListHTML() + "</ul>";
        currentInner = inner;
        root.innerHTML = inner;

        var layout = root.closest(".post-layout");
        if (layout) layout.classList.add("has-toc");

        /* 移动/中屏：浮动按钮 + 抽屉 */
        if (!fab) {
          fab = document.createElement("button");
          fab.type = "button";
          fab.className = "gm-toc-fab glass";
          fab.title = "文章目录";
          fab.setAttribute("aria-label", "文章目录");
          fab.innerHTML =
            '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 3.75A.75.75 0 0 1 1.75 3h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 3.75Zm0 4A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75Zm0 4a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1-.75-.75Z"></path></svg>';
          document.body.appendChild(fab);

          panel = document.createElement("nav");
          panel.className = "gm-toc-panel glass";
          panel.setAttribute("aria-label", "文章目录");
          document.body.appendChild(panel);

          fab.addEventListener("click", function () {
            panel.innerHTML = currentInner;
            panel.classList.toggle("open");
            if (lastActive >= 0) setActive(lastActive);
          });
          panel.addEventListener("click", function (e) {
            if (e.target && e.target.tagName === "A") panel.classList.remove("open");
          });
          document.addEventListener("click", function (e) {
            if (!panel.classList.contains("open")) return;
            if (panel.contains(e.target) || fab.contains(e.target)) return;
            panel.classList.remove("open");
          });
        }

        /* 当前小节高亮：滚动节流计算，双份列表同步 */
        var onScroll = GM.throttle(updateActive, 160);
        window.addEventListener("scroll", onScroll, { passive: true });
        updateActive();
        return true;
      }

      function setActive(i) {
        lastActive = i;
        [root, panel].forEach(function (container) {
          if (!container) return;
          GM.$$(".toc-active", container).forEach(function (a) {
            a.classList.remove("toc-active");
          });
          var link = GM.$('a[data-i="' + i + '"]', container);
          if (link) link.classList.add("toc-active");
        });
      }

      function updateActive() {
        if (!heads.length) return;
        var line = (window.pageYOffset || 0) + 130;
        var cur = 0;
        for (var i = 0; i < heads.length; i++) {
          var top = heads[i].getBoundingClientRect().top + (window.pageYOffset || 0);
          if (top <= line) cur = i;
        }
        if (cur !== lastActive) setActive(cur);
      }

      render();

      /* 兜底：异步注入的标题（MathJax 等）。15 秒后自动断开，避免常驻开销 */
      if (typeof MutationObserver !== "undefined") {
        var mo = new MutationObserver(
          GM.debounce(function () {
            var count = GM.$$("h1,h2,h3,h4,h5,h6", body).length;
            if (count !== heads.length) render();
          }, 400)
        );
        mo.observe(body, { childList: true, subtree: true });
        setTimeout(function () {
          mo.disconnect();
        }, 15000);
      }
    },
  });
})();
