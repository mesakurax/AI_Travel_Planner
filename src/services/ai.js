/**
 * AI 服务 - 行程规划
 * 支持 OpenAI 及兼容接口（如 DeepSeek, 通义千问等）
 */

import axios from 'axios'

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_AI_API_KEY || ''
    this.baseURL = import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1'
    this.model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo'
  }

  /**
   * 生成旅行计划
   */
  async generateTravelPlan(travelRequest) {
    const prompt = this.buildTravelPlanPrompt(travelRequest)
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一位专业的旅行规划师，擅长根据用户需求制定详细的旅行计划。请以 JSON 格式返回行程安排。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const content = response.data.choices[0].message.content
      return this.parseTravelPlan(content, travelRequest)
    } catch (error) {
      console.error('AI 生成失败:', error)
      throw new Error('生成旅行计划失败，请重试')
    }
  }

  /**
   * 构建提示词
   */
  buildTravelPlanPrompt(request) {
    const { destination, days, budget, travelers, preferences, withChildren, startDate } = request
    
    return `请为我规划一次旅行：

目的地：${destination}
旅行天数：${days}天
预算：${budget}元
同行人数：${travelers}人
旅行偏好：${preferences.join('、')}
${withChildren ? '带孩子同行' : ''}
出发日期：${startDate || '待定'}

请按以下 JSON 格式返回详细的旅行计划：

{
  "title": "行程标题",
  "summary": "行程概述",
  "itinerary": [
    {
      "day": 1,
      "date": "日期",
      "theme": "当天主题",
      "activities": [
        {
          "time": "09:00",
          "type": "景点",
          "name": "景点名称",
          "description": "简要描述",
          "address": "详细地址",
          "estimatedCost": 100,
          "duration": 120,
          "tips": "游玩建议"
        }
      ],
      "accommodation": {
        "name": "酒店名称",
        "type": "酒店类型",
        "address": "酒店地址",
        "price": 300
      }
    }
  ],
  "budget": {
    "transportation": 2000,
    "accommodation": 3000,
    "food": 2000,
    "activities": 2000,
    "shopping": 500,
    "other": 500,
    "total": 10000
  },
  "tips": [
    "旅行建议1",
    "旅行建议2"
  ]
}

注意：
1. 活动类型包括：景点、餐厅、交通、购物、休闲
2. 每天安排 3-5 个活动
3. 考虑用户偏好和是否带孩子
4. 预算分配要合理
5. 地址要详细准确
6. 时间安排要考虑交通和游览时间`
  }

  /**
   * 解析 AI 返回的计划
   */
  parseTravelPlan(content, originalRequest) {
    try {
      // 尝试提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('无法解析返回内容')
      }

      const plan = JSON.parse(jsonMatch[0])
      
      return {
        title: plan.title || `${originalRequest.destination} ${originalRequest.days}日游`,
        summary: plan.summary || '',
        itinerary: plan.itinerary || [],
        budget: plan.budget || this.generateDefaultBudget(originalRequest.budget),
        tips: plan.tips || [],
        request: originalRequest
      }
    } catch (error) {
      console.error('解析 AI 返回失败:', error)
      // 返回默认计划结构
      return this.generateDefaultPlan(originalRequest)
    }
  }

  /**
   * 生成默认预算分配
   */
  generateDefaultBudget(totalBudget) {
    return {
      transportation: Math.round(totalBudget * 0.25),
      accommodation: Math.round(totalBudget * 0.30),
      food: Math.round(totalBudget * 0.25),
      activities: Math.round(totalBudget * 0.15),
      shopping: Math.round(totalBudget * 0.03),
      other: Math.round(totalBudget * 0.02),
      total: totalBudget
    }
  }

  /**
   * 生成默认计划（AI 失败时的后备方案）
   */
  generateDefaultPlan(request) {
    const itinerary = []
    const startDate = request.startDate ? new Date(request.startDate) : new Date()
    
    for (let i = 0; i < request.days; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      itinerary.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        theme: `第${i + 1}天`,
        activities: [
          {
            time: '09:00',
            type: '景点',
            name: '待规划',
            description: '请手动添加景点',
            address: request.destination,
            estimatedCost: 0,
            duration: 180,
            tips: ''
          }
        ],
        accommodation: {
          name: '待预订',
          type: '酒店',
          address: request.destination,
          price: 0
        }
      })
    }

    return {
      title: `${request.destination} ${request.days}日游`,
      summary: '行程规划中，请稍后查看详细安排',
      itinerary,
      budget: this.generateDefaultBudget(request.budget),
      tips: [],
      request
    }
  }

  /**
   * 优化行程建议
   */
  async optimizeItinerary(plan) {
    const prompt = `请优化以下旅行计划，使行程更加合理：\n\n${JSON.stringify(plan, null, 2)}\n\n请返回优化后的完整 JSON 数据。`
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: '你是旅行规划专家，请优化行程安排。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const content = response.data.choices[0].message.content
      return this.parseTravelPlan(content, plan.request)
    } catch (error) {
      console.error('优化失败:', error)
      return plan // 返回原计划
    }
  }
}

export default new AIService()
