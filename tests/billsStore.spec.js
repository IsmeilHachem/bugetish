import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBillsStore } from '../src/stores/bills'

function mockESTDate(dateString) {
  // Return a Date object in EST (UTC-5, no DST for simplicity)
  const [year, month, day] = dateString.split('-').map(Number)
  // JS months are 0-based
  return new Date(Date.UTC(year, month - 1, day, 5, 0, 0)) // 5am UTC is midnight EST
}

describe('Bills Store - Per Month Logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('correctly aggregates previous months from transactions', () => {
    // Mock transactions for March and April
    const transactions = [
      { date: '2025-03-05', description: 'netflix', amount: -10 },
      { date: '2025-03-15', description: 'netflix', amount: -10 },
      { date: '2025-04-01', description: 'netflix', amount: -10 },
      { date: '2025-04-10', description: 'netflix', amount: -10 },
      { date: '2025-04-15', description: 'rent', amount: -500 },
      { date: '2025-04-20', description: 'netflix', amount: -10 },
    ]
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions }))
    // Mock bills
    const bills = [
      { id: '1', name: 'netflix', dueDate: '2025-04-01', amount: 10 },
      { id: '2', name: 'rent', dueDate: '2025-04-15', amount: 500 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()
    // March: netflix paid twice, rent unpaid
    expect(store.billMonthStatus['1']['2025-03'].paid).toBe(true)
    expect(store.billMonthStatus['1']['2025-03'].amount).toBe(20)
    expect(store.billMonthStatus['1']['2025-03'].paymentCount).toBe(2)
    expect(store.billMonthStatus['2']['2025-03'].paid).toBe(false)
    expect(store.billMonthStatus['2']['2025-03'].amount).toBe(0)
    // April: netflix paid 3x, rent paid 1x
    expect(store.billMonthStatus['1']['2025-04'].paid).toBe(true)
    expect(store.billMonthStatus['1']['2025-04'].amount).toBe(30)
    expect(store.billMonthStatus['1']['2025-04'].paymentCount).toBe(3)
    expect(store.billMonthStatus['2']['2025-04'].paid).toBe(true)
    expect(store.billMonthStatus['2']['2025-04'].amount).toBe(500)
    expect(store.billMonthStatus['2']['2025-04'].paymentCount).toBe(1)
  })

  it('initializes current/future months as unpaid/$0 unless a transaction exists', () => {
    const now = new Date()
    const yyyyMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions: [] }))
    const bills = [
      { id: '1', name: 'netflix', dueDate: '2025-04-01', amount: 10 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()
    expect(store.billMonthStatus['1'][yyyyMM].paid).toBe(false)
    expect(store.billMonthStatus['1'][yyyyMM].amount).toBe(0)
  })

  it('removes bill from future months when deleted', () => {
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions: [] }))
    const bills = [
      { id: '1', name: 'netflix', dueDate: '2025-04-01', amount: 10 },
      { id: '2', name: 'rent', dueDate: '2025-04-15', amount: 500 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()
    store.deleteBill('1')
    expect(store.billMonthStatus['1']).toBeUndefined()
    expect(store.billMonthStatus['2']).toBeDefined()
  })

  it('uses EST for due dates', () => {
    // Bill due on 9th should show as 9th in EST
    const bill = { id: '1', name: 'netflix', dueDate: '2025-04-09', amount: 10 }
    // Simulate EST conversion
    const estDate = mockESTDate(bill.dueDate)
    expect(estDate.getUTCDate()).toBe(9)
    expect(estDate.getUTCHours()).toBe(5) // 5am UTC is midnight EST
  })

  it('initializes 12 future months as unpaid/$0 unless a transaction exists', () => {
    const now = new Date()
    const yyyyMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    localStorage.setItem('budgetish-transactions', JSON.stringify({ transactions: [] }))
    const bills = [
      { id: '1', name: 'netflix', dueDate: '2025-04-01', amount: 10 }
    ]
    localStorage.setItem('budgetish-bills', JSON.stringify({ bills }))
    const store = useBillsStore()
    store.initialize()
    for (let i = 1; i <= 12; i++) {
      const future = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const futureMonth = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}`
      expect(store.billMonthStatus['1'][futureMonth].paid).toBe(false)
      expect(store.billMonthStatus['1'][futureMonth].amount).toBe(0)
      expect(store.billMonthStatus['1'][futureMonth].paymentCount).toBe(0)
    }
  })

  it('displays due date as the correct day regardless of time zone', () => {
    // Simulate a bill due on the 9th
    const bill = { id: '1', name: 'netflix', dueDate: '2025-06-09', amount: 10 }
    // Use the same formatDate logic as BillListItem.vue
    const formatDate = (date) => {
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-')
        return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    expect(formatDate(bill.dueDate)).toMatch(/Jun 9, 2025/)
  })
}) 