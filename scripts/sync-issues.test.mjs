import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderPost, renderPage, fetchIssues, syncAll, parseArgs, restoreLegacyHtml, parsePinnedNumbers } from "./sync-issues.mjs";

/** 构造最小 GitHub issue 形状 */
function mkIssue(n, over = {}) {
  return {
    number: n,
    title: `第${n}篇`,
    body: `正文 ${n}`,
    labels: [{ name: "blog" }, { name: "教程" }],
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-02T09:00:00Z",
    comments: 3,
    html_url: `https://github.com/example/repo/issues/${n}`,
    state: "open",
    user: { login: "tiengming" },
    ...over,
  };
}

test("renderPost：空 body 的 issue 只产出 frontmatter，正文为空", () => {
  const { content } = renderPost(mkIssue(9, { body: null }));
  assert.match(content, /^---\n/);
  assert.match(content, /title: "第9篇"/);
  assert.doesNotMatch(content, /正文/);
});

test("renderPost：frontmatter 字段完整（issueNumber/pubDate/updatedDate/comments/labels/source）", () => {
  const { content } = renderPost(mkIssue(29));
  assert.match(content, /issueNumber: 29/);
  assert.match(content, /pubDate: 2026-10-01T08:00:00Z/);
  assert.match(content, /updatedDate: 2026-10-02T09:00:00Z/);
  assert.match(content, /comments: 3/);
  assert.match(content, /labels: \["blog", "教程"\]/);
  assert.match(content, /source: https:\/\/github\.com\/example\/repo\/issues\/29/);
});

test("renderPost：正文以 --- 开头时 frontmatter 不被破坏", () => {
  const { content } = renderPost(mkIssue(10, { body: "---\n分隔线" }));
  const parts = content.split("\n---\n");
  // 第一段为 frontmatter，其后至少还有正文内容
  assert.ok(parts.length >= 2);
  assert.match(content, /分隔线/);
});

test("mirrorDir 经 syncAll：全量镜像并删除 stale 文件（closed issue 消失）", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sync-"));
  const posts = join(dir, "posts");
  mkdirSync(posts, { recursive: true });
  writeFileSync(join(posts, "99.md"), "---\ntitle: 旧文\n---\n"); // stale：issue 99 不存在
  writeFileSync(join(posts, "not-a-post.txt"), "keep");           // 非 md，不删

  await syncAll({ fetchImpl: null, issues: [mkIssue(1), mkIssue(2)], dir, ownerLogin: "tiengming" });

  const files = readdirSync(posts).sort();
  assert.deepEqual(files, ["1.md", "2.md", "not-a-post.txt"]);
  rmSync(dir, { recursive: true, force: true });
});

test("syncAll：带 about 标签的 issue 进 pages/about.md 且不进 posts", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sync-"));
  const about = mkIssue(30, { title: "关于我", labels: [{ name: "about" }] });
  await syncAll({ fetchImpl: null, issues: [mkIssue(1), about], dir, ownerLogin: "tiengming" });

  assert.ok(existsSync(join(dir, "pages", "about.md")));
  assert.ok(!existsSync(join(dir, "posts", "30.md")));
  assert.ok(existsSync(join(dir, "posts", "1.md")));
  rmSync(dir, { recursive: true, force: true });
});

test("syncAll：fetch 失败抛错且不触碰现有目录（先取全后落盘）", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sync-"));
  const posts = join(dir, "posts");
  mkdirSync(posts, { recursive: true });
  writeFileSync(join(posts, "5.md"), "---\ntitle: 既有\n---\n");

  const boom = async () => {
    throw new Error("rate limited");
  };
  await assert.rejects(() => fetchIssues({ repo: "a/b", token: "t", fetchImpl: boom }), /rate limited/);

  const before = readFileSync(join(posts, "5.md"), "utf8");
  await assert.rejects(() => syncAll({ fetchImpl: boom, issues: null, dir }), /rate limited/);
  assert.equal(readFileSync(join(posts, "5.md"), "utf8"), before, "目录必须原样保留");
  rmSync(dir, { recursive: true, force: true });
});

