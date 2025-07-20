<!-- Bills View -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Bills Management
            </h1>
            <p class="text-gray-600 mt-2 text-lg">Track and manage your recurring bills and payments</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <!-- Month Picker -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
              <input 
                type="month" 
                v-model="selectedMonth" 
                class="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:shadow-md"
              />
            </div>
            <div class="flex gap-3">
              <button
                @click="resetBills"
                class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Bills
              </button>
              <button
                @click="showAddModal = true"
                class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Bill
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bills List Section -->
      <div class="space-y-8">
        <!-- Category Filter -->
        <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div class="flex items-center space-x-4">
            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <select 
              v-model="selectedCategory"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:shadow-md"
            >
              <option value="">All Categories</option>
              <option v-for="category in categoriesWithBills" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>

        <!-- Bills by Category Masonry Layout -->
        <div class="columns-1 sm:columns-2 gap-8">
          <div v-for="category in filteredCategories" :key="category"
            class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mb-8 break-inside-avoid">
            <!-- Category Header -->
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ category }}</h2>
                <div class="flex items-center space-x-4 mt-1">
                  <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {{ getBillCountForCategory(category) }} bills
                  </span>
                  <span :class="{
                    'text-green-600 bg-green-100': getTotalForCategory(category) > 0,
                    'text-red-600 bg-red-100': getTotalForCategory(category) < 0,
                    'text-gray-600 bg-gray-100': getTotalForCategory(category) === 0
                  }" class="text-sm font-semibold px-3 py-1 rounded-full">
                    {{ formatCurrency(getTotalForCategory(category)) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <!-- Upcoming Bills in Category -->
              <div v-if="getUpcomingBillsForCategory(category).length > 0">
                <h3 class="text-lg font-semibold text-blue-700 mb-2">Upcoming</h3>
                <div class="space-y-3">
                  <div v-for="bill in getUpcomingBillsForCategory(category)" :key="bill.id" class="bg-gray-50 rounded-xl px-4 py-3 mb-2">
                    <BillListItem
                      :bill="bill"
                      :paid="isBillPaid(bill)"
                      :due-date="bill.dueDate"
                      :amount="bill.amount"
                      :payment-count="bill.paymentCount"
                      @edit="editBill"
                      @delete="deleteBill"
                      @mark-paid="markBillAsPaid"
                      @mark-unpaid="markBillAsUnpaid"
                    />
                  </div>
                </div>
              </div>
              <!-- Overdue Bills in Category -->
              <div v-if="getUnpaidBillsForCategory(category).length > 0">
                <h3 class="text-lg font-semibold text-red-700 mb-2">Overdue</h3>
                <div class="space-y-3">
                  <div v-for="bill in getUnpaidBillsForCategory(category)" :key="bill.id" class="bg-gray-50 rounded-xl px-4 py-3 mb-2">
                    <BillListItem
                      :bill="bill"
                      :paid="isBillPaid(bill)"
                      :due-date="bill.dueDate"
                      :amount="bill.amount"
                      :payment-count="bill.paymentCount"
                      @edit="editBill"
                      @delete="deleteBill"
                      @mark-paid="markBillAsPaid"
                      @mark-unpaid="markBillAsUnpaid"
                    />
                  </div>
                </div>
              </div>
              <!-- Paid Bills in Category -->
              <div v-if="getPaidBillsForCategory(category).length > 0">
                <h3 class="text-lg font-semibold text-green-700 mb-2">Paid</h3>
                <div class="space-y-3">
                  <div v-for="bill in getPaidBillsForCategory(category)" :key="bill.id" class="bg-gray-50 rounded-xl px-4 py-3 mb-2">
                    <BillListItem
                      :bill="bill"
                      :paid="isBillPaid(bill)"
                      :due-date="bill.dueDate"
                      :amount="bill.amount"
                      :payment-count="bill.paymentCount"
                      @edit="editBill"
                      @delete="deleteBill"
                      @mark-paid="markBillAsPaid"
                      @mark-unpaid="markBillAsUnpaid"
                    />
                  </div>
                </div>
              </div>
              <!-- If no bills in this category -->
              <div v-if="getBillCountForCategory(category) === 0" class="text-gray-400 text-center py-8">
                No bills in this category for this month.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bill Modal -->
      <BillModal
        v-if="showAddModal || editingBill"
        :bill="editingBill"
        @close="closeModal"
        @saved="handleBillSaved"
      />

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">Delete Bill</h3>
          </div>
          <p class="text-gray-600 mb-8 text-lg">Are you sure you want to delete this bill? This action cannot be undone.</p>
          <div class="flex justify-end space-x-4">
            <button
              @click="showDeleteModal = false"
              class="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBillsStore } from '@/stores/bills'
import { useBillCategoriesStore } from '@/stores/billCategories'
import BillModal from '@/components/BillModal.vue'
import BillListItem from '@/components/BillListItem.vue'

const billsStore = useBillsStore()
const billCategoriesStore = useBillCategoriesStore()

// Modal states
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingBill = ref(null)
const deletingBillId = ref(null)

// Add state for category filter
const selectedCategory = ref('')

// Month picker state
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

// Helper: Get YYYY-MM for a date
function getYYYYMM(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// Initialize bills and categories
onMounted(async () => {
  await billsStore.initialize()
  billCategoriesStore.initialize()
  billsStore.updateBillStatuses()
})

// Watch for changes and persist paid status
watch(billsStore.billMonthStatus, (val) => {
  localStorage.setItem('billMonthStatus', JSON.stringify(val))
}, { deep: true })

// Computed properties for filtered bills
const upcomingBills = computed(() => billsStore.getUpcomingBills || [])
const unpaidBills = computed(() => billsStore.getUnpaidBills || [])
const paidBills = computed(() => billsStore.getPaidBills || [])

// Update computed properties to use billCategoriesStore
const categories = computed(() => {
  billCategoriesStore.initialize() // Ensure categories are initialized
  return billCategoriesStore.getMainCategories
})

// Only show categories that have bills
const categoriesWithBills = computed(() => {
  if (!billsStore.getBills || !categories.value) return []
  return categories.value.filter(category => 
    billsStore.getBills.some(bill => {
      if (!bill || !bill.category) return false
      const [mainCat] = bill.category.split(' - ')
      return mainCat === category
    })
  ).sort()
})

// Update filtered categories based on selection
const filteredCategories = computed(() => {
  if (!selectedCategory.value) return categoriesWithBills.value
  return [selectedCategory.value]
})

// Helper: Get per-month paid status
function isBillPaid(bill) {
  return billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.paid || false
}

// Helper: Get per-month amount
function getBillAmount(bill) {
  const perMonth = billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.amount;
  if (perMonth === null || perMonth === undefined || perMonth === '') {
    return bill.amount;
  }
  if (perMonth === 0 && bill.amount !== 0) {
    return bill.amount;
  }
  return perMonth;
}

// Helper: Get due date for bill in selected month
function getDueDateForMonth(bill) {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  // Extract the day directly from the bill's dueDate string
  const day = bill.dueDate.split('-')[2]
  return `${year}-${String(month).padStart(2, '0')}-${day}`
}

// Helper: Get bills for selected month
const billsForMonth = computed(() => {
  return (billsStore.getBills || [])
    .filter(bill => {
      // Exclude bills deleted for this and future months
      if (bill.deletedAfter && selectedMonth.value >= bill.deletedAfter) return false
      return true
    })
    .map(bill => ({
      ...bill,
      dueDate: getDueDateForMonth(bill),
      amount: getBillAmount(bill),
      paid: isBillPaid(bill),
      paymentCount: billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.paymentCount ?? 0
    }))
})

// Update getTotalForCategory to sum per-month amounts
const getTotalForCategory = (category) => {
  return billsForMonth.value
    .filter(bill => {
      if (!bill || !bill.category || bill.amount === undefined) return false
      const [mainCat] = bill.category.split(' - ')
      return mainCat === category
    })
    .reduce((total, bill) => total + (bill.amount || 0), 0)
}

// Update getBillCountForCategory
const getBillCountForCategory = (category) => {
  if (!billsForMonth.value) return 0
  return billsForMonth.value.filter(bill => {
    if (!bill || !bill.category) return false
    const [mainCat] = bill.category.split(' - ')
    return mainCat === category
  }).length
}

// Helper: Determine if a bill is overdue or upcoming for the selected month
function isOverdue(bill) {
  const today = new Date()
  const due = new Date(bill.dueDate)
  return !isBillPaid(bill) && due < today.setHours(0,0,0,0)
}
function isUpcoming(bill) {
  const today = new Date()
  const due = new Date(bill.dueDate)
  return !isBillPaid(bill) && due >= today.setHours(0,0,0,0)
}

// Update bill list getters to use new status logic
const getPaidBillsForCategory = (category) => {
  return billsForMonth.value.filter(bill => {
    if (!bill || !bill.category) return false
    const [mainCat] = bill.category.split(' - ')
    return mainCat === category && isBillPaid(bill)
  })
}
const getUpcomingBillsForCategory = (category) => {
  return billsForMonth.value.filter(bill => {
    if (!bill || !bill.category) return false
    const [mainCat] = bill.category.split(' - ')
    return mainCat === category && isUpcoming(bill)
  })
}
const getUnpaidBillsForCategory = (category) => {
  return billsForMonth.value.filter(bill => {
    if (!bill || !bill.category) return false
    const [mainCat] = bill.category.split(' - ')
    return mainCat === category && isOverdue(bill)
  })
}

// Update markBillAsPaid/markBillAsUnpaid to use per-month logic
function markBillAsPaid(bill) {
  billsStore.markAsPaid(bill.id, bill.amount, selectedMonth.value)
}
function markBillAsUnpaid(bill) {
  billsStore.markAsUnpaid(bill.id, selectedMonth.value)
}

// Modal handlers
const closeModal = () => {
  showAddModal.value = false
  editingBill.value = null
}

const handleBillSaved = () => {
  billsStore.updateBillStatuses()
}

// Bill actions
const editBill = (bill) => {
  editingBill.value = bill
}

const deleteBill = (bill) => {
  deletingBillId.value = bill.id
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (deletingBillId.value) {
    billsStore.deleteBill(deletingBillId.value, selectedMonth.value)
    showDeleteModal.value = false
    deletingBillId.value = null
  }
}

// Utility functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const resetBills = () => {
  if (confirm('Are you sure you want to reset all bills? This cannot be undone.')) {
    billsStore.resetBills()
  }
}
</script> 