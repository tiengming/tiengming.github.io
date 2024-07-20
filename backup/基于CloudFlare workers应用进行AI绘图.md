# 基于CloudFlare workers应用进行AI绘图

## 演示

|   |   |   |
| :---: | :---: | :---: |
|  ![ca6832cf36820f3a0fcfe.png](https://imghosting.buxiantang.top/file/ca6832cf36820f3a0fcfe.png)| ![04beae21d486a3bf87022.png](https://imghosting.buxiantang.top/file/04beae21d486a3bf87022.png) | ![e69b41808e1e6e0ed88ef.png](https://imghosting.buxiantang.top/file/e69b41808e1e6e0ed88ef.png) |
| ![a3f47639e1942ddf9e75b.png](https://imghosting.buxiantang.top/file/a3f47639e1942ddf9e75b.png) |![85651a51a2b7c30fba416.png](https://imghosting.buxiantang.top/file/85651a51a2b7c30fba416.png)  | ![ef1264a0cdd944b15466d.png](https://imghosting.buxiantang.top/file/ef1264a0cdd944b15466d.png) |

## 演示地址：[demo](https://img.buxiantang.top/)

## 部署流程

本项目基于：[cloudflare workers应用系列之6:AI 生成图片 Text to Image App](https://51xmi.com/post0715203336)完成二次开发。

### 实现功能：

1. 生成过程中加载动画提示
2. 对原有的中文提示词生成效果不友好进行优化。主要实现过程为：调用大模型和提示词对提示词进行优化，让大模型生成绘图提示词👍👍👍。*有一说一，大模型的提示词确实很好😊。*

### 部署实现

1. 进入[cloudflare](https://dash.cloudflare.com/)，并登录；
2. 点击左侧栏`workers-and-pages`
3. 创建workers。
4. 编辑代码，将下方的代码覆盖添加到workers中。

```
// worker.ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:title" content="免费AI文字生成图片" />
    <meta property="og:image" content="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fa845a04b-d140-4ee9-933e-86358e364583%2F7b32b226-09c3-4f2e-b247-2cfa854149b7%2Flogo.png?id=b3172623-21d8-41c8-9dbc-52425d4ece2b&table=collection&spaceId=a845a04b-d140-4ee9-933e-86358e364583&width=60&userId=a2d6cd07-1a8f-438a-894c-269b862aa1ab&cache=v2" />
    <link rel="icon" href="https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fa845a04b-d140-4ee9-933e-86358e364583%2F7b32b226-09c3-4f2e-b247-2cfa854149b7%2Flogo.png?id=b3172623-21d8-41c8-9dbc-52425d4ece2b&table=collection&spaceId=a845a04b-d140-4ee9-933e-86358e364583&width=60&userId=a2d6cd07-1a8f-438a-894c-269b862aa1ab&cache=v2">
    <link rel="author" href="https://code.buxiantang.top/">
    <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "n8mmwklxas");
    </script>
    <title>免费AI Image Generator || buxiantang.top </title>
    <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f3f4f6;
          color: #333;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }

        .container {
          max-width: 400px;
          background-color: #fff;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        h2 {
          margin-bottom: 20px;
          color: #444;
        }

        .textinput {
          width: calc(100% - 24px);
          height: 40px;
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          transition: border-color 0.3s;
        }

        .textinput:focus {
          border-color: #007BFF;
          outline: none;
        }

        .btn-wrapper {
          background-color: #007BFF;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s, box-shadow 0.3s;
        }

        .btn-wrapper:hover {
          background-color: #0056b3;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .aiimage {
          width: 100%;
          max-width: 360px;
          height: auto;
          margin-top: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .aiimage img {
          max-width: 100%;
          border-radius: 10px;
        }
        .links p {
          color: #2b1216;
          text-decoration: none;
          font-size: 12px;
        }
        .inline-links p {
          display: inline;
          margin-right: 10px;
        }
        .links a {
          color: #007BFF;
          text-decoration: none;
          font-size: 12px;
        }

        .links a:hover {
          text-decoration: underline;
        }

        hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 20px 0;
        }

        .loading-spinner {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #007BFF;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-top: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
        }
        .note {
          font-size: 12px;
          color: #666;
          background-color: #f9f9f9;
          border: 1px solid #e1e1e1;
          padding: 8px;
          border-radius: 8px;
          margin-top: 5px;
          text-align: center;
          display: block; 
        }

        /* 将按钮放在一行 */
        .button-group {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        /* 模态窗口样式 */
        .modal {
          display: none; 
          position: fixed; 
          z-index: 1; 
          padding-top: 100px; 
          left: 0;
          top: 0;
          width: 100%; 
          height: 100%; 
          overflow: auto; 
          background-color: rgb(0,0,0); 
          background-color: rgba(0,0,0,0.4); 
        }

        .modal-content {
          background-color: #fefefe;
          margin: auto;
          padding: 20px;
          border: 1px solid #888;
          width: 80%;
          max-width: 400px;
          border-radius: 10px;
          text-align: center;
        }

        .close {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
        }

        .close:hover,
        .close:focus {
          color: black;
          text-decoration: none;
          cursor: pointer;
        }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>免费AI Image Generator</h2>
      <input class="textinput" type="text" id="prompt" value="明月松间照，清泉石上流。" />
      <p class="note" id="note">建议使用提示词优化功能，中英文都可！</p>
      <div class="button-group">
        <button type="button" id="submit-button" class="btn-wrapper">🎨 AI生成</button>
        <button type="button" id="optimize-prompt-button" class="btn-wrapper">💡 提示词优化</button>
        <button type="button" id="clear-button" class="btn-wrapper">✊ 清除</button>
      </div>
      <hr>
      <div class="aiimage" id="image-container"></div>
      <div id="loading" style="display: none;">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在生成，通常需要10s...</div>
      </div>
      <hr>
      <div class="links">
        <p>develop by <a href="https://51xmi.com/">51xmi</a></p>
        <div class="inline-links">
          <p>导航页● <a href="https://nav.buxiantang.top/">一键网上冲浪</a></p>
          <p>卜仙堂● <a href="https://buxiantang.top/">佛道仙易修行</a></p>
        </div>
      </div>
    </div>

    <!-- 模态窗口 HTML -->
    <div id="myModal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <p id="modal-text">提示词已优化！</p>
      </div>
    </div>

    <script>
      const promptInput = document.getElementById("prompt");
      const submitButton = document.getElementById("submit-button");
      const imageContainer = document.getElementById("image-container");
      const loading = document.getElementById("loading");
      const note = document.getElementById("note");
      const optimizePromptButton = document.getElementById("optimize-prompt-button");
      const clearButton = document.getElementById("clear-button");

      // 获取模态窗口元素
      const modal = document.getElementById("myModal");
      const closeModal = document.getElementsByClassName("close")[0];

      // 当用户点击 <span> (x), 关闭模态窗口
      closeModal.onclick = function() {
        modal.style.display = "none";
      }

      // 当用户点击窗口外区域时关闭模态窗口
      window.onclick = function(event) {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      }

      optimizePromptButton.addEventListener("click", async () => {
        const prompt = promptInput.value;
        if (!prompt.trim()) {
          alert("请输入提示词");
          return;
        }
        loading.style.display = 'block';
        const optimizedPrompt = await optimizePromptAI(prompt);
        showOptimizationResult(optimizedPrompt);
        loading.style.display = 'none';
      });

      submitButton.addEventListener("click", async () => {
        const prompt = promptInput.value;
        if (!prompt.trim()) {
          alert("请输入提示词");
          return;
        }
        note.style.display = 'block';
        const requestBody = { content: prompt };

        imageContainer.innerHTML = '';
        loading.style.display = 'block';

        try {
          const response = await fetchWithTimeout("/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);

            const image = document.createElement("img");
            image.src = imageUrl;
            image.onload = () => { note.style.display = 'none'; };
            imageContainer.appendChild(image);
          } else {
            throw new Error("Error generating image");
          }
        } catch (error) {
          alert(error.message);
        } finally {
          loading.style.display = 'none';
        }
      });

      clearButton.addEventListener("click", () => {
        promptInput.value = "";
        imageContainer.innerHTML = "";
        note.style.display = 'block';
      });

      async function optimizePromptAI(content) {
        const promptTemplate = "您是一位专业的提示词工程师,负责优化用户输入的绘画提示词。您的任务是根据输入的绘画提示词创建一个详细的Stable Diffusion绘图提示词,包括具体的绘画风格、主题、色彩要求、画质、其他细节,并按照以下格式的英文语言输出:Prompt: [风格][主题][色彩][其他细节]...。Negative Prompt: [残缺的][畸形的]...举个例子：我输入的绘画提示词为：“一个长发蓝色眼睛的女孩”，你创建的Stable Diffusion绘图提示词为：“Prompt: Long-haired girl with blue eyes, beautiful detailed eyes and lips, flowing blonde hair, serene expression, standing in a field of wildflowers. (best quality,4k,8k,highres,masterpiece:1.2), ultra-detailed, (realistic,photorealistic,photo-realistic:1.37), HDR, UHD, studio lighting, physically-based rendering, extreme detail description, professional, vivid colors, bokeh, portraits, impressionist painting style, warm color temperature, soft natural light.Negative Prompt: nsfw, (low quality,normal quality,worst quality,jpeg artifacts), cropped, monochrome, lowres, low saturation, watermark, white letters, skin spots, acnes, skin blemishes, age spot, mutated hands, mutated fingers, deformed, bad anatomy, disfigured, poorly drawn face, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, out of focus, long neck, long body, extra fingers, fewer fingers, multi nipples, bad hands, signature, username, bad feet, blurry, bad body.”请你直接输出创建的Stable Diffusion绘图提示词，不要包含其他内容。我的绘画提示词为：";
        const prompt = \`\${promptTemplate}"\${content}"\`;

        try {
          const response = await fetchWithTimeout("/optimize-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: prompt }),
          });

          if (response.ok) {
            const result = await response.json();
            return result.optimizedPrompt;
          } else {
            throw new Error("Error optimizing prompt");
          }
        } catch (error) {
          console.error("Optimization error:", error);
          alert("提示词优化失败: " + error.message);
          return null;
        }
      }

      function showOptimizationResult(optimizedPrompt) {
        if (optimizedPrompt) {
          // 提取response字段
          const response = JSON.parse(optimizedPrompt).response;
          // 在输入框中显示response字段的内容
          promptInput.value = response;
          // 显示自定义模态窗口
          document.getElementById("modal-text").innerText = "提示词已优化！";
          modal.style.display = "block";
        } else {
          // 无法优化提示词，弹窗提示
          document.getElementById("modal-text").innerText = "无法优化提示词，请重试。";
          modal.style.display = "block";
        }
      }
      
      function fetchWithTimeout(url, options, timeout = 30000) {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('请求超时')), timeout)
          )
        ]);
      }
    </script>
  </body>
</html>
`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "POST") {
      try {
        const { content } = await request.json();
        if (!content || typeof content !== 'string') {
          throw new Error("Invalid input");
        }

        if (new URL(request.url).pathname === "/optimize-prompt") {
          const response = await env.AI.run(
            "@hf/meta-llama/meta-llama-3-8b-instruct",
            { prompt: content }
          );
          const optimizedPrompt = typeof response === 'string' ? response : JSON.stringify(response);
          return new Response(JSON.stringify({ optimizedPrompt }), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        } else {
          const response = await env.AI.run(
            "@cf/bytedance/stable-diffusion-xl-lightning",
            { prompt: content }
          );
          return new Response(response, {
            headers: {
              "content-type": "image/png",
              ...corsHeaders,
            },
          });
        }
      } catch (error) {
        console.error("Error in fetch function:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    return new Response(htmlContent, {
      headers: { "Content-Type": "text/html" },
    });
  },
};
```

5. 添加自定义域，你的自定义域就是访问地址

### 后续功能

* [ ] 已生成图片展示
* [ ] 可选上传图床，分享图片
* [ ] ...


### 许可证
本项目遵循[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)


