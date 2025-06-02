import { createRouter, createWebHistory } from 'vue-router'
import ReflectionPage from '@/views/ReflectionPage.vue'
import ReflectionHistory from '@/views/ReflectionHistory.vue'

const routes = [
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

export default router 