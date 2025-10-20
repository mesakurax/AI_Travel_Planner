# 📦 快速开始：将项目发布到 GitHub

## ✅ 您已完成的准备工作

以下文件已自动创建并配置好：

- ✅ `Dockerfile` - Docker 镜像构建配置
- ✅ `nginx.conf` - Nginx 服务器配置
- ✅ `.dockerignore` - Docker 构建忽略文件
- ✅ `docker-compose.yml` - Docker Compose 编排配置
- ✅ `.github/workflows/docker-build.yml` - GitHub Actions 自动构建工作流
- ✅ `deploy.ps1` - Windows 部署脚本
- ✅ `deploy.sh` - Linux/Mac 部署脚本
- ✅ `DOCKER_DEPLOYMENT.md` - Docker 部署详细文档
- ✅ `GITHUB_DOCKER_GUIDE.md` - GitHub Docker 发布指南
- ✅ `README.md` - 已更新包含 Docker 部署说明

## 🚀 推送到 GitHub（3 步完成）

### 步骤 1: 添加所有文件

```powershell
git add .
```

### 步骤 2: 提交更改

```powershell
git commit -m "添加 Docker 支持和自动化部署配置"
```

### 步骤 3: 推送到 GitHub

```powershell
git push origin main
```

**就这么简单！** 🎉

## 🤖 自动化构建（无需本地 Docker）

推送到 GitHub 后，**GitHub Actions 会自动**：

1. ✅ 检测到代码更新
2. ✅ 自动构建 Docker 镜像
3. ✅ 发布到 GitHub Container Registry
4. ✅ 标记为 `ghcr.io/mesakurax/ai_travel_planner:main`

### 查看构建进度

1. 访问你的 GitHub 仓库
2. 点击顶部的 **"Actions"** 标签
3. 查看 "Build and Push Docker Image" 工作流
4. 等待构建完成（通常 5-10 分钟）

### 构建成功标志

当你看到绿色的 ✅ 时，说明镜像已成功构建并发布！

## 📦 使用发布的镜像

### 方法 1: 直接运行（需要安装 Docker）

```powershell
# 拉取镜像
docker pull ghcr.io/mesakurax/ai_travel_planner:main

# 运行容器
docker run -d -p 3000:80 ghcr.io/mesakurax/ai_travel_planner:main

# 访问 http://localhost:3000
```

### 方法 2: 使用部署脚本（推荐）

Windows:
```powershell
.\deploy.ps1
```

Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

### 方法 3: 使用 Docker Compose

```powershell
docker-compose up -d
```

## 🔒 配置镜像可见性

默认情况下，镜像是**私有的**。如果你想让其他人使用：

1. 访问 https://github.com/mesakurax?tab=packages
2. 找到 `ai_travel_planner` 包
3. 点击包名进入详情页
4. 点击右侧 **"Package settings"**
5. 滚动到 **"Danger Zone"**
6. 点击 **"Change visibility"**
7. 选择 **"Public"**
8. 确认更改

现在任何人都可以使用：
```powershell
docker pull ghcr.io/mesakurax/ai_travel_planner:main
```

## 📝 添加版本标签（可选）

### 发布版本 v1.0.0

```powershell
# 创建标签
git tag -a v1.0.0 -m "首次正式发布"

# 推送标签
git push origin v1.0.0
```

GitHub Actions 会自动构建并发布：
- `ghcr.io/mesakurax/ai_travel_planner:v1.0.0`
- `ghcr.io/mesakurax/ai_travel_planner:1.0`
- `ghcr.io/mesakurax/ai_travel_planner:1`
- `ghcr.io/mesakurax/ai_travel_planner:main`

## 🎯 在 README 中显示徽章（可选）

在 `README.md` 顶部添加：

```markdown
# AI 旅行规划师

[![Docker Image](https://img.shields.io/badge/docker-ghcr.io-blue)](https://github.com/mesakurax/AI_Travel_Planner/pkgs/container/ai_travel_planner)
[![GitHub Actions](https://github.com/mesakurax/AI_Travel_Planner/workflows/Build%20and%20Push%20Docker%20Image/badge.svg)](https://github.com/mesakurax/AI_Travel_Planner/actions)
```

## 📚 详细文档

更多详细信息，请查看：

- 📖 **[GITHUB_DOCKER_GUIDE.md](./GITHUB_DOCKER_GUIDE.md)** - 完整的 GitHub Docker 发布指南
- 🐳 **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** - Docker 部署详细文档
- 🔧 **[API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)** - API 配置指南

## ❓ 常见问题

### Q: 我需要安装 Docker 吗？

**A:** 不需要！GitHub Actions 会在云端自动构建。你只需要推送代码到 GitHub。

### Q: 构建失败怎么办？

**A:** 
1. 检查 GitHub Actions 的错误日志
2. 确保所有文件都已正确提交
3. 检查 Dockerfile 语法

### Q: 如何更新镜像？

**A:** 只需推送新代码到 GitHub，Actions 会自动重新构建。

```powershell
git add .
git commit -m "更新功能"
git push origin main
```

### Q: 镜像在哪里？

**A:** 访问 https://github.com/mesakurax/AI_Travel_Planner/pkgs/container/ai_travel_planner

### Q: 如何在服务器上部署？

**A:** 在服务器上运行：

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 拉取并运行镜像
docker pull ghcr.io/mesakurax/ai_travel_planner:main
docker run -d -p 80:80 ghcr.io/mesakurax/ai_travel_planner:main
```

## 🎊 完成！

现在你可以：

1. ✅ 推送代码到 GitHub
2. ✅ 自动构建 Docker 镜像
3. ✅ 在任何地方部署你的应用
4. ✅ 轻松分享给其他人使用

**下一步**: 执行 `git push origin main` 开始自动构建！🚀

---

**需要帮助？** 查看 [GitHub Issues](https://github.com/mesakurax/AI_Travel_Planner/issues) 或查阅详细文档。
