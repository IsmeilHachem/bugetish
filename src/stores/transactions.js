import { defineStore } from 'pinia'
import { useCategoriesStore } from './categories'
import { useBillsStore } from './bills'

// Helper function to parse EST date
function parseESTDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  // Create date in EST (UTC-5)
  return new Date(Date.UTC(year, month - 1, day, 5, 0, 0))
}

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
    // Initialize transactions
    // Initialize transactions from API
async initialize() {
console.log('Transactions store initialize called');
  if (this.initialized) return
  
console.log('About to fetch /api/transactions');
  try {
    const response = await fetch('/api/transactions')
    if (response.ok) {
      const data = await response.json()
      this.transactions = data.transactions || []
      this.initialized = true
    } else {
      console.error('Failed to load transactions from API')
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem('budgetish-transactions')
      if (stored) {
        const data = JSON.parse(stored)
        this.transactions = data.transactions || []
        this.initialized = data.initialized || false
      }
      this.initialized = true
    }
  } catch (error) {
    console.error('Error loading transactions:', error)
    // Fallback to localStorage if API fails
    const stored = localStorage.getItem('budgetish-transactions')
    if (stored) {
      const data = JSON.parse(stored)
      this.transactions = data.transactions || []
      this.initialized = data.initialized || false
    }
    this.initialized = true
  }
  
  this.saveToLocalStorage()
},

    // Save to localStorage
    saveToLocalStorage() {
      localStorage.setItem('budgetish-transactions', JSON.stringify({
        transactions: this.transactions,
        initialized: this.initialized
      }))
    },

    // Add helper method to calculate category total
    calculateCategoryTotal(mainCategory, subcategory) {
      return this.transactions
        .filter(t => t.category === `${mainCategory} - ${subcategory}`)
        .reduce((total, t) => total + Math.abs(t.amount), 0)
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
        id: Date.now().toString(),
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        amount: transaction.isIncome ? Math.abs(transaction.amount) : -Math.abs(transaction.amount),
        isIncome: transaction.isIncome
      }

      this.transactions.push(newTransaction)
      
      // Update category amount by recalculating total
      const [mainCategory, subcategory] = transaction.category.split(' - ')
      const categoryTotal = this.calculateCategoryTotal(mainCategory, subcategory)
      categoriesStore.updateCategoryAmount(mainCategory, subcategory, categoryTotal)
      
      // Check if this transaction matches any unpaid bills
      if (!transaction.isIncome) {
        billsStore.checkAndMarkPayment(transaction.description, transaction.amount, transaction.category)
      }
      
      this.saveToLocalStorage()
      return true
    },

    // Delete a transaction
    deleteTransaction(id) {
      const index = this.transactions.findIndex(t => t.id === id)
      if (index === -1) return false

      const transaction = this.transactions[index]
      const categoriesStore = useCategoriesStore()
      
      // Update category amount - remove the absolute value
      const [mainCategory, subcategory] = transaction.category.split(' - ')
      categoriesStore.updateCategoryAmount(mainCategory, subcategory, -Math.abs(transaction.amount))

      // Remove transaction
      this.transactions.splice(index, 1)
      
      this.saveToLocalStorage()
      return true
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
      
      this.saveToLocalStorage()
      return true
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
        billsStore.checkAndMarkPayment(transaction.description, transaction.amount, transaction.category)
      }

      this.saveToLocalStorage()
      return true
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
