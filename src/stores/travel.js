/**
 * 旅行计划 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'
import aiService from '@/services/ai'
import amapService from '@/services/amap'

export const useTravelStore = defineStore('travel', () => {
  const plans = ref([])
  const currentPlan = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 计算属性
  const hasPlan = computed(() => currentPlan.value !== null)

  /**
   * 创建新的旅行计划
   */
  const createPlan = async (travelRequest, onProgress) => {
    try {
      loading.value = true
      error.value = null

      // 1. 使用 AI 生成计划
      if (onProgress) onProgress({ stage: 'ai', message: '🤖 AI 正在生成行程...', progress: 10 })
      
      const aiPlan = await aiService.generateTravelPlan(travelRequest, onProgress)
      
      // 2. 地理编码 - 获取目的地坐标
      if (onProgress) onProgress({ stage: 'geocode', message: '🗺️ 正在获取地理位置...', progress: 50 })
      
      try {
        const location = await amapService.geocode(travelRequest.destination)
        aiPlan.destinationLocation = location
      } catch (geoError) {
        console.warn('目的地地理编码失败:', geoError)
      }

      // 3. 为每个活动获取地理坐标 - 并行处理，带超时
      const geocodePromises = []
      const geocodeTimeout = 3000
      
      for (const day of aiPlan.itinerary) {
        for (const activity of day.activities) {
          if (activity.address) {
            const geocodeWithTimeout = Promise.race([
              amapService.geocode(activity.address, travelRequest.destination)
                .then(loc => {
                  activity.location = loc
                  return { success: true }
                })
                .catch(() => ({ success: false })),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('超时')), geocodeTimeout)
              )
            ]).catch(() => ({ success: false }))
            
            geocodePromises.push(geocodeWithTimeout)
          }
        }
      }

      if (geocodePromises.length > 0) {
        await Promise.all(geocodePromises)
      }

      // 4. 保存到 Supabase
      if (onProgress) onProgress({ stage: 'save', message: '💾 正在保存行程...', progress: 80 })
      
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data, error: saveError } = await supabase
          .from('travel_plans')
          .insert({
            user_id: userData.user.id,
            title: aiPlan.title,
            destination: travelRequest.destination,
            days: travelRequest.days,
            budget: travelRequest.budget,
            travelers: travelRequest.travelers,
            preferences: travelRequest.preferences,
            with_children: travelRequest.withChildren,
            start_date: travelRequest.startDate,
            itinerary: aiPlan.itinerary,
            budget_breakdown: aiPlan.budget,
            tips: aiPlan.tips,
            summary: aiPlan.summary
          })
          .select()
          .single()

        if (saveError) throw saveError

        aiPlan.id = data.id
        aiPlan.createdAt = data.created_at
      }

      currentPlan.value = aiPlan
      plans.value.unshift(aiPlan)

      if (onProgress) onProgress({ stage: 'complete', message: '✨ 行程创建完成！', progress: 100 })
      
      return { success: true, plan: aiPlan }
    } catch (err) {
      console.error('创建计划失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取用户的所有计划
   */
  const fetchPlans = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('用户未登录')
      }

      const { data, error: fetchError } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      plans.value = data
      return { success: true, plans: data }
    } catch (err) {
      console.error('获取计划失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取单个计划详情
   */
  const fetchPlanById = async (planId) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (fetchError) throw fetchError

      currentPlan.value = data
      return { success: true, plan: data }
    } catch (err) {
      console.error('获取计划失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新计划
   */
  const updatePlan = async (planId, updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('travel_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single()

      if (updateError) throw updateError

      // 更新本地状态
      const index = plans.value.findIndex(p => p.id === planId)
      if (index !== -1) {
        plans.value[index] = data
      }

      if (currentPlan.value?.id === planId) {
        currentPlan.value = data
      }

      return { success: true, plan: data }
    } catch (err) {
      console.error('更新计划失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除计划
   */
  const deletePlan = async (planId) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('travel_plans')
        .delete()
        .eq('id', planId)

      if (deleteError) throw deleteError

      // 从本地移除
      plans.value = plans.value.filter(p => p.id !== planId)
      
      if (currentPlan.value?.id === planId) {
        currentPlan.value = null
      }

      return { success: true }
    } catch (err) {
      console.error('删除计划失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 优化当前计划
   */
  const optimizePlan = async () => {
    if (!currentPlan.value) {
      return { success: false, error: '没有可优化的计划' }
    }

    try {
      loading.value = true
      error.value = null

      const optimized = await aiService.optimizeItinerary(currentPlan.value)
      
      // 更新到数据库
      if (currentPlan.value.id) {
        await updatePlan(currentPlan.value.id, {
          itinerary: optimized.itinerary,
          budget_breakdown: optimized.budget,
          tips: optimized.tips
        })
      }

      currentPlan.value = optimized
      return { success: true, plan: optimized }
    } catch (err) {
      console.error('优化计划失败:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置当前计划
   */
  const setCurrentPlan = (plan) => {
    currentPlan.value = plan
  }

  /**
   * 清空当前计划
   */
  const clearCurrentPlan = () => {
    currentPlan.value = null
  }

  return {
    plans,
    currentPlan,
    loading,
    error,
    hasPlan,
    createPlan,
    fetchPlans,
    fetchPlanById,
    updatePlan,
    deletePlan,
    optimizePlan,
    setCurrentPlan,
    clearCurrentPlan
  }
})
