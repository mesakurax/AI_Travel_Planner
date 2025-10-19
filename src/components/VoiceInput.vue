<template>
  <div class="voice-input">
    <div class="input-wrapper">
      <input
        v-model="inputText"
        type="text"
        :placeholder="placeholder"
        class="text-input"
        @keyup.enter="handleSubmit"
      />
      <button
        class="voice-btn"
        :class="{ recording: isRecording }"
        @click="toggleRecording"
        :disabled="disabled"
      >
        <span v-if="!isRecording" class="icon">🎤</span>
        <span v-else class="recording-icon">⏸</span>
      </button>
      <button
        class="submit-btn"
        @click="handleSubmit"
        :disabled="disabled || !inputText.trim()"
      >
        发送
      </button>
    </div>

    <div v-if="isRecording" class="recording-indicator">
      <div class="recording-animation">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <span class="recording-text">正在录音...</span>
    </div>

    <div v-if="error" class="error-tip">
      {{ error }}
    </div>

    <div v-if="showExample" class="example-tips">
      <div class="tip-title">💡 示例输入：</div>
      <div class="tips">
        <span class="tip" @click="fillExample('我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子')">
          我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子
        </span>
        <span class="tip" @click="fillExample('计划去巴黎7日游，预算2万，2人，喜欢艺术和历史')">
          计划去巴黎7日游，预算2万，2人，喜欢艺术和历史
        </span>
        <span class="tip" @click="fillExample('想去三亚度假，3天，预算5000，喜欢海滩和美食')">
          想去三亚度假，3天，预算5000，喜欢海滩和美食
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import xfyunASR from '@/services/xfyun'

const props = defineProps({
  placeholder: {
    type: String,
    default: '输入或语音描述你的旅行需求...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showExample: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['submit'])

const inputText = ref('')
const isRecording = ref(false)
const error = ref('')

/**
 * 切换录音状态
 */
const toggleRecording = async () => {
  if (isRecording.value) {
    // 停止录音
    xfyunASR.stopRecording()
    isRecording.value = false
  } else {
    // 开始录音
    error.value = ''
    isRecording.value = true
    
    try {
      await xfyunASR.startRecording(
        (text, isFinal) => {
          inputText.value = text
          if (isFinal) {
            isRecording.value = false
          }
        },
        (err) => {
          error.value = '语音识别失败: ' + err.message
          isRecording.value = false
        }
      )
    } catch (err) {
      error.value = '无法启动录音，请检查麦克风权限'
      isRecording.value = false
    }
  }
}

/**
 * 提交输入
 */
const handleSubmit = () => {
  const text = inputText.value.trim()
  if (text) {
    emit('submit', text)
  }
}

/**
 * 填充示例
 */
const fillExample = (text) => {
  inputText.value = text
}

/**
 * 清空输入
 */
const clear = () => {
  inputText.value = ''
  error.value = ''
}

// 组件卸载时停止录音
onUnmounted(() => {
  if (isRecording.value) {
    xfyunASR.stopRecording()
  }
})

// 暴露方法
defineExpose({
  clear
})
</script>

<style scoped>
.voice-input {
  width: 100%;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.text-input {
  flex: 1;
  padding: 14px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s;
  outline: none;
}

.text-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.voice-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-btn.recording {
  background: #f44336;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
}

.submit-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-indicator {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f44336;
  font-size: 14px;
}

.recording-animation {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f44336;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.error-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 6px;
  font-size: 13px;
}

.example-tips {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 12px;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip {
  padding: 10px 14px;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.tip:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateX(4px);
}
</style>
