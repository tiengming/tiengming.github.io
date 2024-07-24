(function() {
    // 创建CSS样式
    const style = document.createElement('style');
    style.innerHTML = `
      #lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      #lightbox.show {
        opacity: 1;
      }
      #lightbox-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 90%;
        max-height: 90%;
      }
      #lightbox img {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        transition: transform 0.3s ease-out;
        transform: scale(0.95);
      }
      #lightbox.show img {
        transform: scale(1);
      }
      #lightbox .caption {
        margin-top: 15px;
        color: white;
        text-align: center;
        font-size: 16px;
        max-width: 80%;
      }
      #lightbox .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        color: white;
        font-size: 30px;
        cursor: pointer;
      }
      #lightbox .nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        color: white;
        font-size: 40px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      #lightbox .nav-btn:hover {
        opacity: 1;
      }
      #lightbox .prev-btn {
        left: 20px;
      }
      #lightbox .next-btn {
        right: 20px;
      }
    `;
    document.head.appendChild(style);

    // 创建灯箱容器
    const lightboxContainer = document.createElement('div');
    lightboxContainer.id = 'lightbox';
    lightboxContainer.innerHTML = `
      <div id="lightbox-content">
        <img src="" alt="">
        <div class="caption"></div>
      </div>
      <div class="close-btn">&times;</div>
      <div class="nav-btn prev-btn">&#10094;</div>
      <div class="nav-btn next-btn">&#10095;</div>
    `;
    document.body.appendChild(lightboxContainer);

    const lightboxImage = lightboxContainer.querySelector('img');
    const caption = lightboxContainer.querySelector('.caption');
    const closeBtn = lightboxContainer.querySelector('.close-btn');
    const prevBtn = lightboxContainer.querySelector('.prev-btn');
    const nextBtn = lightboxContainer.querySelector('.next-btn');

    let currentImageIndex;
    const images = document.querySelectorAll('img');

    // 显示灯箱
    function showLightbox(index) {
      currentImageIndex = index;
      updateLightboxContent();
      lightboxContainer.style.display = 'flex';
      requestAnimationFrame(() => {
        lightboxContainer.classList.add('show');
      });
    }

    // 更新灯箱内容
    function updateLightboxContent() {
      lightboxImage.src = images[currentImageIndex].src;
      caption.textContent = images[currentImageIndex].alt || '';
      updateNavButtons();
    }
// 更新导航按钮状态
    function updateNavButtons() {
      prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
      nextBtn.style.display = currentImageIndex < images.length - 1 ? 'block' : 'none';
    }

    // 关闭灯箱
    function closeLightbox() {
      lightboxContainer.classList.remove('show');
      setTimeout(() => {
        lightboxContainer.style.display = 'none';
      }, 300);
    }

    // 切换到上一张图片
    function showPreviousImage() {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateLightboxContent();
      }
    }

    // 切换到下一张图片
    function showNextImage() {
      if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        updateLightboxContent();
      }
    }

    // 图片点击事件
    images.forEach((image, index) => {
      image.style.cursor = 'pointer';
      image.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止默认行为，不在新标签页打开
        showLightbox(index);
      });
    });

    // 灯箱点击事件
    lightboxContainer.addEventListener('click', (e) => {
      if (e.target === lightboxContainer) {
        closeLightbox();
      }
    });

    // 关闭按钮点击事件
    closeBtn.addEventListener('click', closeLightbox);

    // 导航按钮点击事件
    prevBtn.addEventListener('click', showPreviousImage);
    nextBtn.addEventListener('click', showNextImage);

    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (lightboxContainer.classList.contains('show')) {
        switch (e.key) {
          case 'Escape':
            closeLightbox();
            break;
          case 'ArrowLeft':
            showPreviousImage();
            break;
          case 'ArrowRight':
            showNextImage();
            break;
        }
      }
    });

    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);

    lightboxContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, false);

    function handleSwipe() {
      if (touchEndX < touchStartX) {
        showNextImage();
      }
      if (touchEndX > touchStartX) {
        showPreviousImage();
      }
    }
})();