test("fetchIssues：分页聚合、过滤 PR、只保留 open", async () => {
  let call = 0;
  const fake = async (url) => {
    call++;
    if (call === 1) {
      assert.match(url, /per_page=100/);
      return { ok: true, json: async () => [mkIssue(1), mkIssue(2, { pull_request: {} }), mkIssue(3, { state: "closed" })], headers: new Map() };
    }
    return { ok: true, json: async () => [], headers: new Map() };
  };
  const issues = await fetchIssues({ repo: "a/b", token: "t", fetchImpl: fake });
  assert.equal(issues.length, 1);
  assert.equal(issues[0].number, 1);
});

test("renderPage：关于页渲染为 pages/{name}.md", () => {
  const { path, content } = renderPage(mkIssue(30, { title: "关于我" }), "about");
  assert.equal(path, "pages/about.md");
  assert.match(content, /title: "关于我"/);
});

test("renderPost：Gmeek 旧约定 `Gmeek-html<X>` 还原为裸 HTML（iframe 等嵌入可渲染）", () => {
  const { content } = renderPost(
    mkIssue(27, {
      body: "前置说明\n\n`Gmeek-html<iframe src=\"//player.bilibili.com/x\" width=\"100%\" height=\"460px\"></iframe>`\n\n后置",
    }),
  );
  assert.match(content, /<iframe src="\/\/player\.bilibili\.com\/x" width="100%" height="460px"><\/iframe>/);
  assert.doesNotMatch(content, /Gmeek-html/);
});

test("renderPost：普通代码 span（无 Gmeek-html 前缀）不受影响", () => {
  const { content } = renderPost(mkIssue(28, { body: "`code span` 保留" }));
  assert.match(content, /`code span` 保留/);
});

test("syncAll：只镜像仓库所有者的 issue（陌生人开的 issue 被过滤，防止他人发文）", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sync-"));
  const mine = mkIssue(50);
  const stranger = mkIssue(51, { user: { login: "someone-else" } });
  const strangerNoUser = mkIssue(52, { user: undefined });
  await syncAll({ fetchImpl: null, issues: [mine, stranger, strangerNoUser], dir, ownerLogin: "tiengming" });

  assert.ok(existsSync(join(dir, "posts", "50.md")));
  assert.ok(!existsSync(join(dir, "posts", "51.md")));
  assert.ok(!existsSync(join(dir, "posts", "52.md")), "无 user 字段的异常条目同样拒绝");
  rmSync(dir, { recursive: true, force: true });
});

test("parsePinnedNumbers：GraphQL 响应解析出置顶 issue 编号", () => {
  const res = { data: { repository: { pinnedIssues: { nodes: [{ issue: { number: 30 } }, { issue: { number: 29 } }] } } } };
  assert.deepEqual(parsePinnedNumbers(res), [30, 29]);
  assert.deepEqual(parsePinnedNumbers({ data: null }), []);
  assert.deepEqual(parsePinnedNumbers(null), []);
});

test("renderPost：置顶文章带 pinned: true，未置顶无该字段", () => {
  const pinned = renderPost(mkIssue(30), new Set([30]));
  assert.match(pinned.content, /^pinned: true$/m);
  const normal = renderPost(mkIssue(5), new Set([30]));
  assert.doesNotMatch(normal.content, /^pinned:/m);
});

test("parseArgs：--repo/--token/--out/--about-label 与默认值", () => {
  const a = parseArgs(["node", "s.mjs", "--repo", "o/r", "--token", "T", "--out", "content", "--about-label", "guanyu"]);
  assert.deepEqual(a, { repo: "o/r", token: "T", out: "content", aboutLabel: "guanyu" });
  const b = parseArgs(["node", "s.mjs", "--repo", "o/r"]);
  assert.equal(b.aboutLabel, "about");
  assert.equal(b.out, "content");
  assert.equal(b.token, undefined);
});
