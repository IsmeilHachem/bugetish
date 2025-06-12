import { defineStore } from 'pinia'

const PAID_STATUS = 'PAID'
const UNPAID_STATUS = 'UNPAID'
const UPCOMING_STATUS = 'UPCOMING'

// Categories mapped from categories.py
const CATEGORY_MAPPING = {
  'Transportation': ['Gas', 'Car Payment', 'Car Insurance', 'Car Maintenance', 'Public Transit'],
  'Housing': ['Rent/Mortgage', 'Utilities', 'Internet', 'Phone', 'Insurance', 'Maintenance'],
  'Personal': ['Entertainment', 'Shopping', 'Health', 'Fitness', 'Education', 'Hair/Beard'],
  'Debt': ['Credit Cards', 'Student Loans', 'Personal Loans', 'Subscriptions']
}

// Default categories are the main categories
const DEFAULT_CATEGORIES = Object.keys(CATEGORY_MAPPING)

export const useBillsStore = defineStore('bills', {
  state: () => ({
    bills: [],
    categories: DEFAULT_CATEGORIES,
    initialized: false,
    billMonthStatus: {} // { [billId]: { [YYYY-MM]: { paid: true/false, amount: number } } }
  }),

  getters: {
    getBills: (state) => state.bills,
    getCategories: (state) => state.categories,
    
    // Get bills by status
    getPaidBills: (state) => state.bills.filter(bill => bill.status === PAID_STATUS),
    getUnpaidBills: (state) => state.bills.filter(bill => bill.status === UNPAID_STATUS),
    getUpcomingBills: (state) => state.bills.filter(bill => 
      bill.status === UPCOMING_STATUS && 
      !bill.deletedAfter // Filter out deleted bills
    ),
    
    // Get bills by category
    getBillsByCategory: (state) => (category) => 
      state.bills.filter(bill => bill.category === category),
    
    // Get bill by ID
    getBillById: (state) => (id) => state.bills.find(b => b.id === id),
    
    // Get total amount of bills
    getTotalBillAmount: (state) => state.bills.reduce((total, bill) => total + (bill.amount || 0), 0),
    
    // Get total amount by category
    getTotalByCategory: (state) => (category) => 
      state.bills.filter(bill => bill.category === category)
        .reduce((total, bill) => total + (bill.amount || 0), 0),
    
    // Get total paid amount
    getTotalPaidAmount: (state) => state.bills
      .filter(bill => bill.status === PAID_STATUS)
      .reduce((total, bill) => total + (bill.amount || 0), 0),
    
    // Get total unpaid amount
    getTotalUnpaidAmount: (state) => state.bills
      .filter(bill => bill.status === UNPAID_STATUS)
      .reduce((total, bill) => total + (bill.amount || 0), 0)
  },

  actions: {
    // Reset all bills data and categories
    resetBills() {
      this.bills = []
      this.categories = DEFAULT_CATEGORIES
      this.initialized = true
      this.saveToLocalStorage()
      return true
    },

    // Initialize bills
    initialize() {
      if (this.initialized) return
      
      // Try to load from localStorage first
      const stored = localStorage.getItem('budgetish-bills')
      if (stored) {
        const data = JSON.parse(stored)
        this.bills = data.bills || []
        this.billMonthStatus = data.billMonthStatus || {}
      }
      
      // Migration: for every month in transactions, aggregate by bill and set status/amount/count
      try {
        const transactionsRaw = localStorage.getItem('budgetish-transactions')
        const transactions = transactionsRaw ? JSON.parse(transactionsRaw).transactions || [] : []
        // Get all months present in transactions and add current/future months
        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const months = new Set([...transactions.map(t => t.date.slice(0,7)), currentMonth])
        // Add 12 future months
        for (let i = 1; i <= 12; i++) {
          const future = new Date(now.getFullYear(), now.getMonth() + i, 1)
          const yyyyMM = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}`
          months.add(yyyyMM)
        }
        this.bills.forEach(bill => {
          months.forEach(month => {
            if (!this.billMonthStatus[bill.id]) this.billMonthStatus[bill.id] = {}
            // Find all matching transactions for this bill in this month
            const matches = transactions.filter(t => {
              const tMonth = t.date.slice(0,7)
              const descMatch = t.description && bill.name && t.description.toLowerCase().includes(bill.name.toLowerCase())
              return tMonth === month && descMatch
            })
            if (matches.length > 0) {
              this.billMonthStatus[bill.id][month] = {
                paid: true,
                amount: matches.reduce((sum, t) => sum + Math.abs(t.amount), 0),
                paymentCount: matches.length
              }
            } else if (!this.billMonthStatus[bill.id][month]) {
              this.billMonthStatus[bill.id][month] = { paid: false, amount: 0, paymentCount: 0 }
            }
          })
        })
      } catch (e) { /* fail silently */ }
      
      // Always use the default categories from CATEGORY_MAPPING
      this.categories = DEFAULT_CATEGORIES
      this.initialized = true
      this.saveToLocalStorage()
    },

    // Force refresh categories
    refreshCategories() {
      this.categories = DEFAULT_CATEGORIES
      this.saveToLocalStorage()
    },

    // Save data to localStorage
    saveToLocalStorage() {
      try {
        localStorage.setItem('budgetish-bills', JSON.stringify({
          bills: this.bills,
          categories: this.categories,
          initialized: this.initialized,
          billMonthStatus: this.billMonthStatus
        }))
      } catch (error) {
        console.error('Error saving bills to localStorage:', error)
      }
    },

    // Add a new bill
    addBill(bill) {
      const newBill = {
        id: Date.now().toString(),
        dueDate: bill.dueDate,
        name: bill.name.toLowerCase(),
        amount: bill.amount || null,
        category: bill.category || 'Other',
        status: UNPAID_STATUS,
        paymentCount: 0,
        notes: bill.notes || '',
        deletedAfter: null // New property for soft delete
      }

      this.bills.push(newBill)
      this.sortBillsByDate()
      this.saveToLocalStorage()
      return true
    },

    // Add a new category
    addCategory(category) {
      if (!this.categories.includes(category)) {
        this.categories.push(category)
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // Delete a category (and its bills)
    deleteCategory(category) {
      // Remove the category from CATEGORY_MAPPING
      delete CATEGORY_MAPPING[category]
      
      // Update DEFAULT_CATEGORIES
      this.categories = Object.keys(CATEGORY_MAPPING)
      
      // Delete all bills in this category
      this.bills = this.bills.filter(bill => bill.category !== category)
      
      this.saveToLocalStorage()
      return true
    },

    // Edit a category name
    editCategory(oldName, newName) {
      if (oldName === 'Other' || this.categories.includes(newName)) return false
      
      const index = this.categories.indexOf(oldName)
      if (index !== -1) {
        // Update category name
        this.categories[index] = newName
        
        // Update all bills with this category
        this.bills.forEach(bill => {
          if (bill.category === oldName) {
            bill.category = newName
          }
        })
        
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // Edit an existing bill
    editBill(id, updates) {
      const bill = this.bills.find(b => b.id === id)
      if (!bill) return false

      // Convert name to lowercase if it's being updated
      if (updates.name) {
        updates.name = updates.name.toLowerCase()
      }

      // Update bill properties
      Object.assign(bill, updates)
      
      this.sortBillsByDate()
      this.saveToLocalStorage()
      return true
    },

    // Delete a bill (soft delete: set deletedAfter)
    deleteBill(id, month) {
      const bill = this.bills.find(b => b.id === id)
      if (!bill) return false
      bill.deletedAfter = month
      this.saveToLocalStorage()
      return true
    },

    // Mark a bill as paid
    markAsPaid(id, amount = null, month = null) {
      const bill = this.bills.find(b => b.id === id)
      if (!bill) return false
      const now = new Date()
      const yyyyMM = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      if (!this.billMonthStatus[id]) this.billMonthStatus[id] = {}
      this.billMonthStatus[id][yyyyMM] = { paid: true, amount: amount !== null ? amount : bill.amount }
      this.saveToLocalStorage()
      return true
    },

    // Mark a bill as unpaid
    markAsUnpaid(id, month = null) {
      const bill = this.bills.find(b => b.id === id)
      if (!bill) return false
      const now = new Date()
      const yyyyMM = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      if (!this.billMonthStatus[id]) this.billMonthStatus[id] = {}
      this.billMonthStatus[id][yyyyMM] = { paid: false, amount: 0, paymentCount: 0 }
      this.saveToLocalStorage()
      return true
    },

    // Sort bills by due date
    sortBillsByDate() {
      this.bills.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    },

    // Update bill statuses based on due dates
    updateBillStatuses() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      this.bills.forEach(bill => {
        if (bill.status === PAID_STATUS) return

        const dueDate = new Date(bill.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        if (dueDate < today) {
          bill.status = UNPAID_STATUS
        } else {
          bill.status = UPCOMING_STATUS
        }
      })

      this.saveToLocalStorage()
    },

    // Check if a transaction matches any bill and mark it as paid
    checkAndMarkPayment(description, amount, category, date = null) {
      const matchedBill = this.bills.find(bill => {
        const normalizedBillName = bill.name.toLowerCase().trim()
        const normalizedTransDesc = description.toLowerCase().trim()
        const isUnpaid = !this.billMonthStatus[bill.id]?.[date?.slice(0,7)]?.paid
        const descriptionMatches =
          normalizedBillName === normalizedTransDesc ||
          normalizedTransDesc.includes(normalizedBillName) ||
          normalizedBillName.includes(normalizedTransDesc)
        const amountMatches = !bill.amount ||
          bill.amount === null ||
          bill.amount === '' ||
          Math.abs(Math.abs(bill.amount) - Math.abs(amount)) < 0.01
        return isUnpaid && descriptionMatches && amountMatches
      })
      if (matchedBill) {
        let mainCategory = category
        if (category && category.includes(' - ')) {
          mainCategory = category.split(' - ')[0]
        }
        const yyyyMM = date ? date.slice(0,7) : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        this.editBill(matchedBill.id, { amount: Math.abs(amount), category: mainCategory })
        this.markAsPaid(matchedBill.id, Math.abs(amount), yyyyMM)
        return true
      }
      return false
    },

    // Add this new method after initialize()
    getMainCategoryForSubcategory(subcategory) {
      for (const [mainCategory, subcategories] of Object.entries(CATEGORY_MAPPING)) {
        if (subcategories.includes(subcategory)) {
          return mainCategory
        }
      }
      return 'Miscellaneous'
    }
  }
}) 

// Helper for EST date (UTC-5, no DST)
function getESTDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 5, 0, 0))
} 