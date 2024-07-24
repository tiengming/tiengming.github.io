(function() {
  // 创建CSS样式
  var style = document.createElement('style');
  style.innerHTML = `
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
  document.head.appendChild(style);

  // 创建灯箱容器
  var lightboxContainer = document.createElement('div');
  lightboxContainer.id = 'lightbox';

  var lightboxImage = document.createElement('img');
  var closeButton = document.createElement('div');
  closeButton.innerHTML = '&times;';
  closeButton.className = 'close-btn';

  var loadingIndicator = document.createElement('div');
  loadingIndicator.innerHTML = 'Loading...';
  loadingIndicator.className = 'loading';

  var caption = document.createElement('div');
  caption.className = 'caption';

  lightboxContainer.appendChild(lightboxImage);
  lightboxContainer.appendChild(closeButton);
  lightboxContainer.appendChild(loadingIndicator);
  lightboxContainer.appendChild(caption);
  document.body.appendChild(lightboxContainer);

  var currentImageIndex;
  var images = document.querySelectorAll('img');

  // 显示灯箱
  function showLightbox(index) {
    currentImageIndex = index;
    lightboxImage.style.display = 'none';
    loadingIndicator.style.display = 'block';
    lightboxImage.src = images[index].src;
    caption.innerHTML = images[index].alt || '';
    lightboxContainer.style.display = 'flex';
    setTimeout(function() {
      lightboxContainer.classList.add('show');
    }, 10);
  }

  // 关闭灯箱
  function closeLightbox() {
    lightboxContainer.classList.remove('show');
    setTimeout(function() {
      lightboxContainer.style.display = 'none';
    }, 500);
  }

  // 图片加载完成事件
  lightboxImage.addEventListener('load', function() {
    loadingIndicator.style.display = 'none';
    lightboxImage.style.display = 'block';
  });

  // 图片点击事件
  images.forEach(function(image, index) {
    image.style.cursor = 'pointer';
    image.addEventListener('click', function(event) {
      event.preventDefault();
      showLightbox(index);
    });
  });

  // 关闭按钮点击事件
  closeButton.addEventListener('click', function() {
    closeLightbox();
  });

  // 灯箱点击事件
  lightboxContainer.addEventListener('click', function(e) {
    if (e.target === lightboxContainer) {
      closeLightbox();
    }
  });

  // 键盘事件
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
})();
