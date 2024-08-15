(function() {
    // 动态加载 highlight.js
    function loadHighlightJS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/github.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/highlight.min.js';
        script.onload = function() {
            if (typeof hljs !== 'undefined') {
                hljs.highlightAll();
            }
        };
        document.head.appendChild(script);
    }

    // 检测暗黑模式
    function isDarkMode() {
        return document.body.classList.contains('dark-theme');
    }

    // 添加样式
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --bg-color: ${isDarkMode() ? '#0d1117' : '#ffffff'};
                --text-color: ${isDarkMode() ? '#c9d1d9' : '#24292f'};
                --hover-bg-color: ${isDarkMode() ? '#21262d' : '#f6f8fa'};
                --shadow-color: ${isDarkMode() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
                --link-color: ${isDarkMode() ? '#58a6ff' : '#0969da'};
            }

            body {
                background-color: var(--bg-color);
                color: var(--text-color);
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            .SideNav-item {
                transition: all 0.3s ease;
                border-radius: 8px;
                box-shadow: 0 2px 4px var(--shadow-color);
                margin-bottom: 10px;
                padding: 15px;
                background-color: var(--bg-color);
                display: flex;
                flex-direction: column;
            }

            .SideNav-item:hover {
                background-color: var(--hover-bg-color);
                box-shadow: 0 4px 8px var(--shadow-color);
                transform: translateY(-2px);
            }

            .SideNav-item .d-flex.flex-items-center {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }

            .SideNav-item .listLabels {
                margin-left: auto;
            }

            .labelContainer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                margin-top: 10px;
            }

            .labelLeft {
                text-align: left;
            }

            .labelRight {
                text-align: right;
            }

            #header {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px 0;
            }

            .header-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
            }

            .avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                box-shadow: 0 4px 8px var(--shadow-color);
                transition: all 0.3s ease;
                margin-bottom: 10px;
            }

            .avatar:hover {
                transform: scale(1.1) rotate(5deg);
            }

            .blogTitle, .postTitle {
                font-size: 24px;
                font-weight: bold;
                margin-top: 10px;
                transition: all 0.3s ease;
                text-align: center;
            }

            .blogTitle:hover {
                color: var(--link-color);
                transform: scale(1.05);
            }

            .post-content img,
            .cnblogs_post_body img {
                border-radius: 8px;
                box-shadow: 0 4px 8px var(--shadow-color);
                max-width: 100%;
                height: auto;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .fade-in {
                animation: fadeIn 0.5s ease-out;
            }

            pre code.hljs {
                display: block;
                overflow-x: auto;
                padding: 1em;
            }

            code.hljs {
                padding: 3px 5px;
            }
        `;
        document.head.appendChild(style);
    }

    function adjustLabels() {
        const sideNavItems = document.querySelectorAll('.SideNav-item');
        sideNavItems.forEach(item => {
            const flexContainer = item.querySelector('.d-flex.flex-items-center');
            const listLabels = item.querySelector('.listLabels');
            const labelContainer = item.querySelector('.labelContainer');
            
            if (flexContainer && listLabels && !flexContainer.contains(listLabels)) {
                flexContainer.appendChild(listLabels);
            }

            if (labelContainer) {
                const labelLeft = labelContainer.querySelector('.labelLeft');
                const labelRight = labelContainer.querySelector('.labelRight');
                
                if (labelLeft && labelRight) {
                    labelContainer.innerHTML = '';
                    labelContainer.appendChild(labelLeft);
                    labelContainer.appendChild(labelRight);
                }
            }
        });
    }

    function adjustHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        const headerContent = header.querySelector('.header-content');
        if (!headerContent) return;

        const postTitle = headerContent.querySelector('.blogTitle, .postTitle');
        
        // 只在文章页添加头像和网站名称
        if (postTitle && postTitle.classList.contains('blogTitle') && !headerContent.querySelector('.avatar')) {
            // 这是文章页面
            const avatar = document.createElement('img');
            avatar.src = 'https://code.buxiantang.top/favicon.svg';
            avatar.className = 'avatar fade-in';
            avatar.alt = 'avatar';

            const blogTitle = document.createElement('a');
            blogTitle.href = '/';
            blogTitle.className = 'blogTitle fade-in';
            blogTitle.textContent = 'Tiengming';

            headerContent.insertBefore(blogTitle, headerContent.firstChild);
            headerContent.insertBefore(avatar, headerContent.firstChild);
        }
    }

    function styleImages() {
        const postContent = document.querySelector('.post-content, .cnblogs_post_body');
        if (postContent) {
            const images = postContent.querySelectorAll('img');
            images.forEach(img => {
                if (!img.classList.contains('styled-image')) {
                    img.classList.add('styled-image', 'fade-in');
                }
            });
        }
    }

    function init() {
        addStyles();
        adjustLabels();
        adjustHeader();
        styleImages();
        loadHighlightJS();

        // 监听主题变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    addStyles(); // 重新应用样式以更新颜色
                }
            });
        });

        observer.observe(document.body, { attributes: true });
    }

    // 使用 DOMContentLoaded 事件确保 DOM 完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 为动态加载的内容添加 MutationObserver
    const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                adjustLabels();
                styleImages();
                if (typeof hljs !== 'undefined') {
                    hljs.highlightAll();
                }
            }
        });
    });

    bodyObserver.observe(document.body, { childList: true, subtree: true });
})();
