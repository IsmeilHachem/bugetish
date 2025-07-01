<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 flex-wrap">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Category Management
            </h1>
            <p class="text-gray-600 mt-2 text-lg">Organize and manage your spending categories</p>
          </div>
          <div class="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center w-full md:w-auto">
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
              <input 
                type="month" 
                v-model="selectedMonth" 
                class="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 hover:shadow-md"
              />
            </div>
            <div class="flex gap-2">
              <button 
                @click="undo" 
                :disabled="!categoriesStore.canUndo"
                class="px-4 py-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Undo last action"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button 
                @click="redo" 
                :disabled="!categoriesStore.canRedo"
                class="px-4 py-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Redo last action"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <CategoryActions />
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-8">
        <div 
          v-for="mainCategory in categoriesStore.getMainCategories" 
          :key="mainCategory"
          class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:scale-105 mb-8 break-inside-avoid"
        >
          <!-- Main Category Header -->
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-900">{{ mainCategory }}</h2>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="editMainCategory(mainCategory)"
                class="p-2 text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                title="Edit category"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                @click="deleteMainCategory(mainCategory)"
                class="p-2 text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                title="Delete category"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Subheaders -->
          <div class="grid grid-cols-2 font-semibold mb-4 text-gray-600 text-sm">
            <div class="text-left">Subcategory</div>
            <div class="text-right">Amount</div>
          </div>
          
          <!-- Subcategories -->
          <div>
            <div class="space-y-4">
              <div 
                v-for="subcategory in categoriesStore.getSubcategories(mainCategory)" 
                :key="subcategory"
                class="flex justify-between items-center p-3 bg-gray-50 rounded-xl transition-colors duration-200"
              >
                <div class="flex items-center space-x-2">
                  <span class="text-gray-700 font-medium">{{ subcategory }}</span>
                  <button 
                    @click="editSubcategory(mainCategory, subcategory)"
                    class="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Edit subcategory"
                  >
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div class="flex items-center space-x-3">
                  <span class="text-gray-900 font-semibold">{{ formatCurrency(Math.abs(getCategoryAmount(mainCategory, subcategory))) }}</span>
                  <button 
                    @click="deleteSubcategory(mainCategory, subcategory)"
                    class="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Delete subcategory"
                  >
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <button 
              @click="addSubcategory(mainCategory)"
              class="w-full mt-4 px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 font-medium"
            >
              <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Subcategory
            </button>
          </div>
          
          <!-- Total Row -->
          <div :class="[categoriesStore.getSubcategories(mainCategory).length > 1 ? 'pt-6 mt-6' : 'pt-2 mt-2', 'border-t border-gray-200']">
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-900">Total</span>
              <span class="font-bold text-blue-600 text-lg">{{ formatCurrency(Math.abs(getCategoryTotal(mainCategory))) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Category Modal -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">
              {{ isEditingSubcategory ? 'Edit Subcategory' : 'Edit Category' }}
            </h3>
          </div>
          <input 
            v-model="editName" 
            type="text" 
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            :placeholder="isEditingSubcategory ? 'New subcategory name' : 'New category name'"
          >
          <div class="mt-6 flex justify-end space-x-4">
            <button 
              @click="cancelEdit"
              class="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              @click="confirmEdit"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Add Subcategory Modal -->
      <div v-if="showAddSubcategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">
              Add Subcategory to {{ categoryToAddSubcategory }}
            </h3>
          </div>
          <input 
            v-model="newSubcategoryName" 
            type="text" 
            class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter subcategory name"
          >
          <div class="mt-6 flex justify-end space-x-4">
            <button 
              @click="cancelAddSubcategory"
              class="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              @click="confirmAddSubcategory"
              class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Add Subcategory
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import CategoryActions from '../components/CategoryActions.vue'
import { useTransactionsStore } from '../stores/transactions'

const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()

// Month picker state
const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

// Helper: Parse date in EST timezone
function parseESTDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  // Create date in EST (UTC-5)
  return new Date(Date.UTC(year, month - 1, day, 5, 0, 0))
}

// Helper: Filter transactions for the selected month
function getMonthTransactions(transactions, monthStr) {
  if (!Array.isArray(transactions) || !monthStr) return []
  const [year, month] = monthStr.split('-').map(Number)
  if (!year || !month) return []
  return transactions.filter(t => {
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}

// Helper: Get amount for a category/subcategory for the selected month
const getCategoryAmount = (mainCategory, subcategory) => {
  const monthTx = getMonthTransactions(transactionsStore.getTransactions || [], selectedMonth.value)
  return monthTx
    .filter(t => {
      if (!t.category) return false
      const parts = t.category.split(' - ')
      return parts[0] === mainCategory && parts[1] === subcategory
    })
    .reduce((sum, t) => sum + t.amount, 0)
}

// Helper: Get total for a main category for the selected month
const getCategoryTotal = (mainCategory) => {
  const monthTx = getMonthTransactions(transactionsStore.getTransactions || [], selectedMonth.value)
  return monthTx
    .filter(t => t.category && t.category.split(' - ')[0] === mainCategory)
    .reduce((sum, t) => sum + t.amount, 0)
}

// Helper: Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Initialize store on component mount
onMounted(() => {
  if (!categoriesStore.initialized) {
    categoriesStore.initialize()
  }
})

// Edit category modal state
const showEditModal = ref(false)
const editName = ref('')
const categoryToEdit = ref('')
const subcategoryToEdit = ref('')
const isEditingSubcategory = ref(false)

// Add subcategory modal state
const showAddSubcategoryModal = ref(false)
const categoryToAddSubcategory = ref('')
const newSubcategoryName = ref('')

// Category management methods
const editMainCategory = (category) => {
  categoryToEdit.value = category
  editName.value = category
  isEditingSubcategory.value = false
  showEditModal.value = true
}

const editSubcategory = (mainCategory, subcategory) => {
  categoryToEdit.value = mainCategory
  subcategoryToEdit.value = subcategory
  editName.value = subcategory
  isEditingSubcategory.value = true
  showEditModal.value = true
}

const cancelEdit = () => {
  showEditModal.value = false
  editName.value = ''
  categoryToEdit.value = ''
  subcategoryToEdit.value = ''
  isEditingSubcategory.value = false
}

const confirmEdit = () => {
  if (editName.value) {
    if (isEditingSubcategory.value) {
      if (editName.value !== subcategoryToEdit.value) {
        categoriesStore.editSubcategory(categoryToEdit.value, subcategoryToEdit.value, editName.value)
      }
    } else {
      if (editName.value !== categoryToEdit.value) {
        categoriesStore.editMainCategory(categoryToEdit.value, editName.value)
      }
    }
  }
  cancelEdit()
}

const deleteMainCategory = async (category) => {
  if (await confirm(`Are you sure you want to delete the category "${category}" and all its subcategories?`)) {
    categoriesStore.deleteMainCategory(category)
  }
}

const deleteSubcategory = async (mainCategory, subcategory) => {
  if (await confirm(`Are you sure you want to delete the subcategory "${subcategory}"?`)) {
    categoriesStore.deleteSubcategory(mainCategory, subcategory)
  }
}

// Add subcategory methods
const addSubcategory = (mainCategory) => {
  categoryToAddSubcategory.value = mainCategory
  newSubcategoryName.value = ''
  showAddSubcategoryModal.value = true
}

const cancelAddSubcategory = () => {
  showAddSubcategoryModal.value = false
  categoryToAddSubcategory.value = ''
  newSubcategoryName.value = ''
}

const confirmAddSubcategory = () => {
  if (newSubcategoryName.value) {
    categoriesStore.addSubcategory(categoryToAddSubcategory.value, newSubcategoryName.value)
  }
  cancelAddSubcategory()
}

// Undo/Redo methods
const undo = () => {
  categoriesStore.undo()
}

const redo = () => {
  categoriesStore.redo()
}
</script> 