
# 卜仙堂访问统计系统

这是一个基于 Cloudflare Workers 和 D1 数据库的访问统计系统，用于记录网站的页面浏览量（PV）和独立访客数（UV）。

## 功能特点

- 实时统计页面访问量（PV）
- 准确统计独立访客数（UV）
- 使用 D1 数据库持久化存储数据
- 自动初始化数据库结构
- 支持跨域访问（CORS）
- 错误处理和日志记录

## 技术架构

- **前端**：原生 JavaScript
- **后端**：Cloudflare Workers
- **数据库**：Cloudflare D1
- **部署**：Cloudflare Workers

## 数据库结构

### stats 表

| 字段名      | 类型    | 说明           |
| ----------- | ------- | -------------- |
| id          | INTEGER | 主键，固定为 1 |
| pv          | INTEGER | 页面浏览量     |
| uv          | INTEGER | 独立访客数     |
| last_update | INTEGER | 最后更新时间戳 |

### visitors 表

| 字段名     | 类型    | 说明                 |
| ---------- | ------- | -------------------- |
| id         | INTEGER | 主键，自增           |
| ip         | TEXT    | 访客 IP 地址（唯一） |
| last_visit | INTEGER | 最后访问时间戳       |

## 部署步骤

1. 创建 D1 数据库

   - 登录 Cloudflare Dashboard
   - 进入 Workers & Pages
   - 点击 "D1" 标签
   - 点击 "Create database"
   - 输入数据库名称（如 "stats-db"）
   - 点击 "Create"

2. 部署 Worker

   - 进入 Workers & Pages
   - 创建新的 Worker
   - 将 worker.js 代码复制到编辑器中(代码见文末)
   - 点击 "Save and Deploy"

3. 绑定数据库
   - 在 Worker 的 "Settings" 标签中
   - 点击 "Add variable"
   - 选择 "D1 database binding"
   - 变量名输入：`DB`
   - 选择之前创建的数据库
   - 点击 "Save"

## 前端集成

在需要统计的页面中添加以下代码：

```html
<script>
  async function updateStats() {
    try {
      const response = await fetch("https://liuyaoworker.buxiantang.top/stats");
      const data = await response.json();
      document.getElementById("site_pv").textContent = data.pv;
      document.getElementById("site_uv").textContent = data.uv;
    } catch (error) {
      console.error("统计更新失败:", error);
    }
  }

  // 页面加载时更新统计
  document.addEventListener("DOMContentLoaded", updateStats);

  // 每5分钟更新一次统计
  setInterval(updateStats, 5 * 60 * 1000);
</script>

<div class="site-stats" id="site-stats">
  <span class="stats-label">浏览量:</span>
  <span id="site_pv">0</span>
  |
  <span class="stats-label">访客数:</span>
  <span id="site_uv">0</span>
</div>
```

## 统计接口

### 请求

- URL: `https://liuyaoworker.buxiantang.top/stats`
- 方法: GET

### 响应

```json
{
  "pv": 123,
  "uv": 45,
  "lastUpdate": 1746004388417
}
```

## 错误处理

系统会自动处理以下情况：

- 数据库未初始化
- 网络错误
- 数据库操作失败

在发生错误时会返回默认值：

```json
{
  "pv": 0,
  "uv": 0,
  "lastUpdate": 1746004388417,
  "error": "错误信息"
}
```

## 维护建议

1. 定期备份 D1 数据库
2. 监控 Worker 的日志
3. 定期清理过期的访客记录（可选）

## 注意事项

- 统计数据会在 Worker 重启后保留
- UV 统计基于 IP 地址，可能不够精确
- 建议设置适当的缓存策略
- 确保 Worker 有足够的资源配额

## 更新日志

### v1.0.0 (2024-03-01)

- 初始版本发布
- 支持 PV 和 UV 统计
- 使用 D1 数据库存储数据
- 自动初始化数据库结构


