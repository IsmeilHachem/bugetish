import { createRouter, createWebHistory } from 'vue-router'
import ReflectionPage from '@/views/ReflectionPage.vue'
import ReflectionHistory from '@/views/ReflectionHistory.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/migrate',
    name: 'Migrate',
    component: () => import('../views/Migrate.vue')
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/Categories.vue')
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('../views/Transactions.vue')
  },
  {
    path: '/bills',
    name: 'Bills',
    component: () => import('../views/Bills.vue')
  },
  {
    path: '/reflection',
    name: 'ReflectionPage',
    component: ReflectionPage
  },
  {
    path: '/reflections',
    name: 'ReflectionHistory',
    component: ReflectionHistory
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Wait for auth to be initialized
  if (authStore.loading) {
    await authStore.init()
  }

  if (!to.meta.public && !authStore.isLoggedIn) {
    return { name: 'Login' }
  }

  if (to.name === 'Login' && authStore.isLoggedIn) {
    return { name: 'Dashboard' }
  }
})

export default router 