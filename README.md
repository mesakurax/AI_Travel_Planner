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

### 方法 1: 使用 Docker（推荐）

```bash
# 从 GitHub 拉取镜像
docker pull ghcr.io/mesakurax/ai_travel_planner:main

# 运行容器
docker run -d -p 3000:80 --env-file .env ghcr.io/mesakurax/ai_travel_planner:main

# 或使用 Docker Compose
docker-compose up -d
```

### 方法 2: 本地开发

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

1. **通义千问** (推荐): https://bailian.console.aliyun.com - 新用户送免费额度
2. **Supabase**: https://supabase.com - 免费套餐足够使用
3. **科大讯飞**: https://console.xfyun.cn - 每日免费500次
4. **高德地图**: https://console.amap.com - 个人开发者免费

## 项目结构

```text
src/
├── assets/          # 静态资源
├── components/      # 公共组件
│   ├── VoiceInput.vue       # 语音输入组件
│   └── TravelMap.vue        # 地图组件
├── views/          # 页面组件
│   ├── Home.vue            # 首页
│   ├── Login.vue           # 登录页
│   ├── Register.vue        # 注册页
│   ├── Dashboard.vue       # 用户主页
│   ├── PlanCreator.vue     # 创建行程
│   └── PlanDetail.vue      # 行程详情
├── router/         # 路由配置
├── stores/         # Pinia 状态管理
│   ├── auth.js             # 认证状态
│   └── travel.js           # 旅行计划状态
├── services/       # API 服务
│   ├── xfyun.js            # 科大讯飞语音识别
│   ├── amap.js             # 高德地图
│   └── ai.js               # AI 大模型
├── types/          # 类型定义
│   └── travel.js           # 旅行相关类型
├── config/         # 配置文件
│   └── supabase.js         # Supabase 配置
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## 📖 使用指南

### 创建旅行计划

1. 注册并登录账号
2. 点击"创建新行程"
3. 使用语音🎤或文字输入需求
   - 例如："去成都3天，预算5000元，喜欢美食和文化"
4. AI 自动生成详细行程（含景点、时间、预算）
5. 在地图上查看路线和位置标记
6. 可选择不同天数查看当日行程

### 功能说明

- **语音输入**: 点击麦克风按钮，支持中文语音识别
- **地图导航**: 自动标注景点位置，规划最优路线（仅支持国内）
- **预算分析**: 查看交通、住宿、餐饮、门票等费用明细
- **行程优化**: AI 二次优化行程，调整时间和安排

## 🐳 Docker 部署

### 自动构建

推送代码到 GitHub 后，GitHub Actions 会自动构建 Docker 镜像并发布到：
```
ghcr.io/mesakurax/ai_travel_planner:main
```

### 使用镜像

```bash
# 拉取镜像
docker pull ghcr.io/mesakurax/ai_travel_planner:main

# 运行（需要先配置 .env 文件）
docker run -d -p 3000:80 --env-file .env ghcr.io/mesakurax/ai_travel_planner:main
```

### 本地构建

```bash
# 构建镜像
docker build -t ai-travel-planner .

# 运行容器
docker run -d -p 3000:80 ai-travel-planner
```

## 🛠️ 开发说明

### 项目结构

```
src/
├── components/      # 公共组件（VoiceInput、TravelMap）
├── views/          # 页面（Home、Login、PlanCreator、PlanDetail）
├── stores/         # Pinia 状态管理（auth、travel）
├── services/       # API 服务（ai、amap、xfyun）
├── router/         # 路由配置
└── config/         # Supabase 配置
```

### 数据库表

执行 `database_schema.sql` 创建以下表：
- `travel_plans` - 旅行计划主表
- `itinerary_days` - 每日行程
- `activities` - 活动详情
- `expenses` - 费用记录

### AI 模型选择

| 模型 | 成本 | 速度 | 质量 | 推荐场景 |
|-----|-----|------|------|---------|
| qwen-plus | ⭐⭐⭐⭐⭐ | 快 | 优秀 | **生产环境** |
| qwen-turbo | ⭐⭐⭐⭐⭐ | 很快 | 良好 | 预算有限 |
| gpt-3.5-turbo | ⭐⭐⭐ | 中等 | 良好 | 国际用户 |
| deepseek-chat | ⭐⭐⭐⭐⭐ | 快 | 良好 | 极致性价比 |
| ollama | 免费 | 中等 | 中等 | 本地部署 |

## ❓ 常见问题

**Q: 语音识别无响应？**  
A: 检查浏览器麦克风权限，必须使用 HTTPS 或 localhost

**Q: 地图不显示？**  
A: 验证高德地图 Key 和安全密钥，检查域名白名单

**Q: AI 生成失败？**  
A: 确认 API Key 有效且有余额，检查网络连接

**Q: Docker 镜像在哪？**  
A: https://github.com/mesakurax/AI_Travel_Planner/pkgs/container/ai_travel_planner

## 📄 License

MIT License - 自由使用、修改和分发

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**开始使用**: `npm run dev` 或 `docker-compose up -d`  
**在线预览**: [Demo](https://ai-travel-planner.example.com) _(待部署)_  
**问题反馈**: [GitHub Issues](https://github.com/mesakurax/AI_Travel_Planner/issues)
