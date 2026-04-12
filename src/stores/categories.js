import { defineStore } from 'pinia'

// Default categories matching Python implementation
export const DEFAULT_CATEGORIES = {
  "Pay Day": ["Pay Day"],
  "Food": ["Groceries", "Dining Out", "Coffee/Water", "Going Out"],
  "Transportation": ["Gas", "Car Payment", "Car Insurance", "Car Maintenance", "Public Transit"],
  "Housing": ["Rent/Mortgage", "Utilities", "Internet", "Phone", "Insurance", "Maintenance"],
  "Personal": ["Entertainment", "Shopping", "Health", "Fitness", "Education", "Hair/Beard"],
  "Debt": ["Credit Cards", "Student Loans", "Personal Loans", "Subscriptions"],
  "Savings": ["Emergency Fund", "Retirement", "Investments", "Goals"],
  "Income": ["Salary", "Bonus", "Interest", "Other"],
  "Miscellaneous": ["Other", "Gifts", "Charity"]
}

export const useCategoriesStore = defineStore('categories', {
  state: () => {
    // Try to load from localStorage first
    const stored = localStorage.getItem('budgetish-categories')
    if (stored) {
      const data = JSON.parse(stored)
      return {
        categories: data.categories && Object.keys(data.categories).length > 0 ? data.categories : DEFAULT_CATEGORIES,
        amounts: data.amounts || {},
        initialized: data.initialized || false,
        undoStack: data.undoStack || [],
        redoStack: data.redoStack || []
      }
    }
    return {
      categories: DEFAULT_CATEGORIES,
      amounts: {},
      initialized: false,
      undoStack: [],
      redoStack: []
    }
  },

  getters: {
    // Get all categories
    getCategories: (state) => state.categories || DEFAULT_CATEGORIES,

    // Get all main categories
    getMainCategories: (state) => Object.keys(state.categories || DEFAULT_CATEGORIES),

    // Get subcategories for a main category
    getSubcategories: (state) => (mainCategory) => {
      const categories = state.categories || DEFAULT_CATEGORIES
      return categories[mainCategory] || []
    },

    // Get amount for a specific category-subcategory pair
    getCategoryAmount: (state) => (mainCategory, subcategory) => {
      const key = `${mainCategory} - ${subcategory}`
      return state.amounts[key] || 0
    },

    // Get total for a main category
    getCategoryTotal: (state) => (mainCategory) => {
      return Object.entries(state.amounts)
        .filter(([key]) => key.startsWith(`${mainCategory} - `))
        .reduce((total, [, amount]) => total + amount, 0)
    },

    // Check if undo is available
    canUndo: (state) => state.undoStack.length > 0,

    // Check if redo is available
    canRedo: (state) => state.redoStack.length > 0
  },

  actions: {
    // Save current state to undo stack
    saveState() {
      this.undoStack.push({
        categories: JSON.parse(JSON.stringify(this.categories)),
        amounts: JSON.parse(JSON.stringify(this.amounts))
      })
      // Clear redo stack when new action is performed
      this.redoStack = []
      this.saveToLocalStorage()
    },

    // Undo last action
    undo() {
      if (this.undoStack.length > 0) {
        const currentState = {
          categories: JSON.parse(JSON.stringify(this.categories)),
          amounts: JSON.parse(JSON.stringify(this.amounts))
        }
        this.redoStack.push(currentState)
        
        const previousState = this.undoStack.pop()
        this.categories = previousState.categories
        this.amounts = previousState.amounts
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // Redo last undone action
    redo() {
      if (this.redoStack.length > 0) {
        const currentState = {
          categories: JSON.parse(JSON.stringify(this.categories)),
          amounts: JSON.parse(JSON.stringify(this.amounts))
        }
        this.undoStack.push(currentState)
        
        const nextState = this.redoStack.pop()
        this.categories = nextState.categories
        this.amounts = nextState.amounts
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // Initialize categories with default structure
    initialize() {
      if (this.initialized) return
      
      // Try to load from localStorage first
      const stored = localStorage.getItem('budgetish-categories')
      if (stored) {
        const data = JSON.parse(stored)
        this.categories = data.categories && Object.keys(data.categories).length > 0 ? data.categories : DEFAULT_CATEGORIES
        this.amounts = data.amounts || {}
        this.initialized = data.initialized || false
        // Do not restore undo/redo from disk — those stacks grew huge and exhausted localStorage.
        // Undo/redo for category edits remains available until the next full page load.
        this.undoStack = []
        this.redoStack = []
      }
      
      // If no stored data or initialization failed, use defaults
      if (!this.initialized) {
        this.categories = { ...DEFAULT_CATEGORIES }
        this.resetAmounts()
        this.initialized = true
        this.saveToLocalStorage()
      } else {
        this.saveToLocalStorage()
      }
    },

    // Reset all amounts to zero
    resetAmounts() {
      const newAmounts = {}
      Object.entries(this.categories).forEach(([mainCategory, subcategories]) => {
        subcategories.forEach(subcategory => {
          newAmounts[`${mainCategory} - ${subcategory}`] = 0
        })
      })
      this.amounts = newAmounts
      this.saveState()
    },

    // Update amount for a specific category
    updateCategoryAmount(mainCategory, subcategory, amount) {
      const key = `${mainCategory} - ${subcategory}`
      if (typeof this.amounts[key] === 'undefined') {
        this.amounts[key] = 0
      }
      this.amounts[key] = amount
      // Do not push undo snapshots here — every transaction recalculates totals and was
      // filling undoStack thousands of times, blowing the origin localStorage quota.
      this.saveToLocalStorage()
    },

    // Add a new subcategory to a main category
    addSubcategory(mainCategory, subcategory) {
      if (!this.categories[mainCategory] || this.categories[mainCategory].includes(subcategory)) {
        return false
      }

      // Save state BEFORE making changes
      this.saveState()

      // Add to categories array
      this.categories[mainCategory].push(subcategory)

      // Initialize amount to zero
      const key = `${mainCategory} - ${subcategory}`
      this.amounts[key] = 0

      this.saveToLocalStorage()
      return true
    },

    // Edit a main category name
    editMainCategory(oldName, newName) {
      if (!this.categories[oldName] || this.categories[newName]) {
        return false
      }

      // Update categories object
      this.categories[newName] = [...this.categories[oldName]]
      delete this.categories[oldName]

      // Update amounts object
      const newAmounts = {}
      Object.entries(this.amounts).forEach(([key, amount]) => {
        if (key.startsWith(`${oldName} - `)) {
          const subcategory = key.split(' - ')[1]
          newAmounts[`${newName} - ${subcategory}`] = amount
        } else {
          newAmounts[key] = amount
        }
      })
      this.amounts = newAmounts

      this.saveState()
      return true
    },

    // Edit a subcategory name
    editSubcategory(mainCategory, oldName, newName) {
      if (!this.categories[mainCategory]?.includes(oldName) || 
          this.categories[mainCategory]?.includes(newName)) {
        return false
      }

      // Update categories array
      const index = this.categories[mainCategory].indexOf(oldName)
      if (index !== -1) {
        this.categories[mainCategory][index] = newName
      }

      // Update amounts object
      const oldKey = `${mainCategory} - ${oldName}`
      const newKey = `${mainCategory} - ${newName}`
      if (this.amounts[oldKey] !== undefined) {
        this.amounts[newKey] = this.amounts[oldKey]
        delete this.amounts[oldKey]
      }

      this.saveState()
      return true
    },

    // Delete a main category and its subcategories
    deleteMainCategory(category) {
      if (!this.categories[category]) {
        return false
      }

      // Remove from categories object
      delete this.categories[category]

      // Remove from amounts object
      const newAmounts = {}
      Object.entries(this.amounts).forEach(([key, amount]) => {
        if (!key.startsWith(`${category} - `)) {
          newAmounts[key] = amount
        }
      })
      this.amounts = newAmounts

      this.saveState()
      return true
    },

    // Delete a subcategory from a main category
    deleteSubcategory(mainCategory, subcategory) {
      if (!this.categories[mainCategory]?.includes(subcategory)) {
        return false
      }

      // Remove from categories array
      this.categories[mainCategory] = this.categories[mainCategory].filter(
        sub => sub !== subcategory
      )

      // Remove from amounts object
      const key = `${mainCategory} - ${subcategory}`
      delete this.amounts[key]

      this.saveState()
      return true
    },

    // Export categories to CSV
    exportCategoriesToCSV() {
      try {
        const data = []
        Object.entries(this.categories).forEach(([mainCategory, subcategories]) => {
          subcategories.forEach(subcategory => {
            data.push({
              'Main Category': mainCategory,
              'Subcategory': subcategory,
              'Amount': this.getCategoryAmount(mainCategory, subcategory)
            })
          })
        })

        // Convert to CSV
        const headers = ['Main Category', 'Subcategory', 'Amount']
        const csv = [
          headers.join(','),
          ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
        ].join('\n')

        // Create and download file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'categories_export.csv'
        link.click()
        URL.revokeObjectURL(link.href)

        return true
      } catch (error) {
        console.error('Error exporting categories:', error)
        return false
      }
    },

    // Validate if a category string is valid (main - sub).
    // Split only on the first " - " so subcategories can contain that sequence if ever needed.
    // Trim parts so extra spaces (e.g. "Transportation  -  Car Payment") still match stored names.
    validateCategory(categoryString) {
      if (!categoryString || typeof categoryString !== 'string') return false
      const normalized = categoryString.trim()
      const sep = ' - '
      const idx = normalized.indexOf(sep)
      if (idx === -1) return false
      const mainPart = normalized.slice(0, idx).trim()
      const subPart = normalized.slice(idx + sep.length).trim()
      if (!mainPart || !subPart) return false

      const cats = this.categories || {}
      const mainKey = Object.keys(cats).find((k) => (k || '').trim() === mainPart)
      if (!mainKey) return false
      const subs = cats[mainKey] || []
      return subs.some((s) => (s || '').trim() === subPart)
    },

    // Load data from localStorage
    loadFromLocalStorage() {
      try {
        const stored = localStorage.getItem('budgetish-categories')
        if (stored) {
          const data = JSON.parse(stored)
          this.categories = data.categories && Object.keys(data.categories).length > 0 ? data.categories : DEFAULT_CATEGORIES
          this.amounts = data.amounts
          this.initialized = data.initialized
          this.undoStack = []
          this.redoStack = []
        } else {
          this.initialize()
        }
      } catch (error) {
        console.error('Error loading categories from localStorage:', error)
        this.initialize()
      }
    },

    // Save data to localStorage
    saveToLocalStorage() {
      try {
        localStorage.setItem('budgetish-categories', JSON.stringify({
          categories: this.categories,
          amounts: this.amounts,
          initialized: this.initialized,
          undoStack: this.undoStack,
          redoStack: this.redoStack
        }))
      } catch (error) {
        console.error('Error saving categories to localStorage:', error)
      }
    }
  }
}) 