(function() {
    // 创建CSS样式
    var style = document.createElement('style');
    style.innerHTML = `
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
        transition: opacity 0.5s;
      }
      #lightbox img {
        max-width: 80%;
        max-height: 80%;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        transition: transform 0.3s;
        transform: scale(0.95);
      }
      #lightbox.show img {
        transform: scale(1);
      }
    `;
    document.head.appendChild(style);
  
    // 创建灯箱容器
    var lightboxContainer = document.createElement('div');
    lightboxContainer.id = 'lightbox';
    lightboxContainer.style.display = 'none';
  
    var lightboxImage = document.createElement('img');
    lightboxContainer.appendChild(lightboxImage);
  
    document.body.appendChild(lightboxContainer);
  
    var currentImageIndex;
    var images = document.querySelectorAll('img');
  
    // 显示灯箱
    function showLightbox(index) {
      currentImageIndex = index;
      lightboxImage.src = images[index].src;
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
  
    // 图片点击事件
    images.forEach(function(image, index) {
      image.style.cursor = 'pointer';
      image.addEventListener('click', function() {
        showLightbox(index);
      });
    });
  
    // 灯箱点击事件
    lightboxContainer.addEventListener('click', function(e) {
      if (e.target !== lightboxImage) {
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
  