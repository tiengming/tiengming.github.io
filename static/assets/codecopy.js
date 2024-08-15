document.addEventListener("DOMContentLoaded", function() {
    // 加载Clipboard.js库
    let clipboardScript = document.createElement('script');
    clipboardScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js';
    document.body.appendChild(clipboardScript);

    // 加载Highlight.js库
    let highlightScript = document.createElement('script');
    highlightScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js';
    document.body.appendChild(highlightScript);

    // 加载Highlight.js样式
    let highlightStyle = document.createElement('link');
    highlightStyle.rel = 'stylesheet';
    highlightStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/github.min.css';
    document.head.appendChild(highlightStyle);

    // 添加自定义样式
    let style = document.createElement('style');
    style.innerHTML = `
        .markdown-body .highlight pre, .markdown-body pre {
            position: relative;
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
        }
        .copy-button {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: rgba(255, 255, 255, 0.8);
            border: none;
            cursor: pointer;
            border-radius: 4px;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease, background-color 0.3s ease;
        }
        pre.notranslate:hover .copy-button {
            opacity: 1;
        }
        .copy-button:hover {
            background-color: rgba(255, 255, 255, 1);
        }
        .copy-button svg {
            width: 16px;
            height: 16px;
        }
        .copy-feedback {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .copy-feedback.show {
            opacity: 1;
        }
        .hljs {
            background: transparent !important;
            padding: 0 !important;
        }
    `;
    document.head.appendChild(style);

    // 等待所有脚本加载完成
    Promise.all([
        new Promise(resolve => clipboardScript.onload = resolve),
        new Promise(resolve => highlightScript.onload = resolve)
    ]).then(() => {
        // 初始化Highlight.js
        hljs.configure({ignoreUnescapedHTML: true});

        function processCodeBlocks() {
            const codeBlocks = document.querySelectorAll('pre.notranslate');
            codeBlocks.forEach((block) => {
                if (!block.querySelector('.copy-button')) {
                    const copyButton = createCopyButton();
                    const feedbackElement = createFeedbackElement();
                    block.appendChild(copyButton);
                    block.appendChild(feedbackElement);

                    new ClipboardJS(copyButton, {
                        target: (trigger) => trigger.parentElement.querySelector('code')
                    }).on('success', (e) => {
                        handleCopySuccess(feedbackElement);
                        e.clearSelection();
                    });

                    block.addEventListener('mouseenter', () => copyButton.style.opacity = '1');
                    block.addEventListener('mouseleave', () => copyButton.style.opacity = '0');
                }

                const codeElement = block.querySelector('code');
                if (codeElement && !codeElement.classList.contains('hljs')) {
                    hljs.highlightElement(codeElement);
                }
            });
        }

        // 初始处理
        processCodeBlocks();

        // 监听DOM变化
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || 
                    (mutation.type === 'attributes' && 
                     (mutation.attributeName === 'style' || mutation.attributeName === 'class'))) {
                    shouldProcess = true;
                }
            });
            if (shouldProcess) {
                processCodeBlocks();
            }
        });

        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['style', 'class'] 
        });

        // 监听可能的折叠/展开事件
        document.body.addEventListener('click', (event) => {
            // 检查是否点击了折叠/展开按钮
            if (event.target.closest('.collapse-button')) {
                setTimeout(processCodeBlocks, 100);
            }
        });
    });

    function createCopyButton() {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon">
                <path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
            </svg>
        `;
        button.classList.add('copy-button');
        return button;
    }

    function createFeedbackElement() {
        const feedback = document.createElement('div');
        feedback.textContent = 'Copied!';
        feedback.classList.add('copy-feedback');
        return feedback;
    }

    function handleCopySuccess(feedbackElement) {
        feedbackElement.classList.add('show');
        setTimeout(() => feedbackElement.classList.remove('show'), 2000);
    }
});
