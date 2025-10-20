# AI 旅行规划师 - Docker 快速部署脚本
# 使用方法: .\deploy.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  AI 旅行规划师 - Docker 部署" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否安装
Write-Host "检查 Docker 环境..." -ForegroundColor Yellow
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未检测到 Docker，请先安装 Docker Desktop" -ForegroundColor Red
    Write-Host "下载地址: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Docker 已安装" -ForegroundColor Green

# 检查 Docker 是否运行
Write-Host "检查 Docker 服务..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker 服务正常" -ForegroundColor Green
} catch {
    Write-Host "错误: Docker 服务未运行，请启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "选择部署方式:" -ForegroundColor Cyan
Write-Host "1. 本地构建镜像（首次部署/开发测试）"
Write-Host "2. 从 GitHub 拉取镜像（生产环境）"
Write-Host "3. 使用 Docker Compose（推荐）"
Write-Host ""

$choice = Read-Host "请输入选项 (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "开始本地构建镜像..." -ForegroundColor Yellow
        Write-Host "这可能需要几分钟时间..." -ForegroundColor Gray
        
        docker build -t ai-travel-planner:local .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ 镜像构建成功" -ForegroundColor Green
            
            Write-Host ""
            Write-Host "启动容器..." -ForegroundColor Yellow
            docker run -d -p 3000:80 --name ai-travel-planner ai-travel-planner:local
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ 容器启动成功" -ForegroundColor Green
                Write-Host ""
                Write-Host "应用已启动！" -ForegroundColor Green
                Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
            } else {
                Write-Host "✗ 容器启动失败" -ForegroundColor Red
            }
        } else {
            Write-Host "✗ 镜像构建失败，请检查错误信息" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "从 GitHub 拉取镜像..." -ForegroundColor Yellow
        
        docker pull ghcr.io/mesakurax/ai_travel_planner:main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ 镜像拉取成功" -ForegroundColor Green
            
            Write-Host ""
            Write-Host "启动容器..." -ForegroundColor Yellow
            docker run -d -p 3000:80 --name ai-travel-planner ghcr.io/mesakurax/ai_travel_planner:main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ 容器启动成功" -ForegroundColor Green
                Write-Host ""
                Write-Host "应用已启动！" -ForegroundColor Green
                Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
            } else {
                Write-Host "✗ 容器启动失败" -ForegroundColor Red
            }
        } else {
            Write-Host "✗ 镜像拉取失败" -ForegroundColor Red
            Write-Host "提示: 如果镜像是私有的，请先执行 'docker login ghcr.io'" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "使用 Docker Compose 启动..." -ForegroundColor Yellow
        
        if (!(Test-Path "docker-compose.yml")) {
            Write-Host "✗ 未找到 docker-compose.yml 文件" -ForegroundColor Red
            exit 1
        }
        
        docker-compose up -d --build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ 服务启动成功" -ForegroundColor Green
            Write-Host ""
            Write-Host "应用已启动！" -ForegroundColor Green
            Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "常用命令:" -ForegroundColor Yellow
            Write-Host "  查看日志: docker-compose logs -f"
            Write-Host "  停止服务: docker-compose down"
            Write-Host "  重启服务: docker-compose restart"
        } else {
            Write-Host "✗ 服务启动失败" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "无效的选项" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "提示: 使用以下命令管理容器" -ForegroundColor Yellow
Write-Host "  查看日志: docker logs -f ai-travel-planner"
Write-Host "  停止容器: docker stop ai-travel-planner"
Write-Host "  启动容器: docker start ai-travel-planner"
Write-Host "  删除容器: docker rm -f ai-travel-planner"
Write-Host "==================================" -ForegroundColor Cyan
