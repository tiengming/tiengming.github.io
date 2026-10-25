/**
 * build-post.mjs —— astro build 之后的本地后处理链（无网络依赖）
 * 步骤：lazy 图片注入（后续任务在此追加 pagefind 索引与旧链接重定向）
 */

import { spawnSync } from "node:child_process";
import { main as lazyImgs } from "./lazy-imgs.mjs";
import { main as legacyRedirects } from "./legacy-redirects.mjs";
import { main as callouts } from "./callouts.mjs";

await lazyImgs("dist");
await callouts("dist");
await legacyRedirects("dist", "legacy");

if (process.env.SKIP_PAGEFIND !== "1") {
  // pagefind 在 Task 8 接入后启用；CLI 不存在时静默跳过
  const r = spawnSync("npx", ["--no-install", "pagefind", "--site", "dist"], { stdio: "inherit" });
  if (r.status !== 0) console.log("pagefind: 跳过（未安装或失败）");
}
