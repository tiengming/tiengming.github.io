(function() {
    function adjustLabels() {
        console.log('Adjusting labels');
        const sideNavItems = document.querySelectorAll('.SideNav-item');
        sideNavItems.forEach(item => {
            const listTitle = item.querySelector('.listTitle');
            const labels = item.querySelectorAll('.Label.LabelName');
            const time = item.querySelector('.Label.LabelTime');
            
            const labelContainer = document.createElement('div');
            labelContainer.className = 'labelContainer';
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

    function addHoverEffect() {
        console.log('Adding hover effect');
        const style = document.createElement('style');
        style.textContent = `
            .SideNav-item {
                transition: all 0.3s ease;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 10px;
                padding: 10px;
            }
            .SideNav-item:hover {
                background-color: #f0f0f0;
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    function adjustHeader() {
        console.log('Adjusting header');
        const header = document.getElementById('header');
        if (!header) {
            console.log('Header not found');
            return;
        }

        console.log('Original header content:', header.innerHTML);

        const blogTitle = header.querySelector('.blogTitle, .postTitle');
        const avatar = header.querySelector('#avatarImg');
        const titleRight = header.querySelector('.title-right');

        console.log('Found elements:', { blogTitle, avatar, titleRight });

        // 清空header
        header.innerHTML = '';

        // 创建header-content容器
        const headerContent = document.createElement('div');
        headerContent.className = 'header-content';

        if (avatar) headerContent.appendChild(avatar.cloneNode(true));
        if (blogTitle) headerContent.appendChild(blogTitle.cloneNode(true));

        // 创建title-right容器
        const titleRightContainer = document.createElement('div');
        titleRightContainer.className = 'title-right-container';
        if (titleRight) titleRightContainer.appendChild(titleRight.cloneNode(true));

        // 将两个容器添加到header
        header.appendChild(headerContent);
        header.appendChild(titleRightContainer);

        console.log('New header content:', header.innerHTML);
    }

    function styleImages() {
        console.log('Styling images');
        const style = document.createElement('style');
        style.textContent = `
            .post-content img,
            .cnblogs_post_body img {
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                max-width: 100%;
                height: auto;
            }
        `;
        document.head.appendChild(style);

        // 为所有文章内的图片添加类
        const postContent = document.querySelector('.post-content, .cnblogs_post_body');
        if (postContent) {
            const images = postContent.querySelectorAll('img');
            images.forEach(img => {
                img.classList.add('styled-image');
                console.log('Styled image:', img.src);
            });
        } else {
            console.log('Post content not found');
        }
    }

    function addStyles() {
        console.log('Adding styles');
        const style = document.createElement('style');
        style.textContent = `
            .labelContainer {
                display: flex;
                justify-content: space-between;
                margin-top: 5px;
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
            }
            .header-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
            }
            .blogTitle, .postTitle {
                text-align: center;
            }
            .title-right-container {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);
    }

    function init() {
        console.log('Initializing script');
        
        // 检查是否为文章页面
        const isPostPage = document.querySelector('.post-content, .cnblogs_post_body') !== null;
        console.log('Is post page:', isPostPage);

        adjustLabels();
        addHoverEffect();
        adjustHeader();
        styleImages();
        addStyles();

        if (isPostPage) {
            console.log('Additional post page specific functions can be called here');
        }

        console.log('Script execution completed');
    }

    // 确保DOM完全加载后执行脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
