/* GM prefetch — 链接悬停预取
   悬停 150ms 后预取同源页面（<link rel="prefetch">，每 URL 一次），
   尊重 Save-Data / 慢速网络。跨文档 View Transitions 由 theme.css 的
   @view-transition 规则启用（支持的浏览器自动获得平滑过渡，其余降级为普通跳转）。
   页面：全部 */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  GM.use({
    name: "prefetch",
    init: function () {
      var conn = navigator.connection || {};
      if (conn.saveData || /2g/i.test(conn.effectiveType || "")) return;

      var prefetched = Object.create(null);
      var timer = null;
      var pendingUrl = null;

      function prefetch(url) {
        if (!url || prefetched[url]) return;
        prefetched[url] = true;
        var link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        link.setAttribute("fetchpriority", "low");
        document.head.appendChild(link);
      }

      function targetUrl(el) {
        if (!el || el.tagName !== "A") return null;
        var href = el.getAttribute("href");
        if (!href || href.charAt(0) === "#") return null;
        try {
          var u = new URL(href, location.href);
          if (u.origin !== location.origin) return null;
          if (u.protocol !== "http:" && u.protocol !== "https:") return null;
          return u.href;
        } catch (e) {
          return null;
        }
      }

      document.addEventListener(
        "mouseover",
        function (e) {
          var url = targetUrl(e.target && e.target.closest ? e.target.closest("a") : null);
          clearTimeout(timer);
          pendingUrl = url;
          if (!url) return;
          timer = setTimeout(function () {
            if (pendingUrl === url) prefetch(url);
          }, 150);
        },
        { passive: true }
      );

      document.addEventListener(
        "mousedown",
        function (e) {
          /* 按下鼠标时立即预取（比等待 150ms 更快响应点击） */
          var url = targetUrl(e.target && e.target.closest ? e.target.closest("a") : null);
          if (url) prefetch(url);
        },
        { passive: true }
      );
    },
  });
})();
