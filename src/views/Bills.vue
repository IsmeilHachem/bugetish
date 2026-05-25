<!-- Bills View -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">

      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Bills
            </h1>
            <p class="text-gray-600 mt-2 text-lg">Track and manage your recurring bills and payments</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
              <input
                type="month"
                v-model="selectedMonth"
                class="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:shadow-md"
              />
            </div>
            <div class="flex gap-2 mt-auto">
              <button
                @click="showAddModal = true"
                class="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg text-sm font-semibold"
              >
                <svg class="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Bill
              </button>
              <button
                v-if="billsStore.canUndo"
                @click="undoAction"
                class="px-4 py-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm text-sm"
                title="Undo last action"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Bills</p>
          <p class="text-3xl font-bold text-gray-900">{{ billsForMonth.length }}</p>
          <p class="text-xs text-gray-400 mt-1">this month</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Amount Due</p>
          <p class="text-3xl font-bold text-gray-900">{{ formatCurrency(totalAmountDue) }}</p>
          <p class="text-xs text-gray-400 mt-1">total this month</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Paid</p>
          <p class="text-3xl font-bold text-green-600">{{ formatCurrency(totalPaid) }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ paidThisMonthBills.length }} bills paid</p>
        </div>
        <div class="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Remaining</p>
          <p class="text-3xl font-bold" :class="totalRemaining > 0 ? 'text-orange-600' : 'text-green-600'">
            {{ formatCurrency(totalRemaining) }}
          </p>
          <p v-if="lifeEnergyStore.lifeEnergyRate > 0 && totalRemaining > 0" class="text-xs text-gray-400 mt-1">
            ≈ {{ lifeEnergyStore.toCost(totalRemaining) }} of work
          </p>
          <p v-else class="text-xs text-gray-400 mt-1">unpaid</p>
        </div>
      </div>

      <div class="space-y-5">

        <!-- Section 1: Due This Week -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div class="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-base font-bold text-gray-900">Due This Week</h2>
            <span v-if="dueThisWeekBills.length > 0" class="ml-auto text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {{ dueThisWeekBills.length }} bill{{ dueThisWeekBills.length === 1 ? '' : 's' }}
            </span>
          </div>
          <div class="p-4">
            <div v-if="dueThisWeekBills.length === 0" class="flex items-center gap-2 text-green-600 text-sm font-medium py-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              No bills due this week ✓
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="bill in dueThisWeekBills"
                :key="bill.id"
                class="flex items-start justify-between p-4 rounded-xl border transition-colors duration-200"
                :class="isOverdueBill(bill) ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-gray-900 capitalize">{{ bill.name }}</span>
                    <span class="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-500 rounded-full">{{ bill.category }}</span>
                    <span v-if="isOverdueBill(bill)" class="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">Overdue</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">Due {{ formatDate(bill.dueDate) }}</p>
                </div>
                <div class="flex items-start gap-3 shrink-0 ml-4">
                  <div class="text-right">
                    <p class="font-bold text-gray-900">{{ formatCurrency(bill.amount) }}</p>
                    <p v-if="lifeEnergyStore.lifeEnergyRate > 0 && bill.amount" class="text-xs text-gray-400">
                      ≈ {{ lifeEnergyStore.toCost(bill.amount) }}
                    </p>
                  </div>
                  <div class="flex gap-1.5">
                    <button @click="markBillAsPaid(bill)" class="px-2.5 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap">
                      Mark Paid
                    </button>
                    <button @click="editBill(bill)" class="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50" title="Edit">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="promptArchive(bill)" class="p-1.5 text-gray-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50" title="Archive">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Due This Month -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div class="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-base font-bold text-gray-900">Due This Month</h2>
            <span v-if="dueThisMonthBills.length > 0" class="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {{ dueThisMonthBills.length }} bill{{ dueThisMonthBills.length === 1 ? '' : 's' }}
            </span>
          </div>
          <div class="p-4">
            <div v-if="dueThisMonthBills.length === 0" class="text-sm text-gray-400 py-2">
              No other unpaid bills this month.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="bill in dueThisMonthBills"
                :key="bill.id"
                class="flex items-start justify-between p-4 rounded-xl border transition-colors duration-200"
                :class="isOverdueBill(bill) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-gray-900 capitalize">{{ bill.name }}</span>
                    <span class="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-500 rounded-full">{{ bill.category }}</span>
                    <span v-if="isOverdueBill(bill)" class="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">Overdue</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">Due {{ formatDate(bill.dueDate) }}</p>
                </div>
                <div class="flex items-start gap-3 shrink-0 ml-4">
                  <div class="text-right">
                    <p class="font-bold text-gray-900">{{ formatCurrency(bill.amount) }}</p>
                    <p v-if="lifeEnergyStore.lifeEnergyRate > 0 && bill.amount" class="text-xs text-gray-400">
                      ≈ {{ lifeEnergyStore.toCost(bill.amount) }}
                    </p>
                  </div>
                  <div class="flex gap-1.5">
                    <button @click="markBillAsPaid(bill)" class="px-2.5 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap">
                      Mark Paid
                    </button>
                    <button @click="editBill(bill)" class="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50" title="Edit">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="promptArchive(bill)" class="p-1.5 text-gray-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50" title="Archive">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Paid This Month (collapsible) -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <button
            @click="paidSectionOpen = !paidSectionOpen"
            class="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200"
          >
            <div class="w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="flex-1 text-left">
              <span class="text-base font-bold text-gray-900">Paid This Month</span>
              <span class="ml-2 text-sm text-gray-500">
                — {{ paidThisMonthBills.length }} bill{{ paidThisMonthBills.length === 1 ? '' : 's' }}, {{ formatCurrency(totalPaid) }} total
              </span>
            </div>
            <svg class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0" :class="paidSectionOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="paidSectionOpen" class="border-t border-gray-100">
            <div class="p-4">
              <div v-if="paidThisMonthBills.length === 0" class="text-sm text-gray-400 py-2">
                No bills paid yet this month.
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="bill in paidThisMonthBills"
                  :key="bill.id"
                  class="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-semibold text-gray-700 capitalize">{{ bill.name }}</span>
                      <span class="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-400 rounded-full">{{ bill.category }}</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">Due {{ formatDate(bill.dueDate) }}</p>
                  </div>
                  <div class="flex items-center gap-3 shrink-0 ml-4">
                    <p class="font-bold text-green-600">{{ formatCurrency(bill.amount) }}</p>
                    <button @click="markBillAsUnpaid(bill)" class="px-2.5 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                      Mark Unpaid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Archived Bills (collapsible) -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <button
            @click="archivedSectionOpen = !archivedSectionOpen"
            class="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200"
          >
            <div class="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div class="flex-1 text-left">
              <span class="text-base font-bold text-gray-500">Archived Bills</span>
              <span class="ml-2 text-sm text-gray-400">— {{ billsStore.getArchivedBills.length }} archived</span>
            </div>
            <svg class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0" :class="archivedSectionOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="archivedSectionOpen" class="border-t border-gray-100">
            <div class="p-4">
              <div v-if="billsStore.getArchivedBills.length === 0" class="text-sm text-gray-400 py-2">
                No archived bills.
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="bill in billsStore.getArchivedBills"
                  :key="bill.id"
                  class="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl opacity-75"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-semibold text-gray-500 capitalize">{{ bill.name }}</span>
                      <span class="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-400 rounded-full">{{ bill.category }}</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">{{ formatCurrency(bill.amount) }}/mo · Archived</p>
                  </div>
                  <button
                    @click="restoreBill(bill)"
                    class="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 ml-4"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- end space-y-5 -->

      <!-- Bill Add/Edit Modal -->
      <BillModal
        v-if="showAddModal || editingBill"
        :bill="editingBill"
        @close="closeModal"
        @saved="handleBillSaved"
      />

      <!-- Archive Confirmation Modal -->
      <div v-if="showArchiveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-gray-100">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">Archive Bill</h3>
          </div>
          <p class="text-gray-600 mb-2 text-base">Archive <strong class="capitalize">{{ archivingBill?.name }}</strong>?</p>
          <p class="text-gray-400 text-sm mb-8">It will be hidden from view but your payment history is preserved. You can restore it anytime from the Archived Bills section.</p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showArchiveModal = false; archivingBill = null"
              class="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none transition-all duration-200"
            >
              Cancel
            </button>
            <button
              @click="confirmArchive"
              class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Archive Bill
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
import { useAuthStore } from '@/stores/auth'
import { useLifeEnergyStore } from '@/stores/lifeEnergy'
import BillModal from '@/components/BillModal.vue'

