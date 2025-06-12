import { defineStore } from 'pinia'

export const useReflectionsStore = defineStore('reflections', {
  state: () => ({
    reflections: [], // Array of reflection objects
    initialized: false
  }),
  getters: {
    getReflections: (state) => state.reflections,
    getReflectionByPeriod: (state) => (periodType, periodStart) =>
      state.reflections.find(r => r.periodType === periodType && r.periodStart === periodStart),
    getReflectionsByType: (state) => (periodType) =>
      state.reflections.filter(r => r.periodType === periodType)
  },
  actions: {
    initialize() {
      const stored = localStorage.getItem('budgetish-reflections')
      if (stored) {
        this.reflections = JSON.parse(stored)
      }
      this.initialized = true
    },
    saveToLocalStorage() {
      localStorage.setItem('budgetish-reflections', JSON.stringify(this.reflections))
    },
    addOrUpdateReflection(reflection) {
      const idx = this.reflections.findIndex(r => r.periodType === reflection.periodType && r.periodStart === reflection.periodStart)
      if (idx !== -1) {
        this.reflections[idx] = { ...this.reflections[idx], ...reflection, updatedAt: new Date().toISOString() }
      } else {
        this.reflections.push({ ...reflection, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      }
      this.saveToLocalStorage()
    },
    deleteReflection(periodType, periodStart) {
      this.reflections = this.reflections.filter(r => !(r.periodType === periodType && r.periodStart === periodStart))
      this.saveToLocalStorage()
    }
  }
}) 