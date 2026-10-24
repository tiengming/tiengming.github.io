/* ============================================================
   Aurora GM — 微内核
   唯一的页面脚本入口（<script type="module" src="/assets/gm/core.js">）
   职责：页面类型检测 / DOM ready / 错误边界 / 主题广播 /
        节流防抖 / 模块注册制（按页面类型初始化）/ 通用动效增强
   各功能模块见同目录，由本文件动态加载，单模块失败互不影响。
   ============================================================ */

/** 由 body[data-page] 属性解析页面类型 */
export function detectPage(bodyAttr) {
  switch (bodyAttr) {
    case "post":
    case "list":
    case "tag":
    case "single":
      return bodyAttr;
    default:
      return "unknown";
  }
}

/** 节流：leading + trailing（末次调用保证执行） */
export function throttle(fn, wait) {
  let last = 0;
  let timer = null;
  let pending = null;
  let pendingThis = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      fn.apply(this, args);
    } else {
      pending = args;
      pendingThis = this;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          last = Date.now();
          fn.apply(pendingThis, pending);
          pending = null;
          pendingThis = null;
        }, remaining);
      }
    }
  };
}

/** 防抖：仅末次生效 */
export function debounce(fn, wait) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * 创建 GM 内核实例（浏览器与测试环境通用）
 * @param {Window} win
 * @param {Document} doc
 */
export function createGM(win, doc) {
  const registry = new Map();
  const events = { theme: [] };
  let ready = false;
  const readyQueue = [];

  const GM = {
    version: "1.0.0",
    page: detectPage(doc.body ? doc.body.getAttribute("data-page") : null),

    $(sel, root) {
      return (root || doc).querySelector(sel);
    },
    $$(sel, root) {
      return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
    },

    /** DOM ready 回调：只触发一次；ready 之后注册立即执行 */
    onReady(fn) {
      if (ready) {
        GM.safe("onReady", fn);
        return;
      }
      readyQueue.push(fn);
    },

    /** 错误边界：单模块异常不扩散 */
    safe(name, fn) {
      try {
        fn();
      } catch (err) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[GM:" + name + "]", err && err.message);
        }
      }
    },

    /** 模块注册：{ name, pages?: string[], init(ctx) }；无 pages 视为全页面 */
    use(def) {
      if (!def || !def.name || registry.has(def.name)) return;
      registry.set(def.name, def);
      if (!def.pages || def.pages.indexOf(GM.page) !== -1) {
        GM.safe(def.name, () => def.init(GM));
      }
    },

    on(evt, cb) {
      if (events[evt]) events[evt].push(cb);
    },
    emit(evt, arg) {
      (events[evt] || []).slice().forEach((cb) => GM.safe(evt + ":cb", () => cb(arg)));
    },

    throttle,
    debounce,

    theme: {
      /** 用户设定的模式：light | dark | auto */
      current() {
        var v = doc.documentElement.getAttribute("data-color-mode");
        return v === "dark" || v === "auto" ? v : "light";
      },
      /** 解析后的实际模式（auto 跟随系统） */
      resolved() {
        var m = this.current();
        if (m !== "auto") return m;
        try {
          return win.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } catch (e) {
          return "light";
        }
      },
      onChange(cb) {
        GM.on("theme", cb);
      },
    },
  };

  function flushReady() {
    if (ready) return;
    ready = true;
    readyQueue.splice(0).forEach((fn) => GM.safe("onReady", fn));
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", flushReady);
  } else {
    flushReady();
  }

  return GM;
}

/* ---------- 通用动效增强：滚动渐显 + 卡片 3D 倾斜 ---------- */
function enhance(GM) {
  var doc = GM.$ ? document : null;

  // 滚动渐显（.reveal → .in），同容器内按序交错
  var revealEls = GM.$$(".reveal:not(.in)");
  if (revealEls.length && typeof IntersectionObserver !== "undefined") {
    var groups = new Map();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          io.unobserve(el);
          var parent = el.parentElement;
          var idx = groups.get(parent) || 0;
          groups.set(parent, idx + 1);
          el.style.setProperty("--reveal-i", String(Math.min(idx, 8)));
          el.classList.add("in");
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  // 卡片 3D 倾斜（仅精确指针设备；prefers-reduced-motion 时跳过）
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || calm) return;
  GM.$$("[data-tilt]").forEach(function (card) {
    var raf = null;
    card.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--tilt-y", (px * 5).toFixed(2) + "deg");
        card.style.setProperty("--tilt-x", (-py * 5).toFixed(2) + "deg");
        card.style.setProperty("--tilt-lift", "-6px");
      });
    });
    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-lift", "0px");
    });
  });
}

/* ---------- 浏览器引导 ---------- */
if (typeof window !== "undefined" && typeof document !== "undefined" && !window.GM) {
  var GM = createGM(window, document);
  window.GM = GM;

  // 主题广播：手动切换（data-color-mode 变化）与系统深浅变化（auto 模式）
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(function () {
      GM.emit("theme", GM.theme.current());
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-color-mode"],
    });
  }
  try {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onScheme = function () {
      if (GM.theme.current() === "auto") GM.emit("theme", "auto");
    };
    if (mq.addEventListener) mq.addEventListener("change", onScheme);
    else if (mq.addListener) mq.addListener(onScheme);
  } catch (e) {
    /* matchMedia 不可用则忽略 */
  }

  GM.onReady(function () {
    GM.safe("enhance", function () {
      enhance(GM);
    });
    // 动态加载功能模块；单个模块加载失败被吞掉，不影响其他模块
    [
      "vercount",
      "backtop",
      "progress",
      "toc",
      "codecopy",
      "lazyload",
      "lightbox",
      "prefetch",
      "palette",
      "comments",
    ].forEach(function (name) {
      import("./" + name + ".js").catch(function () {
        /* 模块缺失或加载失败：静默降级 */
      });
    });
  });
}
