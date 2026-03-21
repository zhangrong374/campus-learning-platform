@echo off
chcp 65001 >nul
title Git + Vercel 部署指南

echo ========================================
echo   GitHub + Vercel 部署
echo ========================================
echo.

echo [步骤 1/4] 初始化 Git 仓库...
if not exist ".git" (
    git init
    echo ✅ Git 仓库已初始化
) else (
    echo ℹ️  Git 仓库已存在
)
echo.

echo [步骤 2/4] 添加文件到 Git...
git add .
if %errorlevel% neq 0 (
    echo ❌ Git add 失败
    pause
    exit /b 1
)
echo ✅ 文件已添加
echo.

echo [步骤 3/4] 创建提交...
set /p commit_msg="请输入提交信息 (默认: Update code): "
if "%commit_msg%"=="" set commit_msg=Update code

git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo ❌ Git commit 失败
    pause
    exit /b 1
)
echo ✅ 提交成功: %commit_msg%
echo.

echo [步骤 4/4] 推送到 GitHub...
echo.
echo ℹ️  请按照以下步骤操作：
echo.
echo 1. 在 GitHub 创建新仓库:
echo    https://github.com/new
echo    仓库名: campus-learning-platform
echo.
echo 2. 添加远程仓库并推送:
echo    git remote add origin https://github.com/YOUR_USERNAME/campus-learning-platform.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. 在 Vercel 导入项目:
echo    https://vercel.com/new
echo    选择 GitHub 仓库
echo    配置环境变量后点击 Deploy
echo.
echo ========================================
echo   下一步:
echo   1. 将代码推送到 GitHub
echo   2. 在 Vercel 导入项目
echo   3. 配置数据库环境变量
echo   4. 等待部署完成
echo ========================================
echo.
echo 📖 详细文档: DEPLOY-GITHUB-VERCEL.md
echo.
pause
