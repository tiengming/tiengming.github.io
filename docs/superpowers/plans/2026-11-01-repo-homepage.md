# 仓库主页装修 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `tiengming/tiengming.github.io` 的仓库主页改造成一个「一眼看懂、愿意 Use this template」的模板项目门面。

**Architecture:** 首屏用本地真实构建产出的截图 + banner 建立第一印象，README 首屏只承担「是什么 / 长什么样 / 几步能用」，详细文档保留在后半部分；仓库元信息（topics、description、LICENSE、社交预览图）补齐可信度信号。不改站点代码。

**Tech Stack:** Astro 7 静态站点（`npm run build`）、GitHub Markdown、`gh` CLI、shields.io 静态徽章。

**Spec:** `docs/specs/2026-11-01-repo-homepage-design.md`

## Global Constraints

- 不修改 `src/`、`scripts/`、`astro.config.mjs`、`.github/workflows/`。
- 视觉资产只放 `.github/assets/`，不得放进 `public/`（避免被发布到站点）。
- 图片：单张 < 400KB，五张总计 < 2MB；尺寸必须精确（见各任务）。
- README 中的命令必须与 `package.json` 一致：`npm run dev` / `build` / `preview` / `test` / `sync`。
- README 中的链接只用仓库内相对路径或官方 URL，不引入短链。
- 视觉沿用 `DESIGN.md`：墨底（`oklch(0.165 0.012 258)`）、玉青点缀、展示字 LXGW WenKai。
- 不新增 npm 依赖。

## Review Focus

- **图片路径大小写错误** → README 在 GitHub 上显示破图；Task 3 用脚本校验所有相对图片路径存在且大小写一致。
- **截图与站点不符**（暗色截图其实是亮色、移动截图不是移动布局）→ Task 1 逐张目检并记录首屏内容，Task 6 复核。
- **徽章指向不存在的 workflow 或分支** → Task 3 校验每个徽章 URL 返回 200。
- **LICENSE 署名/年份与 README 不一致** → Task 4 用 `grep` 对照。
- **首屏过长或特性夸大** → Task 3 限制首屏 ≤ 60 行，六条特性逐条对应仓库内真实文件/脚本；Task 6 复核。

---

### Task 1: 构建站点并截取三张真实截图

**Files:**
- Create: `.github/assets/screenshot-light.png`（1280×800）
- Create: `.github/assets/screenshot-dark.png`（1280×800）
- Create: `.github/assets/screenshot-mobile.png`（390×844）

**Interfaces:**
- Produces: 三张 PNG 的路径与尺寸，供 Task 2、Task 3 引用。

- [ ] **Step 1: 安装依赖并构建**

```bash
cd /home/tieng/project/tiengming.github.io
npm install
npm run build
```

Expected: 构建成功，`dist/` 生成，`dist/index.html` 存在。

- [ ] **Step 2: 起本地静态服务**

```bash
cd dist && python3 -m http.server 4321
```

Expected: `http://127.0.0.1:4321/` 返回 200。

- [ ] **Step 3: 截亮色首页**

用浏览器把视口设为 1280×800、主题切到浅色，打开 `/`，截图保存为 `.github/assets/screenshot-light.png`。
画面必须包含站名、文章卡片列表和顶栏。

- [ ] **Step 4: 截暗色首页**

切到暗色主题，保持在首页 `/`，同样 1280×800 截图，保存为 `.github/assets/screenshot-dark.png`。
画面必须包含站名与文章卡片。

- [ ] **Step 5: 截移动端首页**

视口设为 390×844（移动），保持在首页 `/`，截图保存为 `.github/assets/screenshot-mobile.png`。

- [ ] **Step 6: 校验尺寸与体积**

```bash
cd /home/tieng/project/tiengming.github.io
file .github/assets/*.png
du -h .github/assets/*.png
```

Expected: 尺寸分别 1280×800、1280×800、390×844；每张 < 400KB。

- [ ] **Step 7: 提交**

```bash
git add .github/assets/screenshot-*.png
git commit -m "docs(assets): 添加 README 站点截图（亮/暗/移动）"
```

---

### Task 2: 制作 banner 与社交预览图

**Files:**
- Create: `.github/assets/banner.png`（1280×320）
- Create: `.github/assets/social-preview.png`（1280×640）

**Interfaces:**
- Consumes: Task 1 的 `screenshot-light.png`（社交预览图左侧取景）。
- Produces: 两张 PNG，供 Task 3（README 头图）与最终交接（社交预览图上传）使用。

- [ ] **Step 1: 写 banner 源文件**

