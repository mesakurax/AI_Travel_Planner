# AI 旅行规划师 - 技术栈配置指南

本文档将详细指导你如何配置所有必需的第三方服务。

---

## 📋 目录

1. [Supabase 配置](#1-supabase-配置)
2. [科大讯飞语音识别配置](#2-科大讯飞语音识别配置)
3. [高德地图配置](#3-高德地图配置)
4. [AI 大模型配置](#4-ai-大模型配置)
5. [项目启动](#5-项目启动)

---

## 1. Supabase 配置

### 1.1 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com/)
2. 注册/登录账号
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - Project name: `ai-travel-planner`
   - Database password: 设置一个安全的密码
   - Region: 选择离你最近的区域（如 `Northeast Asia (Tokyo)`）
5. 等待项目创建完成（约 2 分钟）

### 1.2 获取 API 密钥

1. 进入项目后，点击左侧 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: 形如 `https://xxxxx.supabase.co`
   - **anon public key**: 以 `eyJ` 开头的长字符串

### 1.3 创建数据库表

1. 点击左侧 **SQL Editor**
2. 点击 "New query"
3. 将 `database_schema.sql` 文件的内容粘贴进去
4. 点击右下角 "RUN" 执行
5. 确认看到 "Success. No rows returned" 提示

### 1.4 配置邮箱认证（可选）

1. 点击左侧 **Authentication** → **Providers**
2. 确保 **Email** 已启用
3. 可以在 **Email Templates** 中自定义验证邮件模板

---

## 2. 科大讯飞语音识别配置

### 2.1 注册讯飞开放平台

1. 访问 [讯飞开放平台](https://www.xfyun.cn/)
2. 注册/登录账号
3. 完成实名认证

### 2.2 创建应用

1. 进入控制台 → **我的应用**
2. 点击 "创建新应用"
3. 填写应用信息：
   - 应用名称: `AI旅行规划师`
   - 应用平台: 选择 **WebAPI**
4. 创建成功后获得：
   - **APPID**
   - **APISecret**
   - **APIKey**

### 2.3 开通服务

1. 在 **控制台** → **我的应用** 中点击刚创建的应用
2. 点击 **语音听写（流式版）** 服务
3. 点击 "立即开通"（免费版每日有500次额度）
4. 确认开通成功

### 2.4 配置说明

- 免费版额度：500 次/天
- 支持语言：中文、英文等
- 实时流式识别，延迟低

---

## 3. 高德地图配置

### 3.1 注册高德开放平台

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册/登录账号
3. 完成个人/企业认证

### 3.2 创建应用

1. 进入 **控制台** → **应用管理** → **我的应用**
2. 点击 "创建新应用"
3. 填写应用信息：
   - 应用名称: `AI旅行规划师`
   - 应用类型: Web端（JS API）

### 3.3 添加 Key

1. 在应用下点击 "添加Key"
2. 填写 Key 信息：
   - Key 名称: `web-key`
   - 服务平台: **Web端（JS API）**
3. 创建成功后获得 **Key**（一串字符串）

### 3.4 获取安全密钥

1. 点击应用设置
2. 找到 **安全密钥（JS API 安全密钥）**
3. 点击生成或查看，获得 **安全密钥**

### 3.5 配置白名单

1. 在 Key 设置中找到 **IP白名单** 或 **域名白名单**
2. 开发阶段可以设置为 `*`（所有域名）
3. 生产环境建议设置具体域名

---

## 4. AI 大模型配置

本项目支持任何兼容 OpenAI API 格式的大模型服务。以下提供几种选择：

### 选项 A: OpenAI (ChatGPT)

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号
3. 进入 **API Keys**
4. 点击 "Create new secret key"
5. 复制生成的 API Key（以 `sk-` 开头）

**配置：**
```env
VITE_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
VITE_AI_BASE_URL=https://api.openai.com/v1
VITE_AI_MODEL=gpt-3.5-turbo
```

**费用：** 按使用量计费，GPT-3.5-Turbo 约 $0.002/1K tokens

---

### 选项 B: DeepSeek（推荐国内用户）

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 **API Keys**
4. 创建新的 API Key

**配置：**
```env
VITE_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
VITE_AI_BASE_URL=https://api.deepseek.com/v1
VITE_AI_MODEL=deepseek-chat
```

**优势：** 价格便宜，中文能力强

---

### 选项 C: 阿里云通义千问

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 开通服务并获取 API Key
3. 使用兼容 OpenAI 的接口

**配置：**
```env
VITE_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
VITE_AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_AI_MODEL=qwen-turbo
```

---

### 选项 D: 本地部署（Ollama）

如果想完全免费使用，可以本地部署：

1. 安装 [Ollama](https://ollama.ai/)
2. 下载模型：`ollama pull qwen:7b`
3. 启动服务：`ollama serve`

**配置：**
```env
VITE_AI_API_KEY=ollama
VITE_AI_BASE_URL=http://localhost:11434/v1
VITE_AI_MODEL=qwen:7b
```

---

## 5. 项目启动

### 5.1 安装依赖

```bash
npm install
```

### 5.2 配置环境变量

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入你的配置：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 科大讯飞语音识别配置
VITE_XFYUN_APPID=12345678
VITE_XFYUN_API_SECRET=abc123def456...
VITE_XFYUN_API_KEY=xyz789...

# 高德地图配置
VITE_AMAP_KEY=abc123def456...
VITE_AMAP_SECURITY_CODE=xyz789...

# AI 大模型配置
VITE_AI_API_KEY=sk-xxxxx...
VITE_AI_BASE_URL=https://api.deepseek.com/v1
VITE_AI_MODEL=deepseek-chat
```

### 5.3 启动开发服务器

```bash
npm run dev
```

服务将运行在 `http://localhost:3000`

---

## 📊 成本估算

### 免费额度

- **Supabase**: 免费版包含 500MB 数据库 + 1GB 文件存储
- **科大讯飞**: 500次/天 语音识别
- **高德地图**: 免费版配额足够个人项目使用
- **DeepSeek**: 新用户赠送 500万 tokens

### 付费版（可选）

如果免费额度不够，可以升级：

| 服务 | 费用 | 说明 |
|------|------|------|
| Supabase | $25/月 起 | 8GB 数据库，100GB 存储 |
| 科大讯飞 | ¥500/月 起 | 500万次调用 |
| 高德地图 | 按调用量 | 基础服务免费 |
| DeepSeek | ¥0.001/1K tokens | 比 GPT-4 便宜90% |

---

## 🔧 故障排查

### 语音识别无法使用

1. 检查浏览器是否允许麦克风权限
2. 确认 HTTPS 环境（本地开发 localhost 可用）
3. 验证科大讯飞 API 密钥是否正确

### 地图无法加载

1. 检查高德地图 Key 和安全密钥
2. 确认域名在白名单中
3. 打开浏览器控制台查看错误信息

### AI 生成失败

1. 验证 API Key 是否有效
2. 检查 BASE_URL 是否正确
3. 确认账户有足够额度
4. 查看控制台网络请求错误

### Supabase 连接失败

1. 确认 URL 和 Key 正确
2. 检查数据库表是否创建成功
3. 验证 RLS 策略是否启用

---

## 📚 相关文档

- [Supabase 文档](https://supabase.com/docs)
- [科大讯飞 Web API 文档](https://www.xfyun.cn/doc/asr/voicedictation/API.html)
- [高德地图 JS API 文档](https://lbs.amap.com/api/javascript-api/summary)
- [OpenAI API 文档](https://platform.openai.com/docs)

---

## 🚀 下一步

配置完成后，你可以：

1. 注册账号并登录
2. 点击 "创建新行程"
3. 使用语音或文字输入旅行需求
4. 查看 AI 生成的详细行程和地图展示

如有问题，请查看项目 README.md 或提交 Issue。
