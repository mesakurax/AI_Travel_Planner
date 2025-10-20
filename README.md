# 🌍 AI 旅行规划师

> 基于 Vue 3 + AI 的智能旅行规划应用，支持语音输入、地图导航和智能行程生成

[![GitHub Actions](https://github.com/mesakurax/AI_Travel_Planner/workflows/Build%20and%20Push%20Docker%20Image/badge.svg)](https://github.com/mesakurax/AI_Travel_Planner/actions)
[![Docker Image](https://img.shields.io/badge/docker-ghcr.io-blue)](https://github.com/mesakurax/AI_Travel_Planner/pkgs/container/ai_travel_planner)

## ✨ 功能特性

- 🎯 **AI 智能规划** - 通过语音或文字描述需求，自动生成详细行程
- 🎤 **语音识别** - 科大讯飞 API，流畅的语音输入体验
- 🗺️ **地图导航** - 高德地图集成，实时路线规划和景点标注（仅支持国内）
- 💰 **预算分析** - 智能费用预算和开支管理
- 👤 **用户系统** - 安全的注册登录，云端数据同步
- 📱 **响应式设计** - 支持桌面和移动端访问

## 🚀 技术栈

**前端**: Vue 3 + Vite + Pinia + Vue Router  
**后端**: Supabase (PostgreSQL + Auth + Storage)  
**AI**: 通义千问 / OpenAI / DeepSeek / Ollama  
**地图**: 高德地图 API  
**语音**: 科大讯飞 WebSocket API  
**部署**: Docker + GitHub Actions

## 📦 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/mesakurax/AI_Travel_Planner.git
cd AI_Travel_Planner

# 2. 安装依赖
npm install

# 3. 配置环境变量（见下方）
cp .env.example .env

# 4. 创建数据库表（执行 database_schema.sql）

# 5. 启动开发服务器
npm run dev
```

## ⚙️ 环境配置

创建 `.env` 文件并填入以下配置：

```env
# AI 模型（推荐通义千问 qwen-plus）
VITE_AI_PROVIDER=qwen
VITE_AI_API_KEY=sk-xxx
VITE_AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_AI_MODEL=qwen-plus

# Supabase 数据库
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx

# 科大讯飞语音识别
VITE_XFYUN_APP_ID=xxx
VITE_XFYUN_API_SECRET=xxx
VITE_XFYUN_API_KEY=xxx

# 高德地图
VITE_AMAP_KEY=xxx
VITE_AMAP_SECURITY_CODE=xxx
```

### 获取 API 密钥

1. **通义千问** (推荐): https://bailian.console.aliyun.com
2. **Supabase**: https://supabase.com
3. **科大讯飞**: https://console.xfyun.cn
4. **高德地图**: https://console.amap.com

## 📖 使用指南

1. 注册并登录账号
2. 点击"创建新行程"，使用语音🎤或文字输入需求
3. AI 自动生成详细行程（景点、时间、预算）
4. 在地图上查看路线和位置标记
5. 可选择不同天数查看当日行程

## 🐳 Docker 部署

```bash
# 拉取并运行镜像
docker pull ghcr.io/mesakurax/ai_travel_planner:main
docker run -d -p 3000:80 --env-file .env ghcr.io/mesakurax/ai_travel_planner:main

# 或使用 Docker Compose
docker-compose up -d

# 本地构建
docker build -t ai-travel-planner .
docker run -d -p 3000:80 ai-travel-planner
```

## 🛠️ 项目结构

```
src/
├── components/      # 公共组件（VoiceInput、TravelMap）
├── views/          # 页面（Home、Login、PlanCreator、PlanDetail）
├── stores/         # Pinia 状态管理（auth、travel）
├── services/       # API 服务（ai、amap、xfyun）
├── router/         # 路由配置
└── config/         # Supabase 配置
```

### 数据库

执行 `database_schema.sql` 创建表：`travel_plans`、`itinerary_days`、`activities`、`expenses`

## ❓ 常见问题

- **语音识别无响应？** 检查浏览器麦克风权限，必须使用 HTTPS 或 localhost
- **地图不显示？** 验证高德地图 Key 和安全密钥，检查域名白名单
- **AI 生成失败？** 确认 API Key 有效且有余额，检查网络连接

## 📄 License

MIT License - 自由使用、修改和分发

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**开始使用**: `npm run dev` 或 `docker-compose up -d`  
**在线预览**: [Demo](https://ai-travel-planner.example.com) _(待部署)_  
**问题反馈**: [GitHub Issues](https://github.com/mesakurax/AI_Travel_Planner/issues)
