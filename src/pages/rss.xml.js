import rss from "@astrojs/rss";
import site from "../config/site";
import { allPosts, excerpt } from "../utils/posts";

export async function GET(context) {
  const posts = await allPosts();
  return rss({
    title: site.site.title,
    description: site.site.description,
    site: context.site ?? new URL(site.site.url),
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      link: `/p/${p.data.issueNumber}/`,
      description: excerpt(p.body, 160),
      content: p.body ?? "",
      categories: p.data.labels,
    })),
    customData: `<language>zh-CN</language><image><url>${site.site.url}/favicon.svg</url><title>${site.site.title}</title><link>${site.site.url}</link></image>`,
  });
}
