/**
 * lazy-imgs.mjs —— 构建后为文章正文 <img> 注入 loading="lazy" decoding="async"
 * 背景：Sätteri 管线对远程图床图片输出裸 <img>（hast 插件属性会被 vite 图片替换阶段
 * 丢弃），构建后 HTML 变换是确定性且零网络依赖的方案。
 *
 * 用法（由 build-post.mjs 调度）：
 *   node scripts/lazy-imgs.mjs            # 处理 dist/
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** 纯函数：给没有 loading 属性的 <img 注入 loading/decoding */
export function transformLazyImages(html) {
  return html.replace(/<img(?![^>]*\bloading=)/g, '<img loading="lazy" decoding="async"');
}

function* walkHtml(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walkHtml(p);
    else if (name.endsWith(".html")) yield p;
  }
}

export async function main(root = "dist") {
  let n = 0;
  for (const file of walkHtml(root)) {
    const before = readFileSync(file, "utf8");
    const after = transformLazyImages(before);
    if (after !== before) {
      writeFileSync(file, after, "utf8");
      n++;
    }
  }
  console.log(`lazy-imgs: 处理 ${n} 个文件`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) main(process.argv[2] ?? "dist");
