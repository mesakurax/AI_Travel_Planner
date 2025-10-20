# AI 旅行规划师 (AI Travel Planner)

一个基于 Vue 3 + Supabase 的智能旅行规划 Web 应用，支持语音输入、地图导航和 AI 智能规划。

## 功能特性

- 🎯 **智能行程规划**: 通过语音或文字输入旅行需求，AI 自动生成详细行程
- 🎤 **语音识别**: 基于科大讯飞 API，支持语音输入旅行需求
- 🗺️ **地图导航**: 高德地图集成，实时展示景点位置和路线
- 💰 **费用预算**: AI 智能预算分析和费用管理
- 👤 **用户系统**: 注册登录，支持登录缓存
- ☁️ **云端同步**: 基于 Supabase 的数据存储和同步

## 技术栈

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 官方状态管理库
- **Vue Router** - 官方路由管理器

### 后端服务

- **Supabase** - 数据库、认证、实时订阅
- **科大讯飞语音识别 API** - WebSocket 流式语音识别
- **高德地图 API** - 地图展示、POI 搜索、路径规划
- **AI 大模型 API** - 智能行程规划（支持 OpenAI/DeepSeek/通义千问等）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置第三方服务

本项目需要配置以下第三方服务，详细配置步骤请查看 **[API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)**：

1. ✅ **Supabase** - 数据库和认证（必需）
2. ✅ **科大讯飞** - 语音识别（必需）
3. ✅ **高德地图** - 地图服务（必需）
4. ✅ **阿里云百练（通义千问）** - AI 行程规划（**强烈推荐 `qwen-plus` 模型**）

**💡 为什么推荐阿里云百练的 qwen-plus？**
- 中文能力优秀，专为旅行规划优化
- 性价比高（0.005元/次，100元用20000次）
- 国内访问快速稳定，无需科学上网
- 新用户赠送免费额度

详见 **[模型选择指南](./MODEL_SELECTION_GUIDE.md)**

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，并填入你的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，参考 `API_SETUP_GUIDE.md` 填写所有必需的 API 密钥。

### 4. 创建数据库表

1. 登录 Supabase 控制台
2. 进入 SQL Editor
3. 执行 `database_schema.sql` 中的 SQL 语句

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 6. Docker 部署（可选）

```bash
# 使用 Docker Compose 快速启动
docker-compose up -d

# 或使用 Docker 命令
docker build -t ai-travel-planner .
docker run -d -p 3000:80 ai-travel-planner
```

详见 **[Docker 部署指南](./DOCKER_DEPLOYMENT.md)**

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

## 使用说明

### 创建旅行计划

1. 注册并登录账号
2. 进入 Dashboard，点击"创建新行程"
3. 使用语音（点击麦克风图标）或文字输入旅行需求
   - 示例："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
4. AI 将自动生成详细的旅行计划
5. 在地图上查看景点位置和路线
6. 查看预算分解和每日行程安排

### 查看行程详情

- 左侧地图展示所有景点标记
- 右侧滚动查看详细行程
- 点击活动可在地图上高亮显示
- 支持行程优化和保存

## 开发进度

- [x] 项目框架搭建
- [x] 用户注册登录系统
- [x] 登录状态缓存
- [x] 语音输入组件
- [x] 地图集成（高德地图）
- [x] AI 行程规划服务
- [x] 行程创建页面
- [x] 行程详情展示
- [x] 数据库设计和 RLS 策略
- [ ] 我的行程列表
- [ ] 费用记录功能
- [ ] 行程编辑功能
- [ ] 分享行程功能

## 文档

- **[API 配置指南](./API_SETUP_GUIDE.md)** - 详细的第三方服务配置教程
- **[模型选择指南](./MODEL_SELECTION_GUIDE.md)** - AI 模型选择和对比（推荐 qwen-plus）
- **[数据库设计](./database_schema.sql)** - Supabase 数据库表结构

## 常见问题

### 语音识别不工作？

1. 确保浏览器已授予麦克风权限
2. 使用 HTTPS 或 localhost 环境
3. 检查科大讯飞 API 配置是否正确

### 地图无法显示？

1. 验证高德地图 Key 和安全密钥
2. 检查域名白名单配置
3. 查看浏览器控制台错误信息

### AI 生成失败？

1. 确认 AI API Key 有效且有余额
2. 检查网络连接
3. 尝试更换其他 AI 服务提供商

更多问题请参考 [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) 中的故障排查章节。

## License

MIT
