<template>
  <div class="plan-list-container">
    <!-- 顶部导航 -->
    <nav class="plan-nav">
      <div class="nav-content">
        <button @click="goBack" class="btn-back">
          <span>←</span> 返回
        </button>
        <h2>我的行程</h2>
        <button @click="createNew" class="btn-create">
          <span>+</span> 创建新行程
        </button>
      </div>
    </nav>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="loadPlans" class="btn-retry">重新加载</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!plans || plans.length === 0" class="empty-container">
      <div class="empty-icon">✈️</div>
      <h3>还没有旅行计划</h3>
      <p>创建您的第一个旅行计划，开启精彩旅程！</p>
      <button @click="createNew" class="btn-create-primary">
        立即创建
      </button>
    </div>

    <!-- 行程列表 -->
    <div v-else class="plan-list-content">
      <div class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card"
          @click="viewPlan(plan.id)"
        >
          <!-- 卡片头部 -->
          <div class="plan-card-header">
            <div class="plan-destination">
              <span class="destination-icon">📍</span>
              <h3>{{ plan.destination }}</h3>
            </div>
            <div class="plan-date">
              {{ formatDate(plan.created_at) }}
            </div>
          </div>

          <!-- 卡片内容 -->
          <div class="plan-card-body">
            <div class="plan-info">
              <div class="info-item">
                <span class="info-icon">📅</span>
                <span>{{ plan.days }} 天</span>
              </div>
              <div class="info-item">
                <span class="info-icon">💰</span>
                <span>¥{{ formatBudget(plan.budget) }}</span>
              </div>
              <div class="info-item" v-if="plan.travelers">
                <span class="info-icon">👥</span>
                <span>{{ plan.travelers }} 人</span>
              </div>
            </div>

            <!-- 偏好标签 -->
            <div class="plan-tags" v-if="plan.preferences">
              <span
                v-for="(pref, index) in getPreferenceTags(plan.preferences)"
                :key="index"
                class="tag"
              >
                {{ pref }}
              </span>
            </div>

            <!-- 摘要 -->
            <div class="plan-summary" v-if="plan.summary">
              {{ truncateSummary(plan.summary) }}
            </div>
          </div>

          <!-- 卡片底部操作 -->
          <div class="plan-card-footer">
            <button @click.stop="viewPlan(plan.id)" class="btn-view">
              查看详情
            </button>
            <button @click.stop="deletePlan(plan.id)" class="btn-delete">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTravelStore } from '@/stores/travel'

const router = useRouter()
const travelStore = useTravelStore()

const plans = ref([])
const loading = ref(false)
const error = ref(null)

// 加载行程列表
const loadPlans = async () => {
  loading.value = true
  error.value = null
  
  const result = await travelStore.fetchPlans()
  
  if (result.success) {
    plans.value = result.plans
  } else {
    error.value = result.error || '加载失败，请重试'
  }
  
  loading.value = false
}

// 查看行程详情
const viewPlan = (planId) => {
  router.push(`/plan/${planId}`)
}

// 创建新行程
const createNew = () => {
  router.push('/plan/create')
}

// 返回
const goBack = () => {
  router.push('/dashboard')
}

// 删除行程
const deletePlan = async (planId) => {
  if (!confirm('确定要删除这个行程吗？')) {
    return
  }

  const result = await travelStore.deletePlan(planId)
  
  if (result.success) {
    // 重新加载列表
    await loadPlans()
  } else {
    alert('删除失败：' + result.error)
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化预算
const formatBudget = (budget) => {
  if (!budget) return '0'
  return budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取偏好标签
const getPreferenceTags = (preferences) => {
  if (!preferences) return []
  if (typeof preferences === 'string') {
    return preferences.split(/[,，、]/).map(p => p.trim()).filter(p => p).slice(0, 3)
  }
  if (Array.isArray(preferences)) {
    return preferences.slice(0, 3)
  }
  return []
}

// 截断摘要
const truncateSummary = (summary) => {
  if (!summary) return ''
  return summary.length > 80 ? summary.substring(0, 80) + '...' : summary
}

// 页面加载时获取数据
onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
.plan-list-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.plan-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.nav-content h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
  flex: 1;
  text-align: center;
}

.btn-back,
.btn-create {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-back:hover,
.btn-create:hover {
  background: #667eea;
  color: white;
}

.loading-container,
.error-container,
.empty-container {
  max-width: 600px;
  margin: 100px auto;
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

.error-icon,
.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-container p,
.empty-container p {
  color: #666;
  font-size: 16px;
  margin: 20px 0;
}

.empty-container h3 {
  color: #333;
  font-size: 24px;
  margin: 20px 0;
}

.btn-retry,
.btn-create-primary {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 20px;
}

.btn-retry:hover,
.btn-create-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.plan-list-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.plan-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.plan-card-header {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.plan-destination {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.destination-icon {
  font-size: 24px;
}

.plan-destination h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.plan-date {
  font-size: 13px;
  opacity: 0.9;
}

.plan-card-body {
  padding: 24px;
  flex: 1;
}

.plan-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.info-icon {
  font-size: 16px;
}

.plan-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  background: #f0f2f5;
  color: #666;
  border-radius: 12px;
  font-size: 12px;
}

.plan-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.plan-card-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
}

.btn-view,
.btn-delete {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-view {
  background: #667eea;
  color: white;
}

.btn-view:hover {
  background: #5568d3;
}

.btn-delete {
  background: #f5f5f5;
  color: #666;
}

.btn-delete:hover {
  background: #ff4757;
  color: white;
}

@media (max-width: 768px) {
  .nav-content h2 {
    font-size: 18px;
  }

  .btn-back span,
  .btn-create span {
    display: inline;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plan-card-header {
    padding: 20px;
  }

  .plan-card-body {
    padding: 20px;
  }
}
</style>
