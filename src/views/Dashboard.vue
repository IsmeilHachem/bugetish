<template>
  <div class="container mx-auto px-4 py-8" :key="selectedMonth + '-' + refreshKey">
    <!-- Header Section -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-2">Your financial overview</p>
      </div>
      <!-- Month Picker -->
      <div class="mt-4 md:mt-0">
        <label class="text-sm font-medium text-gray-700">Month:
          <input type="month" v-model="selectedMonth" class="ml-2 border rounded px-2 py-1" />
        </label>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Current Balance -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500">Current Balance</h3>
        <p class="text-2xl font-bold text-gray-900 mt-2">{{ formatCurrency(currentBalance) }}</p>
        <p class="text-sm text-gray-500 mt-1">
          <span :class="balanceChange >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ balanceChange >= 0 ? '↑' : '↓' }} {{ formatCurrency(Math.abs(balanceChange)) }}
          </span>
          <span class="ml-1">this month</span>
        </p>
      </div>

      <!-- Monthly Income -->
      <div class="bg-green-50 rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-green-900">Monthly Income</h3>
        <p class="text-2xl font-bold text-green-900 mt-2">{{ formatCurrency(monthlyIncome) }}</p>
        <p class="text-sm text-green-700 mt-1">From {{ monthlyIncomeTransactions }} transactions</p>
      </div>

      <!-- Monthly Expenses -->
      <div class="bg-red-50 rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-red-900">Monthly Expenses</h3>
        <p class="text-2xl font-bold text-red-900 mt-2">{{ formatCurrency(monthlyExpenses) }}</p>
        <p class="text-sm text-red-700 mt-1">From {{ monthlyExpenseTransactions }} transactions</p>
      </div>

      <!-- Upcoming Bills -->
      <div class="bg-blue-50 rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-blue-900">Upcoming Bills</h3>
        <p class="text-2xl font-bold text-blue-900 mt-2">{{ formatCurrency(upcomingBillsTotal) }}</p>
        <p class="text-sm text-blue-700 mt-1">{{ upcomingBillsText }}</p>
        <div v-if="upcomingBills.length" class="flex flex-wrap gap-1 mt-1">
          <span v-for="bill in upcomingBills" :key="bill.id" class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
            {{ bill.name }}
          </span>
        </div>
      </div>
    </div>
    <div class="mb-8 flex justify-end">
      <router-link :to="{ path: '/reflection', query: { periodStart: formatLocalYYYYMMDD(new Date(new Date().getFullYear(), new Date().getMonth(), 1)) } }">
        <button class="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition">Reflect on this month</button>
      </router-link>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column - Charts -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Spending by Category Chart -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
          <div class="p-6">
            <div class="mb-6">
              <DateRangeSelector
                v-model:dateRange="selectedDateRange"
                initial-range="6M"
              />
            </div>
            <div class="h-64">
              <SpendingCategoryChart :category-data="categorySpendingData" />
            </div>
          </div>
        </div>
        <!-- Income vs Expenses Chart -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Income vs Expenses</h3>
          <div class="h-[400px] p-4">
            <IncomeExpensesChart :monthly-data="monthlyIncomeExpenses" />
          </div>
        </div>
      </div>

      <!-- Right Column - Lists -->
      <div class="space-y-8">
        <!-- Recent Transactions -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Recent Transactions</h3>
              <router-link 
                to="/transactions" 
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </router-link>
            </div>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="transaction in recentTransactions" 
              :key="transaction.id" 
              class="p-4 hover:bg-gray-50"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ transaction.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(transaction.date) }}</p>
                </div>
                <span :class="{
                  'text-green-600': transaction.amount > 0,
                  'text-red-600': transaction.amount < 0
                }">
                  {{ formatCurrency(transaction.amount) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Bills List -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Upcoming Bills</h3>
              <router-link 
                to="/bills" 
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </router-link>
            </div>
          </div>
          <div class="divide-y divide-gray-200">
            <div 
              v-for="bill in upcomingBills" 
              :key="bill.id" 
              class="p-4 hover:bg-gray-50"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ bill.name }}</p>
                  <p class="text-xs text-gray-500">Due {{ formatDate(bill.dueDate) }}</p>
                </div>
                <span class="text-gray-900">{{ formatCurrency(bill.amount) }}</span>
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
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
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
    const transDate = new Date(t.date)
    transDate.setMinutes(transDate.getMinutes() + transDate.getTimezoneOffset())
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
// Update upcomingBills to use per-month logic and match Bills page
const billsForDashboardMonth = computed(() => (billsStore.getBills || []).map(bill => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const day = bill.dueDate.split('-')[2]
  return {
    ...bill,
    dueDate: `${year}-${String(month).padStart(2, '0')}-${day}`,
    amount: getBillAmountDashboard(bill),
    paid: isBillPaidDashboard(bill),
    paymentCount: getBillPaymentCountDashboard(bill)
  }
}))
const upcomingBills = computed(() => {
  const { lastFriday, nextFriday } = getWeekRange()
  return (billsForDashboardMonth.value || []).filter(bill => {
    const dueDate = parseLocalDate(bill.dueDate)
    return dueDate >= lastFriday && 
           dueDate <= nextFriday && 
           !bill.paid && 
           !bill.deletedAfter // Filter out deleted bills
  }).sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate))
})
const upcomingBillsTotal = computed(() => {
  return upcomingBills.value.reduce((sum, bill) => sum + (bill.paid ? 0 : bill.amount), 0)
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