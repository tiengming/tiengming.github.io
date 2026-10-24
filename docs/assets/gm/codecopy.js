/* GM codecopy — 代码块复制按钮 + 语言标签
   替代上游 post.html 内联的 clipboard 逻辑（execCommand 已废弃 → Clipboard API + 降级）。
   兼容 GitHub 输出的两种结构：div.highlight > pre 与裸 pre。
   页面：post / single */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  var ICON_COPY =
    "M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z";
  var ICON_CHECK =
    "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z";

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    /* 旧环境降级 */
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  GM.use({
    name: "codecopy",
    pages: ["post", "single"],
    init: function () {
      var body = GM.$("#postBody");
      if (!body) return;

      var pres = GM.$$("pre", body).filter(function (pre) {
        return !pre.closest(".code-block");
      });
      if (!pres.length) return;

      pres.forEach(function (pre) {
        var wrapper = document.createElement("div");
        wrapper.className = "code-block";

        var lang = "";
        var highlight = pre.closest("[class*='highlight']");
        if (highlight) {
          var m = /highlight-source-([\w-]+)/.exec(highlight.className || "");
          if (m) lang = m[1];
        }

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        if (lang) {
          var tag = document.createElement("span");
          tag.className = "code-lang";
          tag.textContent = lang;
          wrapper.appendChild(tag);
        }

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "code-copy";
        btn.setAttribute("aria-label", "复制代码");
        btn.innerHTML =
          '<svg class="ic-copy" viewBox="0 0 16 16"><path d="' + ICON_COPY + '"></path></svg>' +
          '<svg class="ic-check" viewBox="0 0 16 16" style="display:none"><path d="' + ICON_CHECK + '"></path></svg>';
        wrapper.appendChild(btn);

        btn.addEventListener("click", function () {
          var text = pre.innerText || pre.textContent || "";
          copyText(text).then(
            function () {
              btn.classList.add("copied");
              btn.querySelector(".ic-copy").style.display = "none";
              btn.querySelector(".ic-check").style.display = "block";
              setTimeout(function () {
                btn.classList.remove("copied");
                btn.querySelector(".ic-copy").style.display = "block";
                btn.querySelector(".ic-check").style.display = "none";
              }, 1800);
            },
            function () {
              /* 复制失败：短暂抖动提示 */
              btn.style.transform = "translateX(2px)";
              setTimeout(function () {
                btn.style.transform = "";
              }, 180);
            }
          );
        });
      });
    },
  });
})();
