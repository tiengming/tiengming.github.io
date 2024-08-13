(function() {
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 1. 调整标签和时间的位置
        function adjustLabels() {
            const sideNavItems = document.querySelectorAll('.SideNav-item');
            sideNavItems.forEach(item => {
                const listTitle = item.querySelector('.listTitle');
                const labels = item.querySelectorAll('.Label.LabelName');
                const time = item.querySelector('.Label.LabelTime');
                
                // 创建新的容器
                const labelContainer = document.createElement('div');
                labelContainer.className = 'labelContainer';
                const labelLeft = document.createElement('div');
                labelLeft.className = 'labelLeft';
                const labelRight = document.createElement('div');
                labelRight.className = 'labelRight';
                
                // 移动标签和时间
                labels.forEach(label => labelLeft.appendChild(label));
                if (time) labelRight.appendChild(time);
                
                labelContainer.appendChild(labelLeft);
                labelContainer.appendChild(labelRight);
                
                // 插入新容器
                listTitle.parentNode.insertBefore(labelContainer, listTitle.nextSibling);
            });
        }

        // 2. 添加鼠标悬停动画
        function addHoverEffect() {
            const style = document.createElement('style');
            style.textContent = `
                .SideNav-item {
                    transition: background-color 0.3s ease;
                }
                .SideNav-item:hover {
                    background-color: #f6f8fa;
                }
            `;
            document.head.appendChild(style);
        }

        // 3. 调整博客标题和右侧按钮的布局
        function adjustHeader() {
            const header = document.getElementById('header');
            const blogTitle = header.querySelector('.blogTitle');
            const avatar = header.querySelector('#avatarImg');
            const titleRight = header.querySelector('.title-right');
            
            // 创建新的容器
            const headerContent = document.createElement('div');
            headerContent.className = 'header-content';
            
            // 重新组织元素
            headerContent.appendChild(avatar);
            headerContent.appendChild(blogTitle.parentNode);
            header.insertBefore(headerContent, header.firstChild);
            
            // 移动右侧按钮
            if (titleRight) {
                header.appendChild(titleRight);
            }
        }

        // 4. 为文章页图片添加圆角和阴影
        function styleImages() {
            const style = document.createElement('style');
            style.textContent = `
                .post-content img {
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
            `;
            document.head.appendChild(style);
        }

        // 执行所有修改
        adjustLabels();
        addHoverEffect();
        adjustHeader();
        styleImages();

        // 添加必要的CSS
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
            .header-content {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .blogTitle {
                text-align: center;
            }
            .title-right {
                display: flex;
                justify-content: center;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);
    });
})();
