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
    /** 带此标签的文章标记为「已过时/归档」：文章页出横幅、卡片挂徽标，内容保留 */
    archivedLabel: string;
  };
  /** 关于页配置：技能光谱维度与联系方式卡片 */
  about: {
    /** 雷达图轴，value 为 0-100；顺序即图中顺时针方向 */
    skillAxes: { label: string; value: number }[];
    /** 「找到我」卡片条目 */
    contacts: { label: string; href: string; note?: string }[];
  };
  features: {
    /** 评论区：utterances 直接复用文章 issue 的评论线程；需在仓库安装 utterances app */
    comments: { provider: "utterances" | "off"; repo?: string };
    search: boolean;
    /** 访问计数（页脚公开数字，busuanzi 兼容协议） */
    counter: "vercount" | "off";
    /**
     * 站点分析（可多开，全部可插拔）：
     * - cloudflare: Cloudflare Web Analytics 的 token（CF 控制台 → Analytics & Logs → Web Analytics → 添加站点后 JS 代码片段里的 cfwml-token）
     * - umami: { src: 'https://cloud.umami.is/script.js', websiteId: '…' }（Umami Cloud 或自托管）
     * - clarity: Microsoft Clarity 的项目 ID
     */
    analytics: {
      cloudflare?: string;
      umami?: { src: string; websiteId: string };
      clarity?: string;
    };
    rss: boolean;
  };
  theme: {
    /** 初始主题：auto 跟随系统，顶栏可手动三态切换 */
    defaultMode: "auto" | "dark" | "light";
  };
}
