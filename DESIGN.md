# DESIGN.md —— 不言堂 · Tiengming Blog v2 设计事实源

> 本文件是全站视觉的唯一事实源。CSS/组件若与之漂移，以本文件为准。
> 产出流程：frontend-design + frontend-design-deslop（Phase 0→3），2026-10-25。

## 0. 发现（Discovery）

- **产物类型**：博客 / 编辑型个人刊物（blog/editorial publication），非营销页、非 SaaS。
- **主体**：中文个人技术·随笔博客「不言堂 / Tiengming」，域名 code.buxiantang.top；作者经 GitHub Issues 发文，主题涉 Cloudflare、AI、输入法、量化、玄学随笔——技术为主、书卷为底。
- **读者**：中文技术人群；**主行为**=读文章；次=标签浏览/搜索。
- **视觉血统**：作者 v1 主题（Gmeek aurora 分支）自有的「极光玻璃」语言——多层背景光斑、玻璃卡片、3D 倾斜、滚动渐显、命令面板。v2 继承其骨相，去其杂糅。
- **品牌形容词（锁定）**：沉静、精工、灵动、书卷。**美感三词**：墨、玉、光。

## 1. 美学承诺（Aesthetic Commitment）

**方向**：墨玉书斋（ink-jade study）——深墨近黑的底、玉青一点锋利点缀、常驻背后的低语极光。安静承担信息，锋利用在交互。
- 候选比较过：①奶油纸+衬线编辑刊（弃：落入 2026 AI 奶油+陶土指纹）；②暗底+酸绿单色（弃：过于赛博，与书卷气冲突）；③**墨玉+极光（取）**：承接 v1 血统与 brief 原词（强烈动画/多层/阴影），且避开靛紫带与奶油带。
- **签名动作（唯一）**：「景深舞台」——极光光场常驻背景层；内容面与卡片以 perspective 回应指针（卡片 ±4° 倾斜、hover 三层阴影绽放）；跨页 View Transitions 中光场 persist、内容层形变。光=深度，深度=层级。
- brief 背书注记：径向光晕/玻璃拟态在 deslop 清单中属「反射即弃」项，本设计启用它们是**用户明确指定**（v1 遗产 + 「多层UI/优雅阴影/强烈视角反馈」原词），故为 committed choice 而非 reflex；约束：玻璃仅用于顶栏与浮层，极光仅三层、transform-only、低不透明度。

## 2. 字体（Typography）

| 角色 | 字体 | 说明 |
|---|---|---|
| 展示（站名/标题/H2-H3） | **LXGW WenKai**（霞鹜文楷，webfont unicode-range 分包） | 楷体书卷气=人格来源；仅展示层使用控制体积 |
| 正文 | 系统 CJK sans：`system-ui, "PingFang SC", "HarmonyOS Sans SC", "MiSans", "Microsoft YaHei", "Noto Sans SC", sans-serif` | 性能优先；人格由展示层承担 |
| 代码/meta 数字 | 系统 mono：`ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace` | 技术 accents |

- 字阶：**major third 1.250**，base 17px（中文可读性）：13.6 / 15 / **17** / 21.25 / 26.6 / 33.2 / 41.5（展示上限，站名 clamp 流式）。
- 正文行高 **1.85**（CJK）；正文块宽 ≤ **38em**（约 65-75ch 等义，中文字符宽）；长文左对齐、不两端对齐。
- 展示字距收紧 ≤ -0.01em（楷体字形自身带势，不再紧排）。
- 禁：Inter/Roboto 人格化、全大写眉标、编号装饰（01/02）、大写 tracking、中点 meta 串（`A · B · C`——改用全角顿号/间距分段）。

## 3. 色彩（Color，OKLCH）

60-30-10：墨底主导 / 表面阶次之 / 玉青锋利点缀。全色相带避开 H≈250-320（靛紫）。

