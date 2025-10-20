# 🌍 AI 旅行规划师

> 基于 Vue 3 + AI 的智能旅行规划应用，支持语音输入、地图导航和智能行程生成

[![GitHub Actions](https://github.com/mesakurax/AI_Travel_Planner/workflows/Build%20and%20Push%20Docker%20Image/badge.svg)](https://github.com/mesakurax/AI_Travel_Planner/actions)

## ✨ 功能特性

- 🎯 **AI 智能规划** - 语音或文字描述需求，自动生成详细行程
- 🎤 **语音识别** - 科大讯飞 API 流畅语音输入
- 🗺️ **地图导航** - 高德地图集成，路线规划和景点标注
- 💰 **预算分析** - 智能费用预算和开支管理
- 👤 **用户系统** - 注册登录，云端数据同步
- 📱 **响应式设计** - 支持桌面和移动端

## 🚀 技术栈

Vue 3 · Vite · Pinia · Supabase · 通义千问 · 高德地图 · 科大讯飞 · Docker

---

## 📦 快速开始

### Docker 部署（推荐）

#### 1. 创建 `.env` 文件

```bash
VITE_AI_PROVIDER=qwen
VITE_AI_API_KEY=sk-你的通义千问密钥
VITE_AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_AI_MODEL=qwen-plus
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的Supabase密钥
VITE_XFYUN_APP_ID=你的讯飞APPID
VITE_XFYUN_API_SECRET=你的讯飞APISecret
VITE_XFYUN_API_KEY=你的讯飞APIKey
VITE_AMAP_KEY=你的高德地图Key
VITE_AMAP_SECURITY_CODE=你的高德安全密钥
```

#### 2. 运行容器

```bash
# 国内用户（推荐）
docker pull crpi-q6jikadfo82vknso.cn-shanghai.personal.cr.aliyuncs.com/mycourse/ai-travel-planner:latest
docker run -d -p 3000:80 --env-file .env --name ai-travel-planner \
  crpi-q6jikadfo82vknso.cn-shanghai.personal.cr.aliyuncs.com/mycourse/ai-travel-planner:latest

# 海外用户
docker pull ghcr.io/mesakurax/ai-travel-planner:latest
docker run -d -p 3000:80 --env-file .env --name ai-travel-planner \
  ghcr.io/mesakurax/ai-travel-planner:latest
```

访问 <http://localhost:3000>

**修改配置**: 编辑 `.env` 后执行 `docker restart ai-travel-planner` 即可生效

---

### 本地开发

```bash
# 1. 克隆并安装
git clone https://github.com/mesakurax/AI_Travel_Planner.git
cd AI_Travel_Planner
npm config set registry https://registry.npmmirror.com
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入上述 API 密钥

# 3. 配置数据库
# 访问 https://supabase.com 创建项目
# 在 SQL 编辑器执行 database_schema.sql

# 4. 启动开发服务器
npm run dev
```

访问 <http://localhost:5173> (Vite 默认开发端口)

**生产构建**:

```bash
npm run build
```

**推送到 GitHub 自动部署**:

- 项目已配置 GitHub Actions
- 推送代码到 main 分支后会自动构建 Docker 镜像并推送到镜像仓库

---

## 🔑 API 密钥获取

- [通义千问](https://bailian.console.aliyun.com) - AI 对话
- [Supabase](https://supabase.com) - 数据库和认证
- [科大讯飞](https://console.xfyun.cn) - 语音识别
- [高德地图](https://console.amap.com) - 地图服务

---

## ❓ 常见问题

- **语音识别无响应？** 检查浏览器麦克风权限（需 HTTPS 或 localhost）
- **地图不显示？** 验证高德地图 Key 和安全密钥
- **AI 生成失败？** 确认 API Key 有效且有余额
- **镜像拉取慢？** 国内用户使用阿里云镜像

---

## 📄 License

MIT License

**问题反馈**: [GitHub Issues](https://github.com/mesakurax/AI_Travel_Planner/issues)
