(function() {
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
      this.isSwiping = false;

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
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity ${this.options.animationDuration}ms ease;
          z-index: -1;
        }
        .lb-lightbox-overlay.active {
          opacity: 1;
          z-index: 10000;
        }
        .lb-lightbox-container {
          position: relative;
          max-width: 90%;
          max-height: 90%;
        }
        .lb-lightbox-image {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .lb-lightbox-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          padding: 10px;
          cursor: pointer;
          font-size: 18px;
        }
        .lb-lightbox-prev {
          left: 10px;
        }
        .lb-lightbox-next {
          right: 10px;
        }
        .lb-lightbox-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          padding: 10px;
          cursor: pointer;
          font-size: 18px;
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

      this.prevButton = document.createElement('button');
      this.prevButton.className = 'lb-lightbox-button lb-lightbox-prev';
      this.prevButton.textContent = '←';

      this.nextButton = document.createElement('button');
      this.nextButton.className = 'lb-lightbox-button lb-lightbox-next';
      this.nextButton.textContent = '→';

      this.closeButton = document.createElement('button');
      this.closeButton.className = 'lb-lightbox-close';
      this.closeButton.textContent = '×';

      this.container.appendChild(this.image);
      this.container.appendChild(this.prevButton);
      this.container.appendChild(this.nextButton);
      this.container.appendChild(this.closeButton);
      this.overlay.appendChild(this.container);

      document.body.appendChild(this.overlay);
    }

    bindEvents() {
      document.addEventListener('click', this.handleImageClick.bind(this), true);
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
        event.preventDefault();
        event.stopPropagation();
        this.images = Array.from(document.querySelectorAll('.markdown-body img'));
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
      if (event.deltaY < 0) {
        this.showPreviousImage();
      } else {
        this.showNextImage();
      }
    }

    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX;
      this.isSwiping = false;
    }

    handleTouchMove(event) {
      if (!this.isSwiping) {
        const touchMoveX = event.touches[0].clientX;
        const diffX = this.touchStartX - touchMoveX;
        if (Math.abs(diffX) > 5) {
          this.isSwiping = true;
        }
      }
      if (this.isSwiping) {
        event.preventDefault();
      }
    }

    handleTouchEnd(event) {
      if (this.isSwiping) {
        const touchEndX = event.changedTouches[0].clientX;
        const diffX = this.touchStartX - touchEndX;
        if (diffX > 50) {
          this.showNextImage();
        } else if (diffX < -50) {
          this.showPreviousImage();
        }
      }
    }

    open() {
      this.isOpen = true;
      this.overlay.classList.add('active');
      this.showImage();
      document.body.style.overflow = 'hidden';
      if (typeof this.options.onOpen === 'function') {
        this.options.onOpen();
      }
    }

    close() {
      this.isOpen = false;
      this.overlay.classList.remove('active');
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
      const tempImage = new Image();
      tempImage.onload = () => {
        this.image.src = imgSrc;
        this.image.style.opacity = '1';
      };
      tempImage.src = imgSrc;

      this.prevButton.style.display = this.currentIndex > 0 ? '' : 'none';
      this.nextButton.style.display = this.currentIndex < this.images.length - 1 ? '' : 'none';

      if (typeof this.options.onNavigate === 'function') {
        this.options.onNavigate(this.currentIndex);
      }
    }

    preloadImages() {
      const preloadNext = (this.currentIndex + 1) % this.images.length;
      const preloadPrev = (this.currentIndex - 1 + this.images.length) % this.images.length;
      new Image().src = this.images[preloadNext].src;
      new Image().src = this.images[preloadPrev].src;
    }
  }

  window.Lightbox = Lightbox;

  document.addEventListener('DOMContentLoaded', () => {
    new Lightbox();
  });
})();
