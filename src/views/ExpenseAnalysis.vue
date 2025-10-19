<template>
  <div class="expense-analysis">
    <nav class="dashboard-nav">
      <div class="nav-content">
        <button @click="goBack" class="back-btn">← 返回</button>
        <h2>💰 费用管理</h2>
      </div>
    </nav>

    <div class="expense-content">
      <!-- 选择行程 -->
      <div class="plan-selector-section">
        <h3>选择行程</h3>
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载行程列表中...</p>
        </div>
        <div v-else-if="plans.length === 0" class="empty-state">
          <p>暂无行程</p>
          <button @click="createPlan" class="btn-create">创建新行程</button>
        </div>
        <div v-else class="plan-selector">
          <div
            v-for="plan in plans"
            :key="plan.id"
            @click="selectPlan(plan)"
            :class="['plan-card', { active: selectedPlan?.id === plan.id }]"
          >
            <div class="plan-header">
              <h4>{{ plan.title }}</h4>
              <span class="plan-budget">¥{{ (plan.budget || 0).toLocaleString() }}</span>
            </div>
            <div class="plan-info">
              <span>📍 {{ plan.destination }}</span>
              <span>📅 {{ plan.days }}天</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 费用可视化展示 -->
      <div v-if="selectedPlan" class="expense-visualization">
        <h3>费用分析 - {{ selectedPlan.title }}</h3>
        
        <!-- 总览卡片 -->
        <div class="overview-cards">
          <div class="overview-card total">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <span class="card-label">总预算</span>
              <span class="card-value">¥{{ totalBudget.toLocaleString() }}</span>
            </div>
          </div>
          <div class="overview-card spent">
            <div class="card-icon">💸</div>
            <div class="card-content">
              <span class="card-label">已规划支出</span>
              <span class="card-value">¥{{ totalSpent.toLocaleString() }}</span>
            </div>
          </div>
          <div class="overview-card remaining">
            <div class="card-icon">💵</div>
            <div class="card-content">
              <span class="card-label">剩余预算</span>
              <span class="card-value">¥{{ remaining.toLocaleString() }}</span>
            </div>
          </div>
          <div class="overview-card percentage">
            <div class="card-icon">📊</div>
            <div class="card-content">
              <span class="card-label">预算使用率</span>
              <span class="card-value">{{ usagePercentage }}%</span>
            </div>
          </div>
        </div>

        <!-- 预算分解饼图 -->
        <div class="chart-section">
          <h4>预算分配（按类型）</h4>
          <div class="pie-chart-container">
            <svg viewBox="0 0 200 200" class="pie-chart">
              <circle
                v-for="(segment, index) in pieSegments"
                :key="index"
                cx="100"
                cy="100"
                r="80"
                fill="none"
                :stroke="segment.color"
                :stroke-width="60"
                :stroke-dasharray="`${segment.percentage * 502.4 / 100} 502.4`"
                :stroke-dashoffset="segment.offset"
                :transform="`rotate(-90 100 100)`"
              />
              <text x="100" y="95" text-anchor="middle" class="chart-center-text">实际支出</text>
              <text x="100" y="115" text-anchor="middle" class="chart-center-value">
                ¥{{ totalSpent.toLocaleString() }}
              </text>
            </svg>
            <div class="pie-legend">
              <div v-for="item in categoryExpenses" :key="item.key" class="legend-item">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-value">¥{{ item.value.toLocaleString() }}</span>
                <span class="legend-percentage">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 每日费用柱状图 -->
        <div class="chart-section">
          <h4>每日费用分布</h4>
          <div class="bar-chart-container">
            <div class="bar-chart">
              <div
                v-for="day in dailyExpenses"
                :key="day.day"
                class="bar-item"
              >
                <div class="bar-wrapper">
                  <div
                    class="bar"
                    :style="{
                      height: `${(day.total / maxDailyExpense) * 100}%`,
                      backgroundColor: getBarColor(day.total)
                    }"
                  >
                    <span class="bar-value">¥{{ day.total }}</span>
                  </div>
                </div>
                <span class="bar-label">第{{ day.day }}天</span>
              </div>
            </div>
            <div class="chart-y-axis">
              <span>¥{{ maxDailyExpense }}</span>
              <span>¥{{ Math.round(maxDailyExpense / 2) }}</span>
              <span>¥0</span>
            </div>
          </div>
        </div>

        <!-- 详细费用列表 -->
        <div class="expense-details">
          <h4>详细费用清单</h4>
          <div class="expense-summary">
            <p>共 {{ expenseList.length }} 项支出，总计 ¥{{ totalSpent.toLocaleString() }}</p>
          </div>
          <div class="expense-table">
            <div class="table-header">
              <span>日期</span>
              <span>项目</span>
              <span>类型</span>
              <span>金额</span>
            </div>
            <div class="table-body">
              <div v-for="item in expenseList" :key="item.id" class="table-row">
                <span class="expense-day">第{{ item.day }}天</span>
                <span class="expense-name">{{ item.name }}</span>
                <span class="expense-type">
                  <span :class="['type-badge', item.typeClass]">
                    {{ item.typeIcon }} {{ item.type }}
                  </span>
                </span>
                <span class="expense-amount">¥{{ item.cost }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未选择行程时的提示 -->
      <div v-else class="no-selection">
        <div class="no-selection-icon">📊</div>
        <p>请选择一个行程查看费用分析</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTravelStore } from '@/stores/travel'

