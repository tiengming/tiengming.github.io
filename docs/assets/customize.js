(function() {
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

            .SideNav {
                border-radius: 12px;
                overflow: hidden;
            }

            .SideNav-item {
                transition: all 0.3s ease;
                border-radius: 8px;
                box-shadow: 0 2px 4px var(--shadow-color);
                margin-bottom: 10px;
                padding: 10px;
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

            .title-right-container {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-top: 10px;
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

            .btn-invisible {
                color: var(--text-color);
            }

            .btn-invisible:hover {
                color: var(--link-color);
            }
        `;
        document.head.appendChild(style);
    }

    function adjustLabels() {
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
    }

    function adjustHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        const headerContent = header.querySelector('.header-content');
        if (!headerContent) return;

        const postTitle = headerContent.querySelector('.blogTitle, .postTitle');
        
        // 只在文章页添加头像和网站名称
        if (postTitle && postTitle.classList.contains('blogTitle')) {
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
                img.classList.add('styled-image', 'fade-in');
            });
        }
    }

    function init() {
        addStyles();
        adjustLabels();
        adjustHeader();
        styleImages();

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

    // 确保DOM完全加载后执行脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
