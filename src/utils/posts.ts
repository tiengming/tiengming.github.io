import { getCollection, type CollectionEntry } from "astro:content";
import site from "../config/site";

export type Post = CollectionEntry<"posts">;

/** 全部文章（应用 excludeLabels 过滤），pubDate 降序 */
export async function allPosts(): Promise<Post[]> {
  return (await getCollection("posts"))
    .filter((p) => !p.data.labels.some((l) => site.issues.excludeLabels.includes(l)))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 带归档标签的文章视为「已过时」 */
export const isArchived = (post: Post) => post.data.labels.includes(site.issues.archivedLabel);

/** 标签 → 文章数（按计数降序、同数按名称） */
export function tagCounts(posts: Post[]): [string, number][] {
  const m = new Map<string, number>();
  for (const p of posts) for (const l of p.data.labels) m.set(l, (m.get(l) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"));
}

/** 由 markdown 原文提取纯文本摘要（粗剥离，够卡片用） */
export function excerpt(body: string | undefined, n = 92): string {
  if (!body) return "";
  const text = body
    .replace(/```[\s\S]*?```/g, " ") // 代码块
    .replace(/^\s*>?\s*\[!\w+\][^\n]*$/gm, " ") // Obsidian callout 行（> [!NOTE] …）
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接留文字
    .replace(/[#>*_~`|-]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s*[（(]https?:\/\/\S+[）)]/g, " ") // 括号裹纯链接的整段删
    .replace(/\s{2,}/g, " ")
    .replace(/\s*([，。、；：？！,.])/g, "$1")
    .trim();
  return text.length > n ? `${text.slice(0, n)}……` : text;
}

export const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }).format(d).replaceAll("/", "-");