在 `/tmp/xime-banner/banner.html` 写一个 1280×320 的页面：墨色底（`oklch(0.165 0.012 258)`）、左下角玉青径向光斑、主标题「不言堂」、副标题「用 Issues 写文章 · 用 Astro 建站」、右下角小字 `code.buxiantang.top`。字体栈优先 `LXGW WenKai`。

- [ ] **Step 2: 截图并校验**

用浏览器以 1280×320 视口打开该文件，截图为 `.github/assets/banner.png`。

```bash
file .github/assets/banner.png
```

Expected: `1280 x 320`。

- [ ] **Step 3: 合成社交预览图**

在 `/tmp/xime-banner/social.html` 中：1280×640，左侧 620px 放 `screenshot-light.png`（等比缩放到高度 640 后裁切），右侧放站名 + 一句话 + `code.buxiantang.top`，背景与 banner 同色。截图保存为 `.github/assets/social-preview.png`。

- [ ] **Step 4: 校验体积**

```bash
du -h .github/assets/banner.png .github/assets/social-preview.png
file .github/assets/social-preview.png
```

Expected: `1280 x 640`；两张均 < 400KB。

- [ ] **Step 5: 提交**

```bash
git add .github/assets/banner.png .github/assets/social-preview.png
git commit -m "docs(assets): 添加仓库 banner 与社交预览图"
```

---

### Task 3: 重写 README 首屏

**Files:**
- Modify: `README.md`（第 1-40 行左右的首屏；后半部分保留）

**Interfaces:**
- Consumes: `.github/assets/banner.png`、三张截图、`social-preview.png` 的路径。
- Produces: README 首屏结构，后续任务引用其中的「许可」章节。

- [ ] **Step 1: 写首屏**

把 `README.md` 开头替换为以下结构（标题与顺序固定，措辞可微调但不得改变信息项）：

```markdown
![不言堂 · Astro issue 博客模板](.github/assets/banner.png)

# 不言堂 · Astro issue 博客模板

用 GitHub Issues 写文章，Astro 7 静态构建，零前端运行时框架。

[![Deploy](https://img.shields.io/github/actions/workflow/status/tiengming/tiengming.github.io/blog.yml?branch=main&label=build)](https://github.com/tiengming/tiengming.github.io/actions/workflows/blog.yml)
[![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01)](https://astro.build)
[![Node 22](https://img.shields.io/badge/Node-22-5fa04e)](https://nodejs.org)
[![License MIT](https://img.shields.io/badge/license-MIT-3da639)](./LICENSE)

**[🌐 在线演示](https://code.buxiantang.top)** ·
**[🚀 Use this template](https://github.com/tiengming/tiengming.github.io/generate)** ·
**[🎨 设计说明](DESIGN.md)**

| 亮色 | 暗色 |
|---|---|
| ![](./.github/assets/screenshot-light.png) | ![](./.github/assets/screenshot-dark.png) |

<p align="center"><img src="./.github/assets/screenshot-mobile.png" width="280" alt="移动端"></p>

## 特性

- **Issue 即文章**：新建 issue 就是发文，标题即标题，标签即分类
- **零前端框架**：Astro 7 静态输出，首屏不加载任何 UI 框架
- **中文搜索**：Pagefind 索引，⌘K 全文搜索支持中文分词
- **评论复用**：utterances 直接复用文章 issue 的评论串
- **完整输出**：RSS 全文、站点地图、结构化数据、明暗三态主题
- **旧站兼容**：`legacy/` 自动为旧 Gmeek 链接生成重定向

## 三步部署

1. **Use this template** 创建仓库（建议 `你的名字.github.io`）
2. 改 [`src/config/site.ts`](src/config/site.ts)：站名、域名、导航、评论仓
3. Settings → Pages → Source 选 **GitHub Actions**，新建一篇 issue 触发首次构建
```

- [ ] **Step 2: 校验首屏行数与链接**

```bash
awk 'NR<=60' README.md | wc -l
grep -oE '\]\(\./[^)]+\)|\]\(\.github/[^)]+\)|src="\./[^"]+"' README.md
```

Expected: 首屏 ≤ 60 行；所有相对路径都能 `test -f` 通过（图片与 `DESIGN.md`、`src/config/site.ts`）。

- [ ] **Step 3: 校验徽章 URL**

```bash
for u in \
  "https://img.shields.io/github/actions/workflow/status/tiengming/tiengming.github.io/blog.yml?branch=main&label=build" \
  "https://img.shields.io/badge/Astro-7-ff5d01" \
  "https://img.shields.io/badge/Node-22-5fa04e" \
  "https://img.shields.io/badge/license-MIT-3da639"; do
  curl -s -o /dev/null -w "%{http_code} $u\n" "$u"
done
```

Expected: 四个都返回 `200`。

- [ ] **Step 4: 保留后半部分并接入许可**

