(function () {
  if (window.__TiengmingUIInjected) return;
  window.__TiengmingUIInjected = true;

  const style = document.createElement("style");
  style.innerHTML = `
    :root {
      --main-font: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif;
      --main-color: #1d1d1f;
      --accent-color: #007aff;
      --bg-light: #fafafa;
    }

    body {
      font-family: var(--main-font);
      color: var(--main-color);
      background-color: var(--bg-light);
      line-height: 1.6;
      margin: auto;
      max-width: 900px;
      padding: 2em 1.5em;
      transition: all 0.3s ease;
    }

    h1,h2,h3,h4 {
      font-weight: 600;
      color: #000;
    }

    a {
      color: var(--accent-color);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    a:hover {
      color: #0040dd;
      text-decoration: underline;
    }

    button, .btn, a.btn {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    button:hover, .btn:hover, a.btn:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    input:invalid {
      border-color: red;
    }

    input:invalid::after {
      content: " ⚠";
      color: red;
      margin-left: 4px;
    }

    ::selection {
      background: #cce4ff;
    }

    /* 平滑滚动 */
    html {
      scroll-behavior: smooth;
    }

    /* 加载动画 */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    [data-fade] {
      animation: fadeIn 0.6s ease-in-out forwards;
    }

    .avatar:hover {
      transition: all 0.6s ease;
      transform: scale(1.1) rotate(8deg);
    }
  `;
  document.head.appendChild(style);

  // 页面加载动画注入
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("h1, h2, .SideNav-item, .listTitle, a").forEach(el => {
      el.setAttribute("data-fade", "");
    });
  });
})();
