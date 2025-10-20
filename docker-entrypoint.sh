#!/bin/sh
set -e

# 生成运行时配置文件
cat > /usr/share/nginx/html/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_AI_API_KEY: '${VITE_AI_API_KEY:-}',
  VITE_AI_BASE_URL: '${VITE_AI_BASE_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}',
  VITE_AI_MODEL: '${VITE_AI_MODEL:-qwen-plus}',
  VITE_AI_PROVIDER: '${VITE_AI_PROVIDER:-qwen}',
  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL:-}',
  VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY:-}',
  VITE_XFYUN_APP_ID: '${VITE_XFYUN_APP_ID:-}',
  VITE_XFYUN_API_SECRET: '${VITE_XFYUN_API_SECRET:-}',
  VITE_XFYUN_API_KEY: '${VITE_XFYUN_API_KEY:-}',
  VITE_AMAP_KEY: '${VITE_AMAP_KEY:-}',
  VITE_AMAP_SECURITY_CODE: '${VITE_AMAP_SECURITY_CODE:-}'
}
EOF

echo "Runtime configuration generated successfully"

# 启动 nginx
exec nginx -g "daemon off;"
