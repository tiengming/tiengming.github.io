(() => {
    // 检测暗黑模式
    const isDarkMode = () => document.body.classList.contains('dark-theme');

    // 添加样式
    const addStyles = () => {
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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }

            .SideNav {
                border-radius: 12px;
                overflow: hidden;
                backdrop-filter: blur(10px);
                background-color: rgba(255, 255, 255, 0.1);
            }

            .SideNav-item {
                transition: all 0.3s ease;
                border-radius: 8px;
                box-shadow: 0 2px 4px var(--shadow-color);
                margin-bottom: 10px;
                padding: 15px;
                background-color: var(--bg-color);
            }

            .SideNav-item:hover {
                background-color: var(--hover-bg-color);
                box-shadow: 0 4px 8px var(--shadow-color);
                transform: translateY(-2px);
            }

            .labelContainer {
                display: flex;
                justify-content: space-between;
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
                background-image: linear-gradient(to bottom, var(--bg-color), transparent);
            }

            .header-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                max-width: 800px;
            }

            .avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                box-shadow: 0 4px 8px var(--shadow-color);
                transition: all 0.3s ease;
                margin-bottom: 20px;
            }

            .avatar:hover {
                transform: scale(1.1) rotate(5deg);
            }

            .blogTitle, .postTitle {
                font-size: 32px;
                font-weight: bold;
                margin-top: 10px;
                transition: all 0.3s ease;
                text-align: center;
            }

            .blogTitle:hover {
                color: var(--link-color);
                transform: scale(1.05);
            }

            .title-right-container {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-top: 20px;
            }

            .post-content img,
            .cnblogs_post_body img {
                border-radius: 8px;
                box-shadow: 0 4px 8px var(--shadow-color);
                max-width: 100%;
                height: auto;
                transition: transform 0.3s ease;
            }

            .post-content img:hover,
            .cnblogs_post_body img:hover {
                transform: scale(1.05);
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .fade-in {
                animation: fadeIn 0.5s ease-out;
            }

            .btn-invisible {
                color: var(--text-color);
                transition: color 0.3s ease;
            }

            .btn-invisible:hover {
                color: var(--link-color);
            }

            pre code {
                display: block;
                overflow-x: auto;
                padding: 1em;
                background: #f4f4f4;
                border-radius: 8px;
            }

            #backToTop {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--bg-color);
                color: var(--text-color);
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 24px;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s ease, background-color 0.3s ease;
            }

            #backToTop:hover {
                background-color: var(--hover-bg-color);
            }

            @media (max-width: 768px) {
                .blogTitle, .postTitle {
                    font-size: 24px;
                }

                .avatar {
                    width: 60px;
                    height: 60px;
                }
            }
        `;
        document.head.appendChild(style);
    };

    const adjustLabels = () => {
        const sideNavItems = document.querySelectorAll('.SideNav-item');
        sideNavItems.forEach(item => {
            const listTitle = item.querySelector('.listTitle');
            const labels = item.querySelectorAll('.Label.LabelName');
            const time = item.querySelector('.Label.LabelTime');
            
            const labelContainer = document.createElement('div');
            labelContainer.className = 'labelContainer fade-in';
            const labelLeft = document.createElement('div');
            labelLeft.className = 'labelLeft';
            const labelRight = document.createElement('div');
            labelRight.className = 'labelRight';
            
            labels.forEach(label => labelLeft.appendChild(label));
            if (time) labelRight.appendChild(time);
            
            labelContainer.appendChild(labelLeft);
            labelContainer.appendChild(labelRight);
            
            listTitle.parentNode.insertBefore(labelContainer, listTitle.nextSibling);
        });
    };

    const adjustHeader = () => {
        const header = document.getElementById('header');
        if (!header) return;

        const headerContent = header.querySelector('.header-content');
        if (!headerContent) return;

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
        }
    };

    const styleImages = () => {
        const postContent = document.querySelector('.post-content, .cnblogs_post_body');
        if (postContent) {
            const images = postContent.querySelectorAll('img');
            images.forEach(img => {
                img.classList.add('styled-image', 'fade-in');
                img.loading = 'lazy';  // 添加懒加载
            });
        }
    };

    const addBackToTopButton = () => {
        const button = document.createElement('button');
        button.id = 'backToTop';
        button.innerHTML = '↑';
        button.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(button);

        window.addEventListener('scroll', () => {
            button.style.opacity = window.scrollY > 300 ? '1' : '0';
        });

        button.addEventListener('click', () => {
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    };

    const highlightCode = () => {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    };

    const init = () => {
        addStyles();
        adjustLabels();
        adjustHeader();
        styleImages();
        addBackToTopButton();
        highlightCode();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    addStyles();
                }
            });
        });

        observer.observe(document.body, { attributes: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
