<!-- Bill List Item Component -->
<template>
  <div class="flex items-center justify-between">
    <!-- Bill Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center">
        <h3 class="text-lg font-medium text-gray-900 truncate">{{ bill.name }}</h3>
        <span
          :class="['ml-2 px-2 py-1 text-xs font-medium rounded-full', paid ? statusClasses['PAID'] : statusClasses['UNPAID']]"
        >
          {{ paid ? 'PAID' : 'UNPAID' }}
        </span>
      </div>
      <div class="mt-1 flex items-center text-sm text-gray-500">
        <span>Due: {{ formatDate(dueDate) }}</span>
        <span class="mx-2">•</span>
        <span>{{ formatCurrency(amount || 0) }}</span>
        <span class="mx-2">•</span>
        <span class="text-gray-600">{{ bill.category }}</span>
        <span v-if="paymentCount > 0" class="mx-2">•</span>
        <span v-if="paymentCount > 0" class="text-green-600">
          Paid {{ paymentCount }} time{{ paymentCount > 1 ? 's' : '' }}
        </span>
      </div>
      <p v-if="bill.notes" class="mt-1 text-sm text-gray-500 truncate">
        {{ bill.notes }}
      </p>
    </div>

    <!-- Actions -->
    <div class="ml-4 flex items-center space-x-2">
      <!-- Mark as Paid/Unpaid Button -->
      <button
        v-if="!paid"
        @click="$emit('mark-paid', bill)"
        class="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
      >
        Mark Paid
      </button>
      <button
        v-else
        @click="$emit('mark-unpaid', bill)"
        class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        Mark Unpaid
      </button>

      <!-- Edit Button -->
      <button
        @click="$emit('edit', bill)"
        class="p-1 text-gray-400 hover:text-gray-500"
        title="Edit"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>

      <!-- Delete Button -->
      <button
        @click="$emit('delete', bill)"
        class="p-1 text-gray-400 hover:text-red-500"
        title="Delete"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bill: {
    type: Object,
    required: true
  },
  paid: {
    type: Boolean,
    required: true
  },
  dueDate: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentCount: {
    type: Number,
    required: true
  }
})

defineEmits(['edit', 'delete', 'mark-paid', 'mark-unpaid'])

// Status styling
const statusClasses = {
  'PAID': 'bg-green-100 text-green-800',
  'UNPAID': 'bg-red-100 text-red-800',
  'UPCOMING': 'bg-blue-100 text-blue-800'
}

// Utility functions
const formatDate = (date) => {
  // Display the date as entered (YYYY-MM-DD) without time zone conversion
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = date.split('-')
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  // Fallback for other formats
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
</script> 