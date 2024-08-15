(function() {
    let isInitialized = false;
    let isProcessing = false;

    function log(message) {
        console.log(`[Blog Enhancer] ${message}`);
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

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

    function isDarkMode() {
        return document.body.classList.contains('dark-theme');
    }

    function addStyles() {
        if (document.getElementById('blog-enhancer-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'blog-enhancer-styles';
        style.textContent = `
            .SideNav.border {
                border-radius: 10px !important;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                backdrop-filter: blur(10px) !important;
                background-color: rgba(255, 255, 255, 0.7) !important;
            }
            .SideNav-item {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 10px 15px !important;
                transition: all 0.3s ease !important;
                border-radius: 8px !important;
                margin: 5px 0 !important;
            }
            .SideNav-item:hover {
                background-color: rgba(0, 0, 0, 0.05) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            }
            .SideNav-item .d-flex.flex-items-center {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                width: 100% !important;
            }
            .SideNav-item .listTitle {
                flex-grow: 1 !important;
                text-align: left !important;
            }
            .SideNav-item .Label {
                display: flex !important;
                align-items: center !important;
            }
            .SideNav-item .LabelName {
                margin-right: 10px !important;
            }
            .SideNav-item .LabelTime {
                text-align: right !important;
            }
            .post-content img, .cnblogs_post_body img {
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
            body.dark-theme .SideNav.border {
                background-color: rgba(30, 30, 30, 0.7) !important;
            }
            body.dark-theme .SideNav-item:hover {
                background-color: rgba(255, 255, 255, 0.05) !important;
            }
            body.dark-theme a {
                color: #58a6ff !important;
            }
            body.dark-theme .post-content img, body.dark-theme .cnblogs_post_body img {
                box-shadow: 0 4px 8px rgba(255,255,255,0.1) !important;
            }
            #avatarImg {
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                margin-right: 10px !important;
            }
            .blogTitle {
                font-size: 1.5em !important;
                font-weight: bold !important;
                text-decoration: none !important;
                color: inherit !important;
            }
        `;
        document.head.appendChild(style);
        log('Styles added');
    }

    function enforceStyles() {
        const sideNav = document.querySelector('.SideNav.border');
        if (sideNav) {
            sideNav.style.setProperty('border-radius', '10px', 'important');
            sideNav.style.setProperty('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)', 'important');
            sideNav.style.setProperty('backdrop-filter', 'blur(10px)', 'important');
            sideNav.style.setProperty('background-color', 'rgba(255, 255, 255, 0.7)', 'important');
        }

        const sideNavItems = document.querySelectorAll('.SideNav-item');
        sideNavItems.forEach(item => {
            item.style.setProperty('display', 'flex', 'important');
            item.style.setProperty('justify-content', 'space-between', 'important');
            item.style.setProperty('align-items', 'center', 'important');
            item.style.setProperty('padding', '10px 15px', 'important');
            item.style.setProperty('transition', 'all 0.3s ease', 'important');
            item.style.setProperty('border-radius', '8px', 'important');
            item.style.setProperty('margin', '5px 0', 'important');

            const flexContainer = item.querySelector('.d-flex.flex-items-center');
            if (flexContainer) {
                flexContainer.style.setProperty('display', 'flex', 'important');
                flexContainer.style.setProperty('justify-content', 'space-between', 'important');
                flexContainer.style.setProperty('align-items', 'center', 'important');
                flexContainer.style.setProperty('width', '100%', 'important');
            }

            const listTitle = item.querySelector('.listTitle');
            if (listTitle) {
                listTitle.style.setProperty('flex-grow', '1', 'important');
                listTitle.style.setProperty('text-align', 'left', 'important');
            }

            const label = item.querySelector('.Label');
            if (label) {
                label.style.setProperty('display', 'flex', 'important');
                label.style.setProperty('align-items', 'center', 'important');
            }

            const labelName = item.querySelector('.LabelName');
            if (labelName) {
                labelName.style.setProperty('margin-right', '10px', 'important');
            }

            const labelTime = item.querySelector('.LabelTime');
            if (labelTime) {
                labelTime.style.setProperty('text-align', 'right', 'important');
            }
        });

        const images = document.querySelectorAll('.post-content img, .cnblogs_post_body img');
        images.forEach(img => {
            img.style.setProperty('border-radius', '8px', 'important');
            img.style.setProperty('box-shadow', '0 4px 8px rgba(0,0,0,0.1)', 'important');
            img.style.setProperty('max-width', '100%', 'important');
            img.style.setProperty('height', 'auto', 'important');
        });

        const avatarImg = document.getElementById('avatarImg');
        if (avatarImg) {
            avatarImg.style.setProperty('width', '40px', 'important');
            avatarImg.style.setProperty('height', '40px', 'important');
            avatarImg.style.setProperty('border-radius', '50%', 'important');
            avatarImg.style.setProperty('margin-right', '10px', 'important');
        }

        const blogTitle = document.querySelector('a.blogTitle');
        if (blogTitle) {
            blogTitle.style.setProperty('font-size', '1.5em', 'important');
            blogTitle.style.setProperty('font-weight', 'bold', 'important');
            blogTitle.style.setProperty('text-decoration', 'none', 'important');
            blogTitle.style.setProperty('color', 'inherit', 'important');
        }

        log('Styles enforced');
    }

    function adjustLabels() {
        const sideNavItems = document.querySelectorAll('.SideNav-item:not(.adjusted)');
        sideNavItems.forEach(item => {
            const flexContainer = item.querySelector('.d-flex.flex-items-center');
            const listTitle = item.querySelector('.listTitle');
            const label = item.querySelector('.Label');
            const labelName = item.querySelector('.LabelName');
            const labelTime = item.querySelector('.LabelTime');
            
            if (flexContainer && listTitle && label) {
                // 确保 listTitle 和 label 在同一行
                flexContainer.appendChild(listTitle);
                flexContainer.appendChild(label);

                // 创建一个新的容器来包含 LabelName 和 LabelTime
                const labelContainer = document.createElement('div');
                labelContainer.style.display = 'flex';
                labelContainer.style.justifyContent = 'space-between';
                labelContainer.style.alignItems = 'center';
                labelContainer.style.width = '100%';

                if (labelName) labelContainer.appendChild(labelName);
                if (labelTime) labelContainer.appendChild(labelTime);

                label.appendChild(labelContainer);
            }

            item.classList.add('adjusted');
        });
        log('Labels adjusted');
    }

    function adjustHeader() {
        const header = document.getElementById('header');
        if (!header || header.querySelector('#avatarImg')) {
            return;
        }

        const headerContent = header.querySelector('.header-content') || header;
        const existingBlogTitle = headerContent.querySelector('a.blogTitle');
        
        if (!existingBlogTitle) {
            const avatar = document.createElement('img');
            avatar.src = 'https://code.buxiantang.top/favicon.svg';
            avatar.id = 'avatarImg';
            avatar.alt = 'avatar';

            const blogTitle = document.createElement('a');
            blogTitle.href = '/';
            blogTitle.className = 'blogTitle';
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

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    log('Theme change detected');
                    addStyles();
                    enforceStyles();
                }
            });
        });

        observer.observe(document.body, { attributes: true });

        isInitialized = true;
        log('Initialization complete');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    const bodyObserver = new MutationObserver(debouncedUpdate);
    bodyObserver.observe(document.body, { childList: true, subtree: true });
})();