const router = useRouter()
const travelStore = useTravelStore()

const loading = ref(true)
const plans = ref([])
const selectedPlan = ref(null)

// 类型颜色映射
const categoryColors = {
  '景点': '#667eea',
  '餐厅': '#f093fb',
  '住宿': '#764ba2',
  '交通': '#4facfe',
  '活动': '#43e97b',
  '购物': '#fa709a',
  '其他': '#95a5a6'
}

onMounted(async () => {
  loading.value = true
  try {
    await travelStore.fetchPlans()
    plans.value = travelStore.plans
    // 默认选择第一个行程
    if (plans.value.length > 0) {
      selectPlan(plans.value[0])
    }
  } catch (error) {
    console.error('加载行程失败:', error)
  } finally {
    loading.value = false
  }
})

const selectPlan = (plan) => {
  selectedPlan.value = plan
}

const goBack = () => {
  router.push('/dashboard')
}

const createPlan = () => {
  router.push('/plan/create')
}

// 计算总预算
const totalBudget = computed(() => {
  if (!selectedPlan.value) return 0
  return selectedPlan.value.budget || 0
})

// 每日费用明细
const dailyExpenses = computed(() => {
  if (!selectedPlan.value?.itinerary) return []
  
  return selectedPlan.value.itinerary.map(day => {
    let total = 0
    
    // 活动费用
    if (day.activities) {
      day.activities.forEach(activity => {
        total += activity.estimatedCost || 0
      })
    }
    
    // 住宿费用
    if (day.accommodation?.price) {
      total += day.accommodation.price
    }
    
    return {
      day: day.day,
      total
    }
  })
})

// 计算已规划支出（将每一天求和）
const totalSpent = computed(() => {
  return dailyExpenses.value.reduce((sum, day) => sum + day.total, 0)
})

// 剩余预算
const remaining = computed(() => {
  return totalBudget.value - totalSpent.value
})

// 使用率
const usagePercentage = computed(() => {
  if (totalBudget.value === 0) return 0
  return Math.round((totalSpent.value / totalBudget.value) * 100)
})

// 详细费用列表
const expenseList = computed(() => {
  if (!selectedPlan.value?.itinerary) return []
  
  const list = []
  selectedPlan.value.itinerary.forEach(day => {
    // 添加活动费用
    if (day.activities) {
      day.activities.forEach((activity, index) => {
        if (activity.estimatedCost) {
          list.push({
            id: `${day.day}-activity-${index}`,
            day: day.day,
            name: activity.name,
            type: activity.type || '活动',
            typeIcon: getTypeIcon(activity.type),
            typeClass: getTypeClass(activity.type),
            cost: activity.estimatedCost
          })
        }
      })
    }
    
    // 添加住宿费用
    if (day.accommodation?.price) {
      list.push({
        id: `${day.day}-accommodation`,
        day: day.day,
        name: day.accommodation.name,
        type: '住宿',
        typeIcon: '🏨',
        typeClass: 'accommodation',
        cost: day.accommodation.price
      })
    }
  })
  
  return list
})

