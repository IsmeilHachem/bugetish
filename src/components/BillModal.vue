<!-- Bill Modal Component -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4">{{ isEditing ? 'Edit Bill' : 'Add New Bill' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Bill Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Bill Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter bill name"
          />
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            v-model="form.dueDate"
            type="date"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Amount</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              v-model="form.amount"
              type="number"
              step="0.01"
              min="0"
              @input="handleAmountInput"
              class="block w-full pl-7 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00 (Optional)"
            />
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Category</label>
          <select
            v-model="form.mainCategory"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2"
          >
            <option value="">Select Main Category</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          
          <select
            v-if="form.mainCategory"
            v-model="form.subcategory"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Subcategory</option>
            <option v-for="subcategory in subcategories" :key="subcategory" :value="subcategory">
              {{ subcategory }}
            </option>
          </select>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Add any notes about this bill"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isEditing ? 'Save Changes' : 'Add Bill' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBillsStore } from '@/stores/bills'
import { useBillCategoriesStore } from '@/stores/billCategories'

const props = defineProps({
  bill: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const billsStore = useBillsStore()
const billCategoriesStore = useBillCategoriesStore()
const isEditing = computed(() => !!props.bill)

// Form state
const form = ref({
  name: '',
  dueDate: '',
  amount: null,
  mainCategory: '',
  subcategory: '',
  notes: ''
})

// Update computed properties
const categories = computed(() => {
  billCategoriesStore.initialize()
  return billCategoriesStore.getMainCategories
})

const subcategories = computed(() => {
  if (!form.value.mainCategory) return []
  return billCategoriesStore.getSubcategories(form.value.mainCategory)
})

// Initialize form if editing
onMounted(() => {
  billCategoriesStore.initialize()
  billsStore.initialize()
  
  // Set default values
  form.value = {
    name: '',
    dueDate: new Date().toISOString().split('T')[0],
    amount: null,
    mainCategory: '',
    subcategory: '',
    notes: ''
  }
  
  if (props.bill) {
    // Split category into main and sub if it exists
    let mainCategory = ''
    let subcategory = ''
    if (props.bill.category && props.bill.category.includes(' - ')) {
      [mainCategory, subcategory] = props.bill.category.split(' - ')
    } else {
      mainCategory = props.bill.category || ''
    }

    form.value = {
      name: props.bill.name || '',
      dueDate: props.bill.dueDate || new Date().toISOString().split('T')[0],
      amount: props.bill.amount ?? null,
      mainCategory,
      subcategory,
      notes: props.bill.notes || ''
    }
  }
})

// Handle amount input to properly handle empty values
const handleAmountInput = (event) => {
  const value = event.target.value
  form.value.amount = value === '' ? null : parseFloat(value)
}

// Form validation
const isFormValid = computed(() => {
  return form.value.name && 
         form.value.name.trim() !== '' && 
         form.value.dueDate && 
         form.value.mainCategory && 
         form.value.mainCategory.trim() !== '' && 
         form.value.subcategory && 
         form.value.subcategory.trim() !== ''
})

// Handle form submission
const handleSubmit = () => {
  if (!isFormValid.value) return

  const billData = {
    name: form.value.name.trim().toLowerCase(),
    dueDate: form.value.dueDate,
    amount: form.value.amount ? parseFloat(form.value.amount) : null,
    category: `${form.value.mainCategory.trim()} - ${form.value.subcategory.trim()}`,
    notes: form.value.notes ? form.value.notes.trim() : ''
  }

  let success
  if (isEditing.value && props.bill) {
    success = billsStore.editBill(props.bill.id, billData)
  } else {
    success = billsStore.addBill(billData)
  }

  if (success) {
    emit('saved')
    emit('close')
  }
}
</script> 