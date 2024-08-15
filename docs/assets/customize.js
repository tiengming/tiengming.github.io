(function() {
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 样式调整函数
    function adjustStyles() {
        console.log('Adjusting styles...');

        // 布局调整
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .d-flex.flex-items-center {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .listLabels {
                text-align: right;
            }
            .labelContainer {
                width: 100%;
                display: flex;
                justify-content: space-between;
            }
            .labelLeft {
                text-align: left;
            }
            .labelRight {
                text-align: right;
            }
            #content img {
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                max-width: 100%;
                height: auto;
            }
            @media (prefers-color-scheme: dark) {
                body {
                    background-color: #1a1a1a;
                    color: #e0e0e0;
                }
                a {
                    color: #58a6ff;
                }
                #content img {
                    box-shadow: 0 4px 8px rgba(255,255,255,0.1);
                }
            }
        `;
        document.head.appendChild(styleElement);

        // 添加头像和博客标题（仅在首页）
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            const header = document.getElementById('header');
            if (header && !document.querySelector('.blog-header')) {
                const blogHeader = document.createElement('div');
                blogHeader.className = 'blog-header';
                blogHeader.innerHTML = `
                    <img src="https://code.buxiantang.top/favicon.svg" alt="Blog Avatar" style="width: 100px; height: 100px; border-radius: 50%;">
                    <h1>Tiengming</h1>
                `;
                header.insertBefore(blogHeader, header.firstChild);
            }
        }
    }

    // 代码高亮函数
    function applyCodeHighlight() {
        console.log('Applying code highlight...');
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }

    // 加载 Highlight.js
    function loadHighlightJs() {
        console.log('Loading Highlight.js...');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/default.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/highlight.min.js';
        script.onload = applyCodeHighlight;
        document.head.appendChild(script);
    }

    // 主函数
    function init() {
        console.log('Initializing plugin...');
        adjustStyles();
        loadHighlightJs();

        // 监听主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(adjustStyles);

        // 使用 MutationObserver 监听页面变化
        const observer = new MutationObserver(debounce(() => {
            console.log('Content changed, reapplying styles...');
            adjustStyles();
            applyCodeHighlight();
        }, 200));

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 确保 DOM 加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
