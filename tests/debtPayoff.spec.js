import { describe, it, expect } from 'vitest'
import { simulateDebtPlan, savingsAt, addMonths, STRATEGIES } from '../src/utils/debtPayoff'

// Spain 2029 baseline: $125k job Aug 2027, parents' house from Nov 2027
const spainPlan = () => ({
  startMonth: '2026-10',
  months: 31, // through April 2029
  strategy: STRATEGIES.avalanche,
  shortfallDebtId: 'discover',
  debts: [
    { id: 'capone', name: 'Capital One', balance: 9000, apr: 20.49, minPayment: 150 },
    { id: 'discover', name: 'Discover', balance: 7000, apr: 23.49, minPayment: 100 },
    { id: 'citi', name: 'Citi', balance: 8700, apr: 25, minPayment: 100 },
    { id: 'bestbuy', name: 'Best Buy', balance: 1500, apr: 30, minPayment: 60 },
    { id: 'macys', name: "Macy's", balance: 350, apr: 30, minPayment: 40 },
    { id: 'upstart', name: 'Upstart', balance: 10240, apr: 17.81, minPayment: 317 },
    { id: 'sofi', name: 'SoFi', balance: 35000, apr: 12.43, minPayment: 903 }
  ],
  income: [
    { label: 'UWM', amount: 3994, end: '2027-08' },
    { label: 'New job', amount: 6900, start: '2027-08' },
    { label: 'No Detroit city tax', amount: 230, start: '2027-11' },
    { label: 'Auto insurance sales', amount: 600, start: '2027-01' },
    { label: 'Massage therapy', amount: 1800, start: '2028-03' }
  ],
  expenses: [
    { label: 'Rent + parking', amount: 2000, end: '2027-11' },
    { label: "Parents' house", amount: 400, start: '2027-11' },
    { label: 'Living expenses', amount: 1330 },
    { label: 'Massage tuition', amount: 12500 / 12, start: '2027-03', end: '2028-03' }
  ]
})

describe('addMonths', () => {
  it('rolls over years', () => {
    expect(addMonths('2026-11', 3)).toBe('2027-02')
    expect(addMonths('2027-01', -1)).toBe('2026-12')
  })
})

describe('simulateDebtPlan', () => {
  it('matches the Spain 2029 baseline plan', () => {
    const result = simulateDebtPlan(spainPlan())
    expect(result.debtFreeMonth).toBe('2028-10')
    expect(savingsAt(result, '2029-04')).toBeGreaterThan(50000)
    expect(savingsAt(result, '2029-04')).toBeLessThan(52000)
  })

  it("pays off highest-APR debts first and Macy's before Best Buy on a tie", () => {
    const { payoffOrder } = simulateDebtPlan(spainPlan())
    const order = payoffOrder.map(d => d.id)
    expect(order.indexOf('macys')).toBeLessThan(order.indexOf('citi'))
    expect(order.indexOf('citi')).toBeLessThan(order.indexOf('discover'))
    expect(order.at(-1)).toBe('sofi')
  })

  it('puts monthly shortfalls on the chosen card so debt grows before the new job', () => {
    const result = simulateDebtPlan(spainPlan())
    const nov = result.rows.find(r => r.month === '2026-11')
    expect(nov.shortfall).toBeGreaterThan(0)
    expect(result.peakDebt.month).toBe('2027-07')
  })

  it('never lets balances go negative', () => {
    const result = simulateDebtPlan(spainPlan())
    for (const row of result.rows) {
      for (const bal of Object.values(row.balances)) expect(bal).toBeGreaterThanOrEqual(0)
    }
  })

  it('snowball clears the smallest balance first', () => {
    const plan = { ...spainPlan(), strategy: STRATEGIES.snowball }
    const { payoffOrder } = simulateDebtPlan(plan)
    expect(payoffOrder[0].id).toBe('macys')
  })

  it('a disabled income line is ignored (scenario toggle)', () => {
    const plan = spainPlan()
    plan.income.find(i => i.label === 'Massage therapy').enabled = false
    const result = simulateDebtPlan(plan)
    expect(result.debtFreeMonth > '2028-10').toBe(true)
  })

  it('avalanche pays no more interest than snowball', () => {
    const a = simulateDebtPlan(spainPlan())
    const s = simulateDebtPlan({ ...spainPlan(), strategy: STRATEGIES.snowball })
    expect(a.totalInterest).toBeLessThanOrEqual(s.totalInterest)
  })
})
