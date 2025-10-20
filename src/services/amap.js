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
    this.loadPromise = null
  }

  /**
   * 加载 AMap SDK
   */
  async loadAMap() {
    if (this.AMap) {
      return this.AMap
    }

    if (!this.loadPromise) {
      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJsCode: this.securityCode
      }

      this.loadPromise = AMapLoader.load({
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
      }).then(AMap => {
        this.AMap = AMap
        return AMap
      }).catch(error => {
        this.loadPromise = null
        throw error
      })
    }

    return this.loadPromise
  }

  /**
   * 初始化地图
   */
  async initMap(containerId, options = {}) {
    try {
      await this.loadAMap()

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
  async geocode(address, city = '') {
    await this.loadAMap()

    return new Promise((resolve, reject) => {
      const geocoder = new this.AMap.Geocoder({
        city: city || '全国',
        batch: false
      })
      
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
    await this.loadAMap()

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
    await this.loadAMap()

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
   * 绘制路线 - 使用驾车路线规划
   */
  async drawRoute(points, options = {}) {
    if (!points || points.length < 2) return null

    await this.loadAMap()

    // 如果只有两个点，直接规划路线
    if (points.length === 2) {
      return this.drawSingleRoute(points[0], points[1], options)
    }

    // 多个点时，依次规划并合并路径
    const allPaths = []
    for (let i = 0; i < points.length - 1; i++) {
      try {
        const routeResult = await this.planDrivingRoute(points[i], points[i + 1])
        if (routeResult && routeResult.path) {
          allPaths.push(...routeResult.path)
        }
      } catch (err) {
        console.warn(`路径规划失败 [${i}]->[${i+1}]:`, err)
        // 如果规划失败，退化为直线连接
        allPaths.push([points[i].lng, points[i].lat])
      }
    }
    // 添加最后一个点
    if (points.length > 0) {
      const lastPoint = points[points.length - 1]
      allPaths.push([lastPoint.lng, lastPoint.lat])
    }

    const polyline = new this.AMap.Polyline({
      path: allPaths,
      strokeColor: options.color || '#667eea',
      strokeWeight: options.width || 6,
      strokeOpacity: 0.8,
      lineJoin: 'round',
      lineCap: 'round',
      ...options
    })
    
    if (this.map) {
      this.map.add(polyline)
      this.map.setFitView([polyline])
    }
    
    return polyline
  }

  /**
   * 绘制单段路线
   */
  async drawSingleRoute(start, end, options = {}) {
    try {
      const routeResult = await this.planDrivingRoute(start, end)
      const polyline = new this.AMap.Polyline({
        path: routeResult.path,
        strokeColor: options.color || '#667eea',
        strokeWeight: options.width || 6,
        strokeOpacity: 0.8,
        lineJoin: 'round',
        lineCap: 'round',
        ...options
      })
      
      if (this.map) {
        this.map.add(polyline)
        this.map.setFitView([polyline])
      }
      
      return polyline
    } catch (err) {
      console.warn('路线规划失败，使用直线连接:', err)
      // 退化为直线
      const polyline = new this.AMap.Polyline({
        path: [[start.lng, start.lat], [end.lng, end.lat]],
        strokeColor: options.color || '#667eea',
        strokeWeight: options.width || 6,
        strokeOpacity: 0.8,
        strokeStyle: 'dashed',
        ...options
      })
      
      if (this.map) {
        this.map.add(polyline)
      }
      
      return polyline
    }
  }

  /**
   * 路径规划 - 驾车
   */
  async planDrivingRoute(start, end) {
    await this.loadAMap()

    return new Promise((resolve, reject) => {
      const driving = new this.AMap.Driving({
        policy: this.AMap.DrivingPolicy.LEAST_TIME,
        extensions: 'base'
      })
      
      driving.search(
        [start.lng, start.lat],
        [end.lng, end.lat],
        (status, result) => {
          if (status === 'complete' && result.routes && result.routes.length > 0) {
            const route = result.routes[0]
            // 提取路径点
            const path = []
            route.steps.forEach(step => {
              if (step.path && step.path.length > 0) {
                step.path.forEach(point => {
                  path.push([point.lng, point.lat])
                })
              }
            })
            
            resolve({
              distance: route.distance,
              duration: route.time,
              path: path,
              steps: route.steps.map(step => ({
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
