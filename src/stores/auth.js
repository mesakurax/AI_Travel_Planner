import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 初始化认证状态
  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        user.value = session.user
      }

      // 监听认证状态变化
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user || null
      })
    } catch (err) {
      console.error('初始化认证失败:', err)
      error.value = err.message
    }
  }

  // 注册
  const register = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })

      if (signUpError) throw signUpError

      return { success: true, data }
    } catch (err) {
      console.error('注册失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 登录
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      user.value = data.user
      return { success: true, data }
    } catch (err) {
      console.error('登录失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      loading.value = true
      error.value = null

      // 检查是否存在会话
      if (!user.value) {
        console.warn('用户未登录，无需登出')
        return { success: true }
      }

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      user.value = null
      return { success: true }
    } catch (err) {
      console.error('登出失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // 重置密码
  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError

      return { success: true }
    } catch (err) {
      console.error('重置密码失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    initAuth,
    register,
    login,
    logout,
    resetPassword
  }
})
