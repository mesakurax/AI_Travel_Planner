import { createClient } from '@supabase/supabase-js'
import { env } from '@/utils/env'

const supabaseUrl = env.SUPABASE_URL
const supabaseAnonKey = env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 配置缺失！请在 .env 文件中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
