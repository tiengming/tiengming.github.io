(function() {
    let isInitialized = false;
    let isProcessing = false;

    // 添加日志函数
    function log(message) {
        console.log(`[Blog Enhancer] ${message}`);
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // 动态加载 highlight.js
    function loadHighlightJS() {
        if (document.querySelector('link[href*="highlight.js"]') && document.querySelector('script[src*="highlight.js"]')) {
            log('Highlight.js already loaded');
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/github.min.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/highlight.min.js';
            script.onload = () => {
                log('Highlight.js loaded');
                if (typeof hljs !== 'undefined') {
                    hljs.highlightAll();
                }
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    // 检测暗黑模式
    function isDarkMode() {
        return document.body.classList.contains('dark-theme');
    }

    // 添加样式
    function addStyles() {
        if (document.getElementById('blog-enhancer-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'blog-enhancer-styles';
        style.textContent = `
            /* 在这里添加您的样式 */
            .SideNav-item {
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
            .styled-image {
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                max-width: 100%;
                height: auto;
            }
            .fade-in {
                animation: fadeIn 0.5s;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            /* 添加更多样式... */
        `;
        document.head.appendChild(style);
        log('Styles added');
    }

    function adjustLabels() {
        const sideNavItems = document.querySelectorAll('.SideNav-item:not(.adjusted)');
        sideNavItems.forEach(item => {
            const flexContainer = item.querySelector('.d-flex.flex-items-center');
            const listLabels = item.querySelector('.listLabels');
            
            if (flexContainer && listLabels && !flexContainer.contains(listLabels)) {
                flexContainer.appendChild(listLabels);
            }

            item.classList.add('adjusted');
        });
        log('Labels adjusted');
    }

    function adjustHeader() {
        const header = document.getElementById('header');
        if (!header || header.querySelector('.avatar')) {
            return;
        }

        const headerContent = header.querySelector('.header-content') || header;
        const postTitle = headerContent.querySelector('.blogTitle, .postTitle');
        
        if (postTitle && postTitle.classList.contains('blogTitle')) {
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
            log('Header adjusted');
        }
    }

    function styleImages() {
        const postContent = document.querySelector('.post-content, .cnblogs_post_body');
        if (postContent) {
            const images = postContent.querySelectorAll('img:not(.styled-image)');
            images.forEach(img => {
                img.classList.add('styled-image', 'fade-in');
            });
            log(`${images.length} images styled`);
        }
    }

    const debouncedUpdate = debounce(() => {
        if (isProcessing) return;
        isProcessing = true;

        adjustLabels();
        styleImages();
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }

        isProcessing = false;
    }, 200);

    function init() {
        if (isInitialized) {
            log('Already initialized');
            return;
        }

        log('Initializing');
        addStyles();
        adjustLabels();
        adjustHeader();
        styleImages();
        loadHighlightJS().then(() => {
            log('Initial setup complete');
        });

        // 监听主题变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    log('Theme change detected');
                    addStyles(); // 重新应用样式以更新颜色
                }
            });
        });

        observer.observe(document.body, { attributes: true });

        isInitialized = true;
        log('Initialization complete');
    }

    // 使用 DOMContentLoaded 事件确保 DOM 完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 为动态加载的内容添加 MutationObserver
    const bodyObserver = new MutationObserver(debouncedUpdate);

    bodyObserver.observe(document.body, { childList: true, subtree: true });
})();
