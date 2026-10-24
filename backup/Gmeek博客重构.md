> [!NOTE]
> 本文对应的修改已开源：主题模板在 [tiengming/Gmeek 的 aurora 分支](https://github.com/tiengming/Gmeek/tree/aurora)，设计系统与插件在 [tiengming/tiengming.github.io 的 static/assets/](https://github.com/tiengming/tiengming.github.io/tree/aurora/static/assets)。本文即本站当前正在使用的主题。

## 🌌 从「插件增强」到「主题重构」

上一篇 [🍎 Gmeek UI 增强插件使用教程](https://code.buxiantang.top/post/%F0%9F%8D%8E%20Gmeek%20UI%20-zeng-qiang-cha-jian-shi-yong-jiao-cheng.html) 的思路是**纯前端注入**：不动上游模板，靠 `GmeekCustomizeCss.js` 在浏览器里把 SideNav 列表动态改写成卡片。用了一年，两个问题越来越明显：

1. **天花板**：运行时改写 DOM 意味着页面先按原样渲染、再被 JS 重排——闪烁、错位、LCP 劣化都源于此，而且视觉深度受模板结构限制；
2. **维护性**：插件散落成一堆独立 JS，互相不知道对方的存在，谁都能在任何页面加载、谁都能崩。

这次的答案是彻底换掉地基：

- **Fork 模板服务端直出** —— 文章卡片、数字分页、图标、文章 meta 全部在 Jinja 模板渲染期生成，浏览器拿到的就是最终 HTML；
- **ES Module 微内核插件体系** —— 页面只加载一个 `core.js` 入口，功能模块按页面类型注册、按需初始化、单模块崩溃互不影响；
- **Aurora 极光玻璃设计系统** —— 设计令牌驱动的完整视觉语言，浅/深/跟随系统三主题全组件统一。

一句话总结：**上一版是给 Gmeek 化妆，这一版是给它换了一套骨骼。**

## ✨ 这一版有什么

### 🎨 视觉

| 特性 | 说明 |
|---|---|
| 极光多层背景 | 3 个大型渐变光斑缓慢漂移 + 细噪点纹理，浅/深主题各自调校 |
| 玻璃拟态卡片 | 磨砂模糊 + 微光描边 + 接触/环境/辉光三级阴影，hover 上浮点亮顶部渐变亮线 |
| 桌面 3D 倾斜 | 卡片随鼠标微倾（仅精确指针设备，自动禁用于触屏） |
| 滚动渐显 | 卡片进入视口时 fade-up + 模糊渐清，同列表按 60ms 交错入场 |
| 页面过渡 | 悬停预取 + 跨文档 View Transitions（Chrome 126+ 平滑过渡，其余浏览器自动降级） |
| 全组件双主题 | 导航、目录、灯箱、返回顶部、命令面板……全部跟随 `data-color-mode` 三态切换 |
| 响应式收敛 | 断点统一为 1200 / 768 / 480，流式字号 `clamp()`，`prefers-reduced-motion` 全局降级 |

### 🖱️ 交互（全部新增）

- **⌘K / Ctrl+K 命令面板**：任意页面唤出，标题/标签即时搜索，方向键导航回车直达；
- **阅读进度条 + 智能导航**：文章页顶部渐变进度条，下滚隐藏导航、上滚浮现；
- **图片懒加载 + 模糊渐显**：进入视口才加载，加载中模糊占位、完成后渐显；
- **代码块增强**：语言标签 + 一键复制（Clipboard API + 旧浏览器降级）；
- **目录 TOC**：≥1200px 桌面右侧粘性目录（当前小节高亮），小屏浮动按钮 + 抽屉。

### 🛠️ 稳定性（这一版顺手修掉的坑）

| 旧版问题 | 现状 |
|---|---|
| `pagination.js` 在每篇文章页对 null 元素必崩，且从未在列表页加载 | 数字分页改**服务端渲染**，文章页根本不存在这段代码 |
| `articletoc.js` 只靠 MutationObserver 触发，脚本加载时 DOM 已静止 → 目录永不渲染 | DOM ready 立即构建，观察器仅作异步内容兜底且限时断开 |
| `GmeekCustomizeCss.js` 双重初始化 + 无上限 1 秒轮询重试 | 卡片由模板直出，轮询代码整个消失 |
| `lightbox.js` 解绑事件传入 `bind` 新引用 → 监听器永远移除不掉 | 全部具名引用，关闭即真正解绑 |
| 灯箱/返回顶部/目录在深色模式下不可见或错误跟随系统 | 全部令牌化，与站点主题三态同步 |
| 所有资源硬编码 `https://code.buxiantang.top` 绝对地址 | 全站相对路径，换域名零成本 |
| `lunar.js`（435KB）等 3 个文件从未被引用 | 已删除，`static/assets` 从 474KB 减到 132KB |
| 浏览量脚本依赖作者博客域名外链加载 | 自托管 + 失败静默降级 |

## 🏗️ 架构一览

```text
你的博客仓库（如 xxx.github.io）                你的 Gmeek fork（aurora 分支）
├─ config.json      ← GMEEK_VERSION:"aurora"   ├─ templates/  6 个 Aurora 模板
├─ static/assets/                                 │   （服务端直出卡片/分页/图标）
│   ├─ aurora/  设计系统（4 个 CSS）              ├─ Gmeek.py    仅 5 处附加改动
│   └─ gm/      插件（core.js + 10 个模块）       └─ AURORA.md   改动清单/同步/回滚
└─ .github/workflows/Gmeek.yml ← 构建源指向 fork
```

浏览器视角：每个页面只加载 **4 个 CSS + 1 个 JS 入口**（`/assets/gm/core.js`），其余模块由内核按页面类型动态 `import()`。

## 🚀 接入指南（四步，约 10 分钟）

前提：你已经有一个能正常运行的 [Gmeek](https://github.com/Meekdai/Gmeek) 博客。

### 第 ① 步：Fork 我的 Gmeek

打开 [tiengming/Gmeek](https://github.com/tiengming/Gmeek)，点右上角 **Fork**。`aurora` 分支会随仓库一起带过去，什么都不用改。

> [!TIP]
> 改动集中在 `templates/` 与 Gmeek.py 的 5 处附加行，细节见 fork 里的 `AURORA.md`。如果你已有自己的 fork，也可以只 cherry-pick aurora 分支的提交。

### 第 ② 步：拷贝主题资产

从 [tiengming.github.io 的 static/assets](https://github.com/tiengming/tiengming.github.io/tree/aurora/static/assets) 把两个目录复制到你博客仓库的 `static/assets/` 下：

```text
static/assets/aurora/   # tokens.css theme.css markdown.css highlight.css
static/assets/gm/       # core.js + 10 个功能模块
```

可选：`static/404.html`（极光风 404 页）和 `static/file/about.html`（配套关于页）也一并拷走。**所有引用都是相对路径，不需要替换任何域名。**

### 第 ③ 步：修改 config.json

对照修改这几处（完整示例见[仓库 config.json](https://github.com/tiengming/tiengming.github.io/blob/aurora/config.json)）：

```json
{
    "GMEEK_VERSION": "aurora",
    "allHead": "<link rel=\"preconnect\" href=\"https://vercount.one\">",
    "script": "",
    "style": "",
    "head": "",
    "indexScript": "",
    "indexStyle": ""
}
```

> [!IMPORTANT]
> 旧版教程里往 `allHead` / `script` 塞样式和插件的那套做法**全部废弃**——设计系统由模板自动引入，插件由 `base.html` 统一加载 `core.js`。你自己的统计代码（如 Clarity）继续放 `allHead` 即可。

### 第 ④ 步：修改 workflow 的构建源

编辑 `.github/workflows/Gmeek.yml` 的 Clone 步骤，把上游地址换成你的 fork：

```yaml
      - name: Clone source code
        run: |
          BRANCH=$(jq -r '.GMEEK_VERSION' config.json)
          git clone --depth 1 --branch "$BRANCH" https://github.com/<你的用户名>/Gmeek.git /opt/Gmeek
```

`GMEEK_VERSION` 的语义变为**分支名**：`aurora` 用本主题，改回 `last` 即回退上游 main。

### ✅ 验证

提交推送 main，Action 构建完成后刷新站点：首屏出现极光渐变与 hero 大标题、按 `Ctrl+K` 能唤出命令面板、文章页右侧出现目录，就说明接入成功。

## 🎨 定制指南

**换一套配色**：只动 `tokens.css` 顶部的极光原色即可全站生效——

```css
:root {
  --au-blue: #7aa8ff;   /* 换成你的主色 */
  --au-violet: #b39dff;
  --au-pink: #ff9dce;
  --au-teal: #7ce8d5;
}
```

**调整插件**：`gm/core.js` 底部有一张模块清单，删掉不想要的模块名（如 `"vercount"`）即完成裁剪；每个模块头部注释写明了它负责的功能与生效页面。

**其他常用项**：每页文章数 `onePageListNum`、代码高亮配色在 `highlight.css`、玻璃模糊强度 `--glass-blur`、断点在 `theme.css` 底部媒体查询。

## ❓ 常见问题

**Q：改了 config.json，但只编辑了某篇 issue，感觉没生效？**
Gmeek 的单篇重建（`runOne`）会优先沿用 `blogBase.json` 里缓存的旧配置。推送一次 main（或等每日定时全量重建）即可刷新缓存，这是 Gmeek 原有行为，不是主题的问题。

**Q：如何跟随上游 Gmeek 更新？**
在 fork 里 `git fetch upstream && git merge upstream/main`。冲突集中在 `templates/`（我们重写过），对照 [AURORA.md](https://github.com/tiengming/Gmeek/blob/aurora/AURORA.md) 的差异表逐个套用即可。

**Q：如何回滚？**
三步：config.json 的 `GMEEK_VERSION` 改回 `last` → workflow 克隆地址改回 `Meekdai/Gmeek` → 删掉 `static/assets/{aurora,gm}`。推完即恢复上游原版构建。

**Q：为什么每页只有一个 `<script>`？**
`core.js` 是 ES Module（天然 defer、严格模式），它在 DOM 就绪后按页面类型动态加载所需模块——文章页的灯箱代码永远不会出现在首页，反之亦然。这也是旧版「分页脚本在文章页崩溃」这类问题从根上消失的原因。

## 🙏 鸣谢

主题底座与构建器来自 [Meekdai/Gmeek](https://github.com/Meekdai/Gmeek)——一个把 GitHub Issues 变成博客的优雅项目；本站的灯箱交互也源自早年间向上游提交的 [lightbox 插件](https://github.com/Meekdai/Gmeek/pull/151)。这一版是在它之上的一次彻底重塑，欢迎交流与反馈。
