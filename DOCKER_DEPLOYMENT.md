# Docker 部署指南

## 快速开始

### 方法 1: 使用 Docker Compose（推荐）

```bash
# 克隆仓库
git clone https://github.com/mesakurax/AI_Travel_Planner.git
cd AI_Travel_Planner

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问 http://localhost:3000

### 方法 2: 使用 Docker 命令

```bash
# 构建镜像
docker build -t ai-travel-planner .

# 运行容器
docker run -d -p 3000:80 --name ai-travel-planner ai-travel-planner

# 查看日志
docker logs -f ai-travel-planner

# 停止容器
docker stop ai-travel-planner
docker rm ai-travel-planner
```

### 方法 3: 从 GitHub Container Registry 拉取

```bash
# 拉取最新镜像
docker pull ghcr.io/mesakurax/ai_travel_planner:main

# 运行容器
docker run -d -p 3000:80 ghcr.io/mesakurax/ai_travel_planner:main
```

## 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# AI 模型配置
VITE_AI_PROVIDER=qwen
VITE_AI_API_KEY=your_api_key_here
VITE_AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_AI_MODEL=qwen-plus

# 高德地图配置
VITE_AMAP_KEY=your_amap_key_here
VITE_AMAP_SECURITY_CODE=your_security_code_here
```

然后使用：

```bash
docker run -d -p 3000:80 --env-file .env ai-travel-planner
```

## 生产环境部署

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 使用 HTTPS

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com
```

## 故障排查

### 查看容器日志
```bash
docker logs ai-travel-planner
```

### 进入容器调试
```bash
docker exec -it ai-travel-planner sh
```

### 检查容器状态
```bash
docker ps
docker inspect ai-travel-planner
```

### 重新构建镜像
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 更新镜像

```bash
# 停止并删除旧容器
docker-compose down

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 性能优化

### 1. 启用多阶段构建（已默认启用）
Dockerfile 使用多阶段构建，减小镜像大小。

### 2. 使用 nginx 缓存
nginx.conf 已配置静态资源缓存。

### 3. 启用 Gzip 压缩
nginx.conf 已启用 Gzip 压缩。

## 安全建议

1. **不要在镜像中包含敏感信息**
   - 使用环境变量或 Docker secrets
   - 不要提交 .env 文件到 Git

2. **定期更新基础镜像**
   ```bash
   docker pull node:18-alpine
   docker pull nginx:alpine
   ```

3. **使用非 root 用户**（高级）
   在 Dockerfile 中添加：
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

## 监控和日志

### 查看实时日志
```bash
docker logs -f --tail 100 ai-travel-planner
```

### 导出日志
```bash
docker logs ai-travel-planner > app.log 2>&1
```

## 备份和恢复

### 导出镜像
```bash
docker save ai-travel-planner > ai-travel-planner.tar
```

### 导入镜像
```bash
docker load < ai-travel-planner.tar
```

## 资源限制

限制容器资源使用：

```yaml
services:
  ai-travel-planner:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 支持

如有问题，请访问：https://github.com/mesakurax/AI_Travel_Planner/issues
