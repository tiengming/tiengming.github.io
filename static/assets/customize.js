let isInitialized = false;

function log(message) {
    console.log(`[Customize] ${message}`);
}

function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .SideNav-item {
            padding: 4px 8px !important;
            margin-bottom: 4px !important;
        }
        .Label {
            padding: 0 7px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            line-height: 18px !important;
            border: 1px solid transparent !important;
            border-radius: 2em !important;
        }
        .LabelName {
            font-weight: 600;
        }
        .LabelTime {
            opacity: 0.75;
        }
        .listTitle {
            font-weight: 600 !important;
        }
        #header {
            padding: 16px !important;
        }
        .header-content {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
        }
        .blogTitle {
            margin-left: 10px !important;
        }
        img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 6px !important;
        }
    `;
    document.head.appendChild(style);
}

function enforceStyles() {
    const labels = document.querySelectorAll('.Label');
    labels.forEach(label => {
        label.style.backgroundColor = 'var(--color-neutral-muted)';
        label.style.color = 'var(--color-fg-default)';
    });
}

function adjustArticleList() {
    const sideNavItems = document.querySelectorAll('.SideNav-item:not(.adjusted)');
    sideNavItems.forEach(item => {
        const flexContainer = item.querySelector('.d-flex.flex-items-center');
        if (!flexContainer) return;

        // 保留原有结构，只调整样式
        const listTitle = flexContainer.querySelector('.listTitle');
        const label = flexContainer.querySelector('.Label');

        if (listTitle) {
            listTitle.style.flexGrow = '1';
            listTitle.style.textAlign = 'left';
        }

        if (label) {
            label.style.marginLeft = 'auto';
            label.style.display = 'flex';
            label.style.alignItems = 'center';

            const labelName = label.querySelector('.LabelName');
            const labelTime = label.querySelector('.LabelTime');

            if (labelName) labelName.style.marginRight = '10px';
            if (labelTime) labelTime.style.whiteSpace = 'nowrap';
        }

        item.classList.add('adjusted');
    });
    log('Article list adjusted');
}

function adjustHeader() {
    const header = document.getElementById('header');
    if (!header || header.querySelector('#avatarImg')) {
        return;
    }

    const headerContent = header.querySelector('.header-content') || header;
    
    // 创建一个新的容器来放置头像和博客标题
    const avatarTitleContainer = document.createElement('div');
    avatarTitleContainer.style.display = 'flex';
    avatarTitleContainer.style.alignItems = 'center';
    avatarTitleContainer.style.marginRight = '20px';

    const avatar = document.createElement('img');
    avatar.src = 'https://code.buxiantang.top/favicon.svg';
    avatar.id = 'avatarImg';
    avatar.alt = 'avatar';
    avatar.style.width = '40px';
    avatar.style.height = '40px';
    avatar.style.borderRadius = '50%';
    avatar.style.marginRight = '10px';

    const blogTitle = document.createElement('a');
    blogTitle.href = '/';
    blogTitle.className = 'blogTitle';
    blogTitle.textContent = 'Tiengming';
    blogTitle.style.fontSize = '1.5em';
    blogTitle.style.fontWeight = 'bold';
    blogTitle.style.textDecoration = 'none';
    blogTitle.style.color = 'inherit';

    avatarTitleContainer.appendChild(avatar);
    avatarTitleContainer.appendChild(blogTitle);

    // 将新容器插入到 headerContent 的开头
    headerContent.insertBefore(avatarTitleContainer, headerContent.firstChild);

    log('Header adjusted');
}

function styleImages() {
    const images = document.querySelectorAll('img:not([style])');
    images.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '6px';
    });
}

function loadHighlightJS() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js';
        script.onload = () => {
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/default.min.css';
            document.head.appendChild(style);
            hljs.highlightAll();
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function init() {
    if (isInitialized) {
        log('Already initialized');
        return;
    }

    log('Initializing');
    addStyles();
    enforceStyles();
    adjustArticleList();
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

// 在 DOMContentLoaded 事件触发时初始化
document.addEventListener('DOMContentLoaded', init);

// 如果 DOMContentLoaded 已经触发，立即初始化
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    init();
}
