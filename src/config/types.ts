/** 全站配置类型 —— 事实源: src/config/site.ts（唯一需要使用者修改的文件） */

export interface NavLink {
  /** 展示名 */
  label: string;
  /** 站内路径以 / 开头；外链完整 http(s) */
  href: string;
}

export interface SiteConfig {
  site: {
    /** 站点绝对地址（部署域名），带协议 */
    url: string;
    /** 站名（展示层楷体呈现） */
    title: string;
    /** 一句副题 */
    subtitle: string;
    /** 站点描述（SEO/RSS） */
    description: string;
    lang: string;
  };
  author: {
    name: string;
    /** 头像，站内路径或完整 URL */
    avatar: string;
    email: string;
    bio: string;
  };
  /** 顶栏导航 */
  nav: NavLink[];
  footer: {
    text: string;
    links: NavLink[];
  };
  issues: {
    /** 带此标签的 issue 渲染为「关于」页（同时改 workflow 的 --about-label） */
    aboutLabel: string;
    /** 带任一此标签的 issue 不进入文章列表 */
    excludeLabels: string[];
  };
  features: {
    /** 评论区：utterances 直接复用文章 issue 的评论线程；需在仓库安装 utterances app */
    comments: { provider: "utterances" | "off"; repo?: string };
    search: boolean;
    /** 访问计数 */
    counter: "vercount" | "off";
    analytics: { clarity?: string };
    rss: boolean;
  };
  theme: {
    /** 初始主题：auto 跟随系统，顶栏可手动三态切换 */
    defaultMode: "auto" | "dark" | "light";
  };
}
