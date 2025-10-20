# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 设置阿里云镜像源加速 npm 安装
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用（不使用 .env，环境变量将在运行时注入）
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 安装 bash（用于运行启动脚本）
RUN apk add --no-cache bash

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 80

# 使用启动脚本（会在启动时生成 config.js）
ENTRYPOINT ["/docker-entrypoint.sh"]