workers.js代码：
<details>
  <summary>点我展开看代码</summary>
  <pre><code>
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // 允许的域名规则
    const isProductionOrigin = /^https:\/\/([a-z0-9-]+\.)?buxiantang\.top$/.test(origin);
    const isLocalOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isAllowedOrigin = isProductionOrigin || isLocalOrigin;

    // 基础 CORS 头
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 只有允许的 origin 才设置 CORS 头
    if (isAllowedOrigin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    } else {
      // 不允许的 origin：不设置 Access-Control-Allow-Origin
      // 这样浏览器会正确地阻止跨域请求
      console.warn(`[CORS] 拒绝来自未授权域名的请求: ${origin}`);
    }

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: isAllowedOrigin ? 204 : 403,
        headers: corsHeaders
      });
    }

    // 健康检查端点
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: '统计服务 API',
        version: '1.1.0',
        environment: isLocalOrigin ? 'development' : 'production',
        endpoints: {
          stats: 'GET /stats - 获取和更新统计数据',
          health: 'GET /health 或 / - 健康检查'
        },
        cors: {
          allowedOrigins: [
            'https://*.buxiantang.top',
            'http://localhost:* (开发环境)',
            'http://127.0.0.1:* (开发环境)'
          ]
        }
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 统计端点
    if (url.pathname === '/stats') {
      // 检查是否允许访问
      if (!isAllowedOrigin) {
        return new Response(JSON.stringify({
          error: '未授权的访问',
          message: `域名 ${origin} 不在允许列表中`
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        console.log(`[Stats] 处理来自 ${origin} 的统计请求`);

        // 初始化数据库表
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pv INTEGER DEFAULT 0,
            uv INTEGER DEFAULT 0,
            last_update INTEGER
          )
        `).run();

        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT UNIQUE,
            last_visit INTEGER
          )
        `).run();

        // 获取当前统计数据
        let stats = await env.DB.prepare(`SELECT * FROM stats WHERE id = 1`).first();

        if (!stats) {
          console.log('[Stats] 初始化统计数据');
          await env.DB.prepare(`
            INSERT INTO stats (id, pv, uv, last_update)
            VALUES (1, 0, 0, ?)
          `).bind(Date.now()).run();
          stats = { pv: 0, uv: 0, last_update: Date.now() };
        }

        // 更新 PV（每次访问都增加）
        await env.DB.prepare(`
          UPDATE stats SET pv = pv + 1, last_update = ? WHERE id = 1
        `).bind(Date.now()).run();

        // 获取访客 IP
        const visitorId = request.headers.get('cf-connecting-ip') ||
                         request.headers.get('x-forwarded-for') ||
                         request.headers.get('x-real-ip') ||
                         'unknown';

        // 检查是否是新访客
        const visitor = await env.DB.prepare(`
          SELECT * FROM visitors WHERE ip = ?
        `).bind(visitorId).first();

        if (!visitor) {
          console.log(`[Stats] 新访客: ${visitorId} (来自: ${origin})`);
          await env.DB.prepare(`UPDATE stats SET uv = uv + 1 WHERE id = 1`).run();
          await env.DB.prepare(`
            INSERT INTO visitors (ip, last_visit)
            VALUES (?, ?)
          `).bind(visitorId, Date.now()).run();
        } else {
          // 更新访客最后访问时间
          await env.DB.prepare(`
            UPDATE visitors SET last_visit = ? WHERE ip = ?
          `).bind(Date.now(), visitorId).run();
        }

        // 获取最新统计数据
        const latestStats = await env.DB.prepare(`SELECT * FROM stats WHERE id = 1`).first();

        console.log(`[Stats] 统计更新成功: PV=${latestStats.pv}, UV=${latestStats.uv}`);

        return new Response(JSON.stringify({
          pv: latestStats.pv,
          uv: latestStats.uv,
          lastUpdate: latestStats.last_update
        }), {
          status: 200,
          headers: corsHeaders
        });

      } catch (error) {
        console.error('[Stats] 错误:', error);
        return new Response(JSON.stringify({
          error: '统计服务暂时不可用',
          message: error.message,
          pv: 0,
          uv: 0,
          lastUpdate: Date.now()
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // 未匹配的路径返回 404
    return new Response(JSON.stringify({
      error: '端点不存在',
      availableEndpoints: ['/stats', '/health', '/']
    }), {
      status: 404,
      headers: corsHeaders
    });
  }
};
  </code></pre>
</details>