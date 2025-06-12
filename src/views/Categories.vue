<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
      <div class="flex items-center space-x-4">
        <!-- Month Picker -->
        <label class="text-sm font-medium text-gray-700">Month:
          <input type="month" v-model="selectedMonth" class="ml-2 border rounded px-2 py-1" />
        </label>
        <!-- Undo/Redo Buttons -->
        <div class="flex space-x-2">
          <button 
            @click="undo" 
            :disabled="!categoriesStore.canUndo"
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo last action"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button 
            @click="redo" 
            :disabled="!categoriesStore.canRedo"
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo last action"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
        <CategoryActions />
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="mainCategory in categoriesStore.getMainCategories" 
        :key="mainCategory"
        class="bg-white rounded-lg shadow-sm p-4"
      >
        <!-- Main Category Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">{{ mainCategory }}</h2>
          <div class="flex space-x-2">
            <button 
              @click="editMainCategory(mainCategory)"
              class="text-gray-400 hover:text-gray-500"
              title="Edit category"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              @click="deleteMainCategory(mainCategory)"
              class="text-gray-400 hover:text-red-500"
              title="Delete category"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Subheaders -->
        <div class="grid grid-cols-2 font-semibold mb-2 text-gray-600">
          <div class="text-left">Subcategory</div>
          <div class="text-right">Amount</div>
        </div>
        
        <!-- Subcategories -->
        <div class="space-y-2">
          <div 
            v-for="subcategory in categoriesStore.getSubcategories(mainCategory)" 
            :key="subcategory"
            class="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
          >
            <div class="flex items-center space-x-2">
              <span class="text-gray-700">{{ subcategory }}</span>
              <button 
                @click="editSubcategory(mainCategory, subcategory)"
                class="text-gray-400 hover:text-gray-500"
                title="Edit subcategory"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-900">{{ formatCurrency(Math.abs(getCategoryAmount(mainCategory, subcategory))) }}</span>
              <button 
                @click="deleteSubcategory(mainCategory, subcategory)"
                class="text-gray-400 hover:text-red-500"
                title="Delete subcategory"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Add Subcategory Button -->
          <button 
            @click="addSubcategory(mainCategory)"
            class="w-full mt-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
          >
            + Add Subcategory
          </button>
        </div>
        
        <!-- Total Row -->
        <div class="border-t border-gray-200 pt-4 mt-4">
          <div class="flex justify-between items-center">
            <span class="font-medium">Total</span>
            <span class="font-medium text-blue-600">{{ formatCurrency(Math.abs(getCategoryTotal(mainCategory))) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditingSubcategory ? 'Edit Subcategory Name' : 'Edit Category Name' }}
        </h3>
        <input 
          v-model="editName" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          :placeholder="isEditingSubcategory ? 'New subcategory name' : 'New category name'"
        >
        <div class="mt-4 flex justify-end space-x-3">
          <button 
            @click="cancelEdit"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="confirmEdit"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Add Subcategory Modal -->
    <div v-if="showAddSubcategoryModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Add New Subcategory to {{ categoryToAddSubcategory }}
        </h3>
        <input 
          v-model="newSubcategoryName" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter subcategory name"
        >
        <div class="mt-4 flex justify-end space-x-3">
          <button 
            @click="cancelAddSubcategory"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="confirmAddSubcategory"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add
          </button>
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