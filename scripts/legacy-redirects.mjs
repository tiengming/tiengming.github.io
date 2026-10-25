#!/usr/bin/env node
/**
 * legacy-redirects.mjs —— Gmeek 旧 URL → 新 URL 重定向桩生成
 *
 * 背景：GitHub Pages 不支持服务端重定向，构建后在旧路径落
 * `<meta refresh 0>` + canonical 桩页（308 语义）。映射源：
 *   legacy/postList.json —— 旧文章 {issue, legacyPath}（Task 0 提取）
 *   legacy/pages.json    —— 旧杂项页清单
 * 规则：post/{pinyin}.html→/p/{N}/，page{N}.html→/page/N/，
 *       tag.html→/tags/，file/about.html→/about/，postList.json→/，
 *       未映射的旧文章路径→/（首页兜底），rss.xml 同路径不处理。
 *
 * 用法（由 build-post.mjs 调度）：node scripts/legacy-redirects.mjs [dist] [legacyDir]
 */

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, normalize, sep } from "node:path";
import { pathToFileURL } from "node:url";

/** 计算 旧路径 → 新路径 映射（纯函数） */
export function buildRedirects(postList, pagesJson) {
  const m = new Map();

  const mapped = new Set();
  for (const p of postList) {
    if (!p.legacyPath) continue;
    m.set(p.legacyPath, `/p/${p.issue}/`);
    mapped.add(p.legacyPath);
  }
  // 旧文章目录里未被 postList 收录的（如 about 型 issue 的旧文章页）兜底首页
  for (const raw of pagesJson.posts ?? []) {
    if (!mapped.has(raw)) m.set(raw, "/");
  }

  if (pagesJson.tag) m.set(pagesJson.tag, "/tags/");
  for (const p of pagesJson.pages ?? []) {
    const n = /^page(\d+)\.html$/.exec(p);
    if (n) m.set(p, `/page/${n[1]}/`);
  }
  if (pagesJson.about) m.set(pagesJson.about, "/about/");
  if (pagesJson.postList) m.set(pagesJson.postList, "/");
  // rss.xml：新站同路径直接提供，无需桩

  return m;
}

/** 渲染重定向桩页（保持极简：无外链资源） */
export function renderStub(target) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex">
<title>内容已迁移</title>
<meta http-equiv="refresh" content="0;url=${target}">
<link rel="canonical" href="${target}">
</head>
<body>
<p>该地址已迁移，正在带你前往新页面……</p>
<p><a href="${target}">若未自动跳转，点这里</a></p>
</body>
</html>
`;
}

/** 把桩页按原始路径写进 dist（拒绝越界路径） */
export function writeStubs(dist, map) {
  const root = normalize(dist);
  for (const [raw, target] of map) {
    const dest = normalize(join(root, raw));
    if (dest !== root && !dest.startsWith(root + sep)) continue; // 防穿越
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, renderStub(target), "utf8");
  }
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export async function main(dist = "dist", legacyDir = "legacy") {
  const postList = readJson(join(legacyDir, "postList.json"));
  const pagesJson = readJson(join(legacyDir, "pages.json"));
  if (!postList || !pagesJson) {
    console.log("legacy-redirects: 无 legacy 数据，跳过");
    return;
  }
  const map = buildRedirects(postList, pagesJson);
  writeStubs(dist, map);
  console.log(`legacy-redirects: 写入 ${map.size} 个重定向桩`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) main(process.argv[2] ?? "dist", process.argv[3] ?? "legacy");
