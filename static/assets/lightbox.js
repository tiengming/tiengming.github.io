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
        placeholderImage: 'path/to/placeholder.jpg' // 占位图的路径
      }, options);

      this.images = [];
      this.currentIndex = 0;
      this.isOpen = false;
      this.isZoomed = false;
      this.zoomLevel = 1;
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.touchStartY = 0;
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
        /* Your existing styles here */
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

      this.errorMessage = document.createElement('div');
      this.errorMessage.className = 'lb-error-message';
      this.errorMessage.innerText = '图片加载失败';
      this.errorMessage.style.display = 'none'; // 默认隐藏

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
      this.imageWrapper.appendChild(this.errorMessage); // 添加错误信息
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
      this.prevButton.setAttribute('type', 'button');
      this.nextButton.setAttribute('type', 'button');
      this.closeButton.setAttribute('type', 'button');
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

    showImage(imgSrc) {
      this.image.style.opacity = '0';
      this.errorMessage.style.display = 'none'; // 隐藏错误信息
      this.image.src = this.options.placeholderImage; // 先显示占位图

      const newImage = new Image();
      newImage.onload = () => {
        this.image.src = imgSrc; // 设置新图片的src
        this.image.style.transition = `opacity ${this.options.animationDuration}ms ease`;
        this.image.style.opacity = '1'; // 设置为可见
        
        // 根据原图尺寸设置容器大小
        const aspectRatio = newImage.width / newImage.height;
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        if (windowWidth / windowHeight > aspectRatio) {
          this.container.style.maxHeight = `${windowHeight * 0.9}px`;
          this.container.style.maxWidth = '90%';
        } else {
          this.container.style.maxHeight = '90%';
          this.container.style.maxWidth = `${windowWidth * 0.9}px`;
        }
      };

      newImage.onerror = () => {
        this.errorMessage.style.display = 'block'; // 显示错误信息
        console.error('Failed to load image:', imgSrc);
      };
      
      newImage.src = imgSrc; // 开始加载新图片
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
        const delta = Math.sign(event.deltaY);
        if (delta > 0) {
          this.showNextImage();
        } else {
          this.showPreviousImage();
        }
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
        if (difference > 0) {
          this.showNextImage();
        } else {
          this.showPreviousImage();
        }
      }
    }
  }

  // 将 Lightbox 类添加到全局对象
  window.Lightbox = Lightbox;

  // 自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    new Lightbox();
  });
})();
