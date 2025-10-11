import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBillsStore } from '../src/stores/bills'

describe('Bills Store - Payment Matching Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('checkAndMarkPayment correctly marks bills as paid for the transaction month', () => {
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions: [] }))
    const bills = [
      { id: '1', name: 'netflix', dueDate: '2025-04-01', amount: 10 },
      { id: '2', name: 'rent', dueDate: '2025-04-15', amount: 500 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()

    // Test marking a bill as paid for a specific month (March 2025)
    const result = store.checkAndMarkPayment('netflix', -10, 'Entertainment - Streaming', '2025-03-15')
    
    expect(result).toBe(true) // Should find and mark the bill
    expect(store.billMonthStatus['1']['2025-03'].paid).toBe(true)
    expect(store.billMonthStatus['1']['2025-03'].amount).toBe(10)
    expect(store.billMonthStatus['1']['2025-03'].paymentCount).toBe(1)
    
    // Current month should still be unpaid
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    if (currentMonth !== '2025-03') {
      expect(store.billMonthStatus['1'][currentMonth].paid).toBe(false)
    }
  })

  it('checkAndMarkPayment handles negative transaction amounts correctly', () => {
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions: [] }))
    const bills = [
      { id: '1', name: 'netflix', dueDate: '2025-04-01', amount: 10 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()

    // Test with negative amount (typical for expense transactions)
    const result = store.checkAndMarkPayment('netflix', -15, 'Entertainment - Streaming', '2025-03-15')
    
    expect(result).toBe(true)
    expect(store.billMonthStatus['1']['2025-03'].paid).toBe(true)
    expect(store.billMonthStatus['1']['2025-03'].amount).toBe(15) // Should store positive amount
  })

  it('checkAndMarkPayment does not mark already paid bills', () => {
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions: [] }))
    const bills = [
      { id: '1', name: 'netflix', dueDate: '2025-04-01', amount: 10 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()

    // First payment
    store.checkAndMarkPayment('netflix', -10, 'Entertainment - Streaming', '2025-03-15')
    expect(store.billMonthStatus['1']['2025-03'].paid).toBe(true)
    expect(store.billMonthStatus['1']['2025-03'].paymentCount).toBe(1)

    // Second payment should not match (bill already paid)
    const result = store.checkAndMarkPayment('netflix', -10, 'Entertainment - Streaming', '2025-03-20')
    expect(result).toBe(false) // Should not find/match the bill
    expect(store.billMonthStatus['1']['2025-03'].paymentCount).toBe(1) // Should not increment
  })

  it('checkAndMarkPayment requires exact name matches to prevent false positives', () => {
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions: [] }))
    const bills = [
      { id: '1', name: 'aaa', dueDate: '2025-04-01', amount: 10 },
      { id: '2', name: 'aaa renters', dueDate: '2025-04-15', amount: 500 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()

    // Transaction for "aaa renters" should only match the "aaa renters" bill
    const result = store.checkAndMarkPayment('aaa renters', -500, 'Insurance - Renters', '2025-03-15')
    
    expect(result).toBe(true) // Should find and mark the bill
    expect(store.billMonthStatus['2']['2025-03'].paid).toBe(true) // "aaa renters" should be marked as paid
    expect(store.billMonthStatus['2']['2025-03'].amount).toBe(500)
    expect(store.billMonthStatus['1']['2025-03'].paid).toBe(false) // "aaa" should remain unpaid
  })

  it('checkAndMarkPayment does not match partial names', () => {
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions: [] }))
    const bills = [
      { id: '1', name: 'netflix', dueDate: '2025-04-01', amount: 10 },
      { id: '2', name: 'netflix premium', dueDate: '2025-04-15', amount: 15 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()

    // Transaction for "netflix" should only match the "netflix" bill, not "netflix premium"
    const result = store.checkAndMarkPayment('netflix', -10, 'Entertainment - Streaming', '2025-03-15')
    
    expect(result).toBe(true) // Should find and mark the bill
    expect(store.billMonthStatus['1']['2025-03'].paid).toBe(true) // "netflix" should be marked as paid
    expect(store.billMonthStatus['2']['2025-03'].paid).toBe(false) // "netflix premium" should remain unpaid
  })
})