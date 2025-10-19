<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>🌏 AI 旅行规划师</h1>
      <p class="subtitle">让 AI 帮你规划完美旅程</p>
      
      <div class="cta-buttons">
        <router-link to="/login" class="btn btn-primary">立即登录</router-link>
        <router-link to="/register" class="btn btn-secondary">免费注册</router-link>
      </div>
    </div>

    <div class="features-section">
      <h2>核心功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🗺️</div>
          <h3>智能行程规划</h3>
          <p>通过语音或文字输入，AI 自动生成个性化旅行路线</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <h3>费用预算管理</h3>
          <p>智能预算分析，实时记录旅行开销</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">☁️</div>
          <h3>云端同步</h3>
          <p>旅行计划云端存储，多设备随时查看</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🎙️</div>
          <h3>语音交互</h3>
          <p>支持语音输入，更便捷的交互体验</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 首页组件
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  text-align: center;
  padding: 120px 20px 80px;
  color: white;
}

.hero-section h1 {
  font-size: 48px;
  margin: 0 0 16px 0;
  animation: fadeInUp 0.8s ease-out;
}

.subtitle {
  font-size: 24px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.btn {
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
  transform: translateY(-3px);
}

.features-section {
  background: white;
  padding: 80px 20px;
  border-radius: 40px 40px 0 0;
}

.features-section h2 {
  text-align: center;
  font-size: 36px;
  margin: 0 0 60px 0;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: #f8f9fa;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  margin: 0 0 12px 0;
  color: #333;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 36px;
  }
  
  .subtitle {
    font-size: 18px;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
}
</style>
