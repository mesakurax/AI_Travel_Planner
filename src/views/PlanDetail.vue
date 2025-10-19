<template>
  <div class="plan-detail">
    <div class="detail-container">
      <!-- 左侧地图 -->
      <div class="map-section">
        <TravelMap
          ref="mapRef"
          :markers="allMarkers"
          :route="routePoints"
          @markerClick="handleMarkerClick"
        />
      </div>

      <!-- 右侧行程详情 -->
      <div class="itinerary-section">
        <div class="plan-header">
          <button @click="goBack" class="back-btn">← 返回</button>
          <h2>{{ plan?.title || '加载中...' }}</h2>
          <div class="actions">
            <button @click="optimizePlan" class="action-btn" :disabled="loading">
              ✨ 优化行程
            </button>
            <button @click="savePlan" class="action-btn primary">
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
                <span class="value">{{ plan.request.destination }}</span>
              </div>
              <div class="info-item">
                <span class="label">📅 天数:</span>
                <span class="value">{{ plan.request.days }}天</span>
              </div>
              <div class="info-item">
                <span class="label">💰 预算:</span>
                <span class="value">¥{{ plan.request.budget.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <span class="label">👥 人数:</span>
                <span class="value">{{ plan.request.travelers }}人</span>
              </div>
            </div>
            <p v-if="plan.summary" class="summary-text">{{ plan.summary }}</p>
          </div>

          <!-- 预算分解 -->
          <div class="budget-card">
            <h3>预算分解</h3>
            <div class="budget-items">
              <div class="budget-item">
                <span class="label">🚄 交通</span>
                <span class="value">¥{{ plan.budget.transportation.toLocaleString() }}</span>
              </div>
              <div class="budget-item">
                <span class="label">🏨 住宿</span>
                <span class="value">¥{{ plan.budget.accommodation.toLocaleString() }}</span>
              </div>
              <div class="budget-item">
                <span class="label">🍜 餐饮</span>
                <span class="value">¥{{ plan.budget.food.toLocaleString() }}</span>
              </div>
              <div class="budget-item">
                <span class="label">🎫 活动</span>
                <span class="value">¥{{ plan.budget.activities.toLocaleString() }}</span>
              </div>
              <div class="budget-item">
                <span class="label">🛍️ 购物</span>
                <span class="value">¥{{ plan.budget.shopping.toLocaleString() }}</span>
              </div>
              <div class="budget-item total">
                <span class="label">总计</span>
                <span class="value">¥{{ plan.budget.total.toLocaleString() }}</span>
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
const loading = ref(false)

const plan = computed(() => travelStore.currentPlan)

// 所有标记点
const allMarkers = computed(() => {
  if (!plan.value) return []
  
  const markers = []
  plan.value.itinerary.forEach(day => {
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
  })
  
  return markers
})

// 路线点
const routePoints = computed(() => {
  return allMarkers.value.map(m => ({ lng: m.lng, lat: m.lat }))
})

onMounted(async () => {
  const planId = route.params.id
  
  if (planId) {
    await travelStore.fetchPlanById(planId)
  } else if (!plan.value) {
    router.push('/plan/create')
  }
})

const goBack = () => {
  router.push('/dashboard')
}

const optimizePlan = async () => {
  loading.value = true
  await travelStore.optimizePlan()
  loading.value = false
}

const savePlan = async () => {
  // 已在创建时保存，这里可以做更新
  alert('计划已保存！')
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
}

.action-btn:hover {
  background: #f5f7ff;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
