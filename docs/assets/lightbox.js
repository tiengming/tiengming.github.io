(function() {
  // 灯箱插件
  class Lightbox {
    constructor(options = {}) {
      this.options = Object.assign({
        animationDuration: 300,
        closeOnOverlayClick: true,
        onOpen: null,
        onClose: null,
        onNavigate: null
      }, options);

      this.images = [];
      this.currentIndex = 0;
      this.isOpen = false;
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.wheelTimer = null;
      this.preloadedImages = {}; // 存储预加载的图片对象
      this.originalDimensions = {}; // 存储原始图片尺寸

      this.init();
    }

    init() {
      this.createStyles();
      this.createLightbox();
      this.bindEvents();
    }

    createStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .lb-lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity ${this.options.animationDuration}ms ease;
          pointer-events: none;
        }
        .lb-lightbox-overlay.active {
          pointer-events: auto;
        }
        .lb-lightbox-container {
          max-width: 90%;
          max-height: 90%;
          position: relative;
          overflow: hidden;
          transition: transform ${this.options.animationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .lb-lightbox-image {
          max-width: 100%;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: transform ${this.options.animationDuration}ms ease, opacity ${this.options.animationDuration}ms ease;
        }
      `;
      document.head.appendChild(style);
    }

    createLightbox() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'lb-lightbox-overlay';

      this.container = document.createElement('div');
      this.container.className = 'lb-lightbox-container';

      this.image = document.createElement('img');
      this.image.className = 'lb-lightbox-image';

      this.closeButton = document.createElement('button');
      this.closeButton.className = 'lb-lightbox-close';
      this.closeButton.innerHTML = '&times;';

      this.container.appendChild(this.image);
      this.overlay.appendChild(this.container);
      this.overlay.appendChild(this.closeButton);
      document.body.appendChild(this.overlay);

      this.closeButton.addEventListener('click', this.close.bind(this));
    }

    bindEvents() {
      document.addEventListener('click', this.handleImageClick.bind(this), true);
      this.overlay.addEventListener('click', this.handleOverlayClick.bind(this));
      this.closeButton.addEventListener('click', this.close.bind(this));
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.overlay.addEventListener('wheel', this.handleWheel.bind(this)); // 处理滚轮事件
      this.overlay.addEventListener('touchstart', this.handleTouchStart.bind(this));
      this.overlay.addEventListener('touchmove', this.handleTouchMove.bind(this));
      this.overlay.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleImageClick(event) {
      const clickedImage = event.target.closest('img');
      if (clickedImage && !this.isOpen) {
        event.preventDefault();
        this.images = Array.from(document.querySelectorAll('.markdown-body img, table img'));
        this.currentIndex = this.images.indexOf(clickedImage);
        this.open();
      }
    }

    handleOverlayClick(event) {
      if (event.target === this.overlay && this.options.closeOnOverlayClick) {
        this.close();
      }
    }

    handleKeyDown(event) {
      if (!this.isOpen) return;
      switch (event.key) {
        case 'Escape':
          this.close();
          break;
      }
    }

    handleWheel(event) {
      event.preventDefault();
      if (event.ctrlKey) {
        // 如果按住Ctrl键，进行缩放
        const scale = event.deltaY > 0 ? 0.9 : 1.1; // 根据滚轮方向设置缩放比例
        this.zoomImage(scale);
      }
    }

    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX;
    }

    handleTouchMove(event) {
      this.touchEndX = event.touches[0].clientX;
    }

    handleTouchEnd() {
      const difference = this.touchStartX - this.touchEndX;
      if (Math.abs(difference) > 50) {
        difference > 0 ? this.showNextImage() : this.showPreviousImage();
      }
    }

    open() {
      this.isOpen = true;
      this.overlay.classList.add('active');
      this.showImage(this.images[this.currentIndex].src);
      this.overlay.style.opacity = '1';
      document.body.style.overflow = 'hidden';
    }

    close() {
      document.body.style.overflow = '';
      this.overlay.classList.remove('active');
      this.overlay.style.opacity = '0';
      this.isOpen = false;
      this.clearPreloadedImages(); // 清除预加载的图片
    }

    showImage(imgSrc) {
      const newImage = new Image();
      newImage.src = imgSrc;

      newImage.onload = () => {
        this.originalDimensions[imgSrc] = { width: newImage.width, height: newImage.height }; // 存储原始尺寸
        this.image.src = imgSrc;
        // 创建容器为原始尺寸
        this.createContainerWithOriginalSize(newImage.width, newImage.height);
      };

      newImage.onerror = () => {
        console.error('Failed to load image:', imgSrc);
        this.image.src = 'path/to/placeholder.png'; // 设置占位图
      };
    }

    createContainerWithOriginalSize(width, height) {
      const aspectRatio = width / height;

      // 根据原始尺寸调整容器大小
      if (aspectRatio > 1) {
        this.container.style.maxWidth = '90%';
        this.container.style.maxHeight = `${(window.innerWidth * 0.9) / aspectRatio}px`; // 根据宽度计算高度
      } else {
        this.container.style.maxHeight = '90%';
        this.container.style.maxWidth = `${(window.innerHeight * 0.9) * aspectRatio}px`; // 根据高度计算宽度
      }
    }

    zoomImage(scale) {
      const currentScale = parseFloat(this.image.style.transform.replace(/scale\(([^)]+)\)/, '\$1')) || 1;
      this.image.style.transform = `scale(${(currentScale * scale).toFixed(2)})`;
    }

    preloadImages() {
      const preloadNext = (this.currentIndex + 1) % this.images.length;
      const preloadPrev = (this.currentIndex - 1 + this.images.length) % this.images.length;

      this.preloadedImages[preloadNext] = new Image();
      this.preloadedImages[preloadPrev] = new Image();

      this.preloadedImages[preloadNext].src = this.images[preloadNext].src;
      this.preloadedImages[preloadPrev].src = this.images[preloadPrev].src;

      // 错误处理
      this.preloadedImages[preloadNext].onerror = () => {
        console.error('Failed to preload next image');
      };
      this.preloadedImages[preloadPrev].onerror = () => {
        console.error('Failed to preload previous image');
      };
    }

    clearPreloadedImages() {
      Object.keys(this.preloadedImages).forEach(key => {
        this.preloadedImages[key].src = '';
      });
      this.preloadedImages = {}; // 清空预加载的图片对象
    }
  }

  // 将 Lightbox 类添加到全局对象
  window.Lightbox = Lightbox;

  // 自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    new Lightbox();
  });
})();
