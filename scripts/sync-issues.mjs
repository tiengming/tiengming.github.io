#!/usr/bin/env node
/**
 * sync-issues.mjs —— GitHub Issues → content/ 全量镜像（零依赖）
 *
 * 约定（事实源: docs/plans/2026-10-25-astro-v2.md Task 2）：
 *   - 每个 open issue（非 PR）→ content/posts/{number}.md（frontmatter + 正文）
 *   - 带 aboutLabel（默认 "about"）标签的 issue → content/pages/about.md，且不进 posts
 *   - 全量镜像：取回全部后再落盘；失败即抛错且不触碰现有文件（先取全后落盘）
 *   - closed/删除的 issue 对应文件在下一次成功同步时被清理
 *
 * CLI:
 *   node scripts/sync-issues.mjs --repo owner/name [--token T] [--out content] [--about-label about]
 *   token 缺省回退环境变量 GITHUB_TOKEN（公共仓库可省略）
 */

import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** frontmatter 字段块（YAML，值经 JSON 序列化保证安全引用） */
function frontmatter(issue, pinned = new Set()) {
  const labels = (issue.labels ?? []).map((l) => l.name).filter(Boolean);
  const lines = [
    "---",
    `title: ${JSON.stringify(issue.title ?? `Issue #${issue.number}`)}`,
    `pubDate: ${issue.created_at}`,
    `updatedDate: ${issue.updated_at}`,
    `issueNumber: ${issue.number}`,
    `comments: ${issue.comments ?? 0}`,
    `labels: [${labels.map((l) => JSON.stringify(l)).join(", ")}]`,
    `source: ${issue.html_url}`,
  ];
  if (pinned.has(issue.number)) lines.push("pinned: true");
  lines.push("---");
  return lines.join("\n");
}

/**
 * Gmeek 旧约定还原：正文里 `` `Gmeek-html<X>` `` 的 code-span 在 Gmeek 构建期
 * 会被还原成裸 HTML；本项目的约定 = 直接在 issue 正文写原生 HTML（Markdown 透传）。
 */
export function restoreLegacyHtml(body) {
  return body.replace(/`Gmeek-html([\s\S]*?)`/g, "$1");
}

/** issue → posts/{number}.md；空正文只产出 frontmatter；pinned 为置顶编号集合 */
export function renderPost(issue, pinned = new Set()) {
  const fm = frontmatter(issue, pinned);
  const body = issue.body ? `\n\n${restoreLegacyHtml(issue.body)}` : "\n";
  return { path: `posts/${issue.number}.md`, content: fm + body };
}

/** issue → pages/{name}.md（关于页等特殊页面） */
export function renderPage(issue, name, pinned = new Set()) {
  const fm = frontmatter(issue, pinned);
  const body = issue.body ? `\n\n${restoreLegacyHtml(issue.body)}` : "\n";
  return { path: `pages/${name}.md`, content: fm + body };
}

/** GraphQL pinnedIssues 响应 → 置顶编号数组（异常形状一律返回空） */
export function parsePinnedNumbers(res) {
  const nodes = res?.data?.repository?.pinnedIssues?.nodes;
  if (!Array.isArray(nodes)) return [];
  return nodes.map((n) => n?.issue?.number).filter((n) => Number.isInteger(n));
}

/** 拉取 GitHub pin 状态（GraphQL，需 token；失败静默返回空集——置顶是增强，不阻断同步） */
export async function fetchPinned({ repo, token, fetchImpl = fetch }) {
  const [owner, name] = repo.split("/");
  const query = `query($o:String!,$n:String!){repository(owner:$o,name:$n){pinnedIssues(first:6){nodes{issue{number}}}}}`;
  try {
    const res = await fetchImpl("https://api.github.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables: { o: owner, n: name } }),
    });
    if (!res.ok) return new Set();
    return new Set(parsePinnedNumbers(await res.json()));
  } catch {
    return new Set();
  }
}

/**
 * 分页拉取仓库全部 open issues（过滤 PR）。
 * 任一页失败即抛错——保证调用方在落盘前感知失败。
 */
export async function fetchIssues({ repo, token, fetchImpl = fetch, state = "open" }) {
  const out = [];
  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${repo}/issues?state=${state}&per_page=100&page=${page}`;
    const res = await fetchImpl(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status} @ ${url}`);
    const batch = await res.json();
    for (const it of batch) {
      if (it.pull_request || it.state !== state) continue;
      out.push(it);
    }
    if (batch.length < 100) break;
  }
  return out;
}

function atomicWrite(file, content) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, content, "utf8");
  renameSync(tmp, file);
}

/** 目录镜像：只删本工具管理的命名空间（posts/\d+.md 与 pages/about.md） */
export function mirrorDir(issues, dir, aboutLabel = "about", pinned = new Set()) {
  const postsDir = join(dir, "posts");
  const pagesDir = join(dir, "pages");
  mkdirSync(postsDir, { recursive: true });
  mkdirSync(pagesDir, { recursive: true });

  const kept = new Set();
  let aboutWritten = false;
  for (const issue of issues) {
    const isAbout = (issue.labels ?? []).some((l) => l.name === aboutLabel);
    const { path, content } = isAbout ? renderPage(issue, "about", pinned) : renderPost(issue, pinned);
    atomicWrite(join(dir, path), content);
    if (isAbout) aboutWritten = true;
    else kept.add(`${issue.number}.md`);
  }

  // 清理已不存在（closed/删除）的文章
  for (const f of readdirSync(postsDir)) {
    if (/^\d+\.md$/.test(f) && !kept.has(f)) rmSync(join(postsDir, f));
  }
  const aboutFile = join(pagesDir, "about.md");
  try {
    if (!aboutWritten) rmSync(aboutFile);
  } catch { /* 文件本不存在，无需处理 */ }
}

/**
 * 全量同步：先取全（或直接使用注入的 issues），后落盘。
 * 取数失败在写盘前抛出——现有目录保持原样。
 * ownerLogin：只镜像该作者的 issue（陌生人开 issue 无法混入站点）。
 */
export async function syncAll({ fetchImpl, issues = null, dir, aboutLabel = "about", repo, token, ownerLogin, pinned = null }) {
  const owner = ownerLogin ?? (repo ? repo.split("/")[0] : undefined);
  const list = (issues ?? (await fetchIssues({ repo, token, fetchImpl }))).filter(
    (it) => owner && it.user?.login === owner,
  );
  // 置顶：外部注入或按 token 拉取；失败/无 token → 空集（不阻断）
  const pinnedSet = pinned ?? (token && repo ? await fetchPinned({ repo, token, fetchImpl }) : new Set());
  mirrorDir(list, dir, aboutLabel, pinnedSet);
  const posts = list.filter((i) => !(i.labels ?? []).some((l) => l.name === aboutLabel));
  return { posts: posts.length, pages: list.length - posts.length };
}

export function parseArgs(argv) {
  const out = { repo: undefined, token: undefined, out: "content", aboutLabel: "about" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--repo") out.repo = argv[++i];
    else if (a === "--token") out.token = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--about-label") out.aboutLabel = argv[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const token = args.token ?? process.env.GITHUB_TOKEN;
  if (!args.repo) {
    console.error("用法: sync-issues.mjs --repo owner/name [--token T] [--out content] [--about-label about]");
    process.exit(2);
  }
  const stat = await syncAll({ repo: args.repo, token, dir: args.out, aboutLabel: args.aboutLabel });
  console.log(`已同步 ${stat.posts} 篇文章、${stat.pages} 个特殊页面 → ${args.out}/`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(`同步失败: ${err.message}`);
    process.exit(1);
  });
}
