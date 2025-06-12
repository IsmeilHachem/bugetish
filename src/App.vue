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
            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link 
                v-for="route in routes" 
                :key="route.path"
                :to="route.path"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[
                  $route.path === route.path
                    ? 'border-b-2 border-primary-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                {{ route.name }}
              </router-link>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
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
  </div>
</template>

<script setup>
const routes = [
  { path: '/', name: 'Dashboard' },
  { path: '/categories', name: 'Categories' },
  { path: '/transactions', name: 'Transactions' },
  { path: '/bills', name: 'Bills' },
  { path: '/reflections', name: 'Reflections' }
]
</script> 