确认原有章节（用 issue 写文章、模块配置速查、自定义外观、本地开发、结构）仍在；把「许可」章节改为引用 `LICENSE`（MIT）。

- [ ] **Step 5: 提交**

```bash
git add README.md
git commit -m "docs(readme): 重做首屏，突出演示、截图与三步部署"
```

---

### Task 4: 添加 MIT LICENSE

**Files:**
- Create: `LICENSE`
- Modify: `README.md`（「许可」章节）

**Interfaces:**
- Consumes: README 的「许可」章节。
- Produces: 仓库根 LICENSE，GitHub 侧栏自动显示 MIT。

- [ ] **Step 1: 写 LICENSE**

标准 MIT 文本，首行 `MIT License`，版权行：

```text
Copyright (c) 2024-2026 Tiengming
```

- [ ] **Step 2: 校验一致**

```bash
head -3 LICENSE
grep -n "MIT\|LICENSE" README.md | head
```

Expected: LICENSE 含 `MIT License` 与 `2024-2026 Tiengming`；README 许可段落写明 MIT 且链接到 `./LICENSE`。

- [ ] **Step 3: 提交**

```bash
git add LICENSE README.md
git commit -m "docs: 添加 MIT 许可证并更新 README 许可说明"
```

---

### Task 5: 补齐仓库元信息

**Files:** 无（仅 GitHub API 元数据）

**Interfaces:**
- Consumes: 无。
- Produces: 仓库 topics 与 description，供仓库主页展示。

- [ ] **Step 1: 设置 topics**

```bash
gh api -X PUT repos/tiengming/tiengming.github.io/topics \
  -f names[]=astro -f names[]=blog-template -f names[]=github-issues \
  -f names[]=static-site -f names[]=pagefind -f names[]=tailwindcss \
  -f names[]=rss -f names[]=chinese
```

- [ ] **Step 2: 压缩 description**

```bash
gh api -X PATCH repos/tiengming/tiengming.github.io \
  -f description="用 GitHub Issues 写文章的 Astro 7 博客模板：零前端框架、中文搜索、RSS 全文、一键部署"
```

- [ ] **Step 3: 校验**

```bash
gh api repos/tiengming/tiengming.github.io --jq '{description, topics, homepage, license: .license.spdx_id}'
```

Expected: `topics` 含 8 个值；`homepage` 仍为 `https://code.buxiantang.top`；`license` 为 `MIT`（LICENSE 推送后生效，可能延迟）。

---

### Task 6: 全量校验与提交推送

**Files:** 无新增。

**Interfaces:**
- Consumes: Task 1-5 的全部产物。

- [ ] **Step 1: 校验资产**

```bash
cd /home/tieng/project/tiengming.github.io
file .github/assets/*.png
du -ch .github/assets/*.png | tail -1
```

Expected: 五张尺寸正确；总计 < 2MB。

- [ ] **Step 2: 校验 README 链接与图片**

```bash
python3 - <<'PY'
import re, pathlib
text = pathlib.Path("README.md").read_text(encoding="utf-8")
paths = re.findall(r'!\[[^\]]*\]\(([^)]+)\)', text) + re.findall(r'src="([^"]+)"', text)
missing = [p for p in paths if not p.startswith("http") and not pathlib.Path(p.lstrip("./")).exists()]
print("missing:", missing)
PY
```

Expected: `missing: []`。

- [ ] **Step 3: 校验没有改到代码**

```bash
git diff --name-only origin/main...HEAD
```

Expected: 只含 `README.md`、`LICENSE`、`.github/assets/*.png`、`docs/specs/*`、`docs/superpowers/plans/*`。

- [ ] **Step 4: 推送并确认渲染**

```bash
git push origin <branch>
```

推送后打开仓库主页，确认：banner 显示、三张截图正常、徽章为绿色、右侧出现 MIT 许可。

- [ ] **Step 5: 交接社交预览图**

告诉所有者：Settings → Social preview → Upload an image，上传 `.github/assets/social-preview.png`（GitHub 无 API）。

---

### Task 7: 执行后自查（对照评审重点）

**Files:** 无。

- [ ] **Step 1: 逐条复核 Review Focus**

```bash
# 1 图片路径大小写
grep -oE '\.github/assets/[A-Za-z0-9._-]+' README.md | sort -u
ls .github/assets
# 2 截图内容目检：亮/暗/移动三张与站点当前状态一致
# 3 徽章 URL 200（Task 3 Step 3 已跑，重跑一次）
# 4 LICENSE 与 README 一致
head -1 LICENSE; grep -n "MIT" README.md
# 5 首屏行数
awk 'NR<=60' README.md | wc -l
```

Expected: 文件名完全一致；三张截图观感正确；徽章全 200；许可一致；首屏 ≤ 60 行。
