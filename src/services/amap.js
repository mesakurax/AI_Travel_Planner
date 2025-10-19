/**
 * 高德地图服务
 * 文档: https://lbs.amap.com/api/javascript-api/summary
 */

import AMapLoader from '@amap/amap-jsapi-loader'

class AmapService {
  constructor() {
    this.mapKey = import.meta.env.VITE_AMAP_KEY || ''
    this.securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE || ''
    this.AMap = null
    this.map = null
  }

  /**
   * 初始化地图
   */
  async initMap(containerId, options = {}) {
    try {
      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJsCode: this.securityCode
      }

      this.AMap = await AMapLoader.load({
        key: this.mapKey,
        version: '2.0',
        plugins: [
          'AMap.Geocoder',
          'AMap.AutoComplete',
          'AMap.PlaceSearch',
          'AMap.Marker',
          'AMap.InfoWindow',
          'AMap.Polyline',
          'AMap.Driving'
        ]
      })

      const defaultOptions = {
        zoom: 13,
        center: [116.397428, 39.90923], // 北京
        viewMode: '3D',
        pitch: 50,
        ...options
      }

      this.map = new this.AMap.Map(containerId, defaultOptions)
      return this.map
    } catch (error) {
      console.error('地图初始化失败:', error)
      throw error
    }
  }

  /**
   * 地理编码 - 地址转坐标
   */
  async geocode(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new this.AMap.Geocoder()
      
      geocoder.getLocation(address, (status, result) => {
        if (status === 'complete' && result.geocodes.length) {
          const location = result.geocodes[0].location
          resolve({
            lng: location.lng,
            lat: location.lat,
            formattedAddress: result.geocodes[0].formattedAddress
          })
        } else {
          reject(new Error('地址解析失败'))
        }
      })
    })
  }

  /**
   * 逆地理编码 - 坐标转地址
   */
  async reverseGeocode(lng, lat) {
    return new Promise((resolve, reject) => {
      const geocoder = new this.AMap.Geocoder()
      
      geocoder.getAddress([lng, lat], (status, result) => {
        if (status === 'complete' && result.regeocode) {
          resolve({
            address: result.regeocode.formattedAddress,
            addressComponent: result.regeocode.addressComponent
          })
        } else {
          reject(new Error('坐标解析失败'))
        }
      })
    })
  }

  /**
   * POI 搜索
   */
  async searchPOI(keyword, city) {
    return new Promise((resolve, reject) => {
      const placeSearch = new this.AMap.PlaceSearch({
        city: city || '全国',
        pageSize: 20,
        pageIndex: 1
      })
      
      placeSearch.search(keyword, (status, result) => {
        if (status === 'complete' && result.poiList) {
          const pois = result.poiList.pois.map(poi => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            location: {
              lng: poi.location.lng,
              lat: poi.location.lat
            },
            type: poi.type,
            tel: poi.tel,
            rating: poi.rating || 0
          }))
          resolve(pois)
        } else {
          reject(new Error('POI 搜索失败'))
        }
      })
    })
  }

  /**
   * 添加标记点
   */
  addMarker(options) {
    const marker = new this.AMap.Marker({
      position: [options.lng, options.lat],
      title: options.title || '',
      icon: options.icon,
      ...options
    })
    
    if (this.map) {
      this.map.add(marker)
    }
    
    return marker
  }

  /**
   * 添加信息窗体
   */
  addInfoWindow(options) {
    const infoWindow = new this.AMap.InfoWindow({
      content: options.content,
      offset: new this.AMap.Pixel(0, -30),
      ...options
    })
    
    return infoWindow
  }

  /**
   * 绘制路线
   */
  async drawRoute(points, options = {}) {
    const polyline = new this.AMap.Polyline({
      path: points.map(p => [p.lng, p.lat]),
      strokeColor: options.color || '#3366FF',
      strokeWeight: options.width || 6,
      strokeOpacity: 0.8,
      ...options
    })
    
    if (this.map) {
      this.map.add(polyline)
      this.map.setFitView([polyline])
    }
    
    return polyline
  }

  /**
   * 路径规划 - 驾车
   */
  async planDrivingRoute(start, end) {
    return new Promise((resolve, reject) => {
      const driving = new this.AMap.Driving({
        policy: this.AMap.DrivingPolicy.LEAST_TIME
      })
      
      driving.search(
        [start.lng, start.lat],
        [end.lng, end.lat],
        (status, result) => {
          if (status === 'complete') {
            const route = result.routes[0]
            resolve({
              distance: route.distance,
              duration: route.time,
              path: route.steps.map(step => ({
                instruction: step.instruction,
                road: step.road,
                distance: step.distance,
                duration: step.time
              }))
            })
          } else {
            reject(new Error('路径规划失败'))
          }
        }
      )
    })
  }

  /**
   * 清除地图覆盖物
   */
  clearMap() {
    if (this.map) {
      this.map.clearMap()
    }
  }

  /**
   * 设置地图中心和缩放
   */
  setCenter(lng, lat, zoom = 13) {
    if (this.map) {
      this.map.setZoomAndCenter(zoom, [lng, lat])
    }
  }

  /**
   * 销毁地图
   */
  destroy() {
    if (this.map) {
      this.map.destroy()
      this.map = null
    }
  }
}

export default new AmapService()
