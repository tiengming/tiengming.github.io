/* GM vercount — 浏览量统计（自托管健壮版，基于上游 GmeekVercount.js 改写）
   文章页：正文底部「本文浏览 N 次」；全站：页脚「总访问 N 次」。
   使用 vercount.one 服务（busuanzi 兼容 id 契约）；服务不可用时占位保持隐藏，无视觉破坏。
   页面：全部 */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  GM.use({
    name: "vercount",
    init: function () {
      /* 文章浏览量：挂在正文底部信息行 */
      if (GM.page === "post" || GM.page === "single") {
        var bottom = GM.$(".post-body-bottom");
        if (bottom) {
          var span = document.createElement("span");
          span.className = "chip";
          span.id = "busuanzi_container_page_pv";
          span.style.display = "none";
          span.innerHTML = '👁 本文浏览 <span id="busuanzi_value_page_pv">…</span> 次';
          var grow = bottom.querySelector(".grow");
          if (grow && grow.parentNode === bottom) {
            bottom.insertBefore(span, grow);
          } else {
            bottom.insertBefore(span, bottom.firstChild);
          }
        }
      }

      /* 站点总访问：页脚 */
      var siteViews = GM.$("#site-views");
      if (siteViews) {
        siteViews.id = "busuanzi_container_site_pv";
        siteViews.style.display = "none";
        siteViews.innerHTML = '总访问 <span id="busuanzi_value_site_pv">…</span> 次 · ';
      }

      /* 容器均就位后再加载统计脚本（失败静默） */
      var script = document.createElement("script");
      script.src = "https://vercount.one/js";
      script.async = true;
      script.onerror = function () {
        /* 服务不可用：隐藏的占位保持隐藏即可 */
      };
      document.head.appendChild(script);
    },
  });
})();
