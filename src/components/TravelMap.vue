<template>
  <div class="travel-map">
    <div id="map-container" class="map-container"></div>
    
    <div v-if="showControls" class="map-controls">
      <button @click="fitView" class="control-btn">
        📍 适应视图
      </button>
      <button @click="clearMarkers" class="control-btn">
        🗑️ 清除标记
      </button>
    </div>

    <div v-if="selectedLocation" class="location-info">
      <div class="info-header">
        <h4>{{ selectedLocation.name }}</h4>
        <button @click="closeInfo" class="close-btn">×</button>
      </div>
      <div class="info-body">
        <p v-if="selectedLocation.address">📍 {{ selectedLocation.address }}</p>
        <p v-if="selectedLocation.description">{{ selectedLocation.description }}</p>
        <p v-if="selectedLocation.estimatedCost" class="cost">
          💰 预估费用: ¥{{ selectedLocation.estimatedCost }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import amapService from '@/services/amap'

const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lng: 116.397428, lat: 39.90923 })
  },
  zoom: {
    type: Number,
    default: 13
  },
  markers: {
    type: Array,
    default: () => []
  },
  route: {
    type: Array,
    default: () => []
  },
  showControls: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['markerClick', 'mapReady'])

const map = ref(null)
const markerObjects = ref([])
const routePolyline = ref(null)
const selectedLocation = ref(null)

onMounted(async () => {
  try {
    map.value = await amapService.initMap('map-container', {
      center: [props.center.lng, props.center.lat],
      zoom: props.zoom
    })
    
    emit('mapReady', map.value)
    
    // 初始化标记
    if (props.markers.length > 0) {
      addMarkers(props.markers)
    }
    
    // 初始化路线
    if (props.route.length > 0) {
      drawRoute(props.route)
    }
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
})

/**
 * 添加标记
 */
const addMarkers = (markers) => {
  clearMarkers()
  
  markers.forEach((marker, index) => {
    if (!marker.lng && !marker.lat && !(marker.location?.lng && marker.location?.lat)) {
      return
    }

    const markerObj = amapService.addMarker({
      lng: marker.lng || marker.location?.lng,
      lat: marker.lat || marker.location?.lat,
      title: marker.name || marker.title,
      label: {
        content: `<div style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #667eea;">${index + 1}</div>`,
        offset: new amapService.AMap.Pixel(0, -35)
      }
    })
    
    // 点击标记
    markerObj.on('click', () => {
      selectedLocation.value = marker
      emit('markerClick', marker)
    })
    
    markerObjects.value.push(markerObj)
  })
  
  // 自适应视图
  if (markers.length > 0) {
    fitView()
  }
}

/**
 * 绘制路线
 */
const drawRoute = async (points) => {
  clearRoute()

  if (!points || points.length < 2) {
    return
  }

  routePolyline.value = await amapService.drawRoute(points, {
    color: '#667eea',
    width: 6
  })
}

const clearRoute = () => {
  if (routePolyline.value) {
    routePolyline.value.setMap(null)
    routePolyline.value = null
  }
}

/**
 * 清除标记
 */
const clearMarkers = () => {
  markerObjects.value.forEach(marker => {
    if (marker?.setMap) {
      marker.setMap(null)
    } else if (amapService.map) {
      amapService.map.remove(marker)
    }
  })
  markerObjects.value = []
}

/**
 * 适应视图
 */
const fitView = () => {
  if (amapService.map && markerObjects.value.length > 0) {
    amapService.map.setFitView(markerObjects.value)
  }
}

/**
 * 关闭信息窗口
 */
const closeInfo = () => {
  selectedLocation.value = null
}

/**
 * 设置地图中心
 */
const setCenter = (lng, lat, zoom) => {
  amapService.setCenter(lng, lat, zoom)
}

// 监听标记变化
watch(() => props.markers, (newMarkers) => {
  if (!map.value) return

  if (newMarkers && newMarkers.length > 0) {
    addMarkers(newMarkers)
  } else {
    clearMarkers()
    clearRoute()
  }
}, { deep: true })

// 监听路线变化
watch(() => props.route, (newRoute) => {
  if (!map.value) return

  if (newRoute && newRoute.length > 1) {
    drawRoute(newRoute)
  } else {
    clearRoute()
  }
}, { deep: true })

onUnmounted(() => {
  clearMarkers()
  clearRoute()
  amapService.destroy()
})

// 暴露方法
defineExpose({
  setCenter,
  addMarkers,
  drawRoute,
  clearMarkers,
  clearRoute
})
</script>

<style scoped>
.travel-map {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.control-btn {
  padding: 10px 16px;
  background: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.control-btn:hover {
  background: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.location-info {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 10;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e0e0e0;
}

.info-body p {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.cost {
  color: #667eea;
  font-weight: 600;
}
</style>
