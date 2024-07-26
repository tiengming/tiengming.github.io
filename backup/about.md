`Gmeek-html
    <div align="center">
    # 关于我 

    ![favicon](https://code.buxiantang.top/favicon.svg)

    ## Tiengming
    </div>
`

职业：夕阳地质工程行业
兼职：出道仙

正如博客首页写的那样：

> 发现世界上所有美好的事物，分享有趣的东西

我有一个渴望好奇的心，对世界新鲜未知的事物充满兴趣。我是陕南人，具备南北汉子的双重特点。

`Gmeek-html
    <div align="center">
    ## 我的专业技能 
    </div>
`
`Gmeek-html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>我的网页</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
        <style>
            body {
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 0;
                background-color: #f0f0f0;
                display: flex;
                flex-direction: column;
                min-height: 100vh; /* 将最小高度设置为100vh */
                justify-content: center; /* 内容居中对齐 */
            }
            .user-skills {
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
                margin: 20px auto; /* 调整外边距减少高度 */
                max-width: 800px; 
                text-align: center;
                background-color: #fff; 
                padding: 15px; /* 调整内边距 */
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .user-skills h2 {
                width: 100%;
                font-size: 1.5rem; /* 减小标题字体大小 */
                margin-bottom: 15px; /* 减小标题底部间距 */
                color: #333; 
            }
            .user-skill {
                text-align: center;
                width: 100px; /* 每个技能的宽度 */
                margin: 10px; /* 技能之间的间距 */
                animation: userSkillFadeInUp 1s ease-out;
                transition: transform 0.3s; 
            }
            .user-skill-icon {
                font-size: 2.5rem; /* 图标的大小 */
                margin-bottom: 10px; 
                transition: transform 0.3s; 
            }
            .user-skill:hover .user-skill-icon {
                transform: scale(1.2); 
            }
            @keyframes userSkillFadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0); 
                }
            }
            a {
                text-decoration: none;
                color: inherit;
            }
            .button {
                display: inline-block;
                padding: 10px 15px; /* 调整按钮的内边距 */
                font-size: 0.9rem; /* 减小按钮的字体大小 */
                color: #fff;
                background-color: #007BFF;
                border: none;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                transition: background-color 0.3s, transform 0.2s;
                cursor: pointer;
                margin: 10px 0; /* 减小顶部和底部的间距 */
            }
            .button:hover {
                background-color: #0056b3;
            }
            .button:active {
                transform: scale(0.95);
            }
            .footer {
                text-align: center;
                margin: 10px 0; /* 减小底部间距 */
            }

            /* 媒体查询：在小屏幕（例如手机）时，调整布局为双列显示 */
            @media (max-width: 600px) {
                .user-skill {
                    width: calc(50% - 20px); /* 每个技能项宽度为50%减去间距 */
                    margin: 10px 0; /* 减小技能项之间的间距 */
                }
            }

            /* 中大屏幕时，保持一行显示 */
            @media (min-width: 601px) {
                .user-skill {
                    width: 100px; /* 恢复到默认的宽度 */
                }
            }
        </style>
    </head>
    <body>
        <div class="user-skills">
            <h2>我的专业技能</h2>
            <div class="user-skill">
                <a href="https://code.buxiantang.top/post/di-zhi-gong-cheng.html" target="_blank">
                    <div class="user-skill-icon"><i class="fa-solid fa-mountain-sun" style="color: #FFD43B;"></i></div>
                    <p>地质工程</p>
                </a>
            </div>
            <div class="user-skill">
                <a href="https://buxiantang.top" target="_blank">
                    <div class="user-skill-icon"><i class="fa-solid fa-yin-yang"></i></div>
                    <p>出道仙</p>
                </a>
            </div>
            <div class="user-skill">
                <a href="https://nav.buxiantang.top" target="_blank">
                    <div class="user-skill-icon"><i class="fa-solid fa-robot" style="color: #3678ce;"></i></div>
                    <p>AI</p>
                </a>
            </div>
            <div class="user-skill">
                <a href="https://code.buxiantang.top" target="_blank">
                    <div class="user-skill-icon"><i class="fa-solid fa-code" style="color: #B197FC;"></i></div>
                    <p>Code</p>
                </a>
            </div>
        </div>
        <div class="footer">
            <a href="https://nav.buxiantang.top" target="_blank">
                <button class="button">网址导航</button>
            </a>
        </div>
    </body>
    </html>
`