| 角色 | 亮（冷纸） | 暗（墨） |
|---|---|---|
| bg | `oklch(0.977 0.004 160)` | `oklch(0.165 0.012 258)` |
| surface | `oklch(0.995 0.002 160)` | `oklch(0.205 0.014 258)` |
| surface-2(hover/raised) | `oklch(0.955 0.006 160)` | `oklch(0.245 0.016 258)` |
| fg | `oklch(0.235 0.018 255)` | `oklch(0.925 0.008 250)` |
| fg-muted | `oklch(0.47 0.02 250)` | `oklch(0.70 0.012 250)` |
| fg-subtle | `oklch(0.60 0.015 250)` | `oklch(0.56 0.012 250)` |
| border | `oklch(0.895 0.008 160)` | `oklch(0.30 0.014 255)` |
| accent（玉） | `oklch(0.52 0.105 172)` | `oklch(0.80 0.125 172)` |
| accent-strong | `oklch(0.44 0.10 172)` | `oklch(0.86 0.11 168)` |
| accent-soft（chip 底） | `oklch(0.92 0.045 172)` | `oklch(0.28 0.05 175)` |
| on-accent | `oklch(0.985 0.005 160)` | `oklch(0.16 0.02 258)` |

语义态：success `oklch(0.55 0.12 150)`/`oklch(0.75 0.13 150)`；warning `oklch(0.62 0.13 75)`/`oklch(0.80 0.13 80)`；error `oklch(0.55 0.19 25)`/`oklch(0.72 0.16 25)`（亮/暗）。

极光三斑（皆玉-青-深青带，H 165-205）：`oklch(0.75 0.12 175)`、`oklch(0.72 0.10 200)`、`oklch(0.55 0.09 190)`，不透明度 0.10-0.16。

对比度：正文/纸 ≥ 4.5:1（fg L0.235 vs bg L0.977 达标）；玉青做链接色时亮模式取 accent-strong(L0.44)。

## 4. 令牌总表（Token Table）

- **间距**：4px 基（Tailwind v4 默认阶）；组内紧（8-12px）、节间松（64-96px），反对均匀。
- **圆角**：仅两档——卡/控件 `--rd-card: 10px`；标签/按钮 `--rd-pill: 999px`。
- **阴影（三层 elevation，brief 核心）**：接触 `--sh-contact` + 环境 `--sh-ambient`（静止组合 `--sh-card`）；悬停绽放 `--sh-bloom`（玉色微晕，`--sh-card-hover` 三合一）。暗模式阴影转「吸光」低亮度同系色，层级主要靠表面明度阶，阴影做辅。**同一元素禁 hairline 边框+弥散阴影叠加**；辉光顶线仅 hover 出现（伪元素 opacity 过渡，不动画 box-shadow）。
- **动效标尺**：`--mo-fast 120ms / base 200ms / slow 320ms / scene 560ms`；缓动 `--mo-ease: cubic-bezier(.16,1,.3,1)`（expo-out）、`--mo-ease-soft: cubic-bezier(.65,0,.35,1)`。仅 transform/opacity 入动画；高频与键盘动作不动画；同列表入场交错 60ms。
- **布局**：内容列 max-width `44rem`（正文）/ `60rem`（列表/复合）；顶栏 sticky 玻璃（毛玻璃仅此处与浮层）。
- 适配器：Tailwind v4 `@theme` + CSS 自定义属性（`--c-*` 色、`--sh-*` 阴影、`--mo-*` 动效、`--rd-*` 圆角、`--ft-*` 字体、`--fs-*` 字阶）。组件一律引用令牌，禁散落字面量。

## 5. 工艺层决策（Craft）

