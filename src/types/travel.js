/**
 * 旅行规划相关类型定义
 */

/**
 * @typedef {Object} TravelRequest
 * @property {string} destination - 目的地
 * @property {number} days - 旅行天数
 * @property {number} budget - 预算（元）
 * @property {number} travelers - 同行人数
 * @property {string[]} preferences - 旅行偏好（美食、动漫、自然、历史等）
 * @property {boolean} withChildren - 是否带孩子
 * @property {string} startDate - 出发日期 (YYYY-MM-DD)
 */

/**
 * @typedef {Object} DayItinerary
 * @property {number} day - 第几天
 * @property {string} date - 日期
 * @property {Activity[]} activities - 当天活动
 * @property {AccommodationInfo} accommodation - 住宿信息
 */

/**
 * @typedef {Object} Activity
 * @property {string} time - 时间
 * @property {string} type - 类型 (景点/餐厅/交通/其他)
 * @property {string} name - 名称
 * @property {string} description - 描述
 * @property {Location} location - 位置信息
 * @property {number} estimatedCost - 预估费用
 * @property {number} duration - 停留时长（分钟）
 */

/**
 * @typedef {Object} Location
 * @property {number} lng - 经度
 * @property {number} lat - 纬度
 * @property {string} address - 地址
 */

/**
 * @typedef {Object} AccommodationInfo
 * @property {string} name - 酒店名称
 * @property {string} type - 类型
 * @property {Location} location - 位置
 * @property {number} price - 价格
 */

/**
 * @typedef {Object} TravelPlan
 * @property {string} id - 计划ID
 * @property {string} userId - 用户ID
 * @property {string} title - 标题
 * @property {TravelRequest} request - 原始请求
 * @property {DayItinerary[]} itinerary - 行程安排
 * @property {BudgetBreakdown} budget - 预算分解
 * @property {string} createdAt - 创建时间
 * @property {string} updatedAt - 更新时间
 */

/**
 * @typedef {Object} BudgetBreakdown
 * @property {number} transportation - 交通
 * @property {number} accommodation - 住宿
 * @property {number} food - 餐饮
 * @property {number} activities - 活动/门票
 * @property {number} shopping - 购物
 * @property {number} other - 其他
 * @property {number} total - 总计
 */

export const TravelTypes = {
  ATTRACTION: '景点',
  RESTAURANT: '餐厅',
  HOTEL: '酒店',
  TRANSPORTATION: '交通',
  ACTIVITY: '活动',
  SHOPPING: '购物'
}

export const PreferenceTypes = {
  FOOD: '美食',
  CULTURE: '文化',
  NATURE: '自然',
  HISTORY: '历史',
  SHOPPING: '购物',
  ADVENTURE: '冒险',
  RELAXATION: '休闲',
  ANIME: '动漫',
  ART: '艺术',
  PHOTOGRAPHY: '摄影'
}
