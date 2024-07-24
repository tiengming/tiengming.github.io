(function() {
  // 使用const定义样式字符串，提高代码的可读性和可维护性
  const lightboxStyles = `
    #lightbox {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(255, 255, 255, 0.95);
      padding: 20px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      border-radius: 10px;
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.5s;
      opacity: 0;
    }
    #lightbox.show {
      display: flex;
      opacity: 1;
    }
    #lightbox img {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 10px;
      transition: transform 0.3s;
      transform: scale(0.95);
    }
    #lightbox.show img {
      transform: scale(1);
    }
    #lightbox .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      color: black;
      font-size: 25px;
      cursor: pointer;
    }
    #lightbox .loading {
      position: absolute;
      display: none;
      color: black;
      font-size: 20px;
    }
    #lightbox .caption {
      margin-top: 10px;
      color: black;
      font-size: 16px;
      text-align: center;
      width: 100%;
    }
  `;

  // 创建CSS样式并添加到文档中
  let style = document.createElement('style');
  style.innerHTML = lightboxStyles;
  document.head.appendChild(style);

  // 创建灯箱容器及相关元素
  let lightboxContainer = document.createElement('div');
  lightboxContainer.id = 'lightbox';

  let lightboxImage = document.createElement('img');
  let closeButton = document.createElement('div');
  closeButton.innerHTML = '&times;';
  closeButton.className = 'close-btn';

  let loadingIndicator = document.createElement('div');
  loadingIndicator.innerHTML = 'Loading...';
  loadingIndicator.className = 'loading';

  let caption = document.createElement('div');
  caption.className = 'caption';

  lightboxContainer.appendChild(lightboxImage);
  lightboxContainer.appendChild(closeButton);
  lightboxContainer.appendChild(loadingIndicator);
  lightboxContainer.appendChild(caption);
  document.body.appendChild(lightboxContainer);

  let currentImageIndex;
  let images = document.querySelectorAll('img');

  // 显示灯箱
  function showLightbox(index) {
    currentImageIndex = index;
    lightboxImage.style.display = 'none';
    loadingIndicator.style.display = 'block';
    lightboxImage.src = images[index].src;
    caption.innerHTML = images[index].alt || '';
    lightboxContainer.style.display = 'flex';
    setTimeout(() => {
      lightboxContainer.classList.add('show');
    }, 10);
  }

  // 关闭灯箱
  function closeLightbox() {
    lightboxContainer.classList.remove('show');
    setTimeout(() => {
      lightboxContainer.style.display = 'none';
    }, 500);
  }

  // 图片加载完成事件
  lightboxImage.addEventListener('load', () => {
    loadingIndicator.style.display = 'none';
    lightboxImage.style.display = 'block';
  });

  // 图片加载失败事件
  lightboxImage.addEventListener('error', () => {
    console.error('Failed to load image');
    loadingIndicator.style.display = 'none';
    lightboxImage.style.display = 'block';
    lightboxImage.src = 'error-image.png'; // 显示占位图或错误提示图片
  });

  // 事件委托，处理图片点击事件
  document.addEventListener('click', event => {
    if (event.target.tagName === 'IMG') {
      event.preventDefault();
      showLightbox(Array.from(images).indexOf(event.target));
    }
  });

  // 关闭按钮点击事件
  closeButton.addEventListener('click', () => {
    closeLightbox();
  });

  // 灯箱点击事件，关闭灯箱
  lightboxContainer.addEventListener('click', event => {
    if (event.target === lightboxContainer) {
      closeLightbox();
    }
  });

  // 键盘事件，按下esc键关闭灯箱
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
})();