<template>
  <div class="max-w-2xl mx-auto py-8">
    <h2 class="text-2xl font-bold mb-4">Monthly Reflection: {{ monthLabel }}</h2>
    <div class="mb-4">
      <label class="block font-medium mb-1">Select Month</label>
      <input type="month" v-model="selectedMonth" @change="onMonthChange" class="border rounded p-2" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded shadow p-4">
        <div class="text-gray-500 text-sm">Income</div>
        <div class="text-2xl font-bold text-green-700">{{ formatCurrency(stats.income) }}</div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="text-gray-500 text-sm">Expenses</div>
        <div class="text-2xl font-bold text-red-700">{{ formatCurrency(stats.expenses) }}</div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="text-gray-500 text-sm flex items-center">Path To Financial Freedom
          <span class="ml-1" title="Income minus Expenses for the month">🛈</span>
        </div>
        <div class="text-2xl font-bold text-blue-700">{{ formatCurrency(stats.pathToFreedom) }}</div>
        <div class="text-xs text-gray-500 mt-1">Income minus Expenses for the month</div>
      </div>
      <div class="bg-white rounded shadow p-4">
        <div class="text-gray-500 text-sm">Top Categories</div>
        <ul class="list-disc list-inside mt-2">
          <li v-for="cat in stats.topCategories" :key="cat" class="text-base font-medium text-gray-800">{{ cat }}</li>
          <li v-if="stats.topCategories.length === 0" class="text-gray-400">-</li>
        </ul>
      </div>
    </div>
    <form @submit.prevent="saveReflection">
      <div class="mb-4">
        <label class="block font-medium mb-1">What went well this month?</label>
        <textarea v-model="reflection.notes" class="w-full border rounded p-2" rows="2" />
      </div>
      <div class="mb-4">
        <label class="block font-medium mb-1">What challenges did you face?</label>
        <textarea v-model="reflection.challenges" class="w-full border rounded p-2" rows="2" />
      </div>
      <div class="mb-4">
        <label class="block font-medium mb-1">Goal for next month</label>
        <textarea v-model="reflection.goals" class="w-full border rounded p-2" rows="2" />
      </div>
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Reflection</button>
    </form>
    <div v-if="lastSaved" class="text-green-600 mt-4">Reflection saved!</div>
    <div class="mt-8">
      <h3 class="text-xl font-bold mb-2">Weekly Reflections</h3>
      <div v-for="week in getWeekRanges(selectedMonth)" :key="week.week" class="mb-4">
        <label class="block font-medium mb-1">
          Week {{ week.week }} ({{ week.start }} - {{ week.end }})
        </label>
        <textarea
          v-model="reflection.weeklyReflections[week.week]"
          class="w-full border rounded p-2"
          rows="2"
          :placeholder="`Reflection for week ${week.week}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useReflectionsStore } from '@/stores/reflections'
import { useTransactionsStore } from '@/stores/transactions'
import { useRoute, useRouter } from 'vue-router'

const reflectionsStore = useReflectionsStore()
const transactionsStore = useTransactionsStore()
const route = useRoute()
const router = useRouter()

// Month picker state
const today = new Date()
const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const selectedMonth = ref(defaultMonth)

