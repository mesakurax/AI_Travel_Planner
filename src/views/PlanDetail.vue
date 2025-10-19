<template>
  <div class="plan-detail">
    <!-- 自定义确认对话框（全局，不受条件影响） -->
    <ConfirmDialog
      ref="confirmDialog"
      :title="dialogConfig.title"
      :message="dialogConfig.message"
      :icon="dialogConfig.icon"
      :type="dialogConfig.type"
      :confirmText="dialogConfig.confirmText"
      :cancelText="dialogConfig.cancelText"
      @confirm="dialogConfig.onConfirm"
      @cancel="dialogConfig.onCancel"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>正在加载行程...</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-overlay">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <p class="error-hint">将在 3 秒后返回行程列表...</p>
      </div>
    </div>

    <!-- 正常内容 -->
    <div v-else class="detail-container">
      <!-- 左侧地图 -->
      <div class="map-section">
        <TravelMap
          v-if="plan"
          ref="mapRef"
          :markers="allMarkers"
          :route="routePoints"
          @markerClick="handleMarkerClick"
        />
      </div>

      <!-- 右侧行程详情 -->
      <div class="itinerary-section">
        <!-- 消息提示 -->
        <transition name="message">
          <div v-if="message" :class="['message-toast', messageType]">
            <span class="message-text">{{ message }}</span>
          </div>
        </transition>

        <div class="plan-header">
          <button @click="goBack" class="back-btn">← 返回</button>
          <h2>{{ plan?.title || '加载中...' }}</h2>
          
          <!-- 未优化状态：显示优化按钮 -->
          <div v-if="!hasOptimized" class="actions">
            <button 
              @click="optimizePlan" 
              class="action-btn" 
              :disabled="loading || optimizing"
              :class="{ optimizing: optimizing }"
            >
              <span v-if="optimizing" class="btn-spinner"></span>
              <span v-else>✨</span>
              {{ optimizing ? '优化中...请不要离开当前页面' : '优化行程' }}
            </button>
          </div>

          <!-- 已优化状态：显示对比和操作按钮 -->
          <div v-else class="actions-optimized">
            <!-- 版本切换按钮 -->
            <div class="version-toggle">
              <button 
                @click="showingOptimized = false" 
                :class="['toggle-btn', { active: !showingOptimized }]"
              >
                📋 原始版本
              </button>
              <button 
                @click="showingOptimized = true" 
                :class="['toggle-btn', { active: showingOptimized }]"
              >
                ✨ 优化版本
              </button>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <button @click="discardOptimization" class="action-btn btn-discard">
                放弃优化
              </button>
              <button @click="applyOptimization" class="action-btn btn-apply">
                应用优化
              </button>
            </div>
          </div>
        </div>

        <div v-if="plan" class="plan-content">
          <!-- 行程概要 -->
          <div class="summary-card">
            <h3>行程概要</h3>
            <div class="summary-info">
              <div class="info-item">
                <span class="label">📍 目的地:</span>
                <span class="value">{{ plan.destination }}</span>
              </div>
              <div class="info-item">
                <span class="label">📅 天数:</span>
                <span class="value">{{ plan.days }}天</span>
              </div>
              <div class="info-item">
                <span class="label">💰 预算:</span>
                <span class="value">¥{{ (plan.budget || 0).toLocaleString() }}</span>
              </div>
              <div class="info-item" v-if="plan.travelers">
                <span class="label">👥 人数:</span>
                <span class="value">{{ plan.travelers }}人</span>
              </div>
            </div>
            <p v-if="plan.summary" class="summary-text">{{ plan.summary }}</p>
          </div>

          <!-- 预算分解 -->
          <div class="budget-card" v-if="plan.budget_breakdown">
            <h3>预算分解</h3>
            <div class="budget-items">
              <div class="budget-item" v-if="plan.budget_breakdown.transportation">
                <span class="label">🚄 交通</span>
                <span class="value">¥{{ (plan.budget_breakdown.transportation || 0).toLocaleString() }}</span>
              </div>
              <div class="budget-item" v-if="plan.budget_breakdown.accommodation">
                <span class="label">🏨 住宿</span>
                <span class="value">¥{{ (plan.budget_breakdown.accommodation || 0).toLocaleString() }}</span>
              </div>
              <div class="budget-item" v-if="plan.budget_breakdown.food">
                <span class="label">🍜 餐饮</span>
                <span class="value">¥{{ (plan.budget_breakdown.food || 0).toLocaleString() }}</span>
              </div>
              <div class="budget-item" v-if="plan.budget_breakdown.activities">
                <span class="label">🎫 活动</span>
                <span class="value">¥{{ (plan.budget_breakdown.activities || 0).toLocaleString() }}</span>
              </div>
              <div class="budget-item" v-if="plan.budget_breakdown.shopping">
                <span class="label">🛍️ 购物</span>
                <span class="value">¥{{ (plan.budget_breakdown.shopping || 0).toLocaleString() }}</span>
              </div>
              <div class="budget-item total">
                <span class="label">总计</span>
                <span class="value">¥{{ (plan.budget_breakdown.total || plan.budget || 0).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- 详细行程 -->
          <div class="days-list">
            <div v-for="day in plan.itinerary" :key="day.day" class="day-card">
              <div class="day-header">
                <h3>第 {{ day.day }} 天</h3>
                <span class="date">{{ day.date }}</span>
              </div>

              <div class="activities-list">
                <div
                  v-for="(activity, index) in day.activities"
                  :key="index"
                  class="activity-item"
                  @click="highlightLocation(activity)"
                >
                  <div class="activity-time">{{ activity.time }}</div>
                  <div class="activity-content">
                    <div class="activity-header">
                      <span class="activity-type">{{ getTypeIcon(activity.type) }} {{ activity.type }}</span>
                      <span class="activity-cost">¥{{ activity.estimatedCost }}</span>
                    </div>
                    <h4>{{ activity.name }}</h4>
                    <p v-if="activity.description">{{ activity.description }}</p>
                    <p v-if="activity.address" class="address">📍 {{ activity.address }}</p>
                    <p v-if="activity.tips" class="tips">💡 {{ activity.tips }}</p>
                  </div>
                </div>
              </div>

              <div v-if="day.accommodation" class="accommodation">
                <h4>🏨 住宿</h4>
                <p><strong>{{ day.accommodation.name }}</strong></p>
                <p v-if="day.accommodation.address">📍 {{ day.accommodation.address }}</p>
                <p class="price">💰 ¥{{ day.accommodation.price }}</p>
              </div>
            </div>
          </div>

          <!-- 旅行建议 -->
          <div v-if="plan.tips && plan.tips.length" class="tips-card">
            <h3>💡 旅行建议</h3>
            <ul>
              <li v-for="(tip, index) in plan.tips" :key="index">{{ tip }}</li>
            </ul>
          </div>
        </div>

        <div v-else class="loading-placeholder">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import TravelMap from '@/components/TravelMap.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const travelStore = useTravelStore()

const mapRef = ref(null)
const confirmDialog = ref(null)
const loading = ref(true)
const error = ref(null)
const optimizing = ref(false)
const message = ref('')
const messageType = ref('') // 'success' | 'error' | 'info'

// 优化相关状态
const hasOptimized = ref(false) // 是否已优化
const showingOptimized = ref(false) // 当前是否显示优化版本
const originalPlan = ref(null) // 原始行程
const optimizedPlan = ref(null) // 优化后的行程

const dialogConfig = reactive({
  title: '确认操作',
  message: '',
  icon: '❓',
  type: 'default', // 'default' | 'warning' | 'danger'
  confirmText: '确定',
  cancelText: '取消',
  onConfirm: () => {},
  onCancel: () => {}
})

// 当前显示的行程（原始或优化版本）
const plan = computed(() => {
  if (hasOptimized.value && showingOptimized.value) {
    return optimizedPlan.value
  }
  return originalPlan.value || travelStore.currentPlan
})

// 所有标记点
const allMarkers = computed(() => {
  if (!plan.value || !plan.value.itinerary) return []
  
  const markers = []
  plan.value.itinerary.forEach(day => {
    if (day.activities) {
      day.activities.forEach(activity => {
        if (activity.location) {
          markers.push({
            ...activity.location,
            name: activity.name,
            description: activity.description,
            estimatedCost: activity.estimatedCost,
            type: activity.type
          })
        }
      })
    }
  })
  
  return markers
})

// 路线点
const routePoints = computed(() => {
  return allMarkers.value.map(m => ({ lng: m.lng, lat: m.lat }))
})

onMounted(async () => {
  const planId = route.params.id
  
  if (!planId) {
    router.push('/plans')
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const result = await travelStore.fetchPlanById(planId)
    
    if (!result.success) {
      throw new Error(result.error || '加载计划失败')
    }
    
    // 保存原始行程
    originalPlan.value = JSON.parse(JSON.stringify(travelStore.currentPlan))
    
    // 等待一下让数据渲染
    setTimeout(() => {
      loading.value = false
    }, 300)
  } catch (err) {
    console.error('加载计划失败:', err)
    error.value = err.message
    loading.value = false
    
    // 如果加载失败，3秒后返回列表
    setTimeout(() => {
      router.push('/plans')
    }, 3000)
  }
})

const goBack = () => {
  router.push('/plans')
}

const showMessage = (msg, type = 'info') => {
  message.value = msg
  messageType.value = type
  
  // 3秒后自动隐藏
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 3000)
}

const optimizePlan = () => {
  if (optimizing.value) return
  
  // 配置对话框
  dialogConfig.title = '优化行程'
  dialogConfig.message = 'AI 将重新分析并调整路线、时间安排和预算分配，使行程更加合理。确定要继续吗？'
  dialogConfig.icon = '✨'
  dialogConfig.type = 'warning'
  dialogConfig.confirmText = '开始优化'
  dialogConfig.cancelText = '取消'
  dialogConfig.onConfirm = performOptimization
  dialogConfig.onCancel = () => {
    // 取消操作，不做任何事
  }
  
  // 显示对话框
  confirmDialog.value?.show()
}

const performOptimization = async () => {
  optimizing.value = true
  showMessage('AI 正在分析行程，重新规划路线...', 'info')
  
  try {
    // 使用原始行程进行优化
    const planToOptimize = originalPlan.value || travelStore.currentPlan
    const result = await travelStore.optimizePlan()
    
    if (result.success) {
      // 保存优化后的行程
      optimizedPlan.value = JSON.parse(JSON.stringify(result.plan))
      hasOptimized.value = true
      showingOptimized.value = true // 自动切换到优化版本
      
      showMessage('✅ 优化完成！请查看对比效果', 'success')
    } else {
      throw new Error(result.error || '优化失败')
    }
  } catch (err) {
    console.error('优化失败:', err)
    showMessage(`❌ 优化失败: ${err.message}`, 'error')
  } finally {
    optimizing.value = false
  }
}

// 放弃优化
const discardOptimization = () => {
  dialogConfig.title = '放弃优化'
  dialogConfig.message = '确定要放弃优化后的行程吗？优化结果将被丢弃。'
  dialogConfig.icon = '❌'
  dialogConfig.type = 'warning'
  dialogConfig.confirmText = '放弃'
  dialogConfig.cancelText = '取消'
  dialogConfig.onConfirm = () => {
    hasOptimized.value = false
    showingOptimized.value = false
    optimizedPlan.value = null
    showMessage('已放弃优化，恢复原始行程', 'info')
  }
  
  confirmDialog.value?.show()
}

// 应用优化
const applyOptimization = () => {
  dialogConfig.title = '应用优化'
  dialogConfig.message = '确定要应用优化后的行程吗？原始行程将被替换，此操作可以通过重新加载恢复。'
  dialogConfig.icon = '✅'
  dialogConfig.type = 'default'
  dialogConfig.confirmText = '应用'
  dialogConfig.cancelText = '取消'
  dialogConfig.onConfirm = performApplyOptimization
  
  confirmDialog.value?.show()
}

const performApplyOptimization = async () => {
  if (!optimizedPlan.value || !optimizedPlan.value.id) {
    showMessage('❌ 应用失败：优化数据无效', 'error')
    return
  }
  
  try {
    showMessage('正在保存优化后的行程...', 'info')
    
    const result = await travelStore.updatePlan(optimizedPlan.value.id, {
      itinerary: optimizedPlan.value.itinerary,
      budget_breakdown: optimizedPlan.value.budget_breakdown,
      tips: optimizedPlan.value.tips,
      summary: optimizedPlan.value.summary
    })
    
    if (result.success) {
      // 更新原始行程为优化后的行程
      originalPlan.value = JSON.parse(JSON.stringify(optimizedPlan.value))
      travelStore.setCurrentPlan(optimizedPlan.value)
      
      // 重置优化状态
      hasOptimized.value = false
      showingOptimized.value = false
      optimizedPlan.value = null
      
      showMessage('✅ 优化已应用并保存！', 'success')
    } else {
      throw new Error(result.error || '保存失败')
    }
  } catch (err) {
    console.error('应用优化失败:', err)
    showMessage(`❌ 应用失败: ${err.message}`, 'error')
  }
}

const highlightLocation = (activity) => {
  if (activity.location && mapRef.value) {
    mapRef.value.setCenter(activity.location.lng, activity.location.lat, 15)
  }
}

const handleMarkerClick = (marker) => {
  console.log('点击标记:', marker)
}

const getTypeIcon = (type) => {
  const icons = {
    '景点': '🏛️',
    '餐厅': '🍽️',
    '酒店': '🏨',
    '交通': '🚗',
    '活动': '🎯',
    '购物': '🛍️'
  }
  return icons[type] || '📍'
}
</script>

<style scoped>
.plan-detail {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
}

.loading-overlay,
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content,
.error-content {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p,
.error-content p {
  color: #666;
  font-size: 16px;
  margin: 10px 0;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-hint {
  font-size: 14px;
  color: #999;
}

.detail-container {
  display: grid;
  grid-template-columns: 1fr 500px;
  height: 100vh;
}

.map-section {
  height: 100vh;
  position: sticky;
  top: 0;
}

.itinerary-section {
  background: white;
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 消息提示框 */
.message-toast {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  max-width: 400px;
}

.message-toast.info {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #90caf9;
}

.message-toast.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #81c784;
}

.message-toast.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.message-text {
  flex: 1;
}

/* 消息动画 */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.plan-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 12px;
}

.plan-header h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #333;
}

.actions {
  display: flex;
  gap: 12px;
}

.actions-optimized {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  max-width: 600px;
}

/* 版本切换按钮组 */
.version-toggle {
  display: flex;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.toggle-btn {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.toggle-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.toggle-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border: 1px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.action-btn:hover:not(:disabled) {
  background: #f5f7ff;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.optimizing {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}

/* 放弃优化按钮 */
.btn-discard {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-discard:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: translateY(-1px);
}

/* 应用优化按钮 */
.btn-apply {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-apply:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 按钮内的旋转加载图标 */
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: btn-spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes btn-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.plan-content {
  padding: 20px;
}

.summary-card,
.budget-card,
.tips-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-card h3,
.budget-card h3,
.tips-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.summary-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 13px;
  color: #666;
}

.info-item .value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.summary-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.budget-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.budget-item.total {
  border-top: 2px solid #667eea;
  border-bottom: none;
  padding-top: 12px;
  font-weight: 600;
  color: #667eea;
}

.day-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #667eea;
}

.day-header h3 {
  margin: 0;
  color: #667eea;
}

.date {
  font-size: 14px;
  color: #666;
}

.activity-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.activity-item:hover {
  background: #f0f4ff;
  transform: translateX(4px);
}

.activity-time {
  font-weight: 600;
  color: #667eea;
  white-space: nowrap;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-type {
  font-size: 13px;
  color: #666;
}

.activity-cost {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.activity-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.activity-content p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.address {
  font-size: 13px !important;
  color: #999 !important;
}

.tips {
  font-size: 13px !important;
  color: #667eea !important;
  background: #f0f4ff;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px !important;
}

.accommodation {
  margin-top: 20px;
  padding: 16px;
  background: #fff9e6;
  border-radius: 8px;
  border-left: 4px solid #ffd700;
}

.accommodation h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #333;
}

.accommodation p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.accommodation .price {
  font-weight: 600;
  color: #667eea;
}

.tips-card ul {
  margin: 0;
  padding-left: 20px;
}

.tips-card li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.loading-placeholder {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .detail-container {
    grid-template-columns: 1fr;
  }
  
  .map-section {
    height: 400px;
    position: relative;
  }

  .actions-optimized {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .plan-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .plan-header h2 {
    font-size: 18px;
  }

  .actions,
  .actions-optimized {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .version-toggle {
    width: 100%;
  }

  .toggle-btn {
    font-size: 13px;
    padding: 8px 12px;
  }

  .message-toast {
    left: 16px;
    right: 16px;
    transform: none;
    max-width: none;
  }
}
</style>
