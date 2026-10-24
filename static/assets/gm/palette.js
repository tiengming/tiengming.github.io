/* GM palette — ⌘K / Ctrl+K 命令面板
   数据源 postList.json（空闲时预取），标题/标签即时过滤，
   ↑↓ 选择、Enter 直达、Esc 关闭；头部搜索按钮亦可唤起。
   页面：全部 */
(function () {
  "use strict";
  if (typeof window === "undefined" || !window.GM) return;
  var GM = window.GM;

  GM.use({
    name: "palette",
    init: function () {
      var overlay = null;
      var input = null;
      var listEl = null;
      var items = [];
      var posts = null;
      var active = 0;
      var openFlag = false;

      var SEARCH_ICON =
        "M15.7 13.3l-3.81-3.83A5.93 5.93 0 0 0 13 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 0 0 0-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z";

      function fetchPosts() {
        if (posts) return Promise.resolve(posts);
        return fetch("/postList.json", { credentials: "same-origin" })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
          .then(function (data) {
            posts = [];
            Object.keys(data).forEach(function (k) {
              if (k === "labelColorDict") return;
              var p = data[k];
              if (p && p.postTitle && p.postUrl) {
                posts.push({
                  title: String(p.postTitle),
                  url: "/" + p.postUrl,
                  labels: (p.labels || []).map(String),
                  date: String(p.createdDate || ""),
                });
              }
            });
            posts.sort(function (a, b) {
              return b.date.localeCompare(a.date);
            });
            return posts;
          })
          .catch(function () {
            posts = [];
            return posts;
          });
      }

      /* 空闲时预热数据 */
      var idle = window.requestIdleCallback || function (fn) { setTimeout(fn, 1200); };
      try {
        idle(function () {
          fetchPosts();
        });
      } catch (e) {
        /* ignore */
      }

      function ensureUI() {
        if (overlay) return;
        overlay = document.createElement("div");
        overlay.className = "gm-palette-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.innerHTML =
          '<div class="gm-palette-panel glass">' +
          '<div class="gm-palette-input-row">' +
          '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + SEARCH_ICON + '"></path></svg>' +
          '<input class="gm-palette-input" type="text" placeholder="搜索文章…" autocomplete="off" spellcheck="false" aria-label="搜索文章">' +
          '<span class="gm-palette-kbd"><kbd>Esc</kbd></span>' +
          "</div>" +
          '<ul class="gm-palette-list" role="listbox"></ul>' +
          "</div>";
        document.body.appendChild(overlay);

        input = overlay.querySelector(".gm-palette-input");
        listEl = overlay.querySelector(".gm-palette-list");

        overlay.addEventListener("mousedown", function (e) {
          if (e.target === overlay) close();
        });
        input.addEventListener("input", function () {
          render(input.value);
        });
        input.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter") {
            e.preventDefault();
            go();
          } else if (e.key === "Escape") {
            close();
          }
        });
        listEl.addEventListener("click", function (e) {
          var li = e.target && e.target.closest ? e.target.closest(".gm-palette-item") : null;
          if (!li) return;
          active = parseInt(li.getAttribute("data-i"), 10) || 0;
          go();
        });
      }

      function move(d) {
        if (!items.length) return;
        active = (active + d + items.length) % items.length;
        paint();
      }

      function go() {
        var it = items[active];
        if (!it) return;
        close();
        location.href = it.url;
      }

      function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      }

      function render(q) {
        q = (q || "").trim().toLowerCase();
        listEl.textContent = "";
        items = [];

        var candidates;
        if (!q) {
          candidates = posts.slice(0, 8);
        } else {
          candidates = posts.filter(function (p) {
            return (
              p.title.toLowerCase().indexOf(q) !== -1 ||
              p.labels.some(function (lb) {
                return lb.toLowerCase().indexOf(q) !== -1;
              })
            );
          });
          candidates = candidates.slice(0, 12);
        }

        candidates.forEach(function (p) {
          var li = document.createElement("li");
          li.className = "gm-palette-item";
          li.setAttribute("role", "option");
          li.setAttribute("data-i", String(items.length));
          var labelsHTML = p.labels
            .slice(0, 2)
            .map(function (lb) {
              return '<span class="chip chip-label" style="--c:#6d8dff">' + esc(lb) + "</span>";
            })
            .join("");
          li.innerHTML =
            '<span class="gm-palette-item-title">' + esc(p.title) + "</span>" +
            labelsHTML +
            '<span class="gm-palette-item-date">' + esc(p.date) + "</span>";
          listEl.appendChild(li);
          items.push(p);
        });

        if (!items.length) {
          var empty = document.createElement("li");
          empty.className = "gm-palette-empty";
          empty.textContent = posts.length
            ? '没有匹配 "' + (q || "") + '" 的文章'
            : "文章数据加载失败，请稍后重试";
          listEl.appendChild(empty);
        }

        active = 0;
        paint();
      }

      function paint() {
        GM.$$(".gm-palette-item", listEl).forEach(function (li) {
          li.classList.toggle("active", parseInt(li.getAttribute("data-i"), 10) === active);
        });
        var cur = listEl.children[active];
        if (cur && cur.scrollIntoView) {
          try {
            cur.scrollIntoView({ block: "nearest" });
          } catch (e) {
            /* ignore */
          }
        }
      }

      function open() {
        ensureUI();
        if (openFlag) return;
        openFlag = true;
        overlay.classList.add("open");
        document.documentElement.style.overflow = "hidden";
        input.value = "";
        fetchPosts().then(function () {
          render("");
        });
        setTimeout(function () {
          input.focus();
        }, 30);
      }

      function close() {
        if (!openFlag) return;
        openFlag = false;
        overlay.classList.remove("open");
        document.documentElement.style.overflow = "";
      }

      /* 触发：⌘K / Ctrl+K */
      document.addEventListener("keydown", function (e) {
        if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
          e.preventDefault();
          if (openFlag) close();
          else open();
        } else if (e.key === "Escape" && openFlag) {
          close();
        }
      });

      /* 触发：头部搜索按钮 */
      var btn = GM.$("#paletteBtn");
      if (btn) {
        btn.addEventListener("click", open);
      }
    },
  });
})();
