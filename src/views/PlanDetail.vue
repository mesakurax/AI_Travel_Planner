<template>
  <div class="plan-detail">
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
          <div class="actions">
            <button 
              @click="optimizePlan" 
              class="action-btn" 
              :disabled="loading || optimizing"
              :class="{ optimizing: optimizing }"
            >
              <span v-if="optimizing" class="btn-spinner"></span>
              <span v-else>✨</span>
              {{ optimizing ? '优化中...' : '优化行程' }}
            </button>
            <button @click="savePlan" class="action-btn primary" :disabled="loading || optimizing">
              💾 保存
            </button>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import TravelMap from '@/components/TravelMap.vue'

const route = useRoute()
const router = useRouter()
const travelStore = useTravelStore()

const mapRef = ref(null)
const loading = ref(true)
const error = ref(null)
const optimizing = ref(false)
const message = ref('')
const messageType = ref('') // 'success' | 'error' | 'info'

const plan = computed(() => travelStore.currentPlan)

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

const optimizePlan = async () => {
  if (optimizing.value) return
  
  if (!confirm('确定要优化这个行程吗？AI 将重新调整路线和时间安排。')) {
    return
  }
  
  optimizing.value = true
  showMessage('正在优化行程，请稍候...', 'info')
  
  try {
    const result = await travelStore.optimizePlan()
    
    if (result.success) {
      showMessage('✅ 行程优化成功！', 'success')
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

const savePlan = async () => {
  if (!plan.value || !plan.value.id) {
    showMessage('❌ 无法保存：计划数据无效', 'error')
    return
  }
  
  try {
    showMessage('正在保存...', 'info')
    
    const result = await travelStore.updatePlan(plan.value.id, {
      itinerary: plan.value.itinerary,
      budget_breakdown: plan.value.budget_breakdown,
      tips: plan.value.tips
    })
    
    if (result.success) {
      showMessage('✅ 保存成功！', 'success')
    } else {
      throw new Error(result.error || '保存失败')
    }
  } catch (err) {
    console.error('保存失败:', err)
    showMessage(`❌ 保存失败: ${err.message}`, 'error')
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
}

.action-btn:hover:not(:disabled) {
  background: #f5f7ff;
  transform: translateY(-1px);
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
}
</style>
