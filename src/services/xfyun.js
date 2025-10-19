/**
 * 科大讯飞语音识别服务
 * 文档: https://www.xfyun.cn/doc/asr/voicedictation/API.html
 */

import CryptoJS from 'crypto-js'

class XunfeiASR {
  constructor() {
    this.APPID = import.meta.env.VITE_XFYUN_APPID || ''
    this.APISecret = import.meta.env.VITE_XFYUN_API_SECRET || ''
    this.APIKey = import.meta.env.VITE_XFYUN_API_KEY || ''
    this.websocket = null
    this.resultText = ''
    this.resultTextTemp = '' // 临时结果（用于动态修正）
    this.onResultCallback = null
    this.onErrorCallback = null
    this.stream = null
    this.audioContext = null
    this.mediaStreamSource = null
    this.processor = null
  }

  /**
   * 生成鉴权 URL（与官方示例一致）
   */
  getAuthUrl() {
    const url = 'wss://iat-api.xfyun.cn/v2/iat'
    const host = 'iat-api.xfyun.cn'
    const apiKey = this.APIKey
    const apiSecret = this.APISecret
    const date = new Date().toGMTString() // 使用 toGMTString 而不是 toUTCString
    const algorithm = 'hmac-sha256'
    const headers = 'host date request-line'
    
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    
    const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
    const authorization = btoa(authorizationOrigin)
    
    return `${url}?authorization=${authorization}&date=${date}&host=${host}`
  }

  /**
   * 开始录音识别（参考官方示例）
   */
  async startRecording(onResult, onError) {
    this.onResultCallback = onResult
    this.onErrorCallback = onError
    this.resultText = ''
    this.resultTextTemp = ''

    try {
      // 连接 WebSocket
      const authUrl = this.getAuthUrl()
      if ('WebSocket' in window) {
        this.websocket = new WebSocket(authUrl)
      } else if ('MozWebSocket' in window) {
        this.websocket = new MozWebSocket(authUrl)
      } else {
        throw new Error('浏览器不支持 WebSocket')
      }
      
      this.websocket.onopen = async () => {
        console.log('WebSocket 连接成功')
        
        // 发送开始参数（与官方示例完全一致）
        const params = {
          common: {
            app_id: this.APPID
          },
          business: {
            language: 'zh_cn',
            domain: 'iat',
            accent: 'mandarin',
            vad_eos: 5000,
            dwa: 'wpgs' // 开启动态修正
          },
          data: {
            status: 0,
            format: 'audio/L16;rate=16000',
            encoding: 'raw'
          }
        }
        this.websocket.send(JSON.stringify(params))
        
        // WebSocket 连接成功后再开始录音
        await this.startAudioRecording()
      }
      
      this.websocket.onmessage = (event) => {
        this.renderResult(event.data)
      }
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket 错误:', error)
        this.stopAudioRecording()
        if (this.onErrorCallback) {
          this.onErrorCallback(error)
        }
      }
      
      this.websocket.onclose = () => {
        console.log('WebSocket 连接关闭')
        this.stopAudioRecording()
      }
      
    } catch (error) {
      console.error('启动录音失败:', error)
      if (this.onErrorCallback) {
        this.onErrorCallback(error)
      }
    }
  }

  /**
   * 渲染识别结果（与官方示例一致）
   */
  renderResult(resultData) {
    const jsonData = JSON.parse(resultData)
    
    if (jsonData.data && jsonData.data.result) {
      const data = jsonData.data.result
      let str = ''
      const ws = data.ws
      
      for (let i = 0; i < ws.length; i++) {
        str = str + ws[i].cw[0].w
      }
      
      // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
      // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果
      if (data.pgs) {
        if (data.pgs === 'apd') {
          // 将resultTextTemp同步给resultText
          this.resultText = this.resultTextTemp
        }
        // 将结果存储在resultTextTemp中
        this.resultTextTemp = this.resultText + str
      } else {
        this.resultText = this.resultText + str
      }
      
      // 回调当前结果
      if (this.onResultCallback) {
        this.onResultCallback(this.resultTextTemp || this.resultText || '', false)
      }
    }
    
    // 识别结束
    if (jsonData.code === 0 && jsonData.data.status === 2) {
      if (this.onResultCallback) {
        this.onResultCallback(this.resultTextTemp || this.resultText || '', true)
      }
      this.websocket.close()
    }
    
    // 错误处理
    if (jsonData.code !== 0) {
      console.error('识别错误:', jsonData)
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(`识别错误: ${jsonData.message || '未知错误'}`))
      }
      this.websocket.close()
    }
  }

  /**
   * 开始音频录制
   */
  async startAudioRecording() {
    try {
      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // 采样率 16kHz
          channelCount: 1,   // 单声道
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      // 创建音频上下文（采样率 16kHz）
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      })
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream)
      
      // 使用 ScriptProcessorNode（bufferSize 必须是 2 的幂次方，使用 2048）
      const bufferSize = 2048 // 最接近官方推荐的 1280
      this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1)
      
      // 音频数据处理
      this.processor.onaudioprocess = (event) => {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
          return
        }
        
        const inputData = event.inputBuffer.getChannelData(0)
        const pcmData = this.convertFloat32ToInt16(inputData)
        const base64Audio = this.toBase64(pcmData.buffer)
        
        const params = {
          data: {
            status: 1,
            format: 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: base64Audio
          }
        }
        this.websocket.send(JSON.stringify(params))
      }
      
      this.mediaStreamSource.connect(this.processor)
      this.processor.connect(this.audioContext.destination)
      
    } catch (error) {
      console.error('启动音频录制失败:', error)
      throw error
    }
  }

  /**
   * 停止音频录制
   */
  stopAudioRecording() {
    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }
    
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect()
      this.mediaStreamSource = null
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  /**
   * 停止录音
   */
  stopRecording() {
    // 先停止音频录制
    this.stopAudioRecording()
    
    // 发送结束标志
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const params = {
        data: {
          status: 2,
          format: 'audio/L16;rate=16000',
          encoding: 'raw',
          audio: ''
        }
      }
      this.websocket.send(JSON.stringify(params))
      this.websocket.close()
    }
    
    this.websocket = null
  }

  /**
   * Float32 转 Int16
   */
  convertFloat32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length)
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]))
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    return int16Array
  }

  /**
   * ArrayBuffer 转 Base64（与官方示例一致）
   */
  toBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

export default new XunfeiASR()
