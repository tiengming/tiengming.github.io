(function () {
  if (window.__TiengmingModernApplied) return;
  window.__TiengmingModernApplied = true;

  const style = document.createElement("style");
  style.textContent = `
    :root {
      --apple-font: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif;
      --apple-bg: #fefefe;
      --apple-text: #1c1c1e;
      --apple-accent: #007aff;
    }

    body {
      font-family: var(--apple-font);
      background: var(--apple-bg);
      color: var(--apple-text);
      margin: 0 auto;
      max-width: 960px;
      padding: 24px;
      line-height: 1.6;
      scroll-behavior: smooth;
    }

    .SideNav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      padding: 0;
    }

    .SideNav-item {
      background: #fff;
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 140px;
      position: relative;
    }

    .SideNav-item:hover {
      transform: translateY(-4px) scale(1.015);
      box-shadow: 0 8px 28px rgba(0,0,0,0.08);
    }

    .listTitle {
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 12px;
    }

    .listLabels {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .Label {
      background-color: #e0e0e0 !important;
      color: #333 !important;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 12px !important;
      font-weight: 500;
      text-transform: lowercase;
    }

    .LabelTime {
      background-color: #bbb !important;
      color: #fff !important;
    }

    a {
      color: var(--apple-accent);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .avatar {
      transition: transform 0.3s ease;
    }

    .avatar:hover {
      transform: scale(1.1) rotate(6deg);
    }

    .card-fade {
      animation: fadeInUp 0.6s ease forwards;
      opacity: 0;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 600px) {
      body {
        padding: 12px;
      }
      .SideNav {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);

  const fadeCards = () => {
    document.querySelectorAll(".SideNav-item").forEach((el, i) => {
      el.classList.add("card-fade");
      el.style.animationDelay = `${i * 60}ms`;
    });
  };

  document.readyState === "loading"
    ? window.addEventListener("DOMContentLoaded", fadeCards)
    : fadeCards();
})();
