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

      <!-- Recovery Tools (always visible) -->
      <div class="mt-8 pt-6 border-t border-gray-200 space-y-3">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recovery Tools</p>

        <!-- Recover categories from transactions -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p class="text-sm font-semibold text-amber-800 mb-1">Rebuild Categories from Transactions</p>
          <p class="text-xs text-amber-700 mb-3">Scans every transaction in Supabase and rebuilds your full category/subcategory list (including custom ones). Use this if subcategories are missing or wrong.</p>
          <button
            @click="recoverCategories"
            :disabled="recoveryStatus.categories === 'running'"
            class="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            <span v-if="recoveryStatus.categories === 'running'">Recovering...</span>
            <span v-else-if="recoveryStatus.categories === 'done'">Done ✓</span>
            <span v-else>Recover Categories</span>
          </button>
          <p v-if="recoveryStatus.categoriesMsg" class="text-xs mt-2 text-amber-700">{{ recoveryStatus.categoriesMsg }}</p>
        </div>

        <!-- Restore bills -->
        <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p class="text-sm font-semibold text-purple-800 mb-1">Restore Hidden Bills</p>
          <p class="text-xs text-purple-700 mb-3">Your bills were soft-deleted (hidden from view) for months after Sep 2025. This restores all of them so they show up again.</p>
          <button
            @click="restoreBills"
            :disabled="recoveryStatus.bills === 'running'"
            class="w-full py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-all disabled:opacity-50"
          >
            <span v-if="recoveryStatus.bills === 'running'">Restoring...</span>
            <span v-else-if="recoveryStatus.bills === 'done'">Done ✓</span>
            <span v-else>Restore Bills</span>
          </button>
          <p v-if="recoveryStatus.billsMsg" class="text-xs mt-2 text-purple-700">{{ recoveryStatus.billsMsg }}</p>
        </div>

        <!-- Monthly reconciliation -->
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <p class="text-sm font-semibold text-green-800 mb-1">Monthly Reconciliation</p>
          <p class="text-xs text-green-700 mb-3">Shows every month's income, spending, and net from your saved data. Compare against your bank statement to find any missing transactions.</p>
          <button
            @click="loadReconciliation"
            :disabled="reconciliation.status === 'loading'"
            class="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50"
          >
            <span v-if="reconciliation.status === 'loading'">Loading...</span>
            <span v-else>Show Monthly Totals</span>
          </button>
          <p v-if="reconciliation.error" class="text-xs mt-2 text-red-600">{{ reconciliation.error }}</p>
          <div v-if="reconciliation.rows.length > 0" class="mt-3 space-y-1">
            <div class="grid grid-cols-4 gap-1 text-xs font-semibold text-green-800 border-b border-green-200 pb-1 mb-1">
              <span>Month</span><span class="text-right">Income</span><span class="text-right">Spending</span><span class="text-right">Net</span>
            </div>
            <div
              v-for="row in reconciliation.rows"
              :key="row.month"
              class="grid grid-cols-4 gap-1 text-xs text-gray-700 py-1 border-b border-green-100"
            >
              <span class="font-medium">{{ row.month }}</span>
              <span class="text-right text-green-700">+{{ row.income }}</span>
              <span class="text-right text-red-600">-{{ row.spending }}</span>
              <span class="text-right font-semibold" :class="row.netRaw >= 0 ? 'text-green-700' : 'text-red-600'">{{ row.net }}</span>
            </div>
            <div class="grid grid-cols-4 gap-1 text-xs font-bold text-gray-900 pt-2 border-t border-green-300 mt-1">
              <span>TOTAL</span>
              <span class="text-right text-green-700">+{{ reconciliation.totals.income }}</span>
              <span class="text-right text-red-600">-{{ reconciliation.totals.spending }}</span>
              <span class="text-right" :class="reconciliation.totals.netRaw >= 0 ? 'text-green-700' : 'text-red-600'">{{ reconciliation.totals.net }}</span>
            </div>
          </div>
        </div>
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
import { DEFAULT_CATEGORIES } from '@/stores/categories'

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
const recoveryStatus = ref({ categories: 'idle', categoriesMsg: '', bills: 'idle', billsMsg: '' })
const reconciliation = ref({ status: 'idle', rows: [], totals: {}, error: '' })

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
      counts.value.bills = Array.isArray(data.bills) ? data.bills.length : (Array.isArray(data) ? data.length : 0)
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

