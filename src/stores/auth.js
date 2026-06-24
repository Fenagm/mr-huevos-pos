import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)

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
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      // Demo mode - accept any password for admin
      if (username === 'admin') {
        user.value = { id: 1, username: 'admin', role: 'admin' }
        token.value = 'demo-token'
        localStorage.setItem('token', 'demo-token')
        return { success: true }
      }
      return { success: false, error: 'Error de conexión' }
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    fetch('/.netlify/functions/logout', { method: 'POST' }).catch(() => {})
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  }
})
