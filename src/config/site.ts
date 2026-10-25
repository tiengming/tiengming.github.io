import type { SiteConfig } from "./types";

/**
 * ★★★ 全站唯一配置文件 ★★★
 * 套用本模板：改完本文件 → 提交 → 在仓库发一篇 issue 即完成部署。
 * 每个模块的说明见 types.ts 与 README「配置速查表」。
 */
const site: SiteConfig = {
  site: {
    url: "https://code.buxiantang.top",
    title: "不言堂",
    subtitle: "发现世界上所有美好的事物，分享有趣的东西",
    description: "Tiengming 的个人博客：Cloudflare、AI、输入法、量化与随笔。",
    lang: "zh-CN",
  },
  author: {
    name: "Tiengming",
    avatar: "/favicon.svg",
    email: "tiengming@qq.com",
    bio: "在技术与玄学之间反复横跳。",
  },
  nav: [
    { label: "首页", href: "/" },
    { label: "标签", href: "/tags/" },
    { label: "关于", href: "/about/" },
    { label: "导航站", href: "https://nav.buxiantang.top" },
  ],
  footer: {
    text: "转载请注明出处",
    links: [
      { label: "GitHub", href: "https://github.com/tiengming" },
      { label: "RSS", href: "/rss.xml" },
    ],
  },
  issues: {
    aboutLabel: "about",
    excludeLabels: [],
  },
  features: {
    comments: { provider: "utterances", repo: "tiengming/tiengming.github.io" },
    search: true,
    counter: "vercount",
    analytics: {
      // Cloudflare Web Analytics：CF 控制台 → 你的域名 → Web Analytics → 手动安装，复制 cfwml-token 填入
      cloudflare: "",
      // Umami Cloud（免费档）：cloud.umami.is → Add website → 拿到 script.js 地址与 data-website-id
      // umami: { src: "https://cloud.umami.is/script.js", websiteId: "xxxxxxxx-xxxx" },
      clarity: "na4qnk47pl",
    },
    rss: true,
  },
  theme: {
    defaultMode: "auto",
  },
};

export default site;