- **布局**：首页=hero（左对齐、楷体站名+一句副题+计数 chips）→ 文章卡片单列长条（非三卡等宽栅格！按时间线性流，卡片带日期竖排/侧挂的编辑刊节奏）；文章页=正文 44rem + 桌面右轨 TOC（宽屏三区：文章/留白/目录）。有意识的布局动作：**侧挂竖排日期**（writing-mode vertical-rl，书卷气）。
- **组件**：卡片（标题楷体、标签 chips 胶囊、meta 系统mono）；分页（数字块，当前块玉底）；顶栏（brand+nav+主题三态+⌘K）；命令面板（居中浮层、玉青高亮条目）；评论区懒加载占位（玻璃卡骨架）。全部状态矩阵：hover/active/focus-visible/visited(链接)。
- **动效**：入场编排一次（hero 先现，列表 60ms 交错渐显+模糊渐清）；滚动渐显 IntersectionObserver 一次性；卡片 tilt 仅 `pointer:fine` + 非 reduced-motion；View Transitions 卡片→文章头共享元素形变，极光 persist。**渐显默认可见**：隐藏初始态由 JS 注入（无 JS 全可见）。
- **图标**：全部内联 SVG，24 网格、1.5px stroke、圆头、10px 圆角终端，与令牌一致；图标按钮均有 aria-label。
- **图像**：正文图片 `loading=lazy decoding=async` + 灯箱放大；无装饰性假图。
- **暗色模式**：非反转——墨底近黑非纯黑、表面明度阶抬升、玉青提亮降饱和；主题切换不加过渡动画。
- **无障碍**：焦点环 `box-shadow`（非 outline 抑制）；目标 ≥ 24px；对比双主题 AA；语义不仅靠色（标签配文字）。

## 6. Slop 预审（Phase 1 尾）

自查通过项：无靛紫带、无渐变字、非奶油底、主字体非 Inter 系、无编号眉标、无侧边色条卡、单一签名动作、reduced-motion 有门控、焦点可见。风险项与处置：径向光晕/玻璃/hover 辉光=brief 指定，已在 §1 注记背书并限域使用。

## 7. Slop 终审（构建后走查，2026-10-25）

**走查方式**：预览服务器 + 浏览器截图 6 张（首页暗/首页亮/文章页暗/命令面板/移动端 390px/404），逐张对照 slop-checklist 审计。

- **通过项**：无靛紫带、无渐变字、冷纸底非奶油、非 Inter 主字体、无编号眉标、无侧签卡、无三卡等宽栅格（单列编辑刊流）、无 hairline+弥散阴影叠加、动效仅 transform/opacity、渐显默认可见（JS 注入隐藏态）、reduced-motion/reduced-transparency 全门控、焦点环可见、触控目标 ≥24px、正文 17px/1.85、脚注对比双主题 AA（走查中两处 subtle 文字提亮：暗 0.56→0.60、亮 0.60→0.64）。
- **走查修复**：卡片摘要剥离 Obsidian `[!NOTE]` 行与括号裸链接；竖排日期字距/边距加大并提亮；⌘K 键提示提亮放大；正文 blockquote 的 `[!TYPE]` 字面经构建后变换转 `data-callout`（warning/tip 左线换色）；meta 行间距放宽；404 描边数字加无 stroke 回退色。
- **布局缺陷检查（渲染态）**：无遮挡/溢出/横向滚动；多栏（文章+右轨目录）对齐正常；标题上间距大于下间距 ✅。
- **性能数字**：首页内联脚本 gzip 3.8KB、文章页 5.5KB（预算 ≤30KB）；外链 JS 为零（Pagefind 与 utterances 均进入视口才动态加载）；楷体 webfont 按 unicode-range 分包按需下载；图片构建期注入 lazy/async；HTML 压缩。
- **签名动作在场**：极光光场（跨页 persist）+ 卡片 3D 倾斜 + 三层阴影 hover 绽放 + 共享元素视图过渡，四者同源于「景深舞台」。✅
- **vercount 实测**：走查中页脚计数已回填真实数据（访问/访客），busuanzi 兼容链路可用。

## Changelog

- 2026-10-25 初版（v2 重建）。
- 2026-10-25 终审回填（§7）：走查 6 视图全部通过，6 处打磨修复，性能达标。
