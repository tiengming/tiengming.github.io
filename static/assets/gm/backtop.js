/* GM backtop — 返回顶部浮动按钮（主题令牌化配色，passive + rAF 节流）
   页面：全部 */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  GM.use({
    name: "backtop",
    init: function () {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gm-backtop glass";
      btn.title = "返回顶部";
      btn.setAttribute("aria-label", "返回顶部");
      btn.innerHTML =
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z"></path></svg>';
      document.body.appendChild(btn);

      var calm = false;
      try {
        calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch (e) {
        /* ignore */
      }

      btn.addEventListener("click", function () {
        try {
          window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
        } catch (e) {
          window.scrollTo(0, 0);
        }
      });

      var ticking = false;
      function update() {
        ticking = false;
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        btn.classList.toggle("on", y > 420);
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
