<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="card w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Mr Huevos POS</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
          <input 
            v-model="username" 
            type="text" 
            class="input-field"
            placeholder="admin"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            class="input-field"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="btn-primary w-full"
        >
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="mt-6 text-xs text-gray-500 text-center">
        Demo: usuario "admin", cualquier contraseña
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('admin')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  const result = await authStore.login(username.value, password.value)

  loading.value = false

  if (result.success) {
    router.push('/pos')
  } else {
    error.value = result.error || 'Credenciales inválidas'
  }
}
</script>
