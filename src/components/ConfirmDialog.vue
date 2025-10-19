<template>
  <transition name="dialog">
    <div v-if="visible" class="confirm-dialog-overlay" @click.self="handleCancel">
      <div class="confirm-dialog">
        <div class="dialog-header">
          <div class="dialog-icon">{{ icon }}</div>
          <h3 class="dialog-title">{{ title }}</h3>
        </div>
        
        <div class="dialog-body">
          <p class="dialog-message">{{ message }}</p>
        </div>
        
        <div class="dialog-footer">
          <button @click="handleCancel" class="dialog-btn btn-cancel">
            {{ cancelText }}
          </button>
          <button 
            @click="handleConfirm" 
            :class="['dialog-btn', 'btn-confirm', `btn-${type}`]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  icon: {
    type: String,
    default: '❓'
  },
  type: {
    type: String,
    default: 'default', // 'default' | 'warning' | 'danger'
    validator: (value) => ['default', 'warning', 'danger'].includes(value)
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const visible = ref(false)

const show = () => {
  visible.value = true
}

const hide = () => {
  visible.value = false
}

const handleConfirm = () => {
  emit('confirm')
  hide()
}

const handleCancel = () => {
  emit('cancel')
  hide()
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 440px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  padding: 32px 32px 20px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-icon {
  font-size: 56px;
  margin-bottom: 16px;
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.dialog-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.dialog-body {
  padding: 24px 32px;
}

.dialog-message {
  font-size: 15px;
  line-height: 1.6;
  color: #666;
  margin: 0;
  text-align: center;
}

.dialog-footer {
  padding: 20px 32px 32px;
  display: flex;
  gap: 12px;
}

.dialog-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-confirm {
  color: white;
}

/* 默认样式 - 蓝紫渐变 */
.btn-confirm.btn-default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-confirm.btn-default:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 警告样式 - 橙黄色 */
.btn-confirm.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.btn-confirm.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

/* 危险样式 - 红色 */
.btn-confirm.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-confirm.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-cancel:active,
.btn-confirm:active {
  transform: translateY(0);
}

/* 对话框动画 */
.dialog-enter-active {
  transition: opacity 0.3s ease;
}

.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .confirm-dialog,
.dialog-leave-to .confirm-dialog {
  transform: translateY(20px) scale(0.95);
}

@media (max-width: 500px) {
  .confirm-dialog {
    max-width: 100%;
    margin: 0 16px;
  }

  .dialog-header,
  .dialog-body,
  .dialog-footer {
    padding-left: 24px;
    padding-right: 24px;
  }

  .dialog-icon {
    font-size: 48px;
  }

  .dialog-title {
    font-size: 20px;
  }

  .dialog-message {
    font-size: 14px;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .dialog-btn {
    width: 100%;
  }
}
</style>
