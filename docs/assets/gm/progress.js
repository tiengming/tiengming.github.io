/* GM progress — 阅读进度条 + 智能导航（下滚隐藏 / 上滚浮现）
   页面：post / single */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  GM.use({
    name: "progress",
    pages: ["post", "single"],
    init: function () {
      var bar = document.createElement("div");
      bar.className = "gm-progress";
      bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);

      var header = GM.$("#site-header");
      var lastY = window.pageYOffset || 0;
      var ticking = false;

      function update() {
        ticking = false;
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var y = window.pageYOffset || doc.scrollTop || 0;
        var pct = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        bar.style.transform = "scaleX(" + pct + ")";
        bar.classList.toggle("on", pct > 0.004);

        if (header) {
          var delta = y - lastY;
          if (Math.abs(delta) > 10) {
            if (y < 90) header.removeAttribute("data-hidden");
            else if (delta > 0 && pct < 0.995) header.setAttribute("data-hidden", "true");
            else header.removeAttribute("data-hidden");
            lastY = y;
          }
        }
      }

      window.addEventListener(
        "scroll",
        function () {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
          }
        },
        { passive: true }
      );
      update();
    },
  });
})();
