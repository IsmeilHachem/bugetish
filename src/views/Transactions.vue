<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Transaction Management
            </h1>
            <p class="text-gray-600 mt-2 text-lg">Track and manage your financial transactions</p>
          </div>
          <div class="flex gap-3">
            <button
              v-if="selectedTransactions.length > 0"
              @click="deleteSelectedTransactions"
              class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected ({{ selectedTransactions.length }})
            </button>
            <button
              @click="openAddTransactionModal"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-2xl shadow-xl mb-8 p-6 border border-gray-100">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900">Filters & Search</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <!-- Date Range Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                type="month"
                v-model="dateRange.start"
                class="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md"
              />
              <input
                type="month"
                v-model="dateRange.end"
                class="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md"
              />
            </div>
          </div>

          <!-- Search Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Search by description, category, or amount"
              class="w-full min-w-0 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md"
            />
          </div>

          <!-- Sort Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <div class="flex gap-3">
              <select
                v-model="sortBy"
                class="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-md"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="description">Description</option>
                <option value="category">Category</option>
              </select>
              <button
                @click="toggleSortOrder"
                class="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="sortOrder === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8V4m0 0l-4 4m4-4l4 4M7 20v-4m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900">Transactions</h2>
            <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {{ filteredAndSortedTransactions.length }} transactions
            </span>
          </div>
          <button
            @click="selectAll"
            class="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
          >
            {{ allSelected ? 'Deselect All' : 'Select All' }}
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    v-model="allSelected"
                    @change="toggleAll"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                </th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Running Total
                </th>
                <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="transaction in filteredAndSortedTransactions" :key="transaction.id" 
                  :class="[
                    'hover:bg-gray-50 transition-colors duration-200',
                    isFutureTransaction(transaction.date) ? 'bg-green-50 hover:bg-green-100' : ''
                  ]">
                <td class="px-6 py-4">
                  <input
                    type="checkbox"
                    v-model="selectedTransactions"
                    :value="transaction.id"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ formatDate(transaction.date) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ transaction.description || '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                    {{ transaction.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-right tabular-nums font-semibold"
                  :class="{
                    'text-green-600': transaction.amount > 0,
                    'text-red-600': transaction.amount < 0
                  }"
                >
                  {{ formatCurrency(transaction.amount) }}
                </td>
                <td class="px-6 py-4 text-sm text-right tabular-nums font-bold"
                  :class="{
                    'text-blue-600': transaction.runningTotal >= 0,
                    'text-red-600': transaction.runningTotal < 0
                  }"
                >
                  {{ formatCurrency(transaction.runningTotal) }}
                </td>
                <td class="px-6 py-4 text-right text-sm">
                  <div class="flex justify-end gap-2">
                    <button
                      @click="editTransaction(transaction)"
                      class="px-3 py-1 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteTransaction(transaction.id)"
                      class="px-3 py-1 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <AddTransactionModal 
    v-model:isOpen="showAddModal"
    @transaction-added="showAddModal = false"
  />

  <EditTransactionModal
    v-model:isOpen="showEditModal"
    :transaction="selectedTransaction"
    @transaction-updated="handleTransactionUpdated"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useAuthStore } from '@/stores/auth'
import AddTransactionModal from '@/components/AddTransactionModal.vue'
import EditTransactionModal from '@/components/EditTransactionModal.vue'
import { parseESTDate, getTodayEST } from '@/utils/dateUtils'

const transactionsStore = useTransactionsStore()
const authStore = useAuthStore()

// Load as soon as auth is confirmed — handles both instant and delayed login states
watch(
  () => authStore.isLoggedIn,
  async (loggedIn) => {
    if (loggedIn) await transactionsStore.loadFromSupabase()
  },
  { immediate: true }
)
const selectedTransactions = ref([])
const allSelected = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedTransaction = ref(null)

// Filter and sort state — default wide range so all loaded data is visible
const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const dateRange = ref({
  start: '2024-01',
  end: currentMonth
})

// Once transactions load, tighten start to the earliest transaction's month
watch(
  () => transactionsStore.getTransactions,
  (txs) => {
    if (!txs || txs.length === 0) return
    const earliest = txs.reduce((min, t) => t.date < min ? t.date : min, txs[0].date)
    const [y, m] = earliest.split('-')
    dateRange.value.start = `${y}-${m}`
  },
  { immediate: true }
)
const searchTerm = ref('')
const sortBy = ref('date')
const sortOrder = ref('desc')

// Helper function to filter transactions by date range
function filterTransactionsByDateRange(transactions, range) {
  if (!range || !range.start || !range.end) return transactions

  // Parse start as EST date
  let [sy, sm, sd] = (range.start.length === 7 ? `${range.start}-01` : range.start).split('-').map(Number)
  let start = parseESTDate(`${sy}-${sm}-${sd || 1}`)

  // Parse end as EST date
  let endExclusive
  if (range.end.length === 7) {
    let [ey, em] = range.end.split('-').map(Number)
    endExclusive = parseESTDate(`${ey}-${em + 1}-1`) // First day of next month
  } else {
    let [ey, em, ed] = range.end.split('-').map(Number)
    endExclusive = parseESTDate(`${ey}-${em}-${ed + 1}`)
  }

  return transactions.filter(t => {
    const tDate = parseESTDate(t.date)
    return tDate >= start && tDate < endExclusive
  })
}

