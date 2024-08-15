(function() {
    function isDarkMode() {
        return document.documentElement.getAttribute('data-color-mode') === 'dark';
    }

    function getWebsiteIcon() {
        const linkTag = document.querySelector('link[rel="shortcut icon"]');
        return linkTag ? linkTag.href : '/favicon.ico';
    }

    function getWebsiteName() {
        const footerLink = document.querySelector('#footer1 a');
        return footerLink ? footerLink.textContent : document.title;
    }

    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --bg-color: ${isDarkMode() ? '#0d1117' : '#ffffff'};
                --text-color: ${isDarkMode() ? '#c9d1d9' : '#24292f'};
                --hover-bg-color: ${isDarkMode() ? '#21262d' : '#f6f8fa'};
                --shadow-color: ${isDarkMode() ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
                --link-color: ${isDarkMode() ? '#58a6ff' : '#0969da'};
                --border-color: ${isDarkMode() ? '#30363d' : '#d0d7de'};
                --title-color: ${isDarkMode() ? '#c9d1d9' : '#24292f'};
                --hover-text-color: ${isDarkMode() ? '#ffffff' : '#0969da'};
                --article-bg-color: ${isDarkMode() ? '#161b22' : '#ffffff'};
            }

            body {
                background-color: var(--bg-color);
                color: var(--text-color);
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            .SideNav.border {
                border: 1px solid var(--border-color) !important;
                border-radius: 6px !important;
                overflow: hidden;
            }

            .article-container {
                background-color: var(--article-bg-color);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                margin-bottom: 16px;
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .article-container:hover {
                box-shadow: 0 2px 8px var(--shadow-color);
                transform: translateY(-1px);
            }

            .SideNav-item {
                border: none !important;
                margin-bottom: 0 !important;
                transition: all 0.3s ease;
                padding: 8px 16px;
                background-color: transparent;
            }

            .SideNav-item:hover {
                background-color: var(--hover-bg-color);
            }

            .SideNav-item .btn-invisible {
                padding: 0;
            }

            .listTitle {
                font-size: 16px;
                line-height: 2;
                font-weight: 600;
                transition: all 0.3s ease;
                display: inline-block;
                color: var(--title-color);
            }

            .listTitle:hover {
                color: var(--hover-text-color);
                text-decoration: none;
            }

            .labelContainer {
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                padding: 2px 16px;
                background-color: var(--article-bg-color);
            }

            .labelLeft, .labelRight {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
            }

            .labelLeft .Label, .labelRight .Label {
                margin-right: 8px;
                margin-bottom: 4px;
                padding: 2px 6px;
                border-radius: 2em;
                font-size: 12px;
                font-weight: 500;
                background-color: ${isDarkMode() ? '#30363d' : '#f1f8ff'};
                color: ${isDarkMode() ? '#8b949e' : '#ffffff'};
            }

            .brand-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
            }

            .website-icon {
                width: 40px;
                height: 40px;
                margin-right: 12px;
                transition: transform 0.3s ease;
            }

            .website-icon:hover {
                transform: scale(1.1);
            }

            .site-name {
                font-size: 28px;
                font-weight: 700;
                color: var(--title-color);
                margin: 0;
                transition: color 0.3s ease;
            }

            .site-name:hover {
                color: var(--hover-text-color);
            }

            .blogTitle, .postTitle {
                font-size: 32px;
                font-weight: 600;
                margin-top: 16px;
                transition: all 0.3s ease;
                text-align: center;
                color: var(--title-color);
            }

            .blogTitle:hover {
                color: var(--hover-text-color);
            }

            #postBody {
                color: var(--text-color);
            }

            #postBody h1, #postBody h2, #postBody h3, #postBody h4, #postBody h5, #postBody h6 {
                color: var(--title-color);
            }

            #postBody a {
                color: var(--link-color);
            }

            #postBody pre {
                background-color: var(--hover-bg-color);
                border: 1px solid var(--border-color);
                border-radius: 6px;
            }

            #postBody code {
                background-color: var(--hover-bg-color);
                color: var(--text-color);
            }

            #postBody blockquote {
                border-left: 4px solid var(--border-color);
                color: var(--text-color);
                opacity: 0.8;
            }

            .post-content img,
            .cnblogs_post_body img,
            #postBody img {
                display: block;
                margin: 20px auto;
                max-width: 100%;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                box-shadow: 0 4px 10px var(--shadow-color);
                transition: all 0.3s ease;
            }

            .post-content img:hover,
            .cnblogs_post_body img:hover,
            #postBody img:hover {
                transform: scale(1.02);
                box-shadow: 0 6px 15px var(--shadow-color);
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .fade-in {
                animation: fadeIn 0.5s ease-out;
            }

            @media (max-width: 768px) {
                .blogTitle, .labelRight, .site-name {
                    font-size: 24px;
                }

                .listTitle {
                    font-size: 14px;
                    line-height: 1.4;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function adjustLabels() {
        const sideNavItems = document.querySelectorAll('.SideNav-item');
        sideNavItems.forEach(item => {
            const labels = item.querySelectorAll('.Label.LabelName');
            const time = item.querySelector('.Label.LabelTime');
            
            const articleContainer = document.createElement('div');
            articleContainer.className = 'article-container';
            
            const labelContainer = document.createElement('div');
            labelContainer.className = 'labelContainer fade-in';
            
            const labelLeft = document.createElement('div');
            labelLeft.className = 'labelLeft';
            const labelRight = document.createElement('div');
            labelRight.className = 'labelRight';
            
            labels.forEach(label => labelLeft.appendChild(label.cloneNode(true)));
            if (time) labelRight.appendChild(time.cloneNode(true));
            
            labelContainer.appendChild(labelLeft);
            labelContainer.appendChild(labelRight);
            
            item.parentNode.insertBefore(articleContainer, item);
            articleContainer.appendChild(item);
            articleContainer.appendChild(labelContainer);
            
            labels.forEach(label => label.remove());
            if (time) time.remove();

            item.style.padding = '0';
        });
    }

    function addBrandToPostTitle() {
        const postTitle = document.querySelector('.postTitle');
        if (!postTitle) return;

        const brandWrapper = document.createElement('div');
        brandWrapper.className = 'brand-wrapper fade-in';

        const favicon = document.createElement('img');
        favicon.src = getWebsiteIcon();
        favicon.alt = 'Website Icon';
        favicon.className = 'website-icon';

        const siteName = document.createElement('h1');
        siteName.textContent = getWebsiteName();
        siteName.className = 'site-name';

        brandWrapper.appendChild(favicon);
        brandWrapper.appendChild(siteName);

        postTitle.insertAdjacentElement('beforebegin', brandWrapper);
    }

    function styleImages() {
        const images = document.querySelectorAll('.post-content img, .cnblogs_post_body img, #postBody img');
        images.forEach(img => {
            img.style.display = 'block';
            img.style.margin = '20px auto';
            img.style.maxWidth = '100%';
            img.style.border = '1px solid var(--border-color)';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 4px 10px var(--shadow-color)';
            img.style.transition = 'all 0.3s ease';
            
            img.addEventListener('mouseover', () => {
                img.style.transform = 'scale(1.02)';
                img.style.boxShadow = '0 6px 15px var(--shadow-color)';
            });
            img.addEventListener('mouseout', () => {
                img.style.transform = 'scale(1)';
                img.style.boxShadow = '0 4px 10px var(--shadow-color)';
            });
        });
    }

    function init() {
        addStyles();
        adjustLabels();
        addBrandToPostTitle();
        styleImages();

        const blogTitle = document.querySelector('.blogTitle');
        if (blogTitle) {
            blogTitle.classList.add('fade-in');
        }

        const postTitle = document.querySelector('.postTitle');
        if (postTitle) {
            postTitle.classList.add('fade-in');
        }

        const listTitles = document.querySelectorAll('.listTitle');
        listTitles.forEach(title => {
            title.classList.add('fade-in');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-color-mode') {
                addStyles();
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-color-mode']
    });
})();
