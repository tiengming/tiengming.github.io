(function() {
  // 灯箱插件
  class Lightbox {
    constructor(options = {}) {
      this.options = Object.assign({
        animationDuration: 300,
        closeOnOverlayClick: true,
        onOpen: null,
        onClose: null,
        onNavigate: null,
        placeholderImage: 'path/to/placeholder.png' // 设置占位图的路径
      }, options);

      this.images = [];
      this.currentIndex = 0;
      this.isOpen = false;
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.wheelTimer = null;

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
        /* 样式与之前相同 */
      `;
      document.head.appendChild(style);
    }

    createLightbox() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'lb-lightbox-overlay';
      this.overlay.style.zIndex = '-1';

      this.contentWrapper = document.createElement('div');
      this.contentWrapper.className = 'lb-lightbox-content-wrapper';

      this.container = document.createElement('div');
      this.container.className = 'lb-lightbox-container';

      this.imageWrapper = document.createElement('div');
      this.imageWrapper.className = 'lb-lightbox-image-wrapper';

      this.image = document.createElement('img');
      this.image.className = 'lb-lightbox-image';
      this.image.onerror = this.handleImageError.bind(this); // 绑定错误处理事件

      this.prevButton = this.createNavButton('lb-lightbox-prev', '&#10094;');
      this.nextButton = this.createNavButton('lb-lightbox-next', '&#10095;');
      this.closeButton = this.createNavButton('lb-lightbox-close', '&times;');

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

    createNavButton(className, innerHTML) {
      const button = document.createElement('button');
      button.className = `lb-lightbox-nav ${className}`;
      button.innerHTML = innerHTML;
      button.setAttribute('type', 'button');
      return button;
    }

    bindEvents() {
      document.addEventListener('click', this.handleImageClick.bind(this), true);
      this.overlay.addEventListener('click', this.handleOverlayClick.bind(this));
      this.prevButton.addEventListener('click', this.showPreviousImage.bind(this));
      this.nextButton.addEventListener('click', this.showNextImage.bind(this));
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
      clearTimeout(this.wheelTimer);
      this.wheelTimer = setTimeout(() => {
        event.deltaY > 0 ? this.showNextImage() : this.showPreviousImage();
      }, 50);
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
      this.overlay.style.zIndex = '10000';
      this.overlay.classList.add('active');
      this.showImage(this.images[this.currentIndex].src);
      this.overlay.style.opacity = '1';
      document.body.style.overflow = 'hidden';
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen();
      }
    }

    close() {
      document.body.style.overflow = '';
      this.overlay.classList.remove('active');
      this.overlay.style.opacity = '0';
      this.isOpen = false;
      this.overlay.style.zIndex = '-1';
      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
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
      const newImage = new Image();
      newImage.onload = () => {
        this.image.src = imgSrc;
        this.setImageSize(newImage);
      };

      newImage.onerror = this.handleImageError.bind(this);
      newImage.src = imgSrc;
      this.image.style.opacity = '0';
    }

    handleImageError() {
      console.error('Failed to load image.');
      this.image.src = this.options.placeholderImage; // 加载占位图
      this.image.style.opacity = '1';
    }

    setImageSize(image) {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const aspectRatio = image.width / image.height;

      this.container.style.maxHeight = `${windowHeight * 0.9}px`;
      this.container.style.maxWidth = `${windowWidth * 0.9}px`;

      if (windowWidth / windowHeight > aspectRatio) {
        this.image.style.maxHeight = '90%';
        this.image.style.maxWidth = 'auto';
      } else {
        this.image.style.maxHeight = 'auto';
        this.image.style.maxWidth = '90%';
      }

      this.image.style.opacity = '1'; // 设置为可见
    }
  }

  // 将 Lightbox 类添加到全局对象
  window.Lightbox = Lightbox;

  // 自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    new Lightbox();
  });
})();
