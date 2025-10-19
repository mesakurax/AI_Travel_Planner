import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/config/supabase'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
    // 首页不需要认证，任何人都可以访问
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plans',
    name: 'PlanList',
    component: () => import('@/views/PlanList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plan/create',
    name: 'PlanCreator',
    component: () => import('@/views/PlanCreator.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/plan/:id',
    name: 'PlanDetail',
    component: () => import('@/views/PlanDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 确保认证状态已初始化
  if (!authStore.user) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        authStore.user = session.user
      }
    } catch (err) {
      console.error('获取会话失败:', err)
    }
  }
  
  const isAuthenticated = authStore.user !== null

  // 如果已登录用户访问首页，自动跳转到 Dashboard
  if (to.name === 'Home' && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // 已登录用户访问登录/注册页，跳转到 Dashboard
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