const billsStore = useBillsStore()
const authStore = useAuthStore()
const lifeEnergyStore = useLifeEnergyStore()

// Load life energy when auth is ready
watch(
  () => authStore.isLoggedIn,
  async (loggedIn) => {
    if (loggedIn) await lifeEnergyStore.loadFromSupabase()
  },
  { immediate: true }
)

// Month picker
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

// Modal / section state
const showAddModal = ref(false)
const editingBill = ref(null)
const showArchiveModal = ref(false)
const archivingBill = ref(null)
const paidSectionOpen = ref(false)
const archivedSectionOpen = ref(false)

// Initialize
onMounted(async () => {
  await billsStore.initialize()
  billsStore.updateBillStatuses()
})

watch(billsStore.billMonthStatus, (val) => {
  localStorage.setItem('billMonthStatus', JSON.stringify(val))
}, { deep: true })

// Helpers
function getYYYYMM(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function isBillPaid(bill) {
  return billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.paid || false
}

function getBillAmount(bill) {
  const perMonth = billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.amount
  if (perMonth === null || perMonth === undefined || perMonth === '') return bill.amount
  if (perMonth === 0 && bill.amount !== 0) return bill.amount
  return perMonth
}

function getDueDateForMonth(bill) {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const day = parseInt(bill.dueDate.split('-')[2])
  const date = new Date(year, month - 1, day)
  if (date.getMonth() !== month - 1) date.setDate(0)
  return date.toISOString().split('T')[0]
}

function isOverdueBill(bill) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(bill.dueDate)
  due.setHours(0, 0, 0, 0)
  return !isBillPaid(bill) && due < today
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(y, m - 1, d))
}

