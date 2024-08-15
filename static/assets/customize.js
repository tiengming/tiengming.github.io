(function() {
    let isInitialized = false;

    // 添加日志函数
    function log(message) {
        console.log(`[Blog Enhancer] ${message}`);
    }

    // 动态加载 highlight.js
    function loadHighlightJS() {
        if (document.querySelector('link[href*="highlight.js"]')) {
            log('Highlight.js CSS already loaded');
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/github.min.css';
        document.head.appendChild(link);

        if (document.querySelector('script[src*="highlight.js"]')) {
            log('Highlight.js script already loaded');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/highlight.min.js';
        script.onload = function() {
            log('Highlight.js loaded');
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
        if (document.getElementById('blog-enhancer-styles')) {
            log('Styles already added');
            return;
        }

        const style = document.createElement('style');
        style.id = 'blog-enhancer-styles';
        style.textContent = `
            /* 样式内容保持不变 */
        `;
        document.head.appendChild(style);
        log('Styles added');
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
        log('Labels adjusted');
    }

    function adjustHeader() {
        const header = document.getElementById('header');
        if (!header) {
            log('Header not found');
            return;
        }

        const headerContent = header.querySelector('.header-content');
        if (!headerContent) {
            log('Header content not found');
            return;
        }

        const postTitle = headerContent.querySelector('.blogTitle, .postTitle');
        
        if (postTitle && postTitle.classList.contains('blogTitle') && !headerContent.querySelector('.avatar')) {
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
        loadHighlightJS();

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
    const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                log('Content change detected');
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