// 按类型统计费用
const categoryExpenses = computed(() => {
  const categoryMap = {}
  
  expenseList.value.forEach(item => {
    const type = item.type
    if (!categoryMap[type]) {
      categoryMap[type] = {
        key: type,
        label: `${item.typeIcon} ${type}`,
        value: 0,
        color: categoryColors[type] || categoryColors['其他']
      }
    }
    categoryMap[type].value += item.cost
  })
  
  const items = Object.values(categoryMap)
  
  return items
    .filter(item => item.value > 0)
    .map(item => ({
      ...item,
      percentage: totalSpent.value > 0 ? Math.round((item.value / totalSpent.value) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value)
})

// 饼图分段数据
const pieSegments = computed(() => {
  let cumulativePercentage = 0
  return categoryExpenses.value.map(item => {
    const segment = {
      percentage: item.percentage,
      color: item.color,
      offset: -cumulativePercentage * 502.4 / 100
    }
    cumulativePercentage += item.percentage
    return segment
  })
})

// 最大每日费用（用于柱状图缩放）
const maxDailyExpense = computed(() => {
  if (dailyExpenses.value.length === 0) return 1000
  return Math.max(...dailyExpenses.value.map(d => d.total), 1000)
})

// 柱状图颜色
const getBarColor = (value) => {
  const percentage = (value / maxDailyExpense.value) * 100
  if (percentage > 80) return '#f093fb'
  if (percentage > 50) return '#667eea'
  return '#4facfe'
}

const getTypeIcon = (type) => {
  const icons = {
    '景点': '🏛️',
    '餐厅': '🍽️',
    '住宿': '🏨',
    '交通': '🚗',
    '活动': '🎯',
    '购物': '🛍️'
  }
  return icons[type] || '📍'
}

const getTypeClass = (type) => {
  const classes = {
    '景点': 'attraction',
    '餐厅': 'food',
    '住宿': 'accommodation',
    '交通': 'transportation',
    '活动': 'activity',
    '购物': 'shopping'
  }
  return classes[type] || 'other'
}
</script>

<style scoped>
.expense-analysis {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.nav-content h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.expense-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* 行程选择器 */
.plan-selector-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.plan-selector-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-create {
  margin-top: 16px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.plan-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.plan-card {
  padding: 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.plan-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.plan-card.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.plan-header h4 {
  margin: 0;
  font-size: 16px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-budget {
  font-size: 18px;
  font-weight: 700;
}

.plan-info {
  display: flex;
  gap: 12px;
  font-size: 13px;
  opacity: 0.9;
}

/* 费用可视化 */
.expense-visualization {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.expense-visualization > h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  color: #333;
}

/* 总览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.overview-card {
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.overview-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.overview-card.spent {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.overview-card.remaining {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.overview-card.percentage {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.card-icon {
  font-size: 36px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-label {
  font-size: 13px;
  opacity: 0.9;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
}

/* 图表区域 */
.chart-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
}

.chart-section h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

/* 饼图 */
.pie-chart-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
  align-items: center;
}

.pie-chart {
  width: 100%;
  max-width: 300px;
}

.chart-center-text {
  font-size: 14px;
  fill: #666;
}

.chart-center-value {
  font-size: 18px;
  font-weight: 700;
  fill: #333;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: grid;
  grid-template-columns: 20px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-label {
  font-size: 14px;
  color: #333;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.legend-percentage {
  font-size: 13px;
  color: #999;
  min-width: 40px;
  text-align: right;
}

/* 柱状图 */
.bar-chart-container {
  display: grid;
  grid-template-columns: 1fr 60px;
  gap: 16px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  min-height: 300px;
  padding: 20px 0;
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-wrapper {
  width: 100%;
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  max-width: 60px;
  min-height: 20px;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: all 0.3s;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
}

.bar:hover {
  opacity: 0.8;
  transform: scaleY(1.02);
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.bar-label {
  font-size: 13px;
  color: #666;
  text-align: center;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 0;
  font-size: 12px;
  color: #999;
  text-align: right;
  height: 290px;
}

/* 费用详情表格 */
.expense-details {
  margin-top: 32px;
}

.expense-details h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.expense-summary {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  border-radius: 4px;
  color: #667eea;
  font-weight: 500;
}

.expense-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 100px 2fr 1fr 120px;
  gap: 16px;
  padding: 16px 20px;
  background: #f9fafb;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid #e5e7eb;
}

.table-body {
  max-height: 500px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 2fr 1fr 120px;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  transition: background 0.2s;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row:last-child {
  border-bottom: none;
}

.expense-day {
  color: #667eea;
  font-weight: 600;
}

.expense-name {
  color: #333;
}

.type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.attraction {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.food {
  background: #fff3e0;
  color: #e65100;
}

.type-badge.accommodation {
  background: #f3e5f5;
  color: #7b1fa2;
}

.type-badge.transportation {
  background: #e8f5e9;
  color: #2e7d32;
}

.type-badge.activity {
  background: #fce4ec;
  color: #c2185b;
}

.type-badge.shopping {
  background: #e0f2f1;
  color: #00695c;
}

.type-badge.other {
  background: #f5f5f5;
  color: #616161;
}

.expense-amount {
  color: #667eea;
  font-weight: 600;
  text-align: right;
}

/* 未选择状态 */
.no-selection {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.no-selection-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .pie-chart-container {
    grid-template-columns: 1fr;
  }
  
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .expense-content {
    padding: 16px;
  }
  
  .plan-selector {
    grid-template-columns: 1fr;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .bar-chart-container {
    grid-template-columns: 1fr;
  }
  
  .chart-y-axis {
    display: none;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 80px 1.5fr 1fr 100px;
    gap: 8px;
    padding: 12px 16px;
    font-size: 13px;
  }
}
</style>
