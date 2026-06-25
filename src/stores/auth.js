import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const currentBranch = ref(JSON.parse(localStorage.getItem('currentBranch') || 'null'))
  
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager')
  const isSeller = computed(() => user.value?.role === 'seller')
  
  // Demo users with branches
  const demoUsers = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', branchId: 1, branchName: 'Centenario' },
    { id: 2, username: 'encargado', password: 'encargado123', role: 'manager', branchId: 1, branchName: 'Centenario' },
    { id: 3, username: 'vendedor', password: 'vendedor123', role: 'seller', branchId: 2, branchName: 'Caaguazú' },
  ]

  async function login(username, password) {
    try {
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        user.value = data.user
        token.value = data.token
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        if (data.user.branchId) {
          currentBranch.value = { id: data.user.branchId, name: data.user.branchName }
          localStorage.setItem('currentBranch', JSON.stringify(currentBranch.value))
        }
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      // Demo mode - accept any password for known users
      const demoUser = demoUsers.find(u => u.username === username && u.password === password)
      if (demoUser) {
        const { password: _password, ...safeDemoUser } = demoUser
        user.value = safeDemoUser
        token.value = 'demo-token'
        localStorage.setItem('token', 'demo-token')
        localStorage.setItem('user', JSON.stringify(safeDemoUser))
        currentBranch.value = { id: safeDemoUser.branchId, name: safeDemoUser.branchName }
        localStorage.setItem('currentBranch', JSON.stringify(currentBranch.value))
        return { success: true }
      }
      // Default admin fallback
      if (username === 'admin' && password === 'admin123') {
        user.value = { id: 1, username: 'admin', role: 'admin', branchId: 1, branchName: 'Centenario' }
        token.value = 'demo-token'
        localStorage.setItem('token', 'demo-token')
        localStorage.setItem('user', JSON.stringify(user.value))
        currentBranch.value = { id: 1, name: 'Centenario' }
        localStorage.setItem('currentBranch', JSON.stringify(currentBranch.value))
        return { success: true }
      }
      return { success: false, error: 'Error de conexión' }
    }
  }

  function logout() {
    user.value = null
    token.value = null
    currentBranch.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentBranch')
    fetch('/.netlify/functions/logout', { method: 'POST' }).catch(() => {})
  }

  function canAccessAccountsReceivable() {
    return user.value?.role === 'admin'
  }

  function canModifyPrices() {
    return user.value?.role === 'admin' || user.value?.role === 'manager'
  }

  function canViewReports() {
    return user.value?.role === 'admin'
  }

  function canManageInventory() {
    return user.value?.role === 'admin'
  }

  function canAccessLogistics() {
    return user.value?.role === 'admin'
  }

  function canAccessInventory() {
    return user.value?.role === 'admin' || user.value?.role === 'manager'
  }

  return {
    user,
    token,
    currentBranch,
    isAuthenticated,
    isAdmin,
    isManager,
    isSeller,
    login,
    logout,
    canAccessAccountsReceivable,
    canModifyPrices,
    canViewReports,
    canManageInventory,
    canAccessLogistics,
    canAccessInventory,
  }
})
