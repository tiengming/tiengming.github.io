# 仓库主页装修设计（模板向）

日期：2026-11-01
状态：已实施（2026-11-01）
范围：`tiengming/tiengming.github.io` 的 GitHub 仓库主页（README + 仓库元信息 + 视觉资产），不改站点本身的视觉与功能。

## 1. 意图

仓库已经是一套可用的 Astro 7 issue 博客模板，README 内容完整，但整页没有一张图：没有站点截图、没有 banner、没有徽章，也没有把在线演示放在第一屏。想用模板的人点进来，无法在 10 秒内判断「长什么样、是不是活的、多快能跑起来」。

这次装修只解决一件事：**让第一屏成为模板的广告位。**

## 2. 目标

- 访客在首屏看到：这是什么 → 长什么样 → 有没有活的 demo → 几步能用。
- README 首屏（约 40 行）承担全部说服工作，详细配置与实现说明保留而不抢戏。
- 补齐仓库可信度信号：`LICENSE`、`topics`、社交预览图、构建徽章。
- 资产可复现：截图与 banner 有明确来源和生成方式，站点改版后能重拍。

## 3. 非目标

- 不改站点视觉（`src/styles/*`、组件、动效）。
- 不改 issue 同步、构建、部署逻辑。
- 不新增运行时依赖。
- 本轮不做英文 README、不做独立文档站。

## 4. 反目标

- 为了好看牺牲准确性（README 里的命令、路径必须与仓库一致）。
- 堆砌徽章和 GIF，首屏变成广告墙。
- 引入体积过大的图片（单张 < 400KB，总计 < 2MB）。
- 把截图放进 `public/`，让它们被发布到站点上。

## 5. 约束

- `docs/` 目录已存在（放草稿与计划），设计文档同样放在 `docs/specs/`。
- README 图片必须能从仓库内相对路径渲染（GitHub 支持 `.github/assets/`）。
- GitHub 没有上传社交预览图的 API，最后一步必须由仓库所有者在 Settings 页面手动完成。
- 截图必须来自本地真实构建（`content/` 已有 27 篇文章），不能是示意稿。

## 6. 方案与取舍

| 方案 | 内容 | 取舍 |
|---|---|---|
| A 轻装修 | 只加 banner、截图、徽章、元信息 | 改动小，但 README 首屏依旧要读文字 |
| **B 重做首屏（选定）** | 首屏重排为 banner + 一句话 + 徽章 + demo + 三图 + 特性 + 三步；详情下沉 | 说服力最强；需要真实截图与 banner，README 结构变动较大 |
| C 独立文档站 | 详细文档外移，README 只留入口 | 长期干净，但本轮成本最高，且与「一眼看懂」目标不匹配 |

选择 B：模板的转化发生在第一屏，A 解决不了这个问题，C 超出了本轮范围。

## 7. 交付物

### 7.1 视觉资产（新增 `.github/assets/`）

| 文件 | 规格 | 来源 |
|---|---|---|
| `banner.png` | 1280×320，墨底 + 玉青点缀，站名 + 一句定位 | 用 HTML 排版后浏览器截图，字体沿用 LXGW WenKai |
| `screenshot-light.png` | 1280×800，首页亮色 | `npm run build` 后本地起服务截图 |
| `screenshot-dark.png` | 1280×800，首页暗色 | 同上，主题切换后截取 |
| `screenshot-mobile.png` | 390×844，首页移动视口 | 同上 |
| `social-preview.jpg` | 1280×640 | 由 banner + 截图拼合，供手动上传（JPEG 保渐变） |

### 7.2 README 首屏（前约 40 行）

```text
banner
# 不言堂 · Astro issue 博客模板
一句话：用 GitHub Issues 写文章，Astro 7 构建，零前端框架。
徽章：Deploy / Astro 7 / Node 22 / License
[在线演示] [Use this template] [设计说明]
三张截图（亮 / 暗 / 移动）
六条特性（issue 即文章、零前端框架、Pagefind 中文搜索、utterances 评论、RSS/站点地图、旧链接重定向）
三步部署（模板 → 改 site.ts → 开 Pages）
---
原有详细内容保留：用 issue 写文章、配置速查、自定义外观、本地开发、结构、许可
```

### 7.3 仓库元信息

- `topics`：`astro` `blog-template` `github-issues` `static-site` `pagefind` `tailwindcss` `rss` `chinese`
- `description`：在现有描述基础上压缩到一句，突出「模板」定位。
- 社交预览图：由所有者手动上传 `social-preview.jpg`（GitHub 无 API）。

### 7.4 LICENSE

待所有者决定，二选一：

- **MIT**：模板生态常规做法，降低使用者的法律顾虑（推荐）。
- **自定义声明**：保留「代码可参考、不授权再分发」。

## 8. 留给执行者

- banner 与社交预览图的具体排版（在既定色板与字体下自由发挥）。
- 截图截哪一页、用什么内容作为画面主体（首屏优先展示文章卡片）。
- 徽章的具体样式（shields.io 静态徽章 vs GitHub 原生）。
- 是否需要 `.github/ISSUE_TEMPLATE/`（本轮可不做）。
