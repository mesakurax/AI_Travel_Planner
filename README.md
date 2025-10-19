# AI 旅行规划师 (AI Travel Planner)

一个基于 Vue 3 + Supabase 的智能旅行规划 Web 应用。

## 功能特性

- 🎯 智能行程规划（支持语音输入）
- 💰 费用预算与管理
- 👤 用户注册登录系统（支持登录缓存）
- ☁️ 云端行程同步

## 技术栈

- **前端框架**: Vue 3 + Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **数据库/认证**: Supabase
- **语音识别**: 科大讯飞 API
- **地图服务**: 高德地图 API
- **AI**: 大语言模型 API

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

1. 复制 `.env.example` 为 `.env`
2. 在 [Supabase](https://supabase.com/) 创建项目
3. 填入你的 Supabase 项目配置信息

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
├── views/          # 页面组件
├── router/         # 路由配置
├── stores/         # Pinia 状态管理
├── composables/    # 组合式函数
├── utils/          # 工具函数
├── config/         # 配置文件
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## 开发计划

- [x] 项目框架搭建
- [x] 用户注册登录系统
- [x] 登录状态缓存
- [ ] 智能行程规划
- [ ] 语音输入功能
- [ ] 地图集成
- [ ] 费用预算管理
- [ ] 云端数据同步
