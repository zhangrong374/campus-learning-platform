@echo off
chcp 65001 >nul
title 校园学习规划平台 - 一键启动

echo ========================================
echo   校园学习规划平台
echo   一键启动
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/5] 清理端口...
taskkill /F /IM node.exe >nul 2>&1
echo ✅ 已清理旧进程

echo.
echo [步骤 2/5] 初始化数据库...
cd backend
node init-users.js
echo ✅ 数据库就绪

echo.
echo [步骤 3/5] 启动后端服务器...
start "后端服务器-3006" cmd /k "cd /d %~dp0backend && title 后端服务器 && node simple-server.js"
echo ✅ 后端启动中...
timeout /t 3 /nobreak >nul

echo.
echo [步骤 4/5] 检查后端状态...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3006/api/health' -UseBasicParsing -TimeoutSec 10; Write-Host '✅ 后端运行正常:' $r.Content } catch { Write-Host '❌ 后端未响应，请检查' }"
timeout /t 2 /nobreak >nul

echo.
echo [步骤 5/5] 启动前端服务器...
cd ..\frontend
start "前端服务器-5173" cmd /k "cd /d %~dp0frontend && title 前端服务器 && npm run dev"
echo ✅ 前端启动中...

echo.
timeout /t 5 /nobreak >nul

echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 📱 访问地址: http://localhost:5173
echo.
echo 👤 测试账号:
echo   学生: student1 / 123456
echo   管理员: admin / 123456
echo.
echo 💡 提示:
echo   - 请保持两个终端窗口打开
echo   - 后端端口: 3006
echo   - 前端端口: 5173
echo.

echo 正在打开浏览器...
start http://localhost:5173

echo.
echo 如果遇到问题，请检查:
echo 1. 后端终端窗口是否有错误
echo 2. 前端终端窗口是否有错误
echo 3. 浏览器F12控制台是否有错误
echo.
pause
