# 发布 Docker 镜像到 GitHub 完整指南

## 准备工作

### 1. 确保已安装 Docker

```powershell
# 检查 Docker 版本
docker --version

# 如果未安装，请访问 https://www.docker.com/products/docker-desktop 下载安装
```

### 2. 确保已安装 Git 并配置好 GitHub

```powershell
# 检查 Git 版本
git --version

# 配置 Git 用户信息（如果还没配置）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

## 本地测试 Docker 镜像

在推送到 GitHub 之前，先在本地测试镜像是否能正常工作：

```powershell
# 1. 构建镜像
docker build -t ai-travel-planner:test .

# 2. 运行容器
docker run -d -p 3000:80 --name test-app ai-travel-planner:test

# 3. 在浏览器访问 http://localhost:3000 测试

# 4. 查看日志
docker logs test-app

# 5. 测试完成后停止并删除
docker stop test-app
docker rm test-app
```

## 方法 1: 使用 GitHub Actions 自动构建（推荐）

这是最简单的方法，每次推送代码到 GitHub 时自动构建和发布镜像。

### 步骤：

1. **确保 GitHub Actions 工作流文件已创建**
   - 文件已自动创建在：`.github/workflows/docker-build.yml`

2. **推送代码到 GitHub**

```powershell
# 添加所有新文件
git add .

# 提交更改
git commit -m "添加 Docker 支持和自动化部署"

# 推送到 GitHub
git push origin main
```

3. **查看构建过程**
   - 访问你的 GitHub 仓库
   - 点击 "Actions" 标签页
   - 查看构建进度和日志

4. **构建成功后，镜像会自动发布到**
   - `ghcr.io/mesakurax/ai_travel_planner:main`

5. **使用发布的镜像**

```powershell
# 拉取镜像
docker pull ghcr.io/mesakurax/ai_travel_planner:main

# 运行镜像
docker run -d -p 3000:80 ghcr.io/mesakurax/ai_travel_planner:main
```

### 配置镜像为公开（可选）

默认情况下，镜像是私有的。如果想让其他人也能使用：

1. 访问 https://github.com/users/mesakurax/packages
2. 找到 `ai_travel_planner` 包
3. 点击 "Package settings"
4. 在 "Danger Zone" 中选择 "Change visibility"
5. 选择 "Public"

## 方法 2: 手动推送到 GitHub Container Registry

如果你想手动控制发布过程：

### 步骤：

1. **登录到 GitHub Container Registry**

```powershell
# 创建 Personal Access Token (PAT)
# 访问：https://github.com/settings/tokens
# 点击 "Generate new token (classic)"
# 勾选权限：
#   - write:packages
#   - read:packages
#   - delete:packages (可选)
# 生成并复制 token

# 使用 token 登录
$env:CR_PAT="你的_github_token"
echo $env:CR_PAT | docker login ghcr.io -u mesakurax --password-stdin
```

2. **构建并标记镜像**

```powershell
# 构建镜像
docker build -t ai-travel-planner .

# 标记镜像（注意要小写）
docker tag ai-travel-planner ghcr.io/mesakurax/ai_travel_planner:latest
docker tag ai-travel-planner ghcr.io/mesakurax/ai_travel_planner:v1.0.0
```

3. **推送镜像到 GitHub**

```powershell
# 推送最新版本
docker push ghcr.io/mesakurax/ai_travel_planner:latest

# 推送特定版本
docker push ghcr.io/mesakurax/ai_travel_planner:v1.0.0
```

4. **验证镜像已发布**

访问：https://github.com/users/mesakurax/packages

## 方法 3: 发布到 Docker Hub（可选）

如果想发布到 Docker Hub 而不是 GitHub：

```powershell
# 1. 登录 Docker Hub
docker login

# 2. 构建并标记镜像
docker build -t mesakurax/ai-travel-planner .
docker tag mesakurax/ai-travel-planner mesakurax/ai-travel-planner:v1.0.0

# 3. 推送到 Docker Hub
docker push mesakurax/ai-travel-planner:latest
docker push mesakurax/ai-travel-planner:v1.0.0
```

## 使用发布的镜像

### 从 GitHub Container Registry

```powershell
# 拉取镜像
docker pull ghcr.io/mesakurax/ai_travel_planner:main

# 运行镜像
docker run -d -p 3000:80 --name ai-travel-planner ghcr.io/mesakurax/ai_travel_planner:main
```

### 使用 docker-compose

修改 `docker-compose.yml` 使用远程镜像：

```yaml
version: '3.8'

services:
  ai-travel-planner:
    image: ghcr.io/mesakurax/ai_travel_planner:main
    ports:
      - "3000:80"
    restart: unless-stopped
```

然后运行：

```powershell
docker-compose up -d
```

## 更新镜像版本

### 使用版本标签（推荐）

```powershell
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# GitHub Actions 会自动构建并发布带版本标签的镜像
```

镜像会发布为：
- `ghcr.io/mesakurax/ai_travel_planner:v1.0.0`
- `ghcr.io/mesakurax/ai_travel_planner:1.0`
- `ghcr.io/mesakurax/ai_travel_planner:1`

## 清理本地镜像

```powershell
# 查看所有镜像
docker images

# 删除特定镜像
docker rmi ai-travel-planner:test

# 删除悬挂镜像（<none>）
docker image prune

# 删除所有未使用的镜像
docker image prune -a
```

## 故障排查

### 构建失败

```powershell
# 查看详细构建日志
docker build -t ai-travel-planner . --no-cache --progress=plain

# 检查 Dockerfile 语法
docker build -t ai-travel-planner . --check
```

### 推送失败

```powershell
# 检查登录状态
docker info | Select-String -Pattern "Username"

# 重新登录
docker logout ghcr.io
docker login ghcr.io
```

### 镜像大小太大

```powershell
# 查看镜像大小
docker images ai-travel-planner

# 查看各层大小
docker history ai-travel-planner

# 优化建议：
# 1. 使用多阶段构建（已启用）
# 2. 使用 alpine 基础镜像（已启用）
# 3. 清理缓存和临时文件
```

## 在 README 中添加镜像徽章

在 `README.md` 顶部添加：

```markdown
![Docker Image Version](https://ghcr-badge.egpl.dev/mesakurax/ai_travel_planner/latest_tag?trim=major&label=latest)
![Docker Image Size](https://ghcr-badge.egpl.dev/mesakurax/ai_travel_planner/size)
```

## 安全建议

1. **不要在镜像中包含敏感信息**
   - 使用 `.dockerignore` 排除 `.env` 文件
   - 通过环境变量传递配置

2. **定期更新基础镜像**
   ```powershell
   docker pull node:18-alpine
   docker pull nginx:alpine
   ```

3. **扫描安全漏洞**
   ```powershell
   docker scan ai-travel-planner
   ```

## 下一步

1. ✅ 配置 GitHub Actions 自动构建
2. ✅ 推送代码触发构建
3. ✅ 查看构建日志
4. ✅ 测试发布的镜像
5. ⬜ 配置自动版本标签
6. ⬜ 添加镜像徽章到 README
7. ⬜ 配置生产环境部署

## 参考资源

- [GitHub Packages 文档](https://docs.github.com/en/packages)
- [Docker 官方文档](https://docs.docker.com/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
