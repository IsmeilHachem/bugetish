import { defineStore } from 'pinia'
import { useCategoriesStore } from './categories'
import { useBillsStore } from './bills'
import { parseESTDate, generateTimestamp } from '@/utils/dateUtils'
import {
  parseTransactionsFromStorage,
  serializeTransactionsForStorage
} from '@/utils/transactionStorage'

export const useTransactionsStore = defineStore('transactions', {
     state: () => ({
     transactions: [],
     initialized: false
   }),

  getters: {
    getTransactions: (state) => state.transactions,
    getTransactionById: (state) => (id) => state.transactions.find(t => t.id === id),
    getTransactionsByDate: (state) => (startDate, endDate) => {
      const start = parseESTDate(startDate)
      const end = parseESTDate(endDate)
      return state.transactions.filter(t => {
        const date = parseESTDate(t.date)
        return date >= start && date <= end
      })
    },
    getTransactionsByCategory: (state) => (category) => {
      return state.transactions.filter(t => t.category === category)
    },
    getCurrentBalance: (state) => {
      return state.transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    },
    getFilteredIncome: (state) => (filterFn) => {
      return state.transactions.filter(t => {
        return t.amount > 0 && t.description?.toLowerCase() !== 'starting balance' && (!filterFn || filterFn(t))
      })
    },
    getFilteredExpense: (state) => (filterFn) => {
      return state.transactions.filter(t => {
        return t.amount < 0 && t.description?.toLowerCase() !== 'starting balance' && (!filterFn || filterFn(t))
      })
    }
  },

  actions: {
    // Initialize transactions from localStorage
    async initialize() {
      if (this.initialized) return
      
      try {
        // Load from localStorage if available
        const stored = localStorage.getItem('budgetish-transactions')
        if (stored) {
          let data = null
          try {
            data = parseTransactionsFromStorage(stored)
          } catch (e) {
            // Don't clobber potentially recoverable user data.
            // Preserve the corrupt payload for debugging/recovery, then start fresh in-memory.
            try {
              localStorage.setItem(`budgetish-transactions-corrupt-${Date.now()}`, stored)
            } catch {
              // ignore secondary failure (quota/blocked storage)
            }
            console.error('Corrupt transactions in localStorage; preserved backup key.', e)
            data = null
          }

          if (data) {
            this.transactions = data.transactions || []
            // Once we successfully load anything, consider the store initialized.
            this.initialized = true
          } else {
            this.transactions = []
            this.initialized = true
          }
        } else {
          // Start with empty transactions
          this.transactions = []
          this.initialized = true
        }
        // Persist only if storage is available.
        this.saveToLocalStorage()
      } catch (error) {
        console.error('Error loading transactions:', error)
        // Storage may be blocked/unavailable. Keep in-memory state, but do not overwrite storage.
        this.transactions = this.transactions || []
        this.initialized = true
      }
    },

    // Save to localStorage
    saveToLocalStorage() {
      try {
        const payload = serializeTransactionsForStorage({
          transactions: this.transactions,
          initialized: this.initialized
        })
        localStorage.setItem('budgetish-transactions', payload)
        return true
      } catch (error) {
        console.error('Error saving transactions to localStorage:', error)
        return false
      }
    },

    // Add helper method to calculate category total
    calculateCategoryTotal(mainCategory, subcategory) {
      return this.transactions
        .filter(t => t.category === `${mainCategory} - ${subcategory}`)
        .reduce((total, t) => total + t.amount, 0)
    },

    // Add a new transaction
    addTransaction(transaction) {
      const categoriesStore = useCategoriesStore()
      const billsStore = useBillsStore()

      // Validate category
      if (!categoriesStore.validateCategory(transaction.category)) {
        return false
      }

      // Add transaction
      const newTransaction = {
        id: generateTimestamp(),
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        amount: transaction.isIncome ? Math.abs(transaction.amount) : -Math.abs(transaction.amount),
        isIncome: transaction.isIncome
      }

      this.transactions.push(newTransaction)

      const sep = ' - '
      const splitIdx = transaction.category.indexOf(sep)
      const mainCategory =
        splitIdx === -1 ? '' : transaction.category.slice(0, splitIdx).trim()
      const subcategory =
        splitIdx === -1 ? '' : transaction.category.slice(splitIdx + sep.length).trim()

      // Update category amount by recalculating total
      const categoryTotal = this.calculateCategoryTotal(mainCategory, subcategory)
      categoriesStore.updateCategoryAmount(mainCategory, subcategory, categoryTotal)

      // Check if this transaction matches any unpaid bills
      if (!transaction.isIncome) {
        billsStore.checkAndMarkPayment(
          transaction.description,
          Math.abs(transaction.amount),
          transaction.category,
          transaction.date
        )
      }

      const rollbackFailedPersist = () => {
        const idx = this.transactions.findIndex((t) => t.id === newTransaction.id)
        if (idx !== -1) this.transactions.splice(idx, 1)
        if (mainCategory && subcategory) {
          const total = this.calculateCategoryTotal(mainCategory, subcategory)
          categoriesStore.updateCategoryAmount(mainCategory, subcategory, total)
        }
      }

      const saved = this.saveToLocalStorage()
      if (!saved) {
        rollbackFailedPersist()
        return false
      }

      // Verify the transaction actually persisted (guards against silent storage failures)
      try {
        const stored = localStorage.getItem('budgetish-transactions')
        if (stored) {
          const data = parseTransactionsFromStorage(stored)
          const exists = (data?.transactions || []).some((t) => t.id === newTransaction.id)
          if (!exists) {
            rollbackFailedPersist()
            return false
          }
        } else {
          rollbackFailedPersist()
          return false
        }
      } catch (e) {
        rollbackFailedPersist()
        return false
      }

      return true
    },

    // Delete a transaction
    deleteTransaction(id) {
      const index = this.transactions.findIndex(t => t.id === id)
      if (index === -1) return false

      const transaction = this.transactions[index]
      const categoriesStore = useCategoriesStore()
      
      // Remove transaction first
      this.transactions.splice(index, 1)
      
      // Recalculate category total after removal
      const [mainCategory, subcategory] = transaction.category.split(' - ')
      const categoryTotal = this.calculateCategoryTotal(mainCategory, subcategory)
      categoriesStore.updateCategoryAmount(mainCategory, subcategory, categoryTotal)
      
      return this.saveToLocalStorage()
    },

    // Update a transaction
    updateTransaction(transaction) {
      const index = this.transactions.findIndex(t => t.id === transaction.id)
      if (index === -1) return false

      const oldTransaction = this.transactions[index]
      const categoriesStore = useCategoriesStore()
      
      // Update category amount - remove old amount and add new amount
      const [oldMainCategory, oldSubcategory] = oldTransaction.category.split(' - ')
      categoriesStore.updateCategoryAmount(oldMainCategory, oldSubcategory, -Math.abs(oldTransaction.amount))
      
      const [newMainCategory, newSubcategory] = transaction.category.split(' - ')
      categoriesStore.updateCategoryAmount(newMainCategory, newSubcategory, Math.abs(transaction.amount))

      // Update transaction
      this.transactions[index] = transaction
      
      return this.saveToLocalStorage()
    },

    // Edit an existing transaction
    editTransaction(id, updates) {
      const transaction = this.transactions.find(t => t.id === id)
      if (!transaction) return false

      const categoriesStore = useCategoriesStore()
      const billsStore = useBillsStore()
      
      // Validate new category if it's being updated
      if (updates.category && !categoriesStore.validateCategory(updates.category)) {
        return false
      }

      // Store old category for comparison
      const oldCategory = transaction.category
      const oldIsIncome = transaction.isIncome
      const oldDescription = transaction.description

      // Update transaction
      Object.assign(transaction, {
        ...updates,
        amount: updates.isIncome ? Math.abs(updates.amount) : -Math.abs(updates.amount)
      })

      // Update category amounts
      if (oldCategory !== transaction.category) {
        // Category changed, need to update both old and new category totals
        const [oldMainCategory, oldSubcategory] = oldCategory.split(' - ')
        const [newMainCategory, newSubcategory] = transaction.category.split(' - ')
        
        // Update old category total
        const oldCategoryTotal = this.calculateCategoryTotal(oldMainCategory, oldSubcategory)
        categoriesStore.updateCategoryAmount(oldMainCategory, oldSubcategory, oldCategoryTotal)
        
        // Update new category total
        const newCategoryTotal = this.calculateCategoryTotal(newMainCategory, newSubcategory)
        categoriesStore.updateCategoryAmount(newMainCategory, newSubcategory, newCategoryTotal)
      } else {
        // Same category, just update its total
        const [mainCategory, subcategory] = transaction.category.split(' - ')
        const categoryTotal = this.calculateCategoryTotal(mainCategory, subcategory)
        categoriesStore.updateCategoryAmount(mainCategory, subcategory, categoryTotal)
      }

      // Check if we need to update bill status
      const descriptionChanged = oldDescription !== transaction.description
      const amountChanged = transaction.amount !== updates.amount
      const categoryChanged = oldCategory !== transaction.category
      const typeChanged = oldIsIncome !== transaction.isIncome

      // If this is an expense (or changed to expense) and any relevant fields changed,
      // check if it matches any bills
      if (!transaction.isIncome && (typeChanged || amountChanged || categoryChanged || descriptionChanged)) {
        // Pass absolute value since bills store positive amounts
        billsStore.checkAndMarkPayment(transaction.description, Math.abs(transaction.amount), transaction.category, transaction.date)
      }

      return this.saveToLocalStorage()
    },

    // Export transactions to CSV
    exportTransactionsToCSV() {
      try {
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Type']
        const rows = this.transactions.map(t => [
          t.date,
          t.description,
          t.category,
          t.amount,
          t.isIncome ? 'Income' : 'Expense'
        ])

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        return true
      } catch (error) {
        console.error('Error exporting transactions to CSV:', error)
        return false
      }
    }
  }
}) 
