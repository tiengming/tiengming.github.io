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
      this.isZoomed = false;
      this.zoomLevel = 1;
      this.touchStartX = 0;
      this.touchEndX = 0;

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
        .lightbox-overlay {
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
          z-index: 9999;
          opacity: 0;
          transition: opacity ${this.options.animationDuration}ms ease;
        }
        .lightbox-container {
          max-width: 90%;
          max-height: 90%;
          position: relative;
          transition: transform ${this.options.animationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .lightbox-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: transform ${this.options.animationDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255, 255, 255, 0.8);
          color: #333;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .lightbox-nav:hover {
          background-color: rgba(255, 255, 255, 1);
          transform: translateY(-50%) scale(1.1);
        }
        .lightbox-nav:active {
          transform: translateY(-50%) scale(0.9);
        }
        .lightbox-prev {
          left: 20px;
        }
        .lightbox-next {
          right: 20px;
        }
        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background-color: rgba(255, 255, 255, 0.8);
          color: #333;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .lightbox-close:hover {
          background-color: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }
        .lightbox-close:active {
          transform: scale(0.9);
        }
        @media (max-width: 768px) {
          .lightbox-nav {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
          .lightbox-close {
            width: 35px;
            height: 35px;
            font-size: 20px;
          }
        }
        @media (prefers-color-scheme: dark) {
          .lightbox-overlay {
            background-color: rgba(0, 0, 0, 0.9);
          }
          .lightbox-nav,
          .lightbox-close {
            background-color: rgba(50, 50, 50, 0.8);
            color: #fff;
          }
          .lightbox-nav:hover,
          .lightbox-close:hover {
            background-color: rgba(70, 70, 70, 1);
          }
          .lightbox-image {
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
          }
        }
      `;
      document.head.appendChild(style);
    }

    createLightbox() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'lightbox-overlay';

      this.container = document.createElement('div');
      this.container.className = 'lightbox-container';

      this.image = document.createElement('img');
      this.image.className = 'lightbox-image';

      this.prevButton = document.createElement('button');
      this.prevButton.className = 'lightbox-nav lightbox-prev';
      this.prevButton.innerHTML = '&#10094;';

      this.nextButton = document.createElement('button');
      this.nextButton.className = 'lightbox-nav lightbox-next';
      this.nextButton.innerHTML = '&#10095;';

      this.closeButton = document.createElement('button');
      this.closeButton.className = 'lightbox-close';
      this.closeButton.innerHTML = '&times;';

      this.container.appendChild(this.image);
      this.overlay.appendChild(this.container);
      this.overlay.appendChild(this.prevButton);
      this.overlay.appendChild(this.nextButton);
      this.overlay.appendChild(this.closeButton);

      document.body.appendChild(this.overlay);
    }

    bindEvents() {
      document.addEventListener('click', this.handleImageClick.bind(this));
      this.overlay.addEventListener('click', this.handleOverlayClick.bind(this));
      this.prevButton.addEventListener('click', this.showPreviousImage.bind(this));
      this.nextButton.addEventListener('click', this.showNextImage.bind(this));
      this.closeButton.addEventListener('click', this.close.bind(this));
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.image.addEventListener('wheel', this.handleWheel.bind(this));
      this.overlay.addEventListener('touchstart', this.handleTouchStart.bind(this));
      this.overlay.addEventListener('touchmove', this.handleTouchMove.bind(this));
      this.overlay.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleImageClick(event) {
      const clickedImage = event.target.closest('img');
      if (clickedImage && !this.isOpen) {
        this.images = Array.from(document.querySelectorAll('img'));
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
      const delta = Math.sign(event.deltaY);
      this.zoom(delta > 0 ? -0.1 : 0.1);
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
        if (difference > 0) {
          this.showNextImage();
        } else {
          this.showPreviousImage();
        }
      }
    }

    open() {
      this.isOpen = true;
      this.showImage();
      this.overlay.style.opacity = '1';
      document.body.style.overflow = 'hidden';
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen();
      }
    }

    close() {
      this.isOpen = false;
      this.overlay.style.opacity = '0';
      document.body.style.overflow = '';
      setTimeout(() => {
        this.image.style.transform = '';
        this.zoomLevel = 1;
        this.isZoomed = false;
      }, this.options.animationDuration);
      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
    }

    showPreviousImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.showImage();
      }
    }

    showNextImage() {
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++;
        this.showImage();
      }
    }

    showImage() {
      const imgSrc = this.images[this.currentIndex].src;
      this.image.style.opacity = '0';
      setTimeout(() => {
        this.image.src = imgSrc;
        this.image.style.opacity = '1';
      }, this.options.animationDuration / 2);

      this.prevButton.style.display = this.currentIndex > 0 ? '' : 'none';
      this.nextButton.style.display = this.currentIndex < this.images.length - 1 ? '' : 'none';

      if (typeof this.options.onNavigate === 'function') {
        this.options.onNavigate(this.currentIndex);
      }
    }

    zoom(factor) {
      this.zoomLevel += factor;
      this.zoomLevel = Math.max(1, Math.min(this.zoomLevel, 3));
      this.image.style.transform = `scale(${this.zoomLevel})`;
      this.isZoomed = this.zoomLevel !== 1;
    }

    preloadImages() {
      const preloadNext = (this.currentIndex + 1) % this.images.length;
      const preloadPrev = (this.currentIndex - 1 + this.images.length) % this.images.length;
      new Image().src = this.images[preloadNext].src;
      new Image().src = this.images[preloadPrev].src;
    }
  }

  // 将 Lightbox 类添加到全局对象
  window.Lightbox = Lightbox;

  // 自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    new Lightbox();
  });
})();
