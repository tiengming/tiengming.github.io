/**
 * 灯箱：正文图片点击放大（多层级浮层），Esc/点击遮罩关闭，关闭后焦点归还
 */

export function attachLightbox(root: ParentNode = document): void {
  const scope = (root as HTMLElement).matches?.("article.post")
    ? (root as HTMLElement)
    : ((root as Document).querySelector?.("article.post") as HTMLElement | null);
  if (!scope) return;

  scope.querySelectorAll<HTMLElement>(".prose img").forEach((img) => {
    if (img.dataset.lightboxBound) return;
    img.dataset.lightboxBound = "1";
    img.setAttribute("tabindex", "0");
    img.addEventListener("click", () => open(img));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(img);
      }
    });
  });

  function open(img: HTMLElement) {
    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.role = "dialog";
    overlay.ariaModal = "true";
    overlay.ariaLabel = "图片预览（点击或按 Esc 关闭）";

    const clone = img.cloneNode(true) as HTMLElement;
    clone.removeAttribute("tabindex");
    overlay.appendChild(clone);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const close = () => {
      overlay.remove();
      document.body.style.overflow = "";
      img.focus();
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    overlay.focus?.();
  }
}
