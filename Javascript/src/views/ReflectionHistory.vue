<template>
  <div class="max-w-3xl mx-auto py-8">
    <h2 class="text-2xl font-bold mb-6">Reflection History</h2>
    <div v-if="reflections.length === 0" class="text-gray-500">No reflections yet. Start by writing your first monthly reflection!</div>
    <div v-else class="space-y-4">
      <div v-for="reflection in sortedReflections" :key="reflection.periodStart" class="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div class="font-semibold text-lg">{{ formatPeriod(reflection.periodStart) }}</div>
          <div class="text-sm text-gray-500 mt-1">Path To Financial Freedom: <span :class="reflection.summaryStats.pathToFreedom >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatCurrency(reflection.summaryStats.pathToFreedom) }}</span></div>
          <div class="text-sm text-gray-500">Income: <span class="text-green-700">{{ formatCurrency(reflection.summaryStats.income) }}</span></div>
          <div class="text-sm text-gray-500">Expenses: <span class="text-red-700">{{ formatCurrency(reflection.summaryStats.expenses) }}</span></div>
        </div>
        <div class="mt-4 md:mt-0">
          <router-link :to="{ name: 'ReflectionPage', query: { periodStart: reflection.periodStart } }">
            <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View / Edit</button>
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
import { computed, onMounted } from 'vue'
import { useReflectionsStore } from '@/stores/reflections'

const reflectionsStore = useReflectionsStore()

onMounted(() => {
  reflectionsStore.initialize()
})

const reflections = computed(() => reflectionsStore.getReflections)
const sortedReflections = computed(() =>
  [...reflections.value].sort((a, b) => new Date(b.periodStart) - new Date(a.periodStart))
)

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