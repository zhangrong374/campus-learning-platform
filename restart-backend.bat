@echo off
chcp 65001 >nul
echo 正在重启后端服务...

echo 1. 停止旧的后端进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3006 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
    echo 已停止进程 %%a
)

echo 2. 等待端口释放...
timeout /t 2 /nobreak >nul

echo 3. 启动新的后端服务...
cd /d %~dp0backend
start "后端服务器" cmd /k "node simple-server.js"

echo 后端服务已启动！
pause
