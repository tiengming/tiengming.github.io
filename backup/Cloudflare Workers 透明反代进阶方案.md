Cloudflare Workers 透明反代进阶方案

### 1. 核心应用场景
* **域名映射**：将 `a.example.com` 透明代理至 `b.example.com`。（也就是访问`a.example.com`实际访问的是`b.example.com`，但不改变路径）
* **优选接入**：配合 Cloudflare 优选 IP，提升国内访问速度。
* **状态保持**：完美支持需要密码登录、保持 Session/Cookie 的网站。

### 2. 核心技术原理
反代不仅仅是请求转发，要实现“登录可用”，必须处理好以下三要素：

1.  **Host 头部欺骗**：原站通常根据 `Host` 头部识别请求，必须将其改为原站域名。
2.  **Cookie 作用域重写**：原站返回的 `Set-Cookie` 带有其原域名限制，需剥离 `Domain` 属性，让浏览器将其存入代理域名下。
3.  **重定向拦截**：拦截 `301/302` 状态码，改写 `Location` 头部，防止页面直接跳转回原站。

---

### 3. 部署代码 (JavaScript)

```javascript
/**
 * 生产环境透明反代脚本
 * 功能：支持登录保持、重定向修复、HTML 链接改写
 * 配置说明：
 * 1. 在 Workers 控制台 -> 设置 -> 变量 -> 添加环境变量：
 * - TARGET_HOSTNAME: b.example.com
 */

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // 从环境变量获取目标域名，如果没有则手动修改下方字符串
    const targetHost = typeof TARGET_HOSTNAME !== 'undefined' ? TARGET_HOSTNAME : 'rin-server.tiengfeng-3cd.workers.dev';
    
    try {
        const url = new URL(request.url);
        const userHost = url.host; // 即 blog.buxiantang.top

        // 1. 修改请求目标
        const newUrl = new URL(request.url);
        newUrl.host = targetHost;
        newUrl.protocol = 'https:';

        // 2. 构造请求头 (透传 Cookie, Authorization 等)
        const newHeaders = new Headers(request.headers);
        newHeaders.set('Host', targetHost);
        newHeaders.set('Referer', `https://${targetHost}/`);
        
        // 移除 CF 自身生成的干扰头
        const headersToDelete = ['cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'cf-visitor', 'x-forwarded-for', 'x-real-ip'];
        headersToDelete.forEach(h => newHeaders.delete(h));

        // 3. 发起后端请求
        const response = await fetch(newUrl.href, {
            method: request.method,
            headers: newHeaders,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
            redirect: 'manual' // 必须手动处理，否则会导致 Cookie 丢失
        });

        // 4. 处理响应头
        let responseHeaders = new Headers(response.headers);

        // 【关键】修复重定向：防止跳回到源站域名
        if ([301, 302, 303, 307, 308].includes(response.status)) {
            const location = responseHeaders.get('Location');
            if (location) {
                // 将响应中的源站域名替换回你的优选域名
                const modifiedLocation = location.replace(targetHost, userHost);
                responseHeaders.set('Location', modifiedLocation);
            }
        }

        // 【关键】修复登录 Cookie：移除 Domain 限制，让浏览器能正常保存
        if (responseHeaders.has('Set-Cookie')) {
            let cookies = responseHeaders.get('Set-Cookie');
            // 移除 Domain 属性，确保 Cookie 写入 blog.buxiantang.top
            cookies = cookies.replace(/Domain=[^;]+;?/gi, '');
            // 移除 Secure 属性（如果你没有全站强制 HTTPS，可以留着，推荐保留）
            // cookies = cookies.replace(/Secure/gi, ''); 
            responseHeaders.set('Set-Cookie', cookies);
        }

        // 5. 处理 HTML 内容 (可选，但建议保留，防止点击页面内部链接跳走)
        let body = response.body;
        const contentType = responseHeaders.get("Content-Type") || "";
        if (contentType.includes("text/html")) {
            let text = await response.text();
            // 全局替换：将页面中所有的源站域名改成优选域名
            text = text.replace(new RegExp(targetHost, 'g'), userHost);
            body = text;
        }

        // 6. 返回结果
        const finalResponse = new Response(body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });

        // 注入 CORS 和安全头
        finalResponse.headers.set('Access-Control-Allow-Origin', '*');
        finalResponse.headers.set('Access-Control-Allow-Credentials', 'true');
        // 移除 CSP 策略，防止拦截代理加载的资源
        finalResponse.headers.delete('Content-Security-Policy');

        return finalResponse;

    } catch (err) {
        return new Response(`[Proxy Error] ${err.message}`, { status: 502 });
    }
}
```

---

### 4. 部署步骤笔记

1.  **新建 Worker**：在 Cloudflare Dashboard 创建一个新的 Worker，粘贴上述代码并保存。
2.   **设置环境变量**：在 Workers 控制台 -> 设置 -> 变量 -> 添加环境变量： `TARGET_HOSTNAME` : `b.example.com`
3.  **设置路由 (Routes)**：    * 进入 Worker -> **Triggers (触发器)**。
    * 点击 **Add Route (添加路由)**。
    * 填入 `a.example.com/*`。
4.  **配置域名解析**：
    * 在 DNS 设置中，确保 `a.example.com` 已通过 CNAME 或 A 记录指向 Cloudflare（开启小黄云或使用优选 IP 地址，比如`cf.090227.xyz`）。
5  **测试登录**：
    * 访问 `a.example.com`。
    * 输入密码登录，检查页面是否依然停留在该域名下，且能够正常进入后台。

### 5. 风险与优化建议
* **安全性**：反代代码会接触到明文账号密码（虽然在 CF 加密隧道内），建议仅为自己使用。
* **缓存优化**：如果原站是静态博客，可以在响应头中添加 `Cache-Control` 以利用 CF 边缘缓存，节省原站 Worker 额度。
* **CSP 拦截**：如果某些 JS 加载失败，检查是否是 `Content-Security-Policy` 导致，本脚本已默认删除该头部以兼容代理。