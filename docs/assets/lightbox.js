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
      this.zoomLevel = 1;
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.wheelTimer = null;
      this.preloadedImages = {}; // 存储预加载的图片对象

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
        .lb-lightbox-content-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        .lb-lightbox-container {
          max-width: 90%;
          max-height: 90%;
          position: relative;
          transition: transform ${this.options.animationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1);
          overflow: hidden;
        }
        .lb-lightbox-image-wrapper {
          max-height: 100%;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .lb-lightbox-image {
          max-width: 100%;
          max-height: 100%;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: transform ${this.options.animationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity ${this.options.animationDuration}ms ease;
        }
        .lb-lightbox-nav, .lb-lightbox-close {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.8);
          color: #333;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .lb-lightbox-prev {
          left: 20px;
        }
        .lb-lightbox-next {
          right: 20px;
        }
        .lb-lightbox-close {
          top: 20px;
          right: 20px;
        }
        @media (max-width: 768px) {
          .lb-lightbox-nav, .lb-lightbox-close {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    createLightbox() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'lb-lightbox-overlay';
      this.overlay.style.zIndex = '10000';

      this.contentWrapper = document.createElement('div');
      this.contentWrapper.className = 'lb-lightbox-content-wrapper';

      this.container = document.createElement('div');
      this.container.className = 'lb-lightbox-container';

      this.imageWrapper = document.createElement('div');
      this.imageWrapper.className = 'lb-lightbox-image-wrapper';

      this.image = document.createElement('img');
      this.image.className = 'lb-lightbox-image';

      this.prevButton = document.createElement('button');
      this.prevButton.className = 'lb-lightbox-nav lb-lightbox-prev';
      this.prevButton.innerHTML = '&#10094;';

      this.nextButton = document.createElement('button');
      this.nextButton.className = 'lb-lightbox-nav lb-lightbox-next';
      this.nextButton.innerHTML = '&#10095;';

      this.closeButton = document.createElement('button');
      this.closeButton.className = 'lb-lightbox-close';
      this.closeButton.innerHTML = '&times;';

      this.imageWrapper.appendChild(this.image);
      this.container.appendChild(this.imageWrapper);
      this.contentWrapper.appendChild(this.container);
      this.contentWrapper.appendChild(this.prevButton);
      this.contentWrapper.appendChild(this.nextButton);
      this.contentWrapper.appendChild(this.closeButton);

      this.overlay.appendChild(this.contentWrapper);
      document.body.appendChild(this.overlay);

      this.closeButton.addEventListener('click', this.close.bind(this));
    }

    bindEvents() {
      document.addEventListener('click', this.handleImageClick.bind(this), true);
      this.overlay.addEventListener('click', this.handleOverlayClick.bind(this));
      this.prevButton.addEventListener('click', this.showPreviousImage.bind(this));
      this.nextButton.addEventListener('click', this.showNextImage.bind(this));
      this.closeButton.addEventListener('click', this.close.bind(this));
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.overlay.addEventListener('wheel', this.handleWheel.bind(this));
      this.overlay.addEventListener('touchstart', this.handleTouchStart.bind(this));
      this.overlay.addEventListener('touchmove', this.handleTouchMove.bind(this));
      this.overlay.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleImageClick(event) {
      const clickedImage = event.target.closest('img');
      if (clickedImage && !this.isOpen) {
        event.preventDefault();
        event.stopPropagation();
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
        case 'ArrowLeft':
          this.showPreviousImage();
          break;
        case 'ArrowRight':
          this.showNextImage();
          break;
        case 'Escape':
          this.close();
          break;
      }
    }

    handleWheel(event) {
      event.preventDefault();

      if (event.ctrlKey) {
        // 如果按住 Ctrl 键，执行缩放
        this.zoomLevel += event.deltaY > 0 ? -0.1 : 0.1; // 负值表示缩小，正值表示放大
        this.zoomLevel = Math.max(1, this.zoomLevel); // 确保缩放级别不小于 1
        this.image.style.transform = `scale(${this.zoomLevel})`; // 应用缩放
      } else {
        // 不按 Ctrl 键，切换图片
        clearTimeout(this.wheelTimer);
        this.wheelTimer = setTimeout(() => {
          const delta = Math.sign(event.deltaY);
          if (delta > 0) {
            this.showNextImage();
          } else {
            this.showPreviousImage();
          }
        }, 50);
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
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen();
      }
    }

    close() {
      document.body.style.overflow = ''; // 恢复页面滚动
      this.overlay.classList.remove('active');
      this.overlay.style.opacity = '0';
      this.isOpen = false;
      this.clearPreloadedImages(); // 清除预加载的图片
      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
      this.unbindEvents(); // 解绑事件
    }

    showPreviousImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.showImage(this.images[this.currentIndex].src);
      }
    }

    showNextImage() {
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++;
        this.showImage(this.images[this.currentIndex].src);
      }
    }

    showImage(imgSrc) {
      this.image.style.opacity = '0'; // 开始时设为透明

      const newImage = new Image();
      newImage.src = imgSrc;

      newImage.onload = () => {
        this.image.src = imgSrc;
        this.image.style.transition = `opacity ${this.options.animationDuration}ms ease`;
        this.image.style.opacity = '1'; // 显示新图片

        // 确保图片完全显示
        this.image.style.transform = 'scale(1)'; // 重置缩放
        this.preloadImages(); // 预加载前后图片
      };

      newImage.onerror = () => {
        console.error('Failed to load image:', imgSrc);
      };
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

    unbindEvents() {
      document.removeEventListener('click', this.handleImageClick.bind(this), true);
      this.overlay.removeEventListener('click', this.handleOverlayClick.bind(this));
      this.prevButton.removeEventListener('click', this.showPreviousImage.bind(this));
      this.nextButton.removeEventListener('click', this.showNextImage.bind(this));
      this.closeButton.removeEventListener('click', this.close.bind(this));
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
      this.overlay.removeEventListener('wheel', this.handleWheel.bind(this));
      this.overlay.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      this.overlay.removeEventListener('touchmove', this.handleTouchMove.bind(this));
      this.overlay.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }
  }

  // 将 Lightbox 类添加到全局对象
  window.Lightbox = Lightbox;

  // 自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    new Lightbox();
  });
})();
