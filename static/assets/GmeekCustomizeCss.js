(function () {
  if (window.__TiengmingEnhanced) return;
  window.__TiengmingEnhanced = true;

  const style = document.createElement("style");
  style.textContent = `
    :root {
      --accent-color: #007aff;
      --font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", "PingFang SC", sans-serif;
      --bg-color: #f9f9fa;
      --text-color: #1d1d1f;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: var(--font-family);
      background: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
      transition: all 0.3s ease;
    }

    a {
      color: var(--accent-color);
      text-decoration: none;
      transition: all 0.3s ease;
    }

    a:hover {
      color: #0055cc;
      text-decoration: underline;
    }

    .SideNav-item {
      transition: background 0.3s ease, transform 0.2s ease;
      border-radius: 8px;
      padding: 6px 8px;
    }

    .SideNav-item:hover {
      background: #eaeef3;
      transform: scale(1.01);
    }

    .listTitle {
      font-weight: 600;
      font-size: 1.05em;
    }

    .Label {
      font-size: 13px !important;
      padding: 2px 6px;
      border-radius: 6px;
      margin-right: 6px;
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .LabelTime {
      color: white !important;
      background-color: #999 !important;
    }

    .avatar {
      border-radius: 50%;
      transition: transform 0.3s ease;
    }

    .avatar:hover {
      transform: scale(1.1) rotate(6deg);
    }

    .blogTitle {
      font-size: 32px !important;
      font-weight: 700;
      font-family: var(--font-family);
    }

    .btn, button {
      transition: all 0.2s ease;
    }

    .btn:hover {
      transform: scale(1.05);
      background-color: #eef3f9;
    }

    /* 页面载入淡入 */
    [data-fade] {
      opacity: 0;
      transform: translateY(10px);
      animation: fadeIn 0.6s ease-in-out forwards;
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 表单字段验证美化 */
    input:invalid {
      border: 1px solid red;
    }

    input:invalid::placeholder {
      color: red;
    }

    input:focus {
      outline: 2px solid var(--accent-color);
    }
  `;
  document.head.appendChild(style);

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".SideNav-item, .listTitle, .Label, h1, h2, h3").forEach(el => {
      el.setAttribute("data-fade", "");
    });
  });
})();
