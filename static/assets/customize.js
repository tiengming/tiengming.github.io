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
            body .SideNav-item {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
            }
            body .SideNav-item .listLabels {
                text-align: right !important;
                margin-left: auto !important;
            }
            body .labelContainer {
                width: 100% !important;
                display: flex !important;
                justify-content: space-between !important;
            }
            body .labelContainer .labelLeft {
                text-align: left !important;
            }
            body .labelContainer .labelRight {
                text-align: right !important;
            }
            body .post-content img, body .cnblogs_post_body img {
                border-radius: 8px !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
                max-width: 100% !important;
                height: auto !important;
            }
            .fade-in {
                animation: fadeIn 0.5s;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            body.dark-theme {
                background-color: #1a1a1a !important;
                color: #e0e0e0 !important;
            }
            body.dark-theme a {
                color: #58a6ff !important;
            }
            body.dark-theme .post-content img, body.dark-theme .cnblogs_post_body img {
                box-shadow: 0 4px 8px rgba(255,255,255,0.1) !important;
            }
        `;
        document.head.appendChild(style);
        log('Styles added');
    }

    function enforceStyles() {
        const sideNavItems = document.querySelectorAll('.SideNav-item');
        sideNavItems.forEach(item => {
            item.style.setProperty('display', 'flex', 'important');
            item.style.setProperty('justify-content', 'space-between', 'important');
            item.style.setProperty('align-items', 'center', 'important');

            const listLabels = item.querySelector('.listLabels');
            if (listLabels) {
                listLabels.style.setProperty('text-align', 'right', 'important');
                listLabels.style.setProperty('margin-left', 'auto', 'important');
            }
        });

        const labelContainers = document.querySelectorAll('.labelContainer');
        labelContainers.forEach(container => {
            container.style.setProperty('width', '100%', 'important');
            container.style.setProperty('display', 'flex', 'important');
            container.style.setProperty('justify-content', 'space-between', 'important');

            const labelLeft = container.querySelector('.labelLeft');
            if (labelLeft) {
                labelLeft.style.setProperty('text-align', 'left', 'important');
            }

            const labelRight = container.querySelector('.labelRight');
            if (labelRight) {
                labelRight.style.setProperty('text-align', 'right', 'important');
            }
        });

        const images = document.querySelectorAll('.post-content img, .cnblogs_post_body img');
        images.forEach(img => {
            img.style.setProperty('border-radius', '8px', 'important');
            img.style.setProperty('box-shadow', '0 4px 8px rgba(0,0,0,0.1)', 'important');
            img.style.setProperty('max-width', '100%', 'important');
            img.style.setProperty('height', 'auto', 'important');
        });

        log('Styles enforced');
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
        enforceStyles();
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
        enforceStyles();
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
                    enforceStyles();
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
