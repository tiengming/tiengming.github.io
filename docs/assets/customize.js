(function() {
    let isInitialized = false;
    let debounceTimer;

    function log(message) {
        console.log(`[Blog Enhancer] ${message}`);
    }

    function debounce(func, delay) {
        return function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
        }
    }

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

    function isDarkMode() {
        return document.body.classList.contains('dark-theme');
    }

    function addStyles() {
        if (document.getElementById('blog-enhancer-styles')) {
            log('Styles already added');
            return;
        }

        const style = document.createElement('style');
        style.id = 'blog-enhancer-styles';
        style.textContent = `
            .SideNav-item {
                display: flex;
                flex-direction: column;
                margin-bottom: 15px;
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
            .SideNav-item .labelContainer {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 5px;
            }
            .SideNav-item .labelLeft {
                text-align: left;
            }
            .SideNav-item .labelRight {
                text-align: right;
            }
            .post-content img, .cnblogs_post_body img {
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                max-width: 100%;
                height: auto;
            }
            .dark-theme .post-content img, .dark-theme .cnblogs_post_body img {
                box-shadow: 0 4px 8px rgba(255,255,255,0.1);
            }
            .dark-theme {
                background-color: #1a1a1a;
                color: #e0e0e0;
            }
            .dark-theme a {
                color: #58a6ff;
            }
            .dark-theme .SideNav-item {
                background-color: #2a2a2a;
            }
            .dark-theme .labelContainer {
                background-color: #2a2a2a;
            }
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
                
                if (labelLeft && labelRight && labelContainer.children.length !== 2) {
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

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    log('Theme change detected');
                    addStyles();
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

    const debouncedUpdate = debounce(() => {
        log('Content change detected');
        adjustLabels();
        styleImages();
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
    }, 300);

    const bodyObserver = new MutationObserver((mutations) => {
        if (mutations.some(mutation => mutation.type === 'childList')) {
            debouncedUpdate();
        }
    });

    bodyObserver.observe(document.body, { childList: true, subtree: true });
})();
