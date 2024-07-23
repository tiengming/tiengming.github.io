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
    var contentContainer = document.getElementById('content');
    if (contentContainer.firstChild) {
        contentContainer.insertBefore(tocElement, contentContainer.firstChild);
    } else {
        contentContainer.appendChild(tocElement);
    }

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

function onScroll() {
    var tocLinks = document.querySelectorAll('.toc a');
    var fromTop = window.scrollY;

    for (var i = 0; i < tocLinks.length; i++) {
        var currentLink = tocLinks[i];
        var refElement = document.querySelector(currentLink.hash);
        if (
            refElement.offsetTop <= fromTop &&
            refElement.offsetTop + refElement.offsetHeight > fromTop
        ) {
            currentLink.classList.add('active');
        } else {
            currentLink.classList.remove('active');
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    createTOC();
    var css = `
        .toc {
            position: fixed;
            top: 130px;
            left: 50%;
            transform: translateX(-50%);
            width: 20%;
            max-width: 300px;
            background-color: #f9f9f9;
            border-right: 1px solid #eee;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow-y: auto;
            height: calc(100vh - 130px);
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
        @media (max-width: 1249px) {
            .toc {
                position: static;
                width: 100%;
                max-width: none;
                height: auto;
                box-shadow: none;
                border-right: none;
            }
        }
    `;
    loadResource('style', {css: css});

    // 监听滚动事件
    window.addEventListener('scroll', onScroll);
});
