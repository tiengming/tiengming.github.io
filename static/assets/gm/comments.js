/* GM comments — utterances 评论懒加载
   点击按钮才加载 utteranc.es（GitHub Issues 评论），
   主题切换时通过 postMessage 同步 iframe 主题；
   用 MutationObserver 替代上游的字符串 setInterval 轮询（已废弃 API）。
   页面：post / single */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  GM.use({
    name: "comments",
    pages: ["post", "single"],
    init: function () {
      var mount = GM.$("#comments-mount");
      var btn = GM.$("#cmButton");
      if (!mount || !btn) return;

      var repo = mount.getAttribute("data-repo") || "";
      if (!repo) {
        mount.style.display = "none";
        return;
      }

      var loaded = false;

      function themeFor(mode) {
        if (mode === "dark") return "dark-blue";
        if (mode === "light") return "github-light";
        return "preferred-color-scheme";
      }

      function syncTheme(mode) {
        var iframe = mount.querySelector(".utterances-frame");
        if (!iframe) return;
        try {
          iframe.contentWindow.postMessage(
            { type: "set-theme", theme: themeFor(mode) },
            "https://utteranc.es"
          );
        } catch (e) {
          /* 跨域窗口尚未就绪时忽略 */
        }
      }

      GM.theme.onChange(function (mode) {
        if (loaded) syncTheme(mode);
      });

      btn.addEventListener("click", function () {
        if (loaded) return;
        loaded = true;
        btn.disabled = true;

        var box = document.createElement("div");
        box.className = "comments-loaded";
        mount.appendChild(box);

        var script = document.createElement("script");
        script.src = "https://utteranc.es/client.js";
        script.async = true;
        script.setAttribute("repo", repo);
        script.setAttribute("issue-term", "title");
        script.setAttribute("theme", themeFor(GM.theme.current()));
        script.setAttribute("crossorigin", "anonymous");
        script.onerror = function () {
          box.textContent = "评论加载失败，请检查网络后刷新重试。";
          box.style.color = "var(--text-3)";
          box.style.textAlign = "center";
          box.style.padding = "28px 0";
          btn.disabled = false;
          loaded = false;
        };
        box.appendChild(script);

        /* iframe 出现后隐藏按钮（一次性观察，10 秒后自动断开） */
        if (typeof MutationObserver !== "undefined") {
          var mo = new MutationObserver(function () {
            if (mount.querySelector(".utterances-frame")) {
              btn.style.display = "none";
              mo.disconnect();
            }
          });
          mo.observe(mount, { childList: true, subtree: true });
          setTimeout(function () {
            mo.disconnect();
          }, 10000);
        }
      });
    },
  });
})();
