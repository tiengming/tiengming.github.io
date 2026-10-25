// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://code.buxiantang.top",
  compressHTML: true,
  integrations: [sitemap()],
  // ClientRouter 页面默认 hover 预取全部内链
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  markdown: {
    // 默认 Sätteri 处理器：GFM 与智能标点默认开启
    // （Obsidian callout 的 [!NOTE] 字面清理走 scripts/build-post.mjs 构建后变换）
    shikiConfig: {
      // 双主题：明暗由 prose.css 按 data-theme/系统切换
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
