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
    // 构建请求对象
    const request = plan.request || {
      destination: plan.destination,
      days: plan.days,
      budget: plan.budget,
      travelers: plan.travelers || 1,
      preferences: plan.preferences ? (typeof plan.preferences === 'string' ? plan.preferences.split(',') : plan.preferences) : [],
      withChildren: plan.with_children || false,
      startDate: plan.start_date || null
    }
    
    const prompt = `作为专业的旅行规划师，请优化以下旅行计划。

【原始行程信息】
目的地：${request.destination}
旅行天数：${request.days}天
总预算：¥${request.budget}
人数：${request.travelers}人
偏好：${request.preferences.join('、')}
${request.withChildren ? '（带孩子同行）' : ''}

【原始行程概要】
${plan.summary || '暂无概要'}

【原始行程安排】
${JSON.stringify(plan.itinerary, null, 2)}

【原始预算分配】
${JSON.stringify(plan.budget_breakdown, null, 2)}

【优化要求】
请从以下几个方面进行全面优化：

1. **路线优化**：调整景点顺序，减少往返路程，优化交通路线
2. **时间优化**：合理安排游览时间，避免行程过紧或过松
3. **预算优化**：在总预算不变的前提下，优化各项开支分配，提高性价比
4. **体验优化**：增加或替换更符合用户偏好的景点和活动
5. **实用建议**：补充更详细的游玩技巧和注意事项

【返回格式要求】
请严格按照以下 JSON 格式返回优化后的完整数据：

{
  "title": "行程标题（可以优化得更吸引人）",
  "summary": "【必填】优化后的行程概要说明（200-300字，突出优化亮点和行程特色）",
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "当日主题",
      "activities": [
        {
          "time": "HH:MM",
          "type": "景点/餐厅/交通/购物/休闲",
          "name": "名称",
          "description": "详细描述（50-100字）",
          "address": "详细地址",
          "estimatedCost": 数字,
          "duration": 分钟数,
          "tips": "游玩建议和注意事项"
        }
      ],
      "accommodation": {
        "name": "酒店名称",
        "type": "酒店类型",
        "address": "酒店地址",
        "price": 价格
      }
    }
  ],
  "budget": {
    "transportation": 交通费用,
    "accommodation": 住宿费用,
    "food": 餐饮费用,
    "activities": 门票和活动费用,
    "shopping": 购物预算,
    "other": 其他费用,
    "total": 总计（必须等于原始预算）
  },
  "tips": [
    "【必填】优化后的实用建议1（具体明确）",
    "【必填】优化后的实用建议2（具体明确）",
    "至少提供 5-8 条建议"
  ]
}

【重要提醒】
- summary 字段是必填项，必须提供详细的行程概要说明
- tips 必须提供 5-8 条实用的旅行建议
- 所有活动的 description 和 tips 都要详细具体
- 总预算必须保持不变（¥${request.budget}）
- 确保返回完整的 JSON 数据，不要省略任何字段`
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            { 
              role: 'system', 
              content: '你是专业的旅行规划师，擅长优化行程路线和时间安排。请以 JSON 格式返回优化后的行程。' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
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
      const optimized = this.parseTravelPlan(content, request)
      
      // 保留原计划的 ID 和其他元数据
      return {
        ...plan,
        itinerary: optimized.itinerary,
        budget_breakdown: optimized.budget,
        tips: optimized.tips,
        summary: optimized.summary
      }
    } catch (error) {
      console.error('优化失败:', error)
      throw new Error(error.response?.data?.error?.message || '优化服务暂时不可用，请稍后重试')
    }
  }
}

export default new AIService()
