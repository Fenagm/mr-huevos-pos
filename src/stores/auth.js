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
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Backend no disponible. Configurar Supabase para autenticación.' 
      }
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

  // Permisos por rol
  function canViewReports() { return ['admin', 'manager'].includes(user.value?.role) }
  function canAccessInventory() { return ['admin', 'manager'].includes(user.value?.role) }
  function canAccessAccountsReceivable() { return ['admin', 'manager'].includes(user.value?.role) }
  function canAccessLogistics() { return ['admin', 'manager'].includes(user.value?.role) }
  function canAccessPurchases() { return ['admin', 'manager'].includes(user.value?.role) }

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
    canViewReports,
    canAccessInventory,
    canAccessAccountsReceivable,
    canAccessLogistics,
    canAccessPurchases,
  }
})
