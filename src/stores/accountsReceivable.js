import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAccountsReceivableStore = defineStore('accountsReceivable', () => {
  // State
  const customers = ref([])
  const accountMovements = ref([])
  const loading = ref(false)

  // Demo data
  const demoCustomers = [
    { 
      id: 1, 
      name: 'Juan Pérez', 
      email: 'juan@email.com', 
      phone: '555-1234', 
      address: 'Calle Falsa 123',
      accountBalance: 150.00,
      creditLimit: 500.00,
      active: true
    },
    { 
      id: 2, 
      name: 'María García', 
      email: 'maria@email.com', 
      phone: '555-5678', 
      address: 'Av. Siempre Viva 742',
      accountBalance: 280.50,
      creditLimit: 1000.00,
      active: true
    },
    { 
      id: 3, 
      name: 'Carlos López', 
      email: 'carlos@email.com', 
      phone: '555-9012', 
      address: 'Belgrano 456',
      accountBalance: 95.00,
      creditLimit: 300.00,
      active: true
    },
  ]

  const demoMovements = [
    { id: 1, customerId: 1, type: 'sale', amount: 50.00, balanceAfter: 150.00, date: '2024-01-10', description: 'Venta fiada', userId: 1 },
    { id: 2, customerId: 1, type: 'payment', amount: -100.00, balanceAfter: 50.00, date: '2024-01-12', description: 'Pago en efectivo', userId: 1 },
    { id: 3, customerId: 1, type: 'sale', amount: 100.00, balanceAfter: 150.00, date: '2024-01-15', description: 'Venta fiada', userId: 1 },
    { id: 4, customerId: 2, type: 'sale', amount: 280.50, balanceAfter: 280.50, date: '2024-01-14', description: 'Venta fiada', userId: 1 },
    { id: 5, customerId: 3, type: 'sale', amount: 95.00, balanceAfter: 95.00, date: '2024-01-13', description: 'Venta fiada', userId: 1 },
  ]

  // Computed
  const totalReceivable = computed(() => {
    return customers.value.reduce((sum, c) => sum + (c.accountBalance || 0), 0)
  })

  const customersWithDebt = computed(() => {
    return customers.value.filter(c => (c.accountBalance || 0) > 0 && c.active)
  })

  const overCreditLimitCustomers = computed(() => {
    return customers.value.filter(c => (c.accountBalance || 0) > (c.creditLimit || 0) && c.active)
  })

  // Actions
  async function loadCustomers() {
    loading.value = true
    try {
      const response = await fetch('/.netlify/functions/get-customers-accounts')
      if (response.ok) {
        const data = await response.json()
        customers.value = data.customers || []
      } else {
        throw new Error('Failed to load customers')
      }
    } catch (error) {
      // Demo mode
      customers.value = [...demoCustomers]
    } finally {
      loading.value = false
    }
  }

  async function getCustomerMovements(customerId, startDate, endDate) {
    try {
      const response = await fetch(
        `/.netlify/functions/get-customer-movements?customerId=${customerId}&startDate=${startDate}&endDate=${endDate}`
      )
      if (response.ok) {
        return await response.json()
      } else {
        throw new Error('Failed to load movements')
      }
    } catch (error) {
      // Demo mode
      return demoMovements.filter(m => m.customerId === customerId)
    }
  }

  async function addToAccount(customerId, amount, description, userId) {
    const customer = customers.value.find(c => c.id === customerId)
    if (!customer) return { success: false, error: 'Cliente no encontrado' }
    
    if (!customer.active) {
      return { success: false, error: 'Cliente inactivo' }
    }

    const newBalance = (customer.accountBalance || 0) + amount
    
    // Check credit limit
    if (newBalance > (customer.creditLimit || 0)) {
      return { 
        success: false, 
        error: `Excede límite de crédito. Límite: $${customer.creditLimit}, Saldo actual: $${customer.accountBalance}, Nuevo saldo sería: $${newBalance}`
      }
    }

    const movement = {
      id: Date.now(),
      customerId,
      type: 'sale',
      amount,
      balanceAfter: newBalance,
      date: new Date().toISOString().split('T')[0],
      description: description || 'Venta a cuenta corriente',
      userId,
    }

    try {
      const response = await fetch('/.netlify/functions/add-account-movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movement, newBalance }),
      })

      if (response.ok) {
        customer.accountBalance = newBalance
        accountMovements.value.push(movement)
        return { success: true, movement, newBalance }
      } else {
        throw new Error('Failed to add movement')
      }
    } catch (error) {
      // Demo mode
      customer.accountBalance = newBalance
      accountMovements.value.push(movement)
      return { success: true, movement, newBalance }
    }
  }

  async function recordPayment(customerId, amount, paymentMethod, description, userId) {
    const customer = customers.value.find(c => c.id === customerId)
    if (!customer) return { success: false, error: 'Cliente no encontrado' }

    if ((customer.accountBalance || 0) <= 0) {
      return { success: false, error: 'El cliente no tiene deuda pendiente' }
    }

    if (amount > customer.accountBalance) {
      return { success: false, error: 'El monto excede la deuda pendiente' }
    }

    const newBalance = customer.accountBalance - amount

    const movement = {
      id: Date.now(),
      customerId,
      type: 'payment',
      amount: -amount,
      balanceAfter: newBalance,
      date: new Date().toISOString().split('T')[0],
      description: description || `Pago (${paymentMethod})`,
      userId,
      paymentMethod,
    }

    try {
      const response = await fetch('/.netlify/functions/record-account-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movement, newBalance, amount, paymentMethod }),
      })

      if (response.ok) {
        customer.accountBalance = newBalance
        accountMovements.value.push(movement)
        return { success: true, movement, newBalance }
      } else {
        throw new Error('Failed to record payment')
      }
    } catch (error) {
      // Demo mode
      customer.accountBalance = newBalance
      accountMovements.value.push(movement)
      return { success: true, movement, newBalance }
    }
  }

  async function updateCustomerCreditLimit(customerId, creditLimit) {
    const customer = customers.value.find(c => c.id === customerId)
    if (!customer) return { success: false, error: 'Cliente no encontrado' }

    try {
      const response = await fetch('/.netlify/functions/update-credit-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, creditLimit }),
      })

      if (response.ok) {
        customer.creditLimit = creditLimit
        return { success: true }
      } else {
        throw new Error('Failed to update credit limit')
      }
    } catch (error) {
      // Demo mode
      customer.creditLimit = creditLimit
      return { success: true }
    }
  }

  async function toggleCustomerActive(customerId) {
    const customer = customers.value.find(c => c.id === customerId)
    if (!customer) return { success: false, error: 'Cliente no encontrado' }

    if (customer.accountBalance > 0) {
      return { success: false, error: 'No se puede desactivar un cliente con deuda pendiente' }
    }

    customer.active = !customer.active

    try {
      const response = await fetch('/.netlify/functions/toggle-customer-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, active: customer.active }),
      })

      if (response.ok) {
        return { success: true }
      } else {
        throw new Error('Failed to update customer status')
      }
    } catch (error) {
      // Demo mode
      return { success: true }
    }
  }

  return {
    customers,
    accountMovements,
    loading,
    totalReceivable,
    customersWithDebt,
    overCreditLimitCustomers,
    loadCustomers,
    getCustomerMovements,
    addToAccount,
    recordPayment,
    updateCustomerCreditLimit,
    toggleCustomerActive,
  }
})
