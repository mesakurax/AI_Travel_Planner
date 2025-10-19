<template>
  <div class="plan-creator">
    <div class="creator-header">
      <h2>🧭 智能行程规划</h2>
      <p>用语音或文字描述您的旅行需求，AI 将为您生成详细的旅行计划</p>
    </div>

    <div class="creator-body">
      <VoiceInput
        ref="voiceInput"
        @submit="handleInput"
        :disabled="loading"
      />

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>

      <div v-if="error" class="error-state">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="retry" class="retry-btn">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTravelStore } from '@/stores/travel'
import VoiceInput from '@/components/VoiceInput.vue'

const router = useRouter()
const travelStore = useTravelStore()

const voiceInput = ref(null)
const loading = ref(false)
const error = ref('')
const loadingMessage = ref('正在分析您的需求...')
const lastInput = ref('')

/**
 * 处理用户输入
 */
const handleInput = async (text) => {
  lastInput.value = text
  error.value = ''
  loading.value = true

  try {
    // 解析用户输入
    loadingMessage.value = '正在解析您的需求...'
    const request = parseUserInput(text)
    
    if (!request.destination) {
      throw new Error('请提供目的地信息')
    }

    // 生成旅行计划
    loadingMessage.value = '正在生成旅行计划...'
    const result = await travelStore.createPlan(request)

    if (result.success) {
      loadingMessage.value = '计划生成成功！正在跳转...'
      
      // 清空输入
      if (voiceInput.value) {
        voiceInput.value.clear()
      }
      
      // 跳转到计划详情页
      setTimeout(() => {
        router.push(`/plan/${result.plan.id}`)
      }, 500)
    } else {
      throw new Error(result.error || '生成计划失败')
    }
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}

/**
 * 解析用户输入
 */
const parseUserInput = (text) => {
  const request = {
    destination: '',
    days: 3,
    budget: 5000,
    travelers: 1,
    preferences: [],
    withChildren: false,
    startDate: null
  }

  // 提取目的地
  const destinationMatch = text.match(/(?:去|到|想去|计划去|前往)([^，,。\s]+)/)
  if (destinationMatch) {
    request.destination = destinationMatch[1].trim()
  }

  // 提取天数
  const daysMatch = text.match(/(\d+)\s*(?:天|日)/)
  if (daysMatch) {
    request.days = parseInt(daysMatch[1])
  }

  // 提取预算
  const budgetMatch = text.match(/(?:预算|花费|费用).*?(\d+(?:\.\d+)?)\s*(?:万|元|块)/)
  if (budgetMatch) {
    let amount = parseFloat(budgetMatch[1])
    if (text.includes('万')) {
      amount *= 10000
    }
    request.budget = amount
  }

  // 提取人数
  const travelersMatch = text.match(/(\d+)\s*(?:人|个人)/)
  if (travelersMatch) {
    request.travelers = parseInt(travelersMatch[1])
  }

  // 提取偏好
  const preferenceKeywords = {
    '美食': 'FOOD',
    '文化': 'CULTURE',
    '自然': 'NATURE',
    '历史': 'HISTORY',
    '购物': 'SHOPPING',
    '冒险': 'ADVENTURE',
    '休闲': 'RELAXATION',
    '动漫': 'ANIME',
    '艺术': 'ART',
    '摄影': 'PHOTOGRAPHY'
  }

  for (const [keyword, type] of Object.entries(preferenceKeywords)) {
    if (text.includes(keyword)) {
      request.preferences.push(keyword)
    }
  }

  // 检测是否带孩子
  if (text.includes('带孩子') || text.includes('孩子') || text.includes('小孩')) {
    request.withChildren = true
  }

  // 提取日期
  const dateMatch = text.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/)
  if (dateMatch) {
    const [, year, month, day] = dateMatch
    request.startDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  return request
}

/**
 * 重试
 */
const retry = () => {
  if (lastInput.value) {
    handleInput(lastInput.value)
  }
}
</script>

<style scoped>
.plan-creator {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.creator-header {
  text-align: center;
  margin-bottom: 40px;
}

.creator-header h2 {
  font-size: 32px;
  margin: 0 0 12px 0;
  color: #333;
}

.creator-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.creator-body {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
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

.loading-state p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.error-state {
  text-align: center;
  padding: 40px 20px;
}

.error-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.error-state p {
  font-size: 16px;
  color: #d32f2f;
  margin: 0 0 20px 0;
}

.retry-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}
</style>
