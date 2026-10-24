/* GM lightbox — 图片灯箱
   修复上游 lightbox.js unbindEvents 无效的 bug：
   所有 document/window 级监听使用同一组具名引用，close() 时逐一移除。
   支持：键盘(Esc/←/→)、滚轮翻页、Ctrl+滚轮缩放、触摸滑动、计数与说明、加载失败占位。
   页面：post / single */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  var ICON = {
    close:
      "M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z",
    prev: "M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 1 1 1.06 1.06L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z",
    next: "M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z",
  };

  GM.use({
    name: "lightbox",
    pages: ["post", "single"],
    init: function () {
      var body = GM.$("#postBody");
      if (!body) return;

      var overlay = null;
      var imgEl = null;
      var captionEl = null;
      var counterEl = null;
      var errorEl = null;
      var images = [];
      var index = 0;
      var scale = 1;
      var openFlag = false;
      var lastTouchX = null;

      /* —— 具名处理器：close() 时以相同引用移除 —— */
      function onKeydown(e) {
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") show(index - 1);
        else if (e.key === "ArrowRight") show(index + 1);
      }
      function onWheel(e) {
        e.preventDefault();
        if (e.ctrlKey) {
          scale = Math.min(4, Math.max(1, scale + (e.deltaY < 0 ? 0.25 : -0.25)));
          imgEl.style.transform = "scale(" + scale + ")";
        } else {
          show(index + (e.deltaY > 0 ? 1 : -1));
        }
      }
      function onOverlayClick(e) {
        if (e.target === overlay || e.target === imgEl) close();
      }
      function onTouchStart(e) {
        if (e.touches.length === 1) lastTouchX = e.touches[0].clientX;
      }
      function onTouchEnd(e) {
        if (lastTouchX === null || !e.changedTouches.length) return;
        var dx = e.changedTouches[0].clientX - lastTouchX;
        if (Math.abs(dx) > 42) show(index + (dx < 0 ? 1 : -1));
        lastTouchX = null;
      }
      function onImgError() {
        if (!errorEl) return;
        errorEl.style.display = "block";
        errorEl.textContent = "图片加载失败：" + (images[index] ? images[index].alt || "" : "");
      }
      function onImgLoad() {
        if (errorEl) errorEl.style.display = "none";
      }

      function ensureOverlay() {
        if (overlay) return;
        overlay = document.createElement("div");
        overlay.className = "gm-lightbox";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.innerHTML =
          '<span class="gm-lightbox-counter"></span>' +
          '<button type="button" class="gm-lightbox-btn gm-lightbox-close" aria-label="关闭">' +
          '<svg viewBox="0 0 16 16"><path d="' + ICON.close + '"></path></svg></button>' +
          '<button type="button" class="gm-lightbox-btn gm-lightbox-prev" aria-label="上一张">' +
          '<svg viewBox="0 0 16 16"><path d="' + ICON.prev + '"></path></svg></button>' +
          '<button type="button" class="gm-lightbox-btn gm-lightbox-next" aria-label="下一张">' +
          '<svg viewBox="0 0 16 16"><path d="' + ICON.next + '"></path></svg></button>' +
          '<img class="gm-lightbox-img" alt="">' +
          '<div class="gm-lightbox-caption"></div>' +
          '<div class="gm-lightbox-error" style="display:none"></div>';
        document.body.appendChild(overlay);

        imgEl = overlay.querySelector(".gm-lightbox-img");
        captionEl = overlay.querySelector(".gm-lightbox-caption");
        counterEl = overlay.querySelector(".gm-lightbox-counter");
        errorEl = overlay.querySelector(".gm-lightbox-error");

        overlay.querySelector(".gm-lightbox-close").addEventListener("click", close);
        overlay.querySelector(".gm-lightbox-prev").addEventListener("click", function () {
          show(index - 1);
        });
        overlay.querySelector(".gm-lightbox-next").addEventListener("click", function () {
          show(index + 1);
        });
        imgEl.addEventListener("error", onImgError);
        imgEl.addEventListener("load", onImgLoad);
        overlay.addEventListener("click", onOverlayClick);
      }

      function bindGlobal() {
        document.addEventListener("keydown", onKeydown);
        window.addEventListener("wheel", onWheel, { passive: false });
        overlay.addEventListener("touchstart", onTouchStart, { passive: true });
        overlay.addEventListener("touchend", onTouchEnd, { passive: true });
      }

      function unbindGlobal() {
        document.removeEventListener("keydown", onKeydown);
        window.removeEventListener("wheel", onWheel);
        overlay.removeEventListener("touchstart", onTouchStart);
        overlay.removeEventListener("touchend", onTouchEnd);
      }

      function open(i) {
        images = GM.$$("img", body).filter(function (img) {
          return (img.currentSrc || img.getAttribute("src") || "").length > 0;
        });
        if (!images.length) return;
        ensureOverlay();
        if (openFlag) {
          show(i);
          return;
        }
        openFlag = true;
        scale = 1;
        bindGlobal();
        document.documentElement.style.overflow = "hidden";
        overlay.classList.add("open");
        show(i);
      }

      function show(i) {
        if (!images.length) return;
        index = (i + images.length) % images.length;
        var src = images[index].currentSrc || images[index].getAttribute("src");
        scale = 1;
        imgEl.style.transform = "scale(1)";
        imgEl.setAttribute("src", src);
        imgEl.setAttribute("alt", images[index].alt || "");
        var cap = images[index].alt || "";
        captionEl.textContent = cap;
        captionEl.style.display = cap ? "block" : "none";
        counterEl.textContent = index + 1 + " / " + images.length;
      }

      function close() {
        if (!openFlag) return;
        openFlag = false;
        unbindGlobal();
        document.documentElement.style.overflow = "";
        overlay.classList.remove("open");
        imgEl.setAttribute("src", "");
      }

      /* 正文图片点击进入灯箱（事件委托，兼容懒加载后的新增图片） */
      body.addEventListener("click", function (e) {
        var target = e.target;
        if (!target || target.tagName !== "IMG") return;
        var src = target.currentSrc || target.getAttribute("src");
        if (!src) return;
        /* 点击的是文章内图片 */
        e.preventDefault();
        var list = GM.$$("img", body);
        open(list.indexOf(target));
      });
    },
  });
})();
