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
    tocElement.style.display = 'none'; // 默认不显示目录
    var contentContainer = document.getElementById('content');
    contentContainer.appendChild(tocElement);

    // 生成目录项
    var headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6');
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
    if (tocElement.style.display === 'none') {
        tocElement.style.display = 'block';
    } else {
        tocElement.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    createTOC();
    var css = `
        .toc {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 200px;
            max-width: 300px;
            background-color: #f9f9f9;
            border: 1px solid #eee;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow-y: auto;
            z-index: 1000;
        }
        .toc a {
            display: block;
            color: black;
            text-decoration: none;
            padding: 5px;
        }
        .toc a:hover, .toc a.active {
            background-color: #ddd;
        }
        .toc-icon {
            position: fixed;
            bottom: 20px;
            right: 20px;
            cursor: pointer;
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
});
