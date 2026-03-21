@echo off
title Campus Learning Platform - Frontend
cd /d c:\Users\DELL\CodeBuddy\route1\frontend
echo ========================================
echo   前端服务器启动中...
echo   端口: 5173
echo ========================================
start http://localhost:5173
npm run dev
