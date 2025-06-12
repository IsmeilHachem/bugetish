<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Transactions</h1>
        <p class="text-gray-600 mt-2">Manage your transactions</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="selectedTransactions.length > 0"
          @click="deleteSelectedTransactions"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Delete Selected
        </button>
        <button
          @click="openAddTransactionModal"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Transaction
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Date Range Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div class="flex gap-2">
            <input
              type="month"
              v-model="dateRange.start"
              class="border rounded px-2 py-1 w-full"
            />
            <input
              type="month"
              v-model="dateRange.end"
              class="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>

        <!-- Search Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Search by description, category, or amount"
            class="border rounded px-2 py-1 w-full"
          />
        </div>

        <!-- Sort Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <div class="flex gap-2">
            <select
              v-model="sortBy"
              class="border rounded px-2 py-1 w-full"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="description">Description</option>
              <option value="category">Category</option>
            </select>
            <button
              @click="toggleSortOrder"
              class="px-2 py-1 border rounded"
            >
              {{ sortOrder === 'desc' ? '↓' : '↑' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-lg font-medium text-gray-900">Transactions</h2>
        <button
          @click="selectAll"
          class="text-blue-600 hover:text-blue-800"
        >
          Select All
        </button>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="w-12 px-4 py-3">
              <input
                type="checkbox"
                v-model="allSelected"
                @change="toggleAll"
                class="rounded border-gray-300 text-blue-600"
              >
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="transaction in filteredAndSortedTransactions" :key="transaction.id">
            <td class="px-4 py-3">
              <input
                type="checkbox"
                v-model="selectedTransactions"
                :value="transaction.id"
                class="rounded border-gray-300 text-blue-600"
              >
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">
              {{ formatDate(transaction.date) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">
              {{ transaction.description || '-' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">
              {{ transaction.category }}
            </td>
            <td class="px-4 py-3 text-sm text-right tabular-nums"
              :class="{
                'text-green-600': transaction.amount > 0,
                'text-red-600': transaction.amount < 0
              }"
            >
              {{ formatCurrency(transaction.amount) }}
            </td>
            <td class="px-4 py-3 text-sm text-right tabular-nums font-medium"
              :class="{
                'text-blue-600': transaction.runningTotal >= 0,
                'text-red-600': transaction.runningTotal < 0
              }"
            >
              {{ formatCurrency(transaction.runningTotal) }}
            </td>
            <td class="px-4 py-3 text-right text-sm">
              <div class="flex justify-end gap-2">
                <button
                  @click="editTransaction(transaction)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  @click="deleteTransaction(transaction.id)"
                  class="text-red-600 hover:text-red-800"
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
import { ref, computed } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import AddTransactionModal from '@/components/AddTransactionModal.vue'
import EditTransactionModal from '@/components/EditTransactionModal.vue'

const transactionsStore = useTransactionsStore()
const selectedTransactions = ref([])
const allSelected = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedTransaction = ref(null)

// Filter and sort state
const dateRange = ref({
  start: new Date().toISOString().slice(0, 7), // Current month
  end: new Date().toISOString().slice(0, 7)
})
const searchTerm = ref('')
const sortBy = ref('date')
const sortOrder = ref('desc')

// Helper function to parse EST date
function parseESTDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  // Create date in EST (UTC-5)
  return new Date(Date.UTC(year, month - 1, day, 5, 0, 0))
}

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