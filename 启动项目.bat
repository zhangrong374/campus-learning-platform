@echo off
title Campus Learning Platform
echo ========================================
echo   校园学习规划平台
echo ========================================
echo.
echo 正在启动服务...
echo.

start "后端服务器" cmd /k "cd /d %~dp0backend && echo 后端启动中... && node simple-server.js"

timeout /t 3 /nobreak >nul

start "前端服务器" cmd /k "cd /d %~dp0frontend && echo 前端启动中... && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   服务启动完成！
echo ========================================
echo.
echo 后端地址: http://localhost:3005
echo 前端地址: http://localhost:5173
echo.
echo 正在打开浏览器...
start http://localhost:5173
echo.
echo 按任意键关闭此窗口（前后端服务仍会继续运行）
pause
