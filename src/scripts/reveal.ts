/**
 * 滚动渐显 —— 隐藏态由本模块注入（无 JS 内容全可见，slop-checklist「Build correctness」）
 * 交错：--i 序号 × 60ms；弱动效直接跳过（内容保持可见）
 */

const STAGGER = 60;

export function attachReveal(root: ParentNode = document): void {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = root.querySelectorAll<HTMLElement>("[data-reveal]");
  if (reduced || !("IntersectionObserver" in window)) return;

  els.forEach((el) => {
    // 幂等：已入列/已显元素跳过（ClientRouter 换页重扫时防重复渐显）
    if (el.classList.contains("reveal-hidden") || el.classList.contains("reveal-in")) return;
    el.classList.add("reveal-hidden");
    el.style.transitionDelay = `${Math.min(Number(el.style.getPropertyValue("--i")) || 0, 8) * STAGGER}ms`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          const el = en.target as HTMLElement;
          el.classList.remove("reveal-hidden");
          el.classList.add("reveal-in");
          io.unobserve(el);
        }
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
  );
  els.forEach((el) => io.observe(el));
}
