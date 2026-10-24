/* GM lazyload — 图片懒加载 + 模糊渐显
   顺带处理 GitHub user-attachments 图链修正（data-canonical-src，原 config 注入脚本移入）。
   原生 loading=lazy + .gm-lazy 模糊占位，加载完成渐显；失败则移除占位避免空白。
   页面：post / single */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  GM.use({
    name: "lazyload",
    pages: ["post", "single"],
    init: function () {
      var body = GM.$("#postBody");
      if (!body) return;

      /* GitHub 渲染的图片可能带 data-canonical-src（私有 CDN 链接），修正为直链 */
      GM.$$("a img[data-canonical-src]", body).forEach(function (img) {
        var canonical = img.getAttribute("data-canonical-src");
        if (!canonical) return;
        var anchor = img.closest("a");
        if (anchor) anchor.setAttribute("href", canonical);
        img.setAttribute("src", canonical);
        img.removeAttribute("data-canonical-src");
      });

      GM.$$("img", body).forEach(function (img) {
        var src = img.getAttribute("src") || "";
        if (!src || src.indexOf("data:") === 0) return;
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        img.classList.add("gm-lazy");

        function done() {
          img.classList.add("gm-loaded");
        }
        function fail() {
          img.classList.remove("gm-lazy");
        }
        if (img.complete && img.naturalWidth > 0) {
          done();
        } else {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", fail, { once: true });
        }
      });
    },
  });
})();
