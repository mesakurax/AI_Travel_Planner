/**
 * 获取环境变量
 * 优先使用运行时配置，如果没有则使用构建时配置
 */
export function getEnv(key) {
  // 运行时配置（Docker 容器启动时注入）
  if (window.__RUNTIME_CONFIG__ && window.__RUNTIME_CONFIG__[key]) {
    return window.__RUNTIME_CONFIG__[key]
  }

  const buildTimeValue = import.meta.env[key]
  if (buildTimeValue) {
    return buildTimeValue
  }

  if (key === 'VITE_XFYUN_APP_ID') {
    return '44149f3c'
  }
  if (key === 'VITE_XFYUN_API_SECRET') {
    return 'N2ZkMTJkYzE0Y2JjMmIxYzE2ZTQwYWVl'
  }
  if (key === 'VITE_XFYUN_API_KEY') {
    return '5f84b4daecb26993dce1fda96349a5e5'
  }

  return ''
}

// 导出所有环境变量
export const env = {
  // AI 相关
  AI_API_KEY: getEnv('VITE_AI_API_KEY'),
  AI_BASE_URL: getEnv('VITE_AI_BASE_URL'),
  AI_MODEL: getEnv('VITE_AI_MODEL'),
  AI_PROVIDER: getEnv('VITE_AI_PROVIDER'),
  
  // Supabase
  SUPABASE_URL: getEnv('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),
  
  // 讯飞语音
  XFYUN_APP_ID: getEnv('VITE_XFYUN_APP_ID'),
  XFYUN_API_SECRET: getEnv('VITE_XFYUN_API_SECRET'),
  XFYUN_API_KEY: getEnv('VITE_XFYUN_API_KEY'),
  
  // 高德地图
  AMAP_KEY: getEnv('VITE_AMAP_KEY'),
  AMAP_SECURITY_CODE: getEnv('VITE_AMAP_SECURITY_CODE')
}
