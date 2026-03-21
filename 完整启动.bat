@echo off
chcp 65001 >nul
title 校园学习规划平台 - 完整启动

echo ========================================
echo   校园学习规划平台
echo   完整启动
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/7] 清理端口...
taskkill /F /IM node.exe >nul 2>&1
echo ✅ 已清理旧进程

echo.
echo [步骤 2/7] 初始化数据库用户...
cd backend
node init-users.js
if errorlevel 1 (
    echo ⚠️ 用户初始化有警告，继续执行...
)

echo.
echo [步骤 3/7] 修复表结构...
node fix-tables.js
echo ✅ 表结构就绪

echo.
echo [步骤 4/7] 创建缺失的表...
node create-missing-tables.js
echo ✅ 数据表就绪

echo.
echo [步骤 5/7] 初始化测试数据...
node init-data.js
echo ✅ 测试数据就绪

echo.
echo [步骤 6/7] 启动后端服务器...
start "后端服务器-3006" cmd /k "cd /d %~dp0backend && title 后端服务器 && node simple-server.js"
echo ✅ 后端启动中...
timeout /t 3 /nobreak >nul

echo.
echo [步骤 7/7] 测试后端API...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3006/api/health' -UseBasicParsing -TimeoutSec 10; Write-Host '✅ 后端运行正常:' $r.Content } catch { Write-Host '❌ 后端未响应，请检查' }"
timeout /t 2 /nobreak >nul

echo.
echo [步骤 8/8] 启动前端服务器...
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
echo 🔧 后端地址: http://localhost:3006
echo.
echo 👤 测试账号:
echo   学生: student1 / 123456
echo   管理员: admin / 123456
echo.
echo 💡 已准备:
echo   ✅ 8 门课程
echo   ✅ 7 个社团
echo   ✅ 6 个活动
echo   ✅ 5 个帖子
echo.
echo 正在打开浏览器...
start http://localhost:5173

echo.
echo 🔍 如果遇到问题:
echo   1. 检查后端终端窗口是否有错误
echo   2. 检查前端终端窗口是否有错误
echo   3. 打开浏览器F12查看控制台错误
echo   4. 访问 http://localhost:5173/api-test.html 测试API
echo.
pause
