<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">

      <h2 class="text-2xl font-bold text-gray-900 mb-2">Migrate Your Data</h2>
      <p class="text-gray-500 mb-6 text-sm">
        This moves your existing transactions from your browser's local storage into Supabase so they're backed up and available on any device. You only need to do this once.
      </p>

      <div v-if="status === 'idle'">
        <div class="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 mb-6">
          Found <strong>{{ localCount }}</strong> transactions in local storage ready to migrate.
        </div>
        <button
          @click="runMigration"
          :disabled="localCount === 0"
          class="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-40"
        >
          Migrate {{ localCount }} Transactions to Supabase
        </button>
      </div>

      <div v-if="status === 'running'" class="text-center py-4">
        <div class="text-gray-600 text-sm">Migrating... please wait</div>
        <div class="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>

      <div v-if="status === 'done'" class="text-center">
        <div class="text-5xl mb-4">✅</div>
        <div class="text-xl font-bold text-gray-900 mb-1">Migration Complete</div>
        <div class="text-gray-500 text-sm mb-6">{{ migratedCount }} transactions saved to Supabase.</div>
        <router-link
          to="/transactions"
          class="block w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium text-center hover:from-green-600 hover:to-green-700 transition-all"
        >
          Go to Transactions
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
import { ref, onMounted } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { parseTransactionsFromStorage } from '@/utils/transactionStorage'

const transactionsStore = useTransactionsStore()

const status = ref('idle')
const localCount = ref(0)
const migratedCount = ref(0)
const errorMessage = ref('')

onMounted(() => {
  try {
    const stored = localStorage.getItem('budgetish-transactions')
    if (stored) {
      const data = parseTransactionsFromStorage(stored)
      localCount.value = data?.transactions?.length ?? 0
    }
  } catch {
    localCount.value = 0
  }
})

async function runMigration() {
  status.value = 'running'
  try {
    const result = await transactionsStore.migrateFromLocalStorage()
    if (result.error && result.migrated === 0) {
      status.value = 'error'
      errorMessage.value = result.error
    } else {
      // Force a fresh load from Supabase so the store reflects the migrated data
      await transactionsStore.loadFromSupabase()
      migratedCount.value = result.migrated
      status.value = 'done'
    }
  } catch (e) {
    status.value = 'error'
    errorMessage.value = e.message || 'Unknown error'
  }
}
</script>