async function recoverCategories() {
  recoveryStatus.value.categories = 'running'
  recoveryStatus.value.categoriesMsg = ''
  try {
    // Fetch ALL transaction categories from Supabase (paginate just in case)
    const PAGE_SIZE = 1000
    let allTx = []
    let offset = 0
    while (true) {
      const { data: page, error } = await supabase
        .from('transactions')
        .select('category')
        .range(offset, offset + PAGE_SIZE - 1)
      if (error) throw error
      if (!page || page.length === 0) break
      allTx = allTx.concat(page)
      if (page.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    // Build category structure from transaction data
    const recovered = {}
    for (const tx of allTx) {
      if (!tx.category) continue
      const sep = ' - '
      const idx = tx.category.indexOf(sep)
      if (idx === -1) continue
      const main = tx.category.slice(0, idx).trim()
      const sub = tx.category.slice(idx + sep.length).trim()
      if (!main || !sub) continue
      if (!recovered[main]) recovered[main] = new Set()
      recovered[main].add(sub)
    }

    // Build ONLY from what appears in transactions.
    // For each found main category, also include its default subcategories so the user
    // doesn't lose defaults they haven't used yet. Main categories with zero transactions
    // (like "Income" if never used) are intentionally excluded.
    const merged = {}
    for (const [main, subs] of Object.entries(recovered)) {
      const defaultSubs = DEFAULT_CATEGORIES[main] || []
      const allSubs = [...new Set([...defaultSubs, ...[...subs]])]
      merged[main] = allSubs
    }

    // Save merged categories to Supabase
    const { error: saveErr } = await supabase.from('user_data').upsert({
      user_id: authStore.userId,
      data_type: 'categories',
      data: { categories: merged, amounts: categoriesStore.amounts || {} },
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,data_type' })
    if (saveErr) throw saveErr

    // Reload categories store
    await categoriesStore.loadFromSupabase()

    const totalSubs = Object.values(merged).reduce((n, arr) => n + arr.length, 0)
    recoveryStatus.value.categoriesMsg = `Recovered ${Object.keys(merged).length} main categories with ${totalSubs} subcategories total.`
    recoveryStatus.value.categories = 'done'
  } catch (e) {
    recoveryStatus.value.categoriesMsg = 'Error: ' + (e.message || 'unknown')
    recoveryStatus.value.categories = 'idle'
  }
}

function fmt(n) {
  return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function loadReconciliation() {
  reconciliation.value = { status: 'loading', rows: [], totals: {}, error: '' }
  try {
    const PAGE_SIZE = 1000
    let all = []
    let offset = 0
    while (true) {
      const { data: page, error } = await supabase
        .from('transactions')
        .select('date, amount, is_income, description')
        .order('date', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1)
      if (error) throw error
      if (!page || page.length === 0) break
      all = all.concat(page)
      if (page.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    const byMonth = {}
    for (const tx of all) {
      const key = tx.date.slice(0, 7) // YYYY-MM
      if (!byMonth[key]) byMonth[key] = { income: 0, spending: 0 }
      const amt = Number(tx.amount)
      if (amt >= 0) byMonth[key].income += amt
      else byMonth[key].spending += Math.abs(amt)
    }

    let totalIncome = 0, totalSpending = 0
    const rows = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, { income, spending }]) => {
        totalIncome += income
        totalSpending += spending
        const netRaw = income - spending
        return { month, income: fmt(income), spending: fmt(spending), net: (netRaw >= 0 ? '+' : '-') + fmt(netRaw), netRaw }
      })

    const netRaw = totalIncome - totalSpending
    reconciliation.value = {
      status: 'done',
      rows,
      totals: {
        income: fmt(totalIncome),
        spending: fmt(totalSpending),
        net: (netRaw >= 0 ? '+' : '-') + fmt(netRaw),
        netRaw
      },
      error: ''
    }
  } catch (e) {
    reconciliation.value = { status: 'idle', rows: [], totals: {}, error: 'Error: ' + (e.message || 'unknown') }
  }
}

async function restoreBills() {
  recoveryStatus.value.bills = 'running'
  recoveryStatus.value.billsMsg = ''
  try {
    // Load bills from Supabase
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('data_type', 'bills')
      .single()
    if (error) throw error
    if (!data) throw new Error('No bills data found in Supabase. Run the migration first.')

    const bills = (data.data.bills || []).map(bill => {
      const b = { ...bill }
      delete b.deletedAfter
      return b
    })

    const { error: saveErr } = await supabase.from('user_data').upsert({
      user_id: authStore.userId,
      data_type: 'bills',
      data: { bills, billMonthStatus: data.data.billMonthStatus || {} },
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,data_type' })
    if (saveErr) throw saveErr

    // Reload bills store
    billsStore.initialized = false
    await billsStore.loadFromSupabase()

    recoveryStatus.value.billsMsg = `Restored ${bills.length} bill(s). Go to the Bills page to see them.`
    recoveryStatus.value.bills = 'done'
  } catch (e) {
    recoveryStatus.value.billsMsg = 'Error: ' + (e.message || 'unknown')
    recoveryStatus.value.bills = 'idle'
  }
}
</script>
