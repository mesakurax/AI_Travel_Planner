<template>
  <div class="dashboard-container">
    <nav class="dashboard-nav">
      <div class="nav-content">
        <h2>🌏 AI 旅行规划师</h2>
        <div class="nav-right">
          <span class="user-info">{{ userEmail }}</span>
          <button @click="handleLogout" class="btn-logout">退出登录</button>
        </div>
      </div>
    </nav>

    <div class="dashboard-content">
      <div class="welcome-section">
        <h1>欢迎，{{ userName }}！</h1>
        <p>开始规划您的下一次旅程吧</p>
      </div>

      <div class="quick-actions">
        <div class="action-card">
          <div class="action-icon">✈️</div>
          <h3>创建新行程</h3>
          <p>使用 AI 快速规划旅行路线</p>
          <button class="btn-action" @click="createPlan">立即创建</button>
        </div>

        <div class="action-card">
          <div class="action-icon">📋</div>
          <h3>我的行程</h3>
          <p>查看和管理已保存的旅行计划</p>
          <button class="btn-action" @click="viewPlans">查看行程</button>
        </div>

        <div class="action-card">
          <div class="action-icon">💰</div>
          <h3>费用管理</h3>
          <p>记录和分析旅行开销</p>
          <button class="btn-action" disabled>即将推出</button>
        </div>
      </div>

      <div class="info-section">
        <div class="info-card">
          <h3>📱 功能状态</h3>
          <ul>
            <li>✅ 用户注册登录系统</li>
            <li>✅ 智能行程规划</li>
            <li>✅ 语音输入功能</li>
            <li>✅ 地图集成</li>
            <li>🚧 费用预算管理</li>
            <li>✅ 云端数据同步</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userEmail = computed(() => authStore.user?.email || '')
const userName = computed(() => {
  return authStore.user?.email?.split('@')[0] || '用户'
})

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/login')
  }
}

const createPlan = () => {
  router.push('/plan/create')
}

const viewPlans = () => {
  // 暂时也跳转到创建页
  router.push('/plan/create')
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
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
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  color: #666;
  font-size: 14px;
}

.btn-logout {
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #5568d3;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-section h1 {
  font-size: 36px;
  color: #333;
  margin: 0 0 12px 0;
}

.welcome-section p {
  font-size: 18px;
  color: #666;
  margin: 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.action-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.action-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.action-card h3 {
  font-size: 22px;
  color: #333;
  margin: 0 0 12px 0;
}

.action-card p {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.btn-action {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-section {
  max-width: 600px;
  margin: 0 auto;
}

.info-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.info-card h3 {
  font-size: 20px;
  color: #333;
  margin: 0 0 20px 0;
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-card li {
  padding: 12px 0;
  color: #666;
  font-size: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.info-card li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .nav-content h2 {
    font-size: 18px;
  }
  
  .user-info {
    display: none;
  }
  
  .welcome-section h1 {
    font-size: 28px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
