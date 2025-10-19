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
import aiService from '@/services/ai'

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
    // 第一步：使用 AI 预处理，提取结构化信息
    loadingMessage.value = '🤖 AI 正在理解您的需求...'
    const parsedRequest = await aiService.parseUserInput(text)
    
    console.log('AI 解析结果:', parsedRequest)
    
    // 检查置信度，如果太低则提示用户
    if (parsedRequest.confidence < 0.5) {
      throw new Error(
        parsedRequest.error || 
        '抱歉，无法准确理解您的需求。请尝试更清楚地描述，例如："我想去北京玩3天，预算5000元"'
      )
    }
    
    if (!parsedRequest.destination || parsedRequest.destination === '待确认') {
      throw new Error('请告诉我您想去哪里旅行，例如："我想去杭州"')
    }

    // 第二步：使用结构化的数据生成旅行计划
    loadingMessage.value = `✨ 正在为您规划 ${parsedRequest.destination} ${parsedRequest.days}天之旅...`
    const result = await travelStore.createPlan(parsedRequest)

    if (result.success) {
      loadingMessage.value = '🎉 计划生成成功！正在跳转...'
      
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
    console.error('处理输入失败:', err)
    error.value = err.message
    loading.value = false
  }
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
