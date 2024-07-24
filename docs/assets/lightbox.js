(function() {
    // 创建并插入 CSS 样式
    const css = `
        #lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.5s cubic-bezier(0.215, 0.610, 0.355, 1);
            backdrop-filter: blur(20px);
        }
        #lightbox.show {
            opacity: 1;
        }
        #lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #lightbox img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            transition: transform 0.5s cubic-bezier(0.215, 0.610, 0.355, 1);
        }
        #lightbox-info {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            color: #fff;
            text-align: center;
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            opacity: 0;
            transition: opacity 0.5s cubic-bezier(0.215, 0.610, 0.355, 1);
        }
        #lightbox-nav {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            justify-content: center;
        }
        .nav-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin: 0 5px;
            background-color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .nav-dot.active {
            background-color: #fff;
        }
        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            color: #fff;
            font-size: 30px;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        .close-btn:hover {
            transform: rotate(90deg);
        }

        /* 白天模式下的样式 */
        @media (prefers-color-scheme: light) {
            #lightbox {
                background-color: rgba(255, 255, 255, 0.9);
            }
            .nav-dot, .close-btn {
                color: #333;
            }
        }

        /* 暗黑模式下的样式 */
        @media (prefers-color-scheme: dark) {
            #lightbox {
                background-color: rgba(0, 0, 0, 0.8);
            }
            .nav-dot, .close-btn {
                color: #fff;
            }
        }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // 创建灯箱容器
    const lightboxContainer = document.createElement('div');
    lightboxContainer.id = 'lightbox';
    lightboxContainer.innerHTML = `
        <div id="lightbox-content">
            <img src="" alt="">
            <div id="lightbox-info"></div>
            <div id="lightbox-nav"></div>
            <div class="close-btn">&times;</div>
        </div>
    `;
    document.body.appendChild(lightboxContainer);

    const lightboxImage = lightboxContainer.querySelector('img');
    const lightboxInfo = lightboxContainer.querySelector('#lightbox-info');
    const navContainer = lightboxContainer.querySelector('#lightbox-nav');
    const closeBtn = lightboxContainer.querySelector('.close-btn');

    let currentImageIndex;
    const images = document.querySelectorAll('img');

    // 创建导航圆点
    const createNavDots = () => {
        navContainer.innerHTML = Array.from(images).map((_, index) => 
            `<div class="nav-dot" data-index="${index}"></div>`
        ).join('');
    };

    // 更新导航圆点状态
    const updateNavDots = () => {
        navContainer.querySelectorAll('.nav-dot').forEach(dot => 
            dot.classList.toggle('active', parseInt(dot.dataset.index) === currentImageIndex)
        );
    };

    // 显示灯箱
    const showLightbox = (index) => {
        currentImageIndex = index;
        updateLightboxContent();
        lightboxContainer.style.display = 'flex';
        requestAnimationFrame(() => lightboxContainer.classList.add('show'));
        updateNavDots();
    };

    // 更新灯箱内容
    const updateLightboxContent = () => {
        lightboxImage.style.opacity = '0';
        lightboxInfo.style.opacity = '0';
        setTimeout(() => {
            lightboxImage.src = images[currentImageIndex].src;
            lightboxInfo.textContent = images[currentImageIndex].alt || '';
            lightboxImage.style.opacity = '1';
            lightboxInfo.style.opacity = '1';
        }, 300);
    };

    // 关闭灯箱
    const closeLightbox = () => {
        lightboxContainer.classList.remove('show');
        setTimeout(() => {
            lightboxContainer.style.display = 'none';
        }, 500);
    };

    // 切换到上一张图片
    const showPreviousImage = () => {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateLightboxContent();
            updateNavDots();
        }
    };

    // 切换到下一张图片
    const showNextImage = () => {
        if (currentImageIndex < images.length - 1) {
            currentImageIndex++;
            updateLightboxContent();
            updateNavDots();
        }
    };

    // 防抖函数
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // 事件监听器
    const addEventListeners = () => {
        // 图片点击事件
        images.forEach((image, index) => {
            image.style.cursor = 'pointer';
            image.addEventListener('click', (e) => {
                e.preventDefault();
                showLightbox(index);
            });
        });

        // 导航圆点点击事件（使用事件委托）
        navContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-dot')) {
                showLightbox(parseInt(e.target.dataset.index));
            }
        });
        // 关闭按钮点击事件
        closeBtn.addEventListener('click', closeLightbox);

        // 点击背景关闭灯箱
        lightboxContainer.addEventListener('click', (e) => {
            if (e.target === lightboxContainer) {
                closeLightbox();
            }
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (lightboxContainer.classList.contains('show')) {
                switch (e.key) {
                    case 'Escape': closeLightbox(); break;
                    case 'ArrowLeft': showPreviousImage(); break;
                    case 'ArrowRight': showNextImage(); break;
                }
            }
        });

        // 鼠标滚轮事件（带防抖）
        lightboxContainer.addEventListener('wheel', debounce((e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                showNextImage();
            } else {
                showPreviousImage();
            }
        }, 200));

        // 触摸滑动支持
        let touchStartX = 0;
        let touchEndX = 0;

        lightboxContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].screenX;
        }, { passive: true });

        lightboxContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX) {
                showNextImage();
            } else if (touchEndX > touchStartX) {
                showPreviousImage();
            }
        }, { passive: true });
    };

    // 初始化函数
    const init = () => {
        createNavDots();
        addEventListeners();
    };

    // 执行初始化
    init();
})();
