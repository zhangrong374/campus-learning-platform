@echo off
title Campus Learning Platform - Backend
cd /d c:\Users\DELL\CodeBuddy\route1\backend
echo ========================================
echo   后端服务器启动中...
echo   端口: 3003
echo ========================================
node src/server.js
if errorlevel 1 (
    echo.
    echo 后端启动失败！
    pause
)
