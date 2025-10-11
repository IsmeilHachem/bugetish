<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" :key="selectedMonth + '-' + refreshKey">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            <p class="text-gray-600 mt-2 text-lg">Your comprehensive financial overview</p>
          </div>
          <!-- Month Picker -->
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
              <input 
                type="month" 
                v-model="selectedMonth" 
                class="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:shadow-md"
              />
            </div>
            <router-link :to="{ path: '/reflection', query: { periodStart: formatLocalYYYYMMDD(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) } }">
              <button class="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Reflect on this month
              </button>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Current Balance -->
        <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Current Balance</h3>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900 mb-2">{{ formatCurrency(currentBalance) }}</p>
          <p class="text-sm text-gray-500">
            <span :class="balanceChange >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
              {{ balanceChange >= 0 ? '↗' : '↘' }} {{ formatCurrency(Math.abs(balanceChange)) }}
            </span>
            <span class="ml-1">this month</span>
          </p>
        </div>

        <!-- Monthly Income -->
        <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Monthly Income</h3>
            </div>
          </div>
          <p class="text-3xl font-bold text-green-600 mb-2">{{ formatCurrency(monthlyIncome) }}</p>
          <p class="text-sm text-gray-500">From {{ monthlyIncomeTransactions }} transactions</p>
        </div>

        <!-- Monthly Expenses -->
        <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Monthly Expenses</h3>
            </div>
          </div>
          <p class="text-3xl font-bold text-red-600 mb-2">{{ formatCurrency(monthlyExpenses) }}</p>
          <p class="text-sm text-gray-500">From {{ monthlyExpenseTransactions }} transactions</p>
        </div>

        <!-- Upcoming Bills -->
        <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming Bills</h3>
            </div>
          </div>
          <p class="text-3xl font-bold text-orange-600 mb-2">{{ formatCurrency(upcomingBillsTotal) }}</p>
          <p class="text-sm text-gray-500 mb-3">{{ upcomingBillsText }}</p>
          <div v-if="upcomingBills.length" class="flex flex-wrap gap-1">
            <span v-for="bill in upcomingBills" :key="bill.id" class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
              {{ bill.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Charts -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Spending by Category Chart -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Spending by Category</h3>
            </div>
            <div class="mb-6">
              <DateRangeSelector
                v-model:dateRange="selectedDateRange"
                initial-range="6M"
              />
            </div>
            <div class="h-80 md:h-96 max-w-2xl mx-auto w-full overflow-hidden flex items-center justify-center p-2">
              <SpendingCategoryChart :category-data="categorySpendingData" />
            </div>
          </div>

          <!-- Income vs Expenses Chart -->
          <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900">Income vs Expenses</h3>
            </div>
            <div class="h-[400px] p-4">
              <IncomeExpensesChart :monthly-data="monthlyIncomeExpenses" />
            </div>
          </div>
        </div>

        <!-- Right Column - Lists -->
        <div class="space-y-8">
          <!-- Recent Transactions -->
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div class="p-6 border-b border-gray-100">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-gray-900">Recent Transactions</h3>
                </div>
                <router-link 
                  to="/transactions" 
                  class="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
                >
                  View All →
                </router-link>
              </div>
            </div>
            <div class="divide-y divide-gray-100">
              <div 
                v-for="transaction in recentTransactions" 
                :key="transaction.id" 
                class="p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ transaction.description }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(transaction.date) }}</p>
                  </div>
                  <span :class="{
                    'text-green-600 font-bold': transaction.amount > 0,
                    'text-red-600 font-bold': transaction.amount < 0
                  }">
                    {{ formatCurrency(transaction.amount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming Bills List -->
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div class="p-6 border-b border-gray-100">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-gray-900">Upcoming Bills</h3>
                </div>
                <router-link 
                  to="/bills" 
                  class="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
                >
                  View All →
                </router-link>
              </div>
            </div>
            <div class="divide-y divide-gray-100">
              <div 
                v-for="bill in upcomingBills" 
                :key="bill.id" 
                class="p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ bill.name }}</p>
                    <p class="text-xs text-gray-500 mt-1">Due {{ formatDate(bill.dueDate) }}</p>
                  </div>
                  <span class="text-gray-900 font-bold">{{ formatCurrency(bill.amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useBillsStore } from '@/stores/bills'
import { useDashboardStore } from '@/stores/dashboard'
import { calculateMonthlyTrends } from '@/stores/dashboard'
import SpendingCategoryChart from '@/components/SpendingCategoryChart.vue'
import IncomeExpensesChart from '@/components/IncomeExpensesChart.vue'
import DateRangeSelector from '../components/DateRangeSelector.vue'

const transactionsStore = useTransactionsStore()
const billsStore = useBillsStore()
const dashboardStore = useDashboardStore()

// Date range for category chart
function getDefault6MonthRange() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of current month
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1); // Start of 6 months ago
  return {
    start: formatLocalYYYYMMDD(start),
    end: formatLocalYYYYMMDD(end)
  };
}
const selectedDateRange = ref(getDefault6MonthRange());

// Month picker state
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
const refreshKey = ref(0)

// Helper: Filter transactions for the selected month
function getMonthTransactions(transactions, monthStr) {
  const [year, month] = monthStr.split('-').map(Number)
  return transactions.filter(t => {
    const [y, m, d] = t.date.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.getFullYear() === year && dateObj.getMonth() + 1 === month
  })
}

// Helper function to filter transactions by selected date range
function filterTransactionsByDateRange(transactions, range) {
  if (!range || !range.start || !range.end) return transactions;
  let [sy, sm, sd] = (range.start.length === 7 ? `${range.start}-01` : range.start).split('-').map(Number);
  let start = new Date(sy, sm - 1, sd);
  let endExclusive;
  if (range.end.length === 7) {
    let [ey, em] = range.end.split('-').map(Number);
    endExclusive = new Date(ey, em, 1);
  } else {
    let [ey, em, ed] = range.end.split('-').map(Number);
    endExclusive = new Date(ey, em - 1, ed + 1);
  }
  return transactions.filter(t => {
    const [ty, tm, td] = t.date.split('-').map(Number);
    const tDate = new Date(ty, tm - 1, td);
    return tDate >= start && tDate < endExclusive;
  });
}

// Initialize data
onMounted(() => {
  transactionsStore.initialize()
  billsStore.initialize()
  dashboardStore.updateMonthlyTrends(transactionsStore.getTransactions || [])
  const filtered = filterTransactionsByDateRange(transactionsStore.getTransactions || [], selectedDateRange.value)
  dashboardStore.updateCategoryStats(filtered)
})

// Watch for transaction or date range changes (for Spending by Category)
watch([
  () => transactionsStore.getTransactions,
  () => selectedDateRange.value
], ([newTransactions, newRange]) => {
  if (newTransactions) {
    const filtered = filterTransactionsByDateRange(newTransactions, newRange)
    dashboardStore.updateCategoryStats(filtered)
  }
}, { deep: true })

// Helper function for current month filtering
const getCurrentMonthTransactions = (transactions, filterFn = () => true) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return transactions?.filter(t => {
    const [y, m, d] = t.date.split('-').map(Number)
    const transDate = new Date(y, m - 1, d)
    return transDate.getMonth() === currentMonth && 
           transDate.getFullYear() === currentYear &&
           filterFn(t)
  }) || []
}

// Update stat card computed properties to use selectedMonth
const currentBalance = computed(() => {
  const monthTx = getMonthTransactions(transactionsStore.getTransactions || [], selectedMonth.value)
  return monthTx.reduce((sum, t) => sum + t.amount, 0)
})

const balanceChange = computed(() => {
  const currentMonthTransactions = getCurrentMonthTransactions(transactionsStore.getTransactions)
  return currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
})

// Monthly Income/Expenses
const monthlyIncome = computed(() => {
  const monthTx = getMonthTransactions(transactionsStore.getFilteredIncome(), selectedMonth.value)
  return monthTx.reduce((sum, t) => sum + t.amount, 0)
})

const monthlyExpenses = computed(() => {
  const monthTx = getMonthTransactions(transactionsStore.getFilteredExpense(), selectedMonth.value)
  return Math.abs(monthTx.reduce((sum, t) => sum + t.amount, 0))
})

const monthlyIncomeTransactions = computed(() =>
  getMonthTransactions(transactionsStore.getFilteredIncome(), selectedMonth.value).length
)

const monthlyExpenseTransactions = computed(() =>
  getMonthTransactions(transactionsStore.getFilteredExpense(), selectedMonth.value).length
)

// Helper function to get the date range for the current week (Friday to Friday)
const getWeekRange = () => {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 6 = Saturday
  const daysToFriday = currentDay <= 5 ? 5 - currentDay : (5 - currentDay + 7)
  const daysFromLastFriday = currentDay <= 5 ? (currentDay + 2) : (currentDay - 5)
  const nextFriday = new Date(now)
  nextFriday.setDate(now.getDate() + daysToFriday)
  nextFriday.setHours(23, 59, 59, 999)
  const lastFriday = new Date(now)
  lastFriday.setDate(now.getDate() - daysFromLastFriday)
  lastFriday.setHours(0, 0, 0, 0)
  return { lastFriday, nextFriday }
}

// Helper to parse YYYY-MM-DD as local date (midnight local time)
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Helper: Get per-month paid status and amount for dashboard
function isBillPaidDashboard(bill) {
  return billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.paid || false
}
function getBillAmountDashboard(bill) {
  return billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.amount ?? bill.amount
}
function getBillPaymentCountDashboard(bill) {
  return billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.paymentCount ?? 0
}
// Update upcomingBills to use original bill dates, not modified month dates
const upcomingBills = computed(() => {
  const { lastFriday, nextFriday } = getWeekRange()
  return (billsStore.getBills || []).filter(bill => {
    // Use original bill due date, not modified month date
    const dueDate = parseLocalDate(bill.dueDate)
    const isPaid = billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.paid || false
    
    return dueDate >= lastFriday && 
           dueDate <= nextFriday && 
           !isPaid && 
           !bill.deletedAfter // Filter out deleted bills
  }).sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate))
})
const upcomingBillsTotal = computed(() => {
  return upcomingBills.value.reduce((sum, bill) => {
    const amount = billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.amount ?? bill.amount
    return sum + amount
  }, 0)
})
const upcomingBillsCount = computed(() => upcomingBills.value.length)

// Update the Upcoming Bills card text
const upcomingBillsText = computed(() => {
  const { lastFriday, nextFriday } = getWeekRange()
  const formattedLastFriday = formatDate(lastFriday)
  const formattedNextFriday = formatDate(nextFriday)
  return `${upcomingBillsCount.value} bills due this week (${formattedLastFriday} - ${formattedNextFriday})`
})

// Recent Transactions
const recentTransactions = computed(() => {
  return (transactionsStore.getTransactions || [])
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

// categorySpendingData uses the filtered transactions for the selected date range
const categorySpendingData = computed(() => {
  return Object.entries(dashboardStore.categoryStats)
    .map(([category, stats]) => ({
      category,
      amount: category === 'Pay Day' ? stats.total : -Math.abs(stats.total)
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
})

// Update monthlyIncomeExpenses to use dashboard store
const monthlyIncomeExpenses = computed(() => {
  return calculateMonthlyTrends(transactionsStore.getTransactions || [], selectedDateRange.value)
})

// Utility Functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatDate = (date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d)
}

function formatLocalYYYYMMDD(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

// Increment refreshKey every time selectedMonth changes
watch(selectedMonth, () => {
  refreshKey.value++
})
</script> 