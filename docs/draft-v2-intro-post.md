---
title: "不言堂 v2：从 Gmeek 到 Astro 的完整重建记录"
pubDate: 2026-10-25T15:30:00Z
updatedDate: 2026-10-25T15:30:00Z
issueNumber: 31
comments: 0
labels: ["blog", "Astro", "教程", "主题"]
source: https://github.com/tiengming/tiengming.github.io/issues/31
---

上一轮重构（那篇已归档的《Gmeek博客重构》）是给 Gmeek 换骨骼；这一轮，是把整座房子推倒重盖——**上游依赖清零，从生成器到设计系统全部自有**。这篇文章记录全过程：选型、架构、设计语言、兼容迁移，以及那些文档里不会告诉你的坑。

## 为什么再次重构

用了一年 aurora 分支后，三个问题始终悬着：

1. **上游天花板**：每次构建都要从我的 Gmeek fork 拉模板，Python 生成器与 Jinja 模板的边界就是站点的边界
2. **运行时负担**：Gmeek 的产物是"先渲染、再被 JS 改写"的 HTML，闪烁与 LCP 损耗是结构性的
3. **双配置漂移**：`config.json` 与 `blogBase.json` 职责重叠，改一处忘一处

v2 的目标一句话：**issue 写作的习惯一点不变，其它全部换掉**。

## 技术选型

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | Astro 7.4 | 内容站事实标准；默认零 JS，岛屿架构按需注水 |
| 样式 | Tailwind 4 + CSS 令牌 | `@theme` 与自定义属性各司其职；令牌全站单一来源 |
| 搜索 | Pagefind | 构建期索引、中文分词、首次打开才加载 |
| 评论 | utterances | 评论区即文章 issue 的讨论串，零数据库 |
| 分析 | CF Web Analytics / Umami / Clarity | 可插拔，全部免 Cookie |
| 部署 | GitHub Actions → Pages | 与写作流同一条管线 |

## 内容管线：issue 即文章

写作体验与 Gmeek 时代完全一致——开 issue 即发文，标签即分类，close 即下架。变化在构建侧：

```text
issue 增删改 / push / 每日定时
        ↓
sync-issues.mjs（零依赖，全量镜像 open issues → content/posts/{N}.md）
        ↓ 变更提交回仓库（[skip ci]）
astro build + 构建后处理（图片懒加载注入 / Gmeek-html 旧约定还原 / 49 条旧链接重定向桩）
        ↓
Pagefind 索引 → deploy-pages
```

几个刻意的决定：

- **URL 恒为 `/p/{issue 编号}/`**——改标题不改链接，永久可引
- **同步脚本只认仓库所有者**——陌生人开的 issue 会被镜像过滤 + workflow 自动关闭，博客不会被塞稿
- **旧约定自动迁移**——Gmeek 时代的 `` `Gmeek-html<iframe…>` `` 在同步期还原为裸 HTML；旧拼音 URL（含空格和 emoji 的百分号编码）全部生成重定向桩，搜索引擎流量不丢

## 设计系统：墨·玉·光

设计事实源是一份 `DESIGN.md`（令牌、色板、动效标尺、以及每次自审的记录），全站只许引用令牌：

- **色**：墨底近黑（OKLCH）+ 玉青一点锋利点缀，60-30-10；刻意避开靛紫带与"奶油纸+陶土"这类一眼模板感的组合
- **字**：霞鹜文楷做展示层（unicode-range 分包，用到才下载），正文系统 CJK——一款 webfont 都不多背
- **影**：三段式 elevation——接触层、环境层、悬停绽放层，明暗双主题各自校准
- **动**：签名动作「景深舞台」——极光光场跨页常驻，卡片随指针 ±4° 倾斜，页面切换共享元素形变；`prefers-reduced-motion` 下全部退化为即时呈现

顺带一提，这套东西最贵的不是任何单项，而是**克制**：玻璃拟态只给顶栏和浮层，辉光只在悬停出现，动画只动 transform 和 opacity。

## 性能账单

- 岛屿 JS：首页 gzip **3.8KB**、文章页 **5.5KB**（预算 30KB）
- 外链阻塞脚本：**0**（Pagefind、评论区、统计全部懒加载）
- 图片：构建期统一注入 `loading=lazy decoding=async`
- Lighthouse 感受：静态 HTML + 系统字体，没有可拖后腿的东西

## 踩坑记（值得抄作业的三条）

1. **Astro 7 的 `data-astro-rerun` 会让脚本走 is:inline**——不转译、不打包，TS 与裸 import 直接变死脚本。正确姿势：普通 `<script>`（被打包）+ `astro:page-load` 事件做唯一初始化入口，首载与每次换页各触发一次
2. **跨组件子选择器在 scoped style 里永远不命中**——`.parent > .child` 里 child 属于子组件时，scope id 对不上。修法：`grid-column`/`order` 各自写在元素所属组件里
3. **Markdown 处理器已换 Sätteri**（Astro 7 默认）——`remarkPlugins` 要装 `@astrojs/markdown-remark` 才能用，GFM 默认开；hast 插件加的属性会被图片替换阶段吞掉，懒加载这类诉求走构建后 HTML 变换更稳

## 套用这个模板

仓库本身即模板：**Use this template → 改 `src/config/site.ts`（唯一配置文件）→ Settings 里把 Pages 源切到 GitHub Actions**，然后发第一个 issue。配置模块覆盖站名、导航、评论、统计开关、关于页技能雷达与联系方式；旧 Gmeek 用户整目录删掉 `legacy/` 即可。

> 从 Gmeek 插件增强，到 fork 模板重构，再到今天的完全自有——三次迭代，写作方式一次没变。工具的意义，是让表达这件事本身越来越轻。

本文对应的源码就在 [tiengming/tiengming.github.io](https://github.com/tiengming/tiengming.github.io)，欢迎 issue 交流。
