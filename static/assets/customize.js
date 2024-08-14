(function() {
    // 检测暗黑模式
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // 添加样式
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --bg-color: ${isDarkMode() ? '#1a1a1a' : '#ffffff'};
                --text-color: ${isDarkMode() ? '#ffffff' : '#333333'};
                --hover-bg-color: ${isDarkMode() ? '#2a2a2a' : '#f0f0f0'};
                --shadow-color: ${isDarkMode() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
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
                width: 100px;
                height: 100px;
                border-radius: 50%;
                box-shadow: 0 4px 8px var(--shadow-color);
                transition: all 0.3s ease;
            }

            .avatar:hover {
                transform: scale(1.1) rotate(5deg);
            }

            .blogTitle {
                font-size: 24px;
                font-weight: bold;
                margin-top: 10px;
                transition: all 0.3s ease;
            }

            .blogTitle:hover {
                color: #3498db;
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

        const blogTitle = header.querySelector('.blogTitle, .postTitle');
        const avatar = header.querySelector('#avatarImg');
        const titleRight = header.querySelector('.title-right');

        header.innerHTML = '';

        const headerContent = document.createElement('div');
        headerContent.className = 'header-content fade-in';

        if (avatar) {
            const newAvatar = avatar.cloneNode(true);
            newAvatar.className = 'avatar';
            headerContent.appendChild(newAvatar);
        }

        if (blogTitle) {
            const newBlogTitle = blogTitle.cloneNode(true);
            newBlogTitle.className = 'blogTitle';
            headerContent.appendChild(newBlogTitle);
        }

        const titleRightContainer = document.createElement('div');
        titleRightContainer.className = 'title-right-container';
        if (titleRight) titleRightContainer.appendChild(titleRight.cloneNode(true));

        header.appendChild(headerContent);
        header.appendChild(titleRightContainer);
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
        const isPostPage = document.querySelector('.post-content, .cnblogs_post_body') !== null;

        addStyles();
        adjustLabels();
        adjustHeader();
        styleImages();

        if (isPostPage) {
            // 在文章页面添加头像和博客标题
            const postHeader = document.querySelector('.header-content');
            if (postHeader) {
                const avatar = document.createElement('img');
                avatar.src = 'https://code.buxiantang.top/favicon.svg';
                avatar.className = 'avatar fade-in';
                avatar.alt = 'avatar';

                const blogTitle = document.createElement('a');
                blogTitle.href = '/';
                blogTitle.className = 'blogTitle fade-in';
                blogTitle.textContent = 'Tiengming';

                postHeader.insertBefore(blogTitle, postHeader.firstChild);
                postHeader.insertBefore(avatar, postHeader.firstChild);
            }
        }

        // 监听系统主题变化
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
                addStyles(); // 重新应用样式以更新颜色
            });
        }
    }

    // 确保DOM完全加载后执行脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
