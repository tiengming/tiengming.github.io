document.addEventListener("DOMContentLoaded", function() {
    // 加载Clipboard.js库
    let clipboardScript = document.createElement('script');
    clipboardScript.type = 'text/javascript';
    clipboardScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js';
    document.body.appendChild(clipboardScript);

    // 样式
    let style = document.createElement('style');
    style.innerHTML = `
        .markdown-body .highlight pre, .markdown-body pre {
            position: relative;
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
    `;
    document.head.appendChild(style);

    clipboardScript.onload = function() {
        // 获取所有代码块
        var codeBlocks = document.querySelectorAll('pre.notranslate');

        // 遍历
        codeBlocks.forEach((codeBlock) => {
            // 创建复制按钮
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
        });
    };

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
