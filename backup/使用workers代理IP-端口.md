## 一、目的

- 通过workers实现访问域名时实际请求url是ip:port
- 举个例子：
  
  - 我需要将ip为123.456.789，端口号为6666，通过域名代理，实现：访问target.example.com，请求的是123.456.789:6666，~~我在绕口令吗？🤣~~

## 二、实现

1. 创建一个workers，名称随意，比如说`targetworkers`（**为什么是`targetworkers`而不是`target`呢？留给聪明的你回答**）
2. 编辑代码：

```JavaScript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 目标域名和端口
  const targetHost = 'targetworkers.example.com:6666'

  // 获取原始请求的 URL 和路径
  const url = new URL(request.url)
  const targetUrl = `http://${targetHost}${url.pathname}${url.search}`

  // 构造新的请求
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  })

  // 发送请求并返回响应
  const response = await fetch(proxyRequest)

  // 创建新的响应，保持地址栏不变
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}
```

3. 保存并部署
4. 添加自定义域名，将这个workers解析到target.example.com
5. 进行DNS解析：使用A记录将`targetworkers.example.com`解析到123.456.789

## 三、完成

现在访问`target.example.com`就可以打开123.456.789:6666了。其实就是代理。



