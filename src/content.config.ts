import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** 文章集合：由 scripts/sync-issues.mjs 从 GitHub Issues 镜像生成 */
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/posts" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    labels: z.array(z.string()).default([]),
    issueNumber: z.number().int(),
    comments: z.number().int().default(0),
    source: z.string().url(),
    pinned: z.boolean().default(false),
  }),
});

/** 特殊页面集合（关于页等，同样来自 issue） */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/pages" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    labels: z.array(z.string()).default([]),
    issueNumber: z.number().int(),
    comments: z.number().int().default(0),
    source: z.string().url(),
  }),
});

export const collections = { posts, pages };
