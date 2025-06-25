

# 一键安装阿里与 Cloudflare 的 DNS over HTTPS 设置（带图形界面 + 进度条 + 回滚）

随着网络安全与隐私的关注度不断提升，**DNS over HTTPS（DoH）** 正逐渐成为主流。它通过加密方式解析域名，避免被第三方窃听或篡改，尤其在公共 Wi-Fi 或复杂网络环境中非常有用。

这篇文章介绍我编写的一个 **图形化一键 `.bat` 安装器**，帮助 Windows 用户快速配置阿里与 Cloudflare 的 DoH 服务。支持：

✅ 安装配置  
🔄 刷新 DNS 缓存  
📡 显示当前网络接口  
♻️ 一键恢复默认设置  
📊 进度提示与交互

---

## 🧠 为什么选择阿里 + Cloudflare？

- **阿里 AliDNS（223.5.5.5 / 2400:3200::1）**：在中国大陆解析速度快，支持 IPv4 与 IPv6。
- **Cloudflare（1.1.1.1 / 2606:4700:4700::1111）**：全球 CDN 架构，DoH 表现出色，国际访问优秀。

这样组合可以保证国内服务快速，访问 GitHub、Cloudflare Pages 等国际平台也更稳定。

---

## 🔧 如何使用这个脚本？

1. 复制脚本内容，保存为 `dns_installer_plus.bat`

```markdown
@echo off
setlocal enabledelayedexpansion
title DNS DoH 配置助手 - 加强版
color 0A

:menu
cls
echo =============================================
echo        DNS over HTTPS 助手（阿里 + Cloudflare）
echo =============================================
echo.
echo  1. 安装 DoH 配置
echo  2. 刷新 DNS 缓存（ipconfig /flushdns）
echo  3. 显示网络接口名称
echo  4. 恢复默认 DNS 设置
echo  0. 退出
echo.
set /p choice= 请输入选项 [0-4]：

if "%choice%"=="1" goto install
if "%choice%"=="2" goto flushdns
if "%choice%"=="3" goto interfaces
if "%choice%"=="4" goto rollback
if "%choice%"=="0" exit
goto menu

:install
cls
echo [1/4] 正在设置 DNS 地址...
powershell -Command "Set-DnsClientServerAddress -InterfaceAlias '以太网' -ServerAddresses '223.5.5.5','1.1.1.1','2400:3200::1','2606:4700:4700::1111'" >nul

echo [2/4] 添加 DoH 模板...
powershell -Command ^
"Add-DnsClientDohServerAddress -ServerAddress '223.5.5.5' -DohTemplate 'https://dns.alidns.com/dns-query' -AllowFallbackToUdp $true -AutoUpgrade $true; ^
 Add-DnsClientDohServerAddress -ServerAddress '2400:3200::1' -DohTemplate 'https://dns.alidns.com/dns-query' -AllowFallbackToUdp $true -AutoUpgrade $true; ^
 Add-DnsClientDohServerAddress -ServerAddress '1.1.1.1' -DohTemplate 'https://cloudflare-dns.com/dns-query' -AllowFallbackToUdp $true -AutoUpgrade $true; ^
 Add-DnsClientDohServerAddress -ServerAddress '2606:4700:4700::1111' -DohTemplate 'https://cloudflare-dns.com/dns-query' -AllowFallbackToUdp $true -AutoUpgrade $true" >nul

echo [3/4] 启用 DoH 设置...
powershell -Command ^
"Set-DnsClientDohServerAddress -ServerAddress '223.5.5.5' -DohTemplate 'https://dns.alidns.com/dns-query' -AllowFallbackToUdp $true -AutoUpgrade $true; ^
 Set-DnsClientDohServerAddress -ServerAddress '2400:3200::1' -DohTemplate 'https://dns.alidns.com/dns-query' -AllowFallbackToUdp $true -AutoUpgrade $true; ^
 Set-DnsClientDohServerAddress -ServerAddress '1.1.1.1' -DohTemplate 'https://cloudflare-dns.com/dns-query' -AllowFallbackToUdp $true -AutoUpgrade $true; ^
 Set-DnsClientDohServerAddress -ServerAddress '2606:4700:4700::1111' -DohTemplate 'https://cloudflare-dns.com/dns-query' -AllowFallbackToUdp $true -AutoUpgrade $true" >nul

echo [4/4] 配置完成！
mshta "javascript:alert('✅ DoH 配置完成！访问 https://1.1.1.1/help 进行验证。');close();"
goto menu

:flushdns
cls
echo 正在刷新本地 DNS 缓存...
ipconfig /flushdns
pause
goto menu

:interfaces
cls
echo 当前网络接口名称如下：
powershell -Command "Get-NetAdapter | Select-Object Name,Status,MacAddress | Format-Table -AutoSize"
echo.
pause
goto menu

:rollback
cls
echo 正在恢复默认 DNS 设置并清理 DoH...
powershell -Command "Get-NetAdapter | ForEach-Object { Set-DnsClientServerAddress -InterfaceAlias $_.Name -ResetServerAddresses }"
powershell -Command "Get-DnsClientDohServerAddress | ForEach-Object { Remove-DnsClientDohServerAddress -ServerAddress $_.ServerAddress -ErrorAction SilentlyContinue }"
mshta "javascript:alert('✔️ 已还原为默认 DNS。');close();"
goto menu
```

2. **以管理员身份运行**
3. 选择操作，自动完成所有配置：
```text
1. 安装 DoH 配置（阿里 + Cloudflare）
2. 刷新 DNS 缓存
3. 显示网络接口名称
4. 恢复默认 DNS
0. 退出
```

所有设置均通过 PowerShell 后台执行，无需用户手动输入 IP、模板地址或命令。

---

## 📜 脚本功能详解

### ✅ 安装 DoH 配置

- 设置 IPv4 + IPv6 DNS 地址
- 注册并启用 DoH 模板（`https://dns.alidns.com/dns-query` 与 `https://cloudflare-dns.com/dns-query`）
- 启用 UDP 回退与自动升级选项

### 🔄 刷新 DNS 缓存

执行 `ipconfig /flushdns` 命令，解决 DNS 缓存问题、刷新生效设置。

### 📡 查看网络接口名称

帮助用户确认当前系统网卡名称，便于个性化调整脚本中的 `"以太网"` 或 `"Wi-Fi"`。

### ♻️ 回滚设置

- 清除所有已注册的 DoH 配置
- 恢复 DNS 为“自动获取”

---

## 🧪 验证是否生效

访问以下任意地址：
- [https://1.1.1.1/help](https://1.1.1.1/help)
- [https://dns.alidns.com/resolve?name=example.com&type=A](https://dns.alidns.com/resolve?name=example.com&type=A)

显示 `Using DNS over HTTPS (DoH): Yes` 即代表启用成功！

---

## 🎯 总结

这个脚本适合希望“开箱即用”的 DoH 配置用户，避免频繁点选系统设置。你也可以基于它拓展更多功能：

- 自定义 DNS 优先级
- 多语言菜单
- 打包成 `.exe`，加图标和自动检测权限

---

📌 博客地址：[code博客](https://code.buxiantang.top)

欢迎改进、PR 或留言交流！你在使用中遇到任何兼容问题，也欢迎给我反馈，我会持续更新 ☕✨

---
