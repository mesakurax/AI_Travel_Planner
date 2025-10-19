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

本项目支持任何兼容 OpenAI API 格式的大模型服务。**强烈推荐使用阿里云百练平台（通义千问）**，中文能力强，价格实惠，服务稳定。

---

### 🌟 推荐选项：阿里云百练平台（通义千问）

**为什么选择阿里云百练？**
- ✅ **中文能力优秀**：专为中文场景优化，旅行规划更准确
- ✅ **价格实惠**：比 GPT-3.5 便宜约 70%
- ✅ **国内访问稳定**：无需科学上网，响应速度快
- ✅ **新用户福利**：赠送免费额度
- ✅ **兼容 OpenAI 接口**：无需修改代码

#### 4.1 注册并开通服务

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 登录阿里云账号（没有则先注册）
3. 进入 **模型广场**
4. 选择 **通义千问** 系列模型
5. 点击 **开通服务**（新用户有免费额度）

#### 4.2 获取 API Key

1. 在百炼平台点击右上角 **API-KEY 管理**
2. 或直接访问 [API Key 管理页](https://bailian.console.aliyun.com/?apiKey=1)
3. 点击 **创建新的 API-KEY**
4. 复制生成的 API Key（以 `sk-` 开头）
5. **重要**：立即保存，只显示一次！

#### 4.3 配置环境变量

在 `.env` 文件中填入：

```env
# AI 大模型配置（阿里云百练）
VITE_AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
VITE_AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_AI_MODEL=qwen-plus
```

#### 4.4 选择合适的模型

**推荐模型：`qwen-plus`** （最适合本项目）

| 模型名称 | 特点 | 价格（元/百万 tokens） | 推荐场景 |
|---------|------|---------------------|---------|
| **qwen-plus** ⭐ | **均衡性能，推荐** | 输入 0.8 / 输出 2.0 | **本项目首选** |
| qwen-turbo | 速度快，便宜 | 输入 0.3 / 输出 0.6 | 预算有限 |
| qwen-max | 能力最强 | 输入 20 / 输出 60 | 追求极致体验 |
| qwen-long | 超长上下文 | 输入 0.5 / 输出 2.0 | 复杂规划 |

**为什么推荐 `qwen-plus`？**
- ✅ 性价比最高
- ✅ 中文理解能力强，旅行规划准确
- ✅ 生成速度快，用户体验好
- ✅ 支持 JSON 格式输出
- ✅ 价格合理（约 0.01-0.02 元/次查询）

#### 4.5 费用估算

假设平均每次行程规划：
- 输入：约 1000 tokens（用户需求 + 提示词）
- 输出：约 2000 tokens（完整行程）

**使用 `qwen-plus` 的费用：**
```
单次费用 = (1000 × 0.8 + 2000 × 2.0) / 1,000,000 = 0.0048 元
即：每次规划不到 0.5 分钱！
```

100 元可以规划约 20,000 次行程，足够个人项目长期使用。

---

### 其他可选方案

<details>
<summary>选项 A: OpenAI (ChatGPT) - 点击展开</summary>

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号（需要国外手机号）
3. 进入 **API Keys**
4. 点击 "Create new secret key"
5. 复制生成的 API Key（以 `sk-` 开头）

**配置：**
```env
VITE_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
VITE_AI_BASE_URL=https://api.openai.com/v1
VITE_AI_MODEL=gpt-3.5-turbo
```

**费用：** $0.50/百万输入 tokens，$1.50/百万输出 tokens  
**缺点：** 需要科学上网，国内访问不稳定

</details>

<details>
<summary>选项 B: DeepSeek - 点击展开</summary>

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

**优势：** 价格最便宜（0.14 元/百万输入 tokens）  
**缺点：** 旅行规划场景表现不如通义千问

</details>

<details>
<summary>选项 C: 本地部署（Ollama）- 点击展开</summary>

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

**优势：** 完全免费，数据隐私  
**缺点：** 需要高性能电脑，效果不如云端模型

</details>

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