function getPeriodStart(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  return `${year}-${String(month).padStart(2, '0')}-01`
}
function getPeriodEnd(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  const end = new Date(year, month, 0)
  return `${year}-${String(month).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
}

const periodType = 'month'
const reflection = ref({
  periodType,
  periodStart: getPeriodStart(selectedMonth.value),
  periodEnd: getPeriodEnd(selectedMonth.value),
  notes: '',
  challenges: '',
  goals: '',
  summaryStats: {},
})
const lastSaved = ref(false)

const monthLabel = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
})

function loadReflectionForMonth(monthStr) {
  const periodStart = getPeriodStart(monthStr)
  const existing = reflectionsStore.getReflectionByPeriod(periodType, periodStart)
  if (existing) {
    reflection.value = { ...existing }
  } else {
    reflection.value = {
      periodType,
      periodStart,
      periodEnd: getPeriodEnd(monthStr),
      notes: '',
      challenges: '',
      goals: '',
      summaryStats: {},
    }
  }
}

function onMonthChange() {
  loadReflectionForMonth(selectedMonth.value)
}

function extractMonthFromQuery(route) {
  // Prefer ?month=YYYY-MM, fallback to ?periodStart=YYYY-MM-DD
  const queryMonth = route.query.month
  if (typeof queryMonth === 'string' && /^\d{4}-\d{2}$/.test(queryMonth)) {
    return queryMonth
  }
  const queryPeriodStart = route.query.periodStart
  if (typeof queryPeriodStart === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(queryPeriodStart)) {
    return queryPeriodStart.slice(0, 7)
  }
  return null
}

onMounted(() => {
  reflectionsStore.initialize()
  // Check for ?month=YYYY-MM or ?periodStart=YYYY-MM-DD in the query
  const monthFromQuery = extractMonthFromQuery(route)
  if (monthFromQuery) {
    selectedMonth.value = monthFromQuery
  }
  loadReflectionForMonth(selectedMonth.value)
})

watch(() => [route.query.month, route.query.periodStart], ([newMonth, newPeriodStart]) => {
  const monthFromQuery = extractMonthFromQuery(route)
  if (monthFromQuery) {
    selectedMonth.value = monthFromQuery
  }
})

watch(selectedMonth, (newMonth) => {
  loadReflectionForMonth(newMonth)
})

function saveReflection() {
  reflection.value.periodStart = getPeriodStart(selectedMonth.value)
  reflection.value.periodEnd = getPeriodEnd(selectedMonth.value)
  reflection.value.summaryStats = stats.value
  if (!reflection.value.weeklyReflections) reflection.value.weeklyReflections = {}
  reflectionsStore.addOrUpdateReflection(reflection.value)
  lastSaved.value = true
  setTimeout(() => (lastSaved.value = false), 2000)
}

// Helper function to filter transactions for a given month (YYYY-MM)
function getMonthTransactions(transactions, monthStr) {
  if (!Array.isArray(transactions) || !monthStr) return []
  const [year, month] = monthStr.split('-').map(Number)
  if (!year || !month) return []
  return transactions.filter(t => {
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}

const stats = computed(() => {
  // Use selectedMonth.value for filtering
  const incomeTxs = getMonthTransactions(transactionsStore.getFilteredIncome(), selectedMonth.value)
  const expenseTxs = getMonthTransactions(transactionsStore.getFilteredExpense(), selectedMonth.value)
  const income = incomeTxs.reduce((sum, t) => sum + t.amount, 0)
  const expenses = Math.abs(expenseTxs.reduce((sum, t) => sum + t.amount, 0))
  const pathToFreedom = income - expenses
  // Top 3 categories by expense
  const categoryTotals = {}
  expenseTxs.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount)
  })
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)
  return {
    income,
    expenses,
    pathToFreedom,
    topCategories
  }
})

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Helper: Get week ranges for the selected month (EST)
function getWeekRanges(monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  const start = new Date(Date.UTC(year, month - 1, 1, 5, 0, 0)) // EST
  const end = new Date(Date.UTC(year, month, 0, 5, 0, 0)) // EST
  const weeks = []
  let current = new Date(start)
  let week = 1
  while (current <= end) {
    const weekStart = new Date(current)
    const weekEnd = new Date(Math.min(
      new Date(current.getFullYear(), current.getMonth(), current.getDate() + 6).getTime(),
      end.getTime()
    ))
    weeks.push({
      week,
      start: weekStart.toISOString().slice(0, 10),
      end: weekEnd.toISOString().slice(0, 10)
    })
    current.setUTCDate(current.getUTCDate() + 7)
    week++
  }
  return weeks
}

// Ensure weeklyReflections is always present
watch(reflection, (val) => {
  if (!val.weeklyReflections) val.weeklyReflections = {}
}, { immediate: true, deep: true })
</script> 