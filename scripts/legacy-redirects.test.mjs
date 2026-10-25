import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildRedirects, renderStub, writeStubs } from "./legacy-redirects.mjs";

const postList = [
  { issue: 29, title: "Gmeek博客重构", legacyPath: "post/Gmeek-bo-ke-zhong-gou.html" },
  { issue: 1, title: "Hello, world", legacyPath: "post/Hello, world.html" },
];
const pagesJson = {
  tag: "tag.html",
  about: "file/about.html",
  rss: "rss.xml",
  postList: "postList.json",
  pages: ["page2.html", "page3.html"],
  posts: ["post/Gmeek-bo-ke-zhong-gou.html", "post/Hello, world.html", "post/🤖 -wu-mapping.html"],
};

test("buildRedirects：postList 条目映射到 /p/{issue}/", () => {
  const m = buildRedirects(postList, pagesJson);
  assert.equal(m.get("post/Gmeek-bo-ke-zhong-gou.html"), "/p/29/");
  assert.equal(m.get("post/Hello, world.html"), "/p/1/");
});

test("buildRedirects：tag/pageN/about/postList 各就各位", () => {
  const m = buildRedirects(postList, pagesJson);
  assert.equal(m.get("tag.html"), "/tags/");
  assert.equal(m.get("page2.html"), "/page/2/");
  assert.equal(m.get("page3.html"), "/page/3/");
  assert.equal(m.get("file/about.html"), "/about/");
  assert.equal(m.get("postList.json"), "/");
  assert.equal(m.has("rss.xml"), false, "rss.xml 新站同路径，无需重定向");
});

test("buildRedirects：不在 postList 的旧文章路径兜底到首页", () => {
  const m = buildRedirects(postList, pagesJson);
  assert.equal(m.get("post/🤖 -wu-mapping.html"), "/");
});

test("renderStub：meta refresh + canonical + noscript 链接", () => {
  const html = renderStub("/p/29/");
  assert.match(html, /http-equiv="refresh" content="0;url=\/p\/29\/"/);
  assert.match(html, /rel="canonical" href="\/p\/29\/"/);
  assert.match(html, /href="\/p\/29\/"/); // noscript 里的可点链接
});

test("writeStubs：按原始路径落盘（空格/emoji 不转义），拒绝路径穿越", () => {
  const dir = mkdtempSync(join(tmpdir(), "redir-"));
  const m = new Map([
    ["post/Hello, world.html", "/p/1/"],
    ["post/🤖 -wu-mapping.html", "/"],
    ["tag.html", "/tags/"],
    ["../escape.txt", "/"],
    ["abs:/etc/passwd", "/"],
  ]);
  writeStubs(dir, m);
  assert.ok(existsSync(join(dir, "post/Hello, world.html")));
  assert.ok(existsSync(join(dir, "post/🤖 -wu-mapping.html")));
  assert.ok(existsSync(join(dir, "tag.html")));
  const stub = readFileSync(join(dir, "post/Hello, world.html"), "utf8");
  assert.match(stub, /\/p\/1\//);
  // 穿越条目不得在 dist 之外产生文件
  assert.ok(!existsSync(join(dir, "..", "escape.txt")));
  rmSync(dir, { recursive: true, force: true });
});
