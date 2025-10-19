<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <p>页面未找到</p>
      <router-link to="/" class="btn-home">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
// 404 页面
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.not-found-content {
  text-align: center;
  color: white;
}

.not-found-content h1 {
  font-size: 120px;
  margin: 0;
  font-weight: bold;
}

.not-found-content p {
  font-size: 24px;
  margin: 20px 0 40px;
}

.btn-home {
  display: inline-block;
  padding: 14px 32px;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-home:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3);
}
</style>