// Bills visible for selected month (excludes soft-deleted and archived)
const billsForMonth = computed(() => {
  return (billsStore.getBills || [])
    .filter(bill => {
      if (bill.archived) return false
      if (bill.deletedAfter && selectedMonth.value >= bill.deletedAfter) return false
      const billOriginalDate = new Date(bill.dueDate)
      const billMonth = `${billOriginalDate.getFullYear()}-${String(billOriginalDate.getMonth() + 1).padStart(2, '0')}`
      return selectedMonth.value >= billMonth
    })
    .map(bill => ({
      ...bill,
      dueDate: getDueDateForMonth(bill),
      amount: getBillAmount(bill),
      paid: isBillPaid(bill),
      paymentCount: billsStore.billMonthStatus?.[bill.id]?.[selectedMonth.value]?.paymentCount ?? 0
    }))
})

// Date window for "this week"
const todayStart = new Date()
todayStart.setHours(0, 0, 0, 0)
const sevenDaysOut = new Date(todayStart)
sevenDaysOut.setDate(todayStart.getDate() + 7)

const dueThisWeekBills = computed(() =>
  billsForMonth.value
    .filter(bill => {
      if (isBillPaid(bill)) return false
      const due = new Date(bill.dueDate)
      due.setHours(0, 0, 0, 0)
      return due >= todayStart && due <= sevenDaysOut
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
)

const dueThisMonthBills = computed(() => {
  const thisWeekIds = new Set(dueThisWeekBills.value.map(b => b.id))
  return billsForMonth.value
    .filter(bill => !isBillPaid(bill) && !thisWeekIds.has(bill.id))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
})

const paidThisMonthBills = computed(() =>
  billsForMonth.value
    .filter(bill => isBillPaid(bill))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
)

// Summary stats
const totalAmountDue = computed(() => billsForMonth.value.reduce((s, b) => s + (b.amount || 0), 0))
const totalPaid = computed(() => paidThisMonthBills.value.reduce((s, b) => s + (b.amount || 0), 0))
const totalRemaining = computed(() =>
  [...dueThisWeekBills.value, ...dueThisMonthBills.value].reduce((s, b) => s + (b.amount || 0), 0)
)

// Actions
function markBillAsPaid(bill) {
  billsStore.markAsPaid(bill.id, bill.amount, selectedMonth.value)
}
function markBillAsUnpaid(bill) {
  billsStore.markAsUnpaid(bill.id, selectedMonth.value)
}
function editBill(bill) {
  editingBill.value = bill
}
function promptArchive(bill) {
  archivingBill.value = bill
  showArchiveModal.value = true
}
function confirmArchive() {
  if (archivingBill.value) {
    billsStore.archiveBill(archivingBill.value.id)
  }
  showArchiveModal.value = false
  archivingBill.value = null
}
function restoreBill(bill) {
  billsStore.restoreArchivedBill(bill.id)
}
function undoAction() {
  if (confirm('Undo the last action? This will restore the previous state.')) {
    billsStore.undo()
  }
}
function closeModal() {
  showAddModal.value = false
  editingBill.value = null
}
function handleBillSaved() {
  billsStore.updateBillStatuses()
}
</script>
