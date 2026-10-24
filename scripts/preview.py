# -*- coding: utf-8 -*-
"""Aurora 主题离线预览：用本地 config.json + blogBase.json + fork 模板渲染站点到 .preview/。

不依赖 GitHub token：文章正文直接从现有 docs/post/*.html 中提取。
用法：
    PYTHONPATH=../vendor python3 scripts/preview.py [--gmeek ../Gmeek] [--out .preview]
    python3 -m http.server -d .preview 4173
"""
import argparse
import json
import math
import os
import re
import shutil
import sys
from collections import OrderedDict

from jinja2 import Environment, FileSystemLoader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 与 Gmeek.py 的 IconBase 保持同步（fork aurora 分支）
IconBase = {
    "post": "M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25ZM3.5 6.25a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Zm.75 2.25h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5Z",
    "link": "m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z",
    "about": "M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z",
    "sun": "M8 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8 12a4 4 0 100-8 4 4 0 000 8zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13zM2.343 2.343a.75.75 0 011.061 0l1.06 1.061a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.193 9.193a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061zM16 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0116 8zM3 8a.75.75 0 01-.75.75H.75a.75.75 0 010-1.5h1.5A.75.75 0 013 8zm10.657-5.657a.75.75 0 010 1.061l-1.061 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm-9.193 9.193a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0z",
    "moon": "M9.598 1.591a.75.75 0 01.785-.175 7 7 0 11-8.967 8.967.75.75 0 01.961-.96 5.5 5.5 0 007.046-7.046.75.75 0 01.175-.786zm1.616 1.945a7 7 0 01-7.678 7.678 5.5 5.5 0 107.678-7.678z",
    "search": "M15.7 13.3l-3.81-3.83A5.93 5.93 0 0 0 13 6c0-3.31-2.69-6-6-6S1 2.69 1 6s2.69 6 6 6c1.3 0 2.48-.41 3.47-1.11l3.83 3.81c.19.2.45.3.7.3.25 0 .52-.09.7-.3a.996.996 0 0 0 0-1.41v.01zM7 10.7c-2.59 0-4.7-2.11-4.7-4.7 0-2.59 2.11-4.7 4.7-4.7 2.59 0 4.7 2.11 4.7 4.7 0 2.59-2.11 4.7-4.7 4.7z",
    "rss": "M2.002 2.725a.75.75 0 0 1 .797-.699C8.79 2.42 13.58 7.21 13.974 13.201a.75.75 0 0 1-1.497.098 10.502 10.502 0 0 0-9.776-9.776.747.747 0 0 1-.7-.798ZM2.84 7.05h-.002a7.002 7.002 0 0 1 6.113 6.111.75.75 0 0 1-1.49.178 5.503 5.503 0 0 0-4.8-4.8.75.75 0 0 1 .179-1.489ZM2 13a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z",
    "upload": "M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z",
    "github": "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z",
    "home": "M6.906.664a1.749 1.749 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019A1.75 1.75 0 0 1 13.25 15h-3.5a.75.75 0 0 1-.75-.75V9H7v5.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 1 13.25V6.23c0-.531.242-1.034.657-1.366l5.25-4.2Zm1.25 1.171a.25.25 0 0 0-.312 0l-5.25 4.2a.25.25 0 0 0-.094.196v7.019c0 .138.112.25.25.25H5.5V8.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v5.25h2.75a.25.25 0 0 0 .25-.25V6.23a.25.25 0 0 0-.094-.195Z",
    "sync": "M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z",
    "copy": "M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z",
    "check": "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z",
}

i18n = {"Search": "搜索", "switchTheme": "切换主题", "home": "首页", "comments": "评论", "run": "网站运行 ", "days": " 天", "Previous": "上一页", "Next": "下一页"}

POST_BODY_RE = re.compile(
    r'<div class="markdown-body" id="postBody">(.*?)</div>\n<div style="font-size:small;margin-top:8px;float:right;">',
    re.DOTALL,
)
MATHJAX_RE = re.compile(r"cdn\.jsdelivr\.net/npm/mathjax")


def load_blog_base():
    """fresh config.json + blogBase.json 数据 + Gmeek 默认值合并，模拟 defaultConfig。"""
    config = json.load(open(os.path.join(ROOT, "config.json"), encoding="utf-8"))
    defaults = {"singlePage": [], "startSite": "", "filingNum": "", "onePageListNum": 15,
                "commentLabelColor": "#006b75", "yearColorList": ["#bc4c00", "#0969da", "#1f883d", "#A333D0"],
                "i18n": "CN", "themeMode": "manual", "dayTheme": "light", "nightTheme": "dark",
                "urlMode": "pinyin", "script": "", "style": "", "head": "", "indexScript": "",
                "indexStyle": "", "bottomText": "", "showPostSource": 1, "iconList": {}, "UTC": 8,
                "rssSplit": "sentence", "exlink": {}, "needComment": 1, "allHead": ""}
    base = {**defaults, **config}
    base.setdefault("displayTitle", base["title"])
    base.setdefault("faviconUrl", base["avatarUrl"])
    base.setdefault("ogImage", base["avatarUrl"])
    base.setdefault("homeUrl", "https://code.buxiantang.top")

    state = json.load(open(os.path.join(ROOT, "blogBase.json"), encoding="utf-8"))
    base["postListJson"] = state["postListJson"]
    base["singeListJson"] = state.get("singeListJson", {})
    base["labelColorDict"] = state["labelColorDict"]
    return base


