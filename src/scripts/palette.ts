/**
 * ⌘K 命令面板逻辑 —— 事实源: CommandPalette.astro
 * ClientRouter 换页会整体替换 DOM：open/close 等操作在事件发生时动态查询元素，
 * 不得捕获执行时的节点引用；document 级监听全局只绑一次。
 */

type PfResult = { result: { results: { url: string; meta: { title?: string }; excerpt?: string }[] } };

interface PaletteEls {
  backdrop: HTMLElement | null;
  panel: HTMLElement | null;
  input: HTMLInputElement | null;
  results: HTMLElement | null;
}

const q = (): PaletteEls => ({
  backdrop: document.querySelector<HTMLElement>(".palette-backdrop"),
  panel: document.querySelector<HTMLElement>(".palette"),
  input: document.querySelector<HTMLInputElement>(".palette-input"),
  results: document.querySelector<HTMLElement>(".palette-results"),
});

const NAV_ITEMS: { label: string; href: string; sub: string }[] = [
  { label: "首页", href: "/", sub: "回到最新文章" },
  { label: "标签", href: "/tags/", sub: "按标签浏览全部文章" },
  { label: "关于", href: "/about/", sub: "关于本站与作者" },
];

let pagefind: { search: (q: string) => Promise<PfResult["result"]> } | null = null;
let selected = -1;
let lastFocused: HTMLElement | null = null;

async function ensurePagefind() {
  if (pagefind) return pagefind;
  try {
    pagefind = (await import(/* @vite-ignore */ "/pagefind/pagefind.js")) as never;
    return pagefind;
  } catch {
    return null;
  }
}

async function open() {
  const { backdrop, panel, input } = q();
  if (!backdrop || !panel || !input) return;
  lastFocused = document.activeElement as HTMLElement;
  backdrop.hidden = false;
  panel.hidden = false;
  document.body.style.overflow = "hidden";
  input.value = "";
  await renderDefault();
  input.focus();
}

function close() {
  const { backdrop, panel } = q();
  if (backdrop) backdrop.hidden = true;
  if (panel) panel.hidden = true;
  document.body.style.overflow = "";
  lastFocused?.focus?.();
}

const isOpen = () => !(q().panel?.hidden ?? true);

function itemEl(title: string, sub: string, href: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.className = "palette-item";
  a.setAttribute("role", "option");
  a.href = href;
  const t = document.createElement("span");
  t.className = "pi-title";
  t.textContent = title;
  const s = document.createElement("span");
  s.className = "pi-sub";
  s.textContent = sub;
  a.append(t, s);
  a.addEventListener("click", () => close());
  return a;
}

async function renderDefault() {
  const results = q().results;
  if (!results) return;
  results.textContent = "";
  const pf = await ensurePagefind();
  let recent: { title: string; url: string }[] = [];
  if (pf) {
    const res = await pf.search("");
    recent = res.results.slice(0, 5).map((r) => ({ title: r.meta.title ?? r.url, url: r.url }));
  }
  const g1 = document.createElement("p");
  g1.className = "palette-group";
  g1.textContent = "快速导航";
  results.append(g1);
  NAV_ITEMS.forEach((n) => results.append(itemEl(n.label, n.sub, n.href)));
  if (recent.length > 0) {
    const g2 = document.createElement("p");
    g2.className = "palette-group";
    g2.textContent = "最近文章";
    results.append(g2);
    recent.forEach((r) => results.append(itemEl(r.title, "", r.url)));
  }
}

async function search(query: string) {
  const results = q().results;
  if (!results) return;
  const pf = await ensurePagefind();
  results.textContent = "";
  if (!pf) {
    const e = document.createElement("p");
    e.className = "palette-empty";
    e.textContent = "搜索索引加载失败，刷新页面重试";
    results.append(e);
    return;
  }
  const res = await pf.search(query);
  selected = -1;
  if (res.results.length === 0) {
    const e = document.createElement("p");
    e.className = "palette-empty";
    e.textContent = `没有与「${query}」相关的文章`;
    results.append(e);
    return;
  }
  const g = document.createElement("p");
  g.className = "palette-group";
  g.textContent = `文章 · ${res.results.length} 条`;
  results.append(g);
  for (const r of res.results.slice(0, 12)) {
    const a = document.createElement("a");
    a.className = "palette-item";
    a.setAttribute("role", "option");
    a.href = r.url;
    const t = document.createElement("span");
    t.className = "pi-title";
    t.textContent = r.meta.title ?? r.url;
    const s = document.createElement("span");
    s.className = "pi-sub";
    s.innerHTML = r.excerpt ?? "";
    a.append(t, s);
    a.addEventListener("click", () => close());
    results.append(a);
  }
}

function move(dir: 1 | -1) {
  const results = q().results;
  if (!results) return;
  const items = [...results.querySelectorAll<HTMLElement>(".palette-item")];
  if (items.length === 0) return;
  selected = (selected + dir + items.length) % items.length;
  items.forEach((el, i) => el.classList.toggle("selected", i === selected));
  items[selected].scrollIntoView({ block: "nearest" });
}

export function initPalette(): void {
  const els = q();
  if (!els.backdrop || !els.panel || !els.input || !els.results) return;

  let debounce = 0;
  els.input.addEventListener("input", () => {
    const query = (q().input?.value ?? "").trim();
    clearTimeout(debounce);
    if (!query) {
      renderDefault();
      return;
    }
    debounce = window.setTimeout(() => search(query), 120);
  });

  els.input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      const item = q().results?.querySelectorAll<HTMLElement>(".palette-item")[Math.max(selected, 0)];
      if (item instanceof HTMLAnchorElement) {
        close();
        item.click();
      }
    }
  });

  // 遮罩与触发按钮元素随页面替换，绑元素级监听即可
  document.querySelector(".palette-backdrop")?.addEventListener("click", close);
  document.getElementById("palette-trigger")?.addEventListener("click", () => open());

  // document 级快捷键全局只绑一次（换页 rerun 防堆积）
  const w = window as unknown as { __tmPaletteKeys?: boolean };
  if (!w.__tmPaletteKeys) {
    w.__tmPaletteKeys = true;
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        isOpen() ? close() : open();
      } else if (e.key === "Escape" && isOpen()) {
        close();
      }
    });
  }
}
