/**
 * callouts.mjs —— 构建后把 issue 正文里 Obsidian callout 的字面标记
 * `[!NOTE] …` 转成 <blockquote data-callout="note">（左线按类型着色，见 prose.css）
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const TYPES = "NOTE|TIP|WARNING|IMPORTANT|CAUTION";

/** 纯函数：清理 blockquote 开头的 [!TYPE] 字面并挂 data-callout */
export function transformCallouts(html) {
  return html.replace(
    new RegExp(`(<blockquote[^>]*>)(\\s*(?:<p>)?)\\[!(${TYPES})\\][ \\t]*`, "g"),
    (_m, open, prefix, type) => `<blockquote data-callout="${type.toLowerCase()}">${prefix}`,
  );
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
    const after = transformCallouts(before);
    if (after !== before) {
      writeFileSync(file, after, "utf8");
      n++;
    }
  }
  console.log(`callouts: 处理 ${n} 个文件`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) main(process.argv[2] ?? "dist");
