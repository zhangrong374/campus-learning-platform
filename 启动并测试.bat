@echo off
chcp 65001 >nul
title 校园学习规划平台 - 启动并测试

echo ========================================
echo   校园学习规划平台
echo   启动并测试
echo ========================================
echo.

echo [1/4] 检查数据库连接...
cd backend
node init-users.js
echo ✅ 数据库初始化完成

echo.
echo [2/4] 启动后端服务器...
start "后端服务器" cmd /k "cd /d %~dp0backend && echo 后端启动中... && node simple-server.js"

echo 等待后端启动...
timeout /t 5 /nobreak >nul

echo.
echo [3/4] 测试后端API...
node test-login.js
echo ✅ 后端API测试完成

echo.
echo [4/4] 启动前端服务器...
start "前端服务器" cmd /k "cd /d %~dp0frontend && echo 前端启动中... && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 后端地址: http://localhost:3006
echo 前端地址: http://localhost:5173
echo.
echo 测试账号:
echo   学生: student1 / 123456
echo   管理员: admin / 123456
echo.
echo 正在打开浏览器...
start http://localhost:5173

echo.
echo 如果登录或注册失败，请检查后端终端窗口的错误信息
echo.
pause
