/*!
 * GmeekCustomizeCss.js v1.0.1
 * https://blog.meekdai.com/
 * Apple 风格 & 移动端优化
 */
(function(window, document){
  'use strict';

  // 1. 默认配置
  var defaults = {
    colors: {
      bg: '#FAFAFC',
      text: '#1D1D1F',
      link: '#007AFF',
      linkHover: '#0051A8',
      buttonBg: '#007AFF',
      buttonBgHover: '#0051A8',
      overlayBg: 'rgba(250, 250, 252, 0.9)'
    },
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    spacing: { base: '1rem', section: '2rem' },
    animation: { duration: '0.3s', easing: 'ease-out' },
    smoothScroll: true
  };

  // 2. 合并用户配置
  var userConfig = window.GmeekCustomizeCssConfig || {};
  function deepMerge(dest, src) {
    for (var k in src) {
      if (src[k] && src[k].constructor === Object) {
        dest[k] = dest[k] || {};
        deepMerge(dest[k], src[k]);
      } else {
        dest[k] = src[k];
      }
    }
    return dest;
  }
  var cfg = deepMerge(defaults, userConfig);

  // 3. 注入全局样式（含移动端优化）
  function injectStyles() {
    var css = `
      /* 基础样式 */
      html { font-family: ${cfg.font}; background: ${cfg.colors.bg}; scroll-behavior: ${cfg.smoothScroll ? 'smooth' : 'auto'}; }
      body { color: ${cfg.colors.text}; margin:0; padding:0; line-height:1.6; }
      h1,h2,h3,h4,h5,h6 { margin-top:${cfg.spacing.section}; font-weight:600; }
      p,li { margin-bottom:${cfg.spacing.base}; }

      /* 链接 & 按钮 */
      a { color:${cfg.colors.link}; text-decoration:none; transition:color ${cfg.animation.duration} ${cfg.animation.easing}; }
      a:hover { color:${cfg.colors.linkHover}; }
      button,.btn { background:${cfg.colors.buttonBg}; color:#fff; border:none;
        padding:.6em 1.2em; border-radius:4px; cursor:pointer;
        transition:background ${cfg.animation.duration} ${cfg.animation.easing},
                   transform ${cfg.animation.duration} ${cfg.animation.easing};
      }
      button:hover,.btn:hover { background:${cfg.colors.buttonBgHover}; }
      button:active,.btn:active { transform:scale(0.98); }

      /* 布局容器 */
      .section { padding:${cfg.spacing.section} 1rem; }
      .container { max-width:960px; margin:0 auto; padding:0 1rem; }

      /* 视差 & 进场动画 */
      .parallax { will-change:transform; transition:transform ${cfg.animation.duration} ${cfg.animation.easing}; }
      .gmeek-reveal { opacity:0; transform:translateY(20px);
        transition:opacity .6s ${cfg.animation.easing}, transform .6s ${cfg.animation.easing};
      }
      .gmeek-reveal.gmeek-visible { opacity:1; transform:none; }

      /* 加载遮罩 */
      #gmeek-loading-overlay {
        position:fixed; inset:0; background:${cfg.colors.overlayBg};
        display:flex; align-items:center; justify-content:center; z-index:9999;
        padding-top:env(safe-area-inset-top);
        padding-bottom:env(safe-area-inset-bottom);
      }
      #gmeek-loading-overlay .spinner {
        width:48px; height:48px; border:4px solid rgba(0,0,0,0.1);
        border-top-color:${cfg.colors.link}; border-radius:50%;
        animation:spin .8s linear infinite;
      }
      @keyframes spin { to { transform:rotate(360deg); } }

      /* 表单验证 */
      form.gmeek-form-error :invalid {
        border-color:#FF3B30; box-shadow:0 0 0 2px rgba(255,59,48,0.2);
      }

      /* 桌面平滑滚动 */
      @media (min-width:768px) {
        html { scroll-behavior:${cfg.smoothScroll ? 'smooth' : 'auto'}; }
      }

      /* 小屏适配 */
      @media (max-width:576px) {
        .container { padding:0 .5rem; }
        h1 { font-size:1.5rem; }
        p,li { margin-bottom:.75rem; }
      }

      /* 低性能设备禁用动画 */
      .gmeek-low-perf .parallax,
      .gmeek-low-perf .gmeek-reveal { transition:none !important; }
    `;
    var style = document.createElement('style');
    style.id = 'gmeek-custom-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // 4. 页面加载动画遮罩
  function setupLoader() {
    var overlay = document.createElement('div');
    overlay.id = 'gmeek-loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.documentElement.appendChild(overlay);
    window.addEventListener('load', function(){
      overlay.style.opacity = '0';
      setTimeout(function(){ overlay.remove(); }, 500);
    });
  }

  // 5. 视差 & 进场动画绑定
  function setupScrollEffects() {
    var items = document.querySelectorAll('.parallax, .gmeek-reveal');
    if (!items.length || !window.IntersectionObserver) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(ent){
        if (ent.isIntersecting) {
          ent.target.classList.add('gmeek-visible');
          if (ent.target.classList.contains('parallax')) {
            ent.target.style.transform = 'translateY(0)';
          }
          io.unobserve(ent.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach(function(el){ io.observe(el); });
  }

  // 6. 简易表单验证提示
  function enhanceForms() {
    document.querySelectorAll('form').forEach(function(f){
      f.addEventListener('submit', function(e){
        if (!f.checkValidity()) {
          e.preventDefault();
          f.classList.add('gmeek-form-error');
          var first = f.querySelector(':invalid');
          first && first.focus();
        }
      }, false);
    });
  }

  // 7. 初始化
  function init() {
    // 低性能设备判断
    var isLowPerf = navigator.deviceMemory && navigator.deviceMemory < 2;
    if (isLowPerf) document.documentElement.classList.add('gmeek-low-perf');

    injectStyles();
    setupLoader();
    setupScrollEffects();
    enhanceForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
