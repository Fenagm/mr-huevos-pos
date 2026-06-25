import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCashRegisterStore = defineStore('cashRegister', () => {
  // State
  const currentSession = ref(null)
  const sessions = ref([])
  const expenses = ref([])
  const loading = ref(false)

  // Demo data
  const demoExpenses = [
    { id: 1, description: 'Pago a proveedor de bolsas', amount: 25.00, date: new Date().toISOString(), category: 'Proveedor' },
    { id: 2, description: 'Artículos de limpieza', amount: 15.50, date: new Date().toISOString(), category: 'Limpieza' },
  ]

  // Computed
  const isOpen = computed(() => currentSession.value !== null && currentSession.value.status === 'open')
  
  const currentBalance = computed(() => {
    if (!currentSession.value) return 0
    const totalIncome = (currentSession.value.cashSales || 0) +
                        (currentSession.value.cardSales || 0) +
                        (currentSession.value.transferSales || 0)
    const totalExpenses = expenses.value
      .filter(e => e.sessionId === currentSession.value.id)
      .reduce((sum, e) => sum + e.amount, 0)
    return totalIncome - totalExpenses
  })

  const sessionSummary = computed(() => {
    if (!currentSession.value) return null
    
    const totalExpensesAmount = expenses.value
      .filter(e => e.sessionId === currentSession.value.id)
      .reduce((sum, e) => sum + e.amount, 0)
    
    const expectedCash = (currentSession.value.initialCash || 0) + 
                         (currentSession.value.cashSales || 0) - 
                         totalExpensesAmount
    
    return {
      initialCash: currentSession.value.initialCash || 0,
      cashSales: currentSession.value.cashSales || 0,
      cardSales: currentSession.value.cardSales || 0,
      transferSales: currentSession.value.transferSales || 0,
      accountReceivableSales: currentSession.value.accountReceivableSales || 0,
      totalExpenses: totalExpensesAmount,
      expectedCash,
      actualCash: currentSession.value.finalCash || 0,
      difference: (currentSession.value.finalCash || 0) - expectedCash,
    }
  })

  // Actions
  async function openSession(initialCash, userId, branchId) {
    if (isOpen.value) {
      return { success: false, error: 'Ya hay una caja abierta' }
    }

    const newSession = {
      id: Date.now(),
      userId,
      branchId,
      initialCash,
      openingDate: new Date().toISOString(),
      status: 'open',
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      accountReceivableSales: 0,
      finalCash: null,
      closingDate: null,
      notes: '',
    }

    try {
      const response = await fetch('/.netlify/functions/open-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      })

      if (response.ok) {
        const savedSession = await response.json()
        currentSession.value = savedSession
        sessions.value.push(savedSession)
        return { success: true, session: savedSession }
      } else {
        throw new Error('Failed to open session')
      }
    } catch (error) {
      // Demo mode
      currentSession.value = newSession
      sessions.value.push(newSession)
      return { success: true, session: newSession }
    }
  }

  async function closeSession(finalCash, notes = '') {
    if (!currentSession.value || !isOpen.value) {
      return { success: false, error: 'No hay una caja abierta' }
    }

    const summary = sessionSummary.value
    const difference = finalCash - summary.expectedCash

    currentSession.value.finalCash = finalCash
    currentSession.value.closingDate = new Date().toISOString()
    currentSession.value.notes = notes
    currentSession.value.difference = difference
    currentSession.value.status = difference === 0 ? 'closed' : (difference < 0 ? 'closed_missing' : 'closed_extra')

    try {
      const response = await fetch('/.netlify/functions/close-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.value.id,
          finalCash,
          notes,
          difference,
        }),
      })

      if (response.ok) {
        const updatedSession = await response.json()
        const index = sessions.value.findIndex(s => s.id === currentSession.value.id)
        if (index !== -1) {
          sessions.value[index] = updatedSession
        }
        currentSession.value = null
        return { success: true, session: updatedSession, difference }
      } else {
        throw new Error('Failed to close session')
      }
    } catch (error) {
      // Demo mode
      const index = sessions.value.findIndex(s => s.id === currentSession.value.id)
      if (index !== -1) {
        sessions.value[index] = { ...currentSession.value }
      }
      currentSession.value = null
      return { success: true, difference }
    }
  }

  async function recordSale(amount, paymentMethod) {
    if (!isOpen.value) {
      return { success: false, error: 'No hay una caja abierta' }
    }

    try {
      const response = await fetch('/.netlify/functions/record-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.value.id,
          amount,
          paymentMethod,
        }),
      })

      if (response.ok) {
        // Update local state
        if (paymentMethod === 'cash') {
          currentSession.value.cashSales = (currentSession.value.cashSales || 0) + amount
        } else if (paymentMethod === 'card') {
          currentSession.value.cardSales = (currentSession.value.cardSales || 0) + amount
        } else if (paymentMethod === 'transfer') {
          currentSession.value.transferSales = (currentSession.value.transferSales || 0) + amount
        } else if (paymentMethod === 'account') {
          currentSession.value.accountReceivableSales = (currentSession.value.accountReceivableSales || 0) + amount
        }
        return { success: true }
      } else {
        throw new Error('Failed to record sale')
      }
    } catch (error) {
      // Demo mode - update local state
      if (paymentMethod === 'cash') {
        currentSession.value.cashSales = (currentSession.value.cashSales || 0) + amount
      } else if (paymentMethod === 'card') {
        currentSession.value.cardSales = (currentSession.value.cardSales || 0) + amount
      } else if (paymentMethod === 'transfer') {
        currentSession.value.transferSales = (currentSession.value.transferSales || 0) + amount
      } else if (paymentMethod === 'account') {
        currentSession.value.accountReceivableSales = (currentSession.value.accountReceivableSales || 0) + amount
      }
      return { success: true }
    }
  }

  async function addExpense(description, amount, category = 'Otros') {
    if (!isOpen.value) {
      return { success: false, error: 'No hay una caja abierta' }
    }

    const newExpense = {
      id: Date.now(),
      sessionId: currentSession.value.id,
      description,
      amount,
      category,
      date: new Date().toISOString(),
      userId: currentSession.value.userId,
    }

    try {
      const response = await fetch('/.netlify/functions/add-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      })

      if (response.ok) {
        const savedExpense = await response.json()
        expenses.value.push(savedExpense)
        return { success: true, expense: savedExpense }
      } else {
        throw new Error('Failed to add expense')
      }
    } catch (error) {
      // Demo mode
      expenses.value.push(newExpense)
      return { success: true, expense: newExpense }
    }
  }

  async function loadSessions(branchId, startDate, endDate) {
    loading.value = true
    try {
      const response = await fetch(
        `/.netlify/functions/get-sessions?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`
      )
      if (response.ok) {
        sessions.value = await response.json()
      } else {
        throw new Error('Failed to load sessions')
      }
    } catch (error) {
      // Demo mode
      sessions.value = []
    } finally {
      loading.value = false
    }
  }

  async function loadExpenses(sessionId) {
    try {
      const response = await fetch(`/.netlify/functions/get-expenses?sessionId=${sessionId}`)
      if (response.ok) {
        expenses.value = await response.json()
      } else {
        throw new Error('Failed to load expenses')
      }
    } catch (error) {
      // Demo mode
      expenses.value = [...demoExpenses]
    }
  }

  function cancelSession() {
    currentSession.value = null
  }

  return {
    currentSession,
    sessions,
    expenses,
    loading,
    isOpen,
    currentBalance,
    sessionSummary,
    openSession,
    closeSession,
    recordSale,
    addExpense,
    loadSessions,
    loadExpenses,
    cancelSession,
  }
})
