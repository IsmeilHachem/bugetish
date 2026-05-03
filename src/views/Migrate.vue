<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg border border-gray-100">

      <h2 class="text-2xl font-bold text-gray-900 mb-2">Migrate Your Data</h2>
      <p class="text-gray-500 mb-6 text-sm">
        Moves all your local data (transactions, categories, bills, reflections) from this browser into Supabase. You only need to do this once per device.
      </p>

      <div v-if="status === 'idle'" class="space-y-4">
        <div class="space-y-2">
          <div class="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            <span>💳 Transactions</span>
            <strong>{{ counts.transactions }} found</strong>
          </div>
          <div class="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            <span>🏷️ Categories</span>
            <strong>{{ counts.categories }} main categories</strong>
          </div>
          <div class="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            <span>📋 Bills</span>
            <strong>{{ counts.bills }} found</strong>
          </div>
          <div class="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            <span>💭 Reflections</span>
            <strong>{{ counts.reflections }} found</strong>
          </div>
        </div>
        <button
          @click="runMigration"
          :disabled="totalCount === 0"
          class="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-40"
        >
          Migrate All Data to Supabase
        </button>
      </div>

      <div v-if="status === 'running'" class="text-center py-4">
        <div class="text-gray-600 text-sm mb-2">{{ currentStep }}</div>
        <div class="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>

      <div v-if="status === 'done'" class="text-center">
        <div class="text-5xl mb-4">✅</div>
        <div class="text-xl font-bold text-gray-900 mb-2">Migration Complete</div>
        <div class="text-gray-500 text-sm mb-6 space-y-1">
          <div>{{ results.transactions }} transactions migrated</div>
          <div>Categories, bills & reflections synced</div>
        </div>
        <router-link
          to="/"
          class="block w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium text-center hover:from-green-600 hover:to-green-700 transition-all"
        >
          Go to Dashboard
        </router-link>
      </div>

      <div v-if="status === 'error'" class="text-center">
        <div class="text-5xl mb-4">⚠️</div>
        <div class="text-xl font-bold text-gray-900 mb-1">Something went wrong</div>
        <div class="text-red-600 text-sm mb-4 bg-red-50 px-4 py-3 rounded-xl">{{ errorMessage }}</div>
        <button
          @click="status = 'idle'"
          class="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
        >
          Try Again
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useCategoriesStore } from '@/stores/categories'
import { useBillsStore } from '@/stores/bills'
import { useReflectionsStore } from '@/stores/reflections'
import { useBillCategoriesStore } from '@/stores/billCategories'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'
import { parseTransactionsFromStorage } from '@/utils/transactionStorage'

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const billsStore = useBillsStore()
const reflectionsStore = useReflectionsStore()
const billCategoriesStore = useBillCategoriesStore()
const authStore = useAuthStore()

const status = ref('idle')
const currentStep = ref('')
const errorMessage = ref('')
const counts = ref({ transactions: 0, categories: 0, bills: 0, reflections: 0 })
const results = ref({ transactions: 0 })

const totalCount = computed(() =>
  counts.value.transactions + counts.value.categories + counts.value.bills + counts.value.reflections
)

onMounted(() => {
  try {
    const stored = localStorage.getItem('budgetish-transactions')
    if (stored) {
      const data = parseTransactionsFromStorage(stored)
      counts.value.transactions = data?.transactions?.length ?? 0
    }
  } catch { counts.value.transactions = 0 }

  try {
    const stored = localStorage.getItem('budgetish-categories')
    if (stored) {
      const data = JSON.parse(stored)
      counts.value.categories = Object.keys(data.categories || {}).length
    }
  } catch { counts.value.categories = 0 }

  try {
    const stored = localStorage.getItem('budgetish-bills')
    if (stored) {
      const data = JSON.parse(stored)
      counts.value.bills = (data.bills || []).length
    }
  } catch { counts.value.bills = 0 }

  try {
    const stored = localStorage.getItem('budgetish-reflections')
    if (stored) {
      counts.value.reflections = JSON.parse(stored).length
    }
  } catch { counts.value.reflections = 0 }
})

async function runMigration() {
  status.value = 'running'
  try {
    // 1. Migrate transactions (skips already-migrated ones)
    currentStep.value = 'Migrating transactions...'
    const txResult = await transactionsStore.migrateFromLocalStorage()
    // "All transactions already in Supabase" is fine — not an error
    if (txResult.error && txResult.migrated === 0 && txResult.error !== 'All transactions already in Supabase') {
      console.warn('Transactions migration note:', txResult.error)
    }
    results.value.transactions = txResult.migrated

    // 2. Migrate categories
    currentStep.value = 'Migrating categories...'
    const catStored = localStorage.getItem('budgetish-categories')
    if (catStored) {
      const catData = JSON.parse(catStored)
      await supabase.from('user_data').upsert({
        user_id: authStore.userId,
        data_type: 'categories',
        data: { categories: catData.categories, amounts: catData.amounts || {} },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,data_type' })
    }

    // 3. Migrate bill categories
    currentStep.value = 'Migrating bill categories...'
    const billCatStored = localStorage.getItem('budgetish-categories-bills')
    if (billCatStored) {
      const billCatData = JSON.parse(billCatStored)
      await supabase.from('user_data').upsert({
        user_id: authStore.userId,
        data_type: 'bill_categories',
        data: { categories: billCatData.categories, amounts: billCatData.amounts || {} },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,data_type' })
    }

    // 4. Migrate bills
    currentStep.value = 'Migrating bills...'
    const billsStored = localStorage.getItem('budgetish-bills')
    if (billsStored) {
      const billsData = JSON.parse(billsStored)
      await supabase.from('user_data').upsert({
        user_id: authStore.userId,
        data_type: 'bills',
        data: { bills: billsData.bills || [], billMonthStatus: billsData.billMonthStatus || {} },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,data_type' })
    }

    // 5. Migrate reflections
    currentStep.value = 'Migrating reflections...'
    const reflStored = localStorage.getItem('budgetish-reflections')
    if (reflStored) {
      const reflData = JSON.parse(reflStored)
      await supabase.from('user_data').upsert({
        user_id: authStore.userId,
        data_type: 'reflections',
        data: { reflections: Array.isArray(reflData) ? reflData : [] },
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,data_type' })
    }

    // 6. Reload all stores from Supabase
    currentStep.value = 'Reloading data...'
    await Promise.all([
      transactionsStore.loadFromSupabase(),
      categoriesStore.loadFromSupabase(),
      billsStore.loadFromSupabase(),
      reflectionsStore.loadFromSupabase(),
      billCategoriesStore.loadFromSupabase()
    ])

    status.value = 'done'
  } catch (e) {
    status.value = 'error'
    errorMessage.value = e.message || 'Unknown error'
  }
}
</script>
