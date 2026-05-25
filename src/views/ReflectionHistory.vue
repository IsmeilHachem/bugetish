<template>
  <div class="max-w-3xl mx-auto py-8">
    <h2 class="text-2xl font-bold mb-6">Reflection History</h2>
    <div v-if="reflections.length === 0" class="text-gray-500">No reflections yet. Start by writing your first monthly reflection!</div>
    <div v-else class="space-y-4">
      <div v-for="reflection in sortedReflections" :key="reflection.periodStart" class="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div class="flex-1">
          <div class="font-semibold text-lg">{{ formatPeriod(reflection.periodStart) }}</div>
          <div class="text-sm text-gray-500 mt-1">Path To Financial Freedom: <span :class="reflection.summaryStats.pathToFreedom >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatCurrency(reflection.summaryStats.pathToFreedom) }}</span></div>
          <div class="text-sm text-gray-500">Income: <span class="text-green-700">{{ formatCurrency(reflection.summaryStats.income) }}</span></div>
          <div class="text-sm text-gray-500">Expenses: <span class="text-red-700">{{ formatCurrency(reflection.summaryStats.expenses) }}</span></div>

          <!-- Category rating badges -->
          <div
            v-if="Object.keys(getRatingsForMonth(reflection.periodStart)).length > 0"
            class="mt-2 flex flex-wrap gap-2"
          >
            <div
              v-for="([catName, data]) in Object.entries(getRatingsForMonth(reflection.periodStart)).slice(0, 5)"
              :key="catName"
              class="flex items-center space-x-1"
            >
              <span class="w-2 h-2 rounded-full inline-block" :class="ratingDotClass(data.rating)"></span>
              <span class="text-xs text-gray-500">{{ catName }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 md:mt-0 shrink-0">
          <router-link :to="{ name: 'ReflectionPage', query: { periodStart: reflection.periodStart } }">
            <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm whitespace-nowrap">View / Edit</button>
          </router-link>
          <router-link :to="{ path: '/monthly-review', query: { month: reflection.periodStart.slice(0, 7) } }">
            <button class="border border-violet-400 text-violet-700 px-4 py-2 rounded hover:bg-violet-50 text-sm whitespace-nowrap">View Full Review →</button>
          </router-link>
        </div>
      </div>
    </div>
    <div class="mt-8">
      <router-link to="/reflection">
        <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Reflect on this month</button>
      </router-link>
      <router-link to="/" class="ml-4">
        <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">Back to Dashboard</button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useReflectionsStore } from '@/stores/reflections'
import { useCategoryReflectionsStore } from '@/stores/categoryReflections'
import { useAuthStore } from '@/stores/auth'

const reflectionsStore = useReflectionsStore()
const categoryReflectionsStore = useCategoryReflectionsStore()
const authStore = useAuthStore()

onMounted(() => {
  reflectionsStore.initialize()
})

const reflections = computed(() => reflectionsStore.getReflections)
const sortedReflections = computed(() =>
  [...reflections.value].sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart))
)

// Per-month ratings cache: { 'YYYY-MM': { [catName]: { rating, notes } } }
const monthRatingsMap = ref({})

watch(
  [() => authStore.isLoggedIn, sortedReflections],
  async ([loggedIn, reflections]) => {
    if (!loggedIn || !reflections.length) return
    for (const r of reflections) {
      const monthStr = r.periodStart.slice(0, 7)
      if (monthRatingsMap.value[monthStr]) continue // already fetched
      await categoryReflectionsStore.loadForMonth(monthStr)
      monthRatingsMap.value[monthStr] = { ...categoryReflectionsStore.ratings }
    }
  },
  { immediate: true, deep: false }
)

function getRatingsForMonth(periodStart) {
  return monthRatingsMap.value[periodStart.slice(0, 7)] ?? {}
}

function ratingDotClass(rating) {
  if (rating === 1) return 'bg-blue-400'
  if (rating === 2) return 'bg-green-400'
  if (rating === 3) return 'bg-amber-400'
  return 'bg-gray-300'
}

function formatPeriod(periodStart) {
  const [year, month, day] = periodStart.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
</script> 