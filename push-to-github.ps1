# 推送项目到 GitHub 并触发自动构建
# 使用方法: .\push-to-github.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  准备推送到 GitHub" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 是否安装
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未检测到 Git，请先安装 Git" -ForegroundColor Red
    Write-Host "下载地址: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# 检查是否是 Git 仓库
if (!(Test-Path ".git")) {
    Write-Host "错误: 当前目录不是 Git 仓库" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先初始化 Git 仓库:" -ForegroundColor Yellow
    Write-Host "  git init"
    Write-Host "  git remote add origin https://github.com/mesakurax/AI_Travel_Planner.git"
    exit 1
}

Write-Host "✓ Git 环境检查通过" -ForegroundColor Green
Write-Host ""

# 显示当前状态
Write-Host "当前修改的文件:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 确认推送
$confirm = Read-Host "确认推送这些更改到 GitHub? (y/n)"

if ($confirm -ne "y") {
    Write-Host "已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "步骤 1/3: 添加所有文件..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 添加文件失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 文件已添加" -ForegroundColor Green

Write-Host ""
Write-Host "步骤 2/3: 提交更改..." -ForegroundColor Yellow
$commitMessage = Read-Host "请输入提交信息 (直接回车使用默认信息)"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "添加 Docker 支持和自动化部署配置"
}

git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 提交失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 更改已提交" -ForegroundColor Green

Write-Host ""
Write-Host "步骤 3/3: 推送到 GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ 推送失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. 未设置远程仓库: git remote add origin <仓库地址>"
    Write-Host "2. 需要先拉取: git pull origin main --rebase"
    Write-Host "3. 认证失败: 需要配置 GitHub 访问令牌"
    Write-Host ""
    Write-Host "详细帮助: https://docs.github.com/cn/get-started/getting-started-with-git/about-remote-repositories" -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ 推送成功！" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  🎉 成功推送到 GitHub!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "接下来的步骤:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 查看自动构建进度:" -ForegroundColor Cyan
Write-Host "   访问: https://github.com/mesakurax/AI_Travel_Planner/actions" -ForegroundColor White
Write-Host ""
Write-Host "2. 构建完成后，镜像将发布到:" -ForegroundColor Cyan
Write-Host "   ghcr.io/mesakurax/ai_travel_planner:main" -ForegroundColor White
Write-Host ""
Write-Host "3. 查看发布的镜像:" -ForegroundColor Cyan
Write-Host "   访问: https://github.com/mesakurax/AI_Travel_Planner/pkgs/container/ai_travel_planner" -ForegroundColor White
Write-Host ""
Write-Host "4. 使用镜像部署:" -ForegroundColor Cyan
Write-Host "   docker pull ghcr.io/mesakurax/ai_travel_planner:main" -ForegroundColor White
Write-Host "   docker run -d -p 3000:80 ghcr.io/mesakurax/ai_travel_planner:main" -ForegroundColor White
Write-Host ""
Write-Host "详细文档: QUICK_START_DOCKER.md" -ForegroundColor Gray
Write-Host ""
