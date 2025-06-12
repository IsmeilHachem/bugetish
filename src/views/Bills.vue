<!-- Bills View -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Bills</h1>
        <p class="text-gray-600 mt-2">Manage your recurring bills and payments</p>
      </div>
      <div class="flex space-x-4 items-center">
        <!-- Month Picker -->
        <label class="text-sm font-medium text-gray-700">Month:
          <input type="month" v-model="selectedMonth" class="ml-2 border rounded px-2 py-1" />
        </label>
        <button
          @click="resetBills"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Reset Bills
        </button>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Bill
        </button>
      </div>
    </div>

    <!-- Bills List Section -->
    <div class="space-y-8 mt-12">
      <!-- Category Filter -->
      <div class="flex items-center space-x-4">
        <select 
          v-model="selectedCategory"
          class="w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          <option v-for="category in categoriesWithBills" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <!-- Bills by Category -->
      <div v-for="category in filteredCategories" :key="category" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ category }} 
            <span class="text-sm text-gray-500">({{ getBillCountForCategory(category) }})</span>
            <span :class="{
              'text-green-600': getTotalForCategory(category) > 0,
              'text-red-600': getTotalForCategory(category) < 0,
              'text-gray-600': getTotalForCategory(category) === 0
            }" class="ml-4">
              {{ formatCurrency(getTotalForCategory(category)) }}
            </span>
          </h2>
        </div>
        
        <!-- Upcoming Bills in Category -->
        <div v-if="getUpcomingBillsForCategory(category).length > 0">
          <h3 class="text-lg font-medium text-blue-600 mb-2">Upcoming</h3>
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              <li v-for="bill in getUpcomingBillsForCategory(category)" :key="bill.id" class="px-4 py-4 sm:px-6">
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
              </li>
            </ul>
          </div>
        </div>

        <!-- Unpaid Bills in Category -->
        <div v-if="getUnpaidBillsForCategory(category).length > 0">
          <h3 class="text-lg font-medium text-red-600 mb-2">Overdue</h3>
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              <li v-for="bill in getUnpaidBillsForCategory(category)" :key="bill.id" class="px-4 py-4 sm:px-6">
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
              </li>
            </ul>
          </div>
        </div>

        <!-- Paid Bills in Category -->
        <div v-if="getPaidBillsForCategory(category).length > 0">
          <h3 class="text-lg font-medium text-green-600 mb-2">Paid</h3>
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              <li v-for="bill in getPaidBillsForCategory(category)" :key="bill.id" class="px-4 py-4 sm:px-6">
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
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Deleted Bills Section -->
    <div v-if="billsStore.getBills && billsStore.getBills.some(bill => bill.deletedAfter && selectedMonth > bill.deletedAfter)" class="mt-12">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Deleted Bills</h2>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="bill in billsStore.getBills.filter(bill => bill.deletedAfter && selectedMonth > bill.deletedAfter)" :key="bill.id" class="px-4 py-4 sm:px-6 flex items-center justify-between">
            <div>
              <div class="font-medium text-gray-900">{{ bill.name }}</div>
              <div class="text-gray-500 text-sm">{{ bill.category }} | Amount: {{ formatCurrency(bill.amount) }}</div>
              <div class="text-gray-400 text-xs">Deleted after: {{ bill.deletedAfter }}</div>
            </div>
            <button @click="restoreBill(bill)" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Restore</button>
          </li>
        </ul>
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
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Delete Bill</h3>
        <p class="text-gray-500 mb-6">Are you sure you want to delete this bill? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Delete
          </button>
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
onMounted(() => {
  billsStore.initialize()
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
  return billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.amount ?? bill.amount
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
      if (bill.deletedAfter && selectedMonth.value > bill.deletedAfter) return false
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

// Add a method to restore a deleted bill
function restoreBill(bill) {
  bill.deletedAfter = null
  billsStore.saveToLocalStorage()
}
</script> 