<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">BudgetIsh</h1>
            </div>
            <!-- Desktop Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="route in routes"
                :key="route.path"
                :to="route.path"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[
                  $route.path === route.path
                    ? 'border-b-2 border-blue-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                {{ route.name }}
              </router-link>
            </div>
          </div>
          <!-- Sign out -->
          <div v-if="authStore.isLoggedIn" class="flex items-center">
            <button
              @click="signOut"
              class="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="pb-20 sm:pb-0">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-view v-slot="{ Component }">
          <transition
            name="fade"
            mode="out-in"
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0"
            enter-to-class="transform opacity-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100"
            leave-to-class="transform opacity-0"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav v-if="authStore.isLoggedIn" class="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div class="flex justify-around">
        <router-link
          v-for="route in routes"
          :key="route.path"
          :to="route.path"
          class="flex flex-col items-center py-2 px-1 text-xs font-medium flex-1"
          :class="[
            $route.path === route.path
              ? 'text-blue-600'
              : 'text-gray-500'
          ]"
        >
          <span class="text-lg mb-0.5">{{ route.icon }}</span>
          <span>{{ route.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const routes = [
  { path: '/', name: 'Dashboard', icon: '📊' },
  { path: '/categories', name: 'Categories', icon: '🏷️' },
  { path: '/transactions', name: 'Transactions', icon: '💳' },
  { path: '/bills', name: 'Bills', icon: '📋' },
  { path: '/reflections', name: 'Reflections', icon: '💭' }
]

async function signOut() {
  await authStore.signOut()
  router.push('/login')
}
</script> 