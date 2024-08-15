function loadResource(type, attributes) {
   if (type === 'style') {
       const style = document.createElement('style');
       style.textContent = attributes.css;
       document.head.appendChild(style);
   }
}

function createTOC() {
   const tocElement = document.createElement('div');
   tocElement.className = 'toc';
   const contentContainer = document.querySelector('.markdown-body');
   contentContainer.appendChild(tocElement);

   const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
   headings.forEach(heading => {
       if (!heading.id) {
           heading.id = heading.textContent.trim().replace(/\s+/g, '-').toLowerCase();
       }
       const link = document.createElement('a');
       link.href = '#' + heading.id;
       link.textContent = heading.textContent;
       link.className = 'toc-link';
       link.style.paddingLeft = `${(parseInt(heading.tagName.charAt(1)) - 1) * 10}px`;
       link.addEventListener('click', function(e) {
           e.preventDefault();
           const targetElement = document.getElementById(heading.id);
           if (targetElement) {
               targetElement.scrollIntoView({ behavior: 'smooth' });
           }
           toggleTOC(); // 点击后关闭目录
       });
       tocElement.appendChild(link);
   });
}

function toggleTOC() {
   const tocElement = document.querySelector('.toc');
   const tocIcon = document.querySelector('.toc-icon');
   if (tocElement) {
       tocElement.classList.toggle('show');
       tocIcon.classList.toggle('active');
       tocIcon.innerHTML = tocElement.classList.contains('show') 
           ? '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>'
           : '<svg viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
   }
}

document.addEventListener("DOMContentLoaded", function() {
   createTOC();
   const css = `
       :root {
           --toc-bg: rgba(255, 255, 255, 0.8);
           --toc-border: #e1e4e8;
           --toc-text: #24292e;
           --toc-hover: rgba(0, 0, 0, 0.05);
           --toc-icon-bg: rgba(255, 255, 255, 0.8);
           --toc-icon-color: #333;
           --toc-icon-active-bg: #fff;
           --toc-icon-active-color: #333;
       }

       @media (prefers-color-scheme: dark) {
           :root {
               --toc-bg: rgba(45, 51, 59, 0.8);
               --toc-border: #444c56;
               --toc-text: #adbac7;
               --toc-hover: rgba(255, 255, 255, 0.05);
               --toc-icon-bg: rgba(45, 51, 59, 0.8);
               --toc-icon-color: #adbac7;
               --toc-icon-active-bg: #2d333b;
               --toc-icon-active-color: #adbac7;
           }
       }

       .toc {
           position: fixed;
           bottom: 80px;
           right: 20px;
           width: 250px;
           max-height: 70vh;
           background-color: var(--toc-bg);
           border: 1px solid var(--toc-border);
           border-radius: 6px;
           padding: 10px;
           box-shadow: 0 2px 10px rgba(0,0,0,0.1);
           overflow-y: auto;
           z-index: 1000;
           opacity: 0;
           visibility: hidden;
           transform: translateY(20px);
           transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
           backdrop-filter: blur(5px);
       }
       .toc.show {
           opacity: 1;
           visibility: visible;
           transform: translateY(0);
       }
       .toc a {
           display: block;
           color: var(--toc-text);
           text-decoration: none;
           padding: 5px 0;
           font-size: 14px;
           line-height: 1.5;
           border-bottom: 1px solid var(--toc-border);
           transition: background-color 0.2s ease, padding-left 0.2s ease;
       }
       .toc a:last-child {
           border-bottom: none;
       }
       .toc a:hover {
           background-color: var(--toc-hover);
           padding-left: 5px;
       }
       .toc-icon {
           position: fixed;
           bottom: 20px;
           right: 20px;
           cursor: pointer;
           background-color: var(--toc-icon-bg);
           color: var(--toc-icon-color);
           border-radius: 50%;
           width: 50px;
           height: 50px;
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: 0 2px 10px rgba(0,0,0,0.1);
           z-index: 1001;
           transition: all 0.3s ease;
           user-select: none;
           -webkit-tap-highlight-color: transparent;
           outline: none;
       }
       .toc-icon:hover {
           transform: scale(1.1);
           background-color: var(--toc-icon-active-bg);
       }
       .toc-icon:active {
           transform: scale(0.9);
       }
       .toc-icon.active {
           background-color: var(--toc-icon-active-bg);
           color: var(--toc-icon-active-color);
       }
       .toc-icon svg {
           width: 24px;
           height: 24px;
           fill: none;
           stroke: currentColor;
           stroke-width: 2;
           stroke-linecap: round;
           stroke-linejoin: round;
       }
   `;
   loadResource('style', {css: css});

   const tocIcon = document.createElement('div');
   tocIcon.className = 'toc-icon';
   tocIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
   tocIcon.onclick = (e) => {
       e.stopPropagation();
       toggleTOC();
   };
   document.body.appendChild(tocIcon);

   document.addEventListener('click', (e) => {
       const tocElement = document.querySelector('.toc');
       if (tocElement && tocElement.classList.contains('show') && !tocElement.contains(e.target) && !e.target.classList.contains('toc-icon')) {
           toggleTOC();
       }
   });
});
