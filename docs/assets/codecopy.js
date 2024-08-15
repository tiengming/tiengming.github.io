document.addEventListener("DOMContentLoaded", function() {
    // 加载Clipboard.js库
    let clipboardScript = document.createElement('script');
    clipboardScript.type = 'text/javascript';
    clipboardScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js';
    document.body.appendChild(clipboardScript);

    // 加载Highlight.js库
    let highlightScript = document.createElement('script');
    highlightScript.type = 'text/javascript';
    highlightScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js';
    document.body.appendChild(highlightScript);

    // 加载Highlight.js样式
    let highlightStyle = document.createElement('link');
    highlightStyle.rel = 'stylesheet';
    highlightStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/github.min.css';
    document.head.appendChild(highlightStyle);

    // 样式
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

        /* Highlight.js overrides */
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
        // 处理代码块
        function processCodeBlocks() {
            var codeBlocks = document.querySelectorAll('pre.notranslate');

            codeBlocks.forEach((codeBlock) => {
                if (codeBlock.querySelector('.copy-button')) {
                    return; // 如果已经处理过，就跳过
                }

                var copyButton = createCopyButton();
                var feedbackElement = createFeedbackElement();

                codeBlock.appendChild(copyButton);
                codeBlock.appendChild(feedbackElement);

                // 初始化Clipboard.js
                var clipboard = new ClipboardJS(copyButton, {
                    target: function(trigger) {
                        return trigger.parentElement.querySelector('code');
                    }
                });

                // 监听成功事件
                clipboard.on('success', function(e) {
                    handleCopySuccess(feedbackElement);
                    e.clearSelection();
                });

                // 监听代码块hover事件
                codeBlock.addEventListener('mouseenter', function() {
                    copyButton.style.opacity = '1';
                });

                codeBlock.addEventListener('mouseleave', function() {
                    copyButton.style.opacity = '0';
                });

                // 确保代码高亮
                highlightCodeBlock(codeBlock);
            });
        }

        function highlightCodeBlock(codeBlock) {
            var codeElement = codeBlock.querySelector('code');
            if (!codeElement) return;

            // 保存原始代码
            var originalCode = codeElement.textContent;

            // 尝试检测语言
            var language = detectLanguage(originalCode);

            // 应用高亮
            if (language) {
                codeElement.classList.add('language-' + language);
                hljs.highlightElement(codeElement);
            } else {
                hljs.highlightAuto(codeElement);
            }
        }

        function detectLanguage(code) {
            // 这里可以添加更多的语言检测逻辑
            if (code.includes('function') || code.includes('var ') || code.includes('let ') || code.includes('const ')) {
                return 'javascript';
            }
            if (code.includes('def ') || code.includes('import ') || code.includes('class ')) {
                return 'python';
            }
            // 添加更多语言的检测逻辑...
            return null;
        }

        // 初始处理
        processCodeBlocks();

        // 监听DOM变化
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    processCodeBlocks();
                }
            });
        });

        observer.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['style', 'class'] 
        });

        // 监听可能的折叠/展开事件
        document.body.addEventListener('click', function(event) {
            // 这里可以添加特定于您网站的折叠/展开逻辑
            setTimeout(processCodeBlocks, 100); // 稍微延迟以确保DOM已更新
        });
    });

    // 创建复制按钮
    function createCopyButton() {
        var button = document.createElement('button');
        button.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon">
                <path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
            </svg>
        `;
        button.classList.add('copy-button');
        return button;
    }

    // 创建反馈元素
    function createFeedbackElement() {
        var feedback = document.createElement('div');
        feedback.textContent = 'Copied!';
        feedback.classList.add('copy-feedback');
        return feedback;
    }

    // 复制成功后操作
    function handleCopySuccess(feedbackElement) {
        feedbackElement.classList.add('show');
        setTimeout(function() {
            feedbackElement.classList.remove('show');
        }, 2000);
    }
});
