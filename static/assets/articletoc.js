function loadResource(type, attributes) {
    var element;
    if (type === 'style') {
        element = document.createElement('style');
        element.rel = 'stylesheet';
        element.appendChild(document.createTextNode(attributes.css));
        document.head.appendChild(element);
    }
}

function createTOC() {
    var tocElement = document.createElement('div');
    tocElement.className = 'toc';
    var contentContainer = document.querySelector('.markdown-body');
    contentContainer.appendChild(tocElement);

    // 生成目录项
    var headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(function(heading) {
        if (!heading.id) {
            heading.id = heading.textContent.trim().replace(/\s+/g, '-').toLowerCase();
        }
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        link.className = 'toc-link';
        var level = parseInt(heading.tagName.replace('H', ''), 10);
        link.style.marginLeft = (level - 1) * 20 + 'px';
        tocElement.appendChild(link);
    });
}

function toggleTOC() {
    var tocElement = document.querySelector('.toc');
    var tocIcon = document.querySelector('.toc-icon');
    if (tocElement) {
        tocElement.style.display = tocElement.style.display === 'block' ? 'none' : 'block';
        tocElement.style.transition = 'display 0.3s ease';
        tocIcon.textContent = tocElement.style.display === 'block' ? '✖' : '☰';
    }
}

function outsideClick(e) {
    var tocElement = document.querySelector('.toc');
    var tocIcon = document.querySelector('.toc-icon');
    if (!tocElement.contains(e.target) && !tocIcon.contains(e.target)) {
        toggleTOC();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    createTOC();
    var css = `
        .toc {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 250px; /* 增加宽度 */
            max-width: 350px; /* 增加最大宽度 */
            background-color: #f9f9f9;
            border: 1px solid #ddd; /* 添加边框 */
            border-radius: 5px; /* 添加圆角 */
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2); /* 增加阴影 */
            overflow-y: auto;
            z-index: 1000;
            display: none; /* 默认不显示 */
            transition: display 0.3s ease; /* 添加过渡动画 */
        }
        .toc a {
            display: block;
            color: black;
            text-decoration: none;
            padding: 5px;
            border-bottom: 1px solid #eee; /* 添加分隔线 */
        }
        .toc a:hover, .toc a.active {
            background-color: #e9e9e9;
        }
        .toc a:last-child {
            border-bottom: none; /* 移除最后一个元素的边框 */
        }
        .toc-icon {
            position: fixed;
            bottom: 20px;
            right: 20px;
            cursor: pointer;
            font-size: 24px; /* 增大图标字体大小 */
            background-color: #fff; /* 添加背景色 */
            border: 1px solid #ddd; /* 添加边框 */
            border-radius: 5px; /* 添加圆角 */
            padding: 5px; /* 添加内边距 */
            box-shadow: 0 1px 3px rgba(0,0,0,0.2); /* 添加阴影 */
            z-index: 1001;
        }
    `;
    loadResource('style', {css: css});

    // 创建目录图标
    var tocIcon = document.createElement('div');
    tocIcon.className = 'toc-icon';
    tocIcon.textContent = '☰'; // 使用 Unicode 字符作为图标
    tocIcon.onclick = toggleTOC;
    document.body.appendChild(tocIcon);

    // 监听点击事件，点击非目录区域关闭目录
    document.addEventListener('click', outsideClick);
});