def extract_post_body(post_url):
    """从现有 docs 构建产物中提取正文 HTML（postUrl 为 URL 编码，需解码匹配本地文件名）。"""
    import urllib.parse
    path = os.path.join(ROOT, "docs", urllib.parse.unquote(post_url))
    if not os.path.exists(path):
        print("  !! 缺少已构建页面，跳过正文: " + post_url)
        return None, False
    html = open(path, encoding="utf-8").read()
    m = POST_BODY_RE.search(html)
    if not m:
        print("  !! 未匹配到 postBody: " + post_url)
        return None, False
    return m.group(1), bool(MATHJAX_RE.search(html))


def make_post_base(blog_base, entry, body, has_math):
    post = dict(blog_base)
    post["postTitle"] = entry["postTitle"]
    post["postUrl"] = blog_base["homeUrl"] + "/" + entry["postUrl"]
    post["description"] = entry.get("description", "")
    post["postBody"] = body
    post["commentNum"] = entry.get("commentNum", 0)
    # 预览用当前 config 的注入字段；旧构建产物里存的是历史值
    post["style"] = blog_base["style"]
    script = blog_base["script"]
    if has_math:
        script += '<script>MathJax = {tex: {inlineMath: [["$", "$"]]}};</script><script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>'
    post["script"] = script
    post["head"] = blog_base["head"]
    post["top"] = entry.get("top", 0)
    post["postSourceUrl"] = entry.get("postSourceUrl", "")
    post["repoName"] = "tiengming/tiengming.github.io"
    post["postLabels"] = entry.get("labels", [])
    post["createdDate"] = entry.get("createdDate", "")
    post["wordCount"] = entry.get("wordCount", 0)

    if "<pre class=\"notranslate\">" in body:
        post["highlight"] = 1 if '<div class="highlight' in body else 2
        keys = ["sun", "moon", "sync", "home", "github", "copy", "check"]
    else:
        post["highlight"] = 0
        keys = ["sun", "moon", "sync", "home", "github"]
    icon = {k: IconBase[k] for k in keys}
    return post, icon


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gmeek", default=os.path.join(ROOT, "..", "Gmeek"), help="fork 路径")
    ap.add_argument("--out", default=os.path.join(ROOT, ".preview"), help="输出目录")
    ap.add_argument("--limit-posts", type=int, default=0, help="只渲染前 N 篇文章（0=全部）")
    opts = ap.parse_args()

    blog_base = load_blog_base()
    env = Environment(loader=FileSystemLoader(os.path.join(opts.gmeek, "templates")))

    out = opts.out
    if os.path.exists(out):
        shutil.rmtree(out)
    os.makedirs(out)
    # 模拟 Gmeek 的 static/ → docs/ 拷贝
    static_dir = os.path.join(ROOT, "static")
    if os.path.exists(static_dir):
        shutil.copytree(static_dir, out, dirs_exist_ok=True)
    os.makedirs(os.path.join(out, "post"), exist_ok=True)
    # postList.json 供 tag/palette/404 客户端使用
    shutil.copy(os.path.join(ROOT, "docs", "postList.json"), os.path.join(out, "postList.json"))

    def render(template, context, icons, rel_path):
        tpl = env.get_template(template)
        html = tpl.render(blogBase=context, postListJson=context.get("_pageList", {}), i18n=i18n, IconList=icons)
        target = os.path.join(out, rel_path)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        open(target, "w", encoding="utf-8").write(html)
        print("  渲染 " + rel_path)

    # ---- 文章页 ----
    posts = dict(sorted(blog_base["postListJson"].items(),
                        key=lambda x: (x[1]["top"], x[1]["createdAt"]), reverse=True))
    singles = blog_base["singeListJson"]
    count = 0
    for entry in list(posts.values()) + list(singles.values()):
        if opts.limit_posts and count >= opts.limit_posts:
            break
        body, has_math = extract_post_body(entry["postUrl"])
        if body is None:
            continue
        post, icon = make_post_base(blog_base, entry, body, has_math)
        render("post.html", post, icon, entry["postUrl"])
        count += 1

    # ---- 列表页（复刻 createPlistHtml 分页逻辑）----
    plist_icon_keys = list(OrderedDict.fromkeys(
        ["sun", "moon", "sync", "search", "rss", "upload", "post"] + blog_base["singlePage"]))
    plist_icon = {**{k: IconBase[k] for k in plist_icon_keys if k in IconBase}, **blog_base["iconList"]}
    tag_icon = {k: IconBase[k] for k in ["sun", "moon", "sync", "home", "search", "post"] if k in IconBase}

    total = len(posts)
    per = blog_base["onePageListNum"]
    page_count = max(1, math.ceil(total / per))
    keys = list(posts.keys())
    for page_flag in range(page_count):
        lo = page_flag * per
        page_list = {k: posts[k] for k in keys[lo:lo + per]}
        ctx = dict(blog_base)
        ctx["_pageList"] = page_list
        ctx["listPageNum"] = page_flag + 1
        ctx["listPageCount"] = page_count
        ctx["prevUrl"] = "disabled" if page_flag == 0 else ("/index.html" if page_flag == 1 else "/page%d.html" % page_flag)
        has_next = (page_flag + 1) * per < total
        ctx["nextUrl"] = "/page%d.html" % (page_flag + 2) if has_next else "disabled"
        rel = "index.html" if page_flag == 0 else "page%d.html" % (page_flag + 1)
        render("plist.html", ctx, plist_icon, rel)

    ctx = dict(blog_base)
    ctx["_pageList"] = {}
    ctx["listPageNum"] = 1
    ctx["listPageCount"] = page_count
    render("tag.html", ctx, tag_icon, "tag.html")

    print("预览完成: %s （共 %d 篇文章 / %d 个列表页）" % (out, count, page_count))
    print("启动服务: python3 -m http.server -d %s 4173" % out)


if __name__ == "__main__":
    sys.exit(main())
