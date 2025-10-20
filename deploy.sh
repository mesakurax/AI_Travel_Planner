#!/bin/bash

# AI 旅行规划师 - Docker 快速部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

echo "=================================="
echo "  AI 旅行规划师 - Docker 部署"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
echo -e "${YELLOW}检查 Docker 环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: 未检测到 Docker，请先安装 Docker${NC}"
    echo -e "${YELLOW}安装指南: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker 已安装${NC}"

# 检查 Docker 是否运行
echo -e "${YELLOW}检查 Docker 服务...${NC}"
if ! docker ps &> /dev/null; then
    echo -e "${RED}错误: Docker 服务未运行，请启动 Docker${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker 服务正常${NC}"

echo ""
echo -e "${CYAN}选择部署方式:${NC}"
echo "1. 本地构建镜像（首次部署/开发测试）"
echo "2. 从 GitHub 拉取镜像（生产环境）"
echo "3. 使用 Docker Compose（推荐）"
echo ""

read -p "请输入选项 (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}开始本地构建镜像...${NC}"
        echo -e "${CYAN}这可能需要几分钟时间...${NC}"
        
        docker build -t ai-travel-planner:local .
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 镜像构建成功${NC}"
            
            echo ""
            echo -e "${YELLOW}启动容器...${NC}"
            docker run -d -p 3000:80 --name ai-travel-planner ai-travel-planner:local
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ 容器启动成功${NC}"
                echo ""
                echo -e "${GREEN}应用已启动！${NC}"
                echo -e "${CYAN}访问地址: http://localhost:3000${NC}"
            else
                echo -e "${RED}✗ 容器启动失败${NC}"
            fi
        else
            echo -e "${RED}✗ 镜像构建失败，请检查错误信息${NC}"
        fi
        ;;
    
    2)
        echo ""
        echo -e "${YELLOW}从 GitHub 拉取镜像...${NC}"
        
        docker pull ghcr.io/mesakurax/ai_travel_planner:main
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 镜像拉取成功${NC}"
            
            echo ""
            echo -e "${YELLOW}启动容器...${NC}"
            docker run -d -p 3000:80 --name ai-travel-planner ghcr.io/mesakurax/ai_travel_planner:main
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ 容器启动成功${NC}"
                echo ""
                echo -e "${GREEN}应用已启动！${NC}"
                echo -e "${CYAN}访问地址: http://localhost:3000${NC}"
            else
                echo -e "${RED}✗ 容器启动失败${NC}"
            fi
        else
            echo -e "${RED}✗ 镜像拉取失败${NC}"
            echo -e "${YELLOW}提示: 如果镜像是私有的，请先执行 'docker login ghcr.io'${NC}"
        fi
        ;;
    
    3)
        echo ""
        echo -e "${YELLOW}使用 Docker Compose 启动...${NC}"
        
        if [ ! -f "docker-compose.yml" ]; then
            echo -e "${RED}✗ 未找到 docker-compose.yml 文件${NC}"
            exit 1
        fi
        
        docker-compose up -d --build
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 服务启动成功${NC}"
            echo ""
            echo -e "${GREEN}应用已启动！${NC}"
            echo -e "${CYAN}访问地址: http://localhost:3000${NC}"
            echo ""
            echo -e "${YELLOW}常用命令:${NC}"
            echo "  查看日志: docker-compose logs -f"
            echo "  停止服务: docker-compose down"
            echo "  重启服务: docker-compose restart"
        else
            echo -e "${RED}✗ 服务启动失败${NC}"
        fi
        ;;
    
    *)
        echo -e "${RED}无效的选项${NC}"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo -e "${YELLOW}提示: 使用以下命令管理容器${NC}"
echo "  查看日志: docker logs -f ai-travel-planner"
echo "  停止容器: docker stop ai-travel-planner"
echo "  启动容器: docker start ai-travel-planner"
echo "  删除容器: docker rm -f ai-travel-planner"
echo "=================================="