// Helper function to search transactions
function searchTransactions(transactions, term) {
  if (!term) return transactions
  const searchTerm = term.toLowerCase()
  return transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm) ||
    t.category?.toLowerCase().includes(searchTerm) ||
    t.amount.toString().includes(searchTerm)
  )
}

// Helper function to sort transactions
function sortTransactions(transactions, sortBy, sortOrder) {
  return [...transactions].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'date': {
        const dateDiff = parseESTDate(a.date) - parseESTDate(b.date)
        if (dateDiff !== 0) {
          comparison = dateDiff
        } else {
          // Same date: sort by ID
          comparison = a.id - b.id
        }
        break
      }
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'description':
        comparison = (a.description || '').localeCompare(b.description || '')
        break
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '')
        break
      default:
        comparison = 0
    }
    return sortOrder === 'desc' ? -comparison : comparison
  })
}

// Helper: Precompute running totals for all transactions (full list, EST, by date and ID)
const runningTotalsMap = computed(() => {
  const allTx = [...(transactionsStore.getTransactions || [])].sort((a, b) => {
    const dateA = parseESTDate(a.date)
    const dateB = parseESTDate(b.date)
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB
    }
    return a.id - b.id
  })
  let total = 0
  const map = {}
  allTx.forEach(tx => {
    total += tx.amount
    map[tx.id] = total
  })
  return map
})

// Computed property for filtered and sorted transactions
const filteredAndSortedTransactions = computed(() => {
  let transactions = transactionsStore.getTransactions || []
  
  // Apply date range filter
  transactions = filterTransactionsByDateRange(transactions, dateRange.value)
  
  // Apply search filter
  transactions = searchTransactions(transactions, searchTerm.value)
  
  // Sort transactions
  transactions = sortTransactions(transactions, sortBy.value, sortOrder.value)
  
  // Smart running total logic
  if (sortBy.value === 'date' && sortOrder.value === 'asc') {
    // Chronological order: use precomputed map
    return transactions.map(transaction => ({
      ...transaction,
      runningTotal: runningTotalsMap.value[transaction.id] ?? transaction.amount
    }))
  } else if (sortBy.value === 'date' && sortOrder.value === 'desc') {
    // Reverse chronological: calculate running total in reverse
    // Get all transactions in chronological order
    const allTx = [...transactionsStore.getTransactions || []].sort((a, b) => {
      const dateA = parseESTDate(a.date)
      const dateB = parseESTDate(b.date)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB
      }
      return a.id - b.id
    })
    // Compute current balance
    let currentBalance = 0
    allTx.forEach(tx => { currentBalance += tx.amount })
    // Map of id to amount
    const amountMap = {}
    allTx.forEach(tx => { amountMap[tx.id] = tx.amount })
    // Calculate running total in reverse for displayed transactions
    let running = currentBalance
    const result = []
    for (const transaction of transactions) {
      result.push({
        ...transaction,
        runningTotal: running
      })
      running -= amountMap[transaction.id] ?? transaction.amount
    }
    return result
  } else {
    // Other sorts: use chronological map
    return transactions.map(transaction => ({
      ...transaction,
      runningTotal: runningTotalsMap.value[transaction.id] ?? transaction.amount
    }))
  }
})

const formatDate = (date) => {
  const d = parseESTDate(date)
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  }).format(d)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Helper function to check if a transaction is in the future (EST timezone)
const isFutureTransaction = (dateStr) => {
  const transactionDate = parseESTDate(dateStr)
  const todayEST = getTodayEST()
  
  return transactionDate > todayEST
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const deleteTransaction = async (id) => {
  if (confirm('Are you sure you want to delete this transaction?')) {
    await transactionsStore.deleteTransaction(id)
  }
}

const deleteSelectedTransactions = async () => {
  if (confirm(`Are you sure you want to delete ${selectedTransactions.value.length} transactions?`)) {
    await Promise.all(selectedTransactions.value.map(id => transactionsStore.deleteTransaction(id)))
    selectedTransactions.value = []
    allSelected.value = false
  }
}

const selectAll = () => {
  allSelected.value = !allSelected.value
  if (allSelected.value) {
    selectedTransactions.value = filteredAndSortedTransactions.value.map(t => t.id)
  } else {
    selectedTransactions.value = []
  }
}

const toggleAll = () => {
  if (allSelected.value) {
    selectedTransactions.value = filteredAndSortedTransactions.value.map(t => t.id)
  } else {
    selectedTransactions.value = []
  }
}

const openAddTransactionModal = () => {
  showAddModal.value = true
}

const editTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showEditModal.value = true
}

const handleTransactionUpdated = () => {
  showEditModal.value = false
  selectedTransaction.value = null
}
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style> 