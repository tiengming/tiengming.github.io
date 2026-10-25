/**
 * 3D 指针倾斜 —— 签名动作「景深舞台」的卡片层回应
 * 门控：仅精确指针设备 + 未开启弱动效（DESIGN.md §5）
 */

const MAX_DEG = 4;

export function attachTilt(root: ParentNode = document): void {
  if (!matchMedia("(pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cards = root.querySelectorAll<HTMLElement>("[data-tilt]");
  cards.forEach((card) => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = "1";

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(800px) rotateX(${(-y * MAX_DEG).toFixed(2)}deg) rotateY(${(x * MAX_DEG).toFixed(2)}deg) translateY(-3px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      card.style.transform = "";
    };
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
  });
}
