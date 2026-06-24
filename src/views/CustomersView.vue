<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Mr Huevos POS</h1>
        <nav class="flex items-center space-x-4">
          <router-link to="/pos" class="text-gray-600 hover:text-gray-800">POS</router-link>
          <router-link to="/reports" class="text-gray-600 hover:text-gray-800">Reportes</router-link>
          <router-link to="/customers" class="text-blue-600 font-medium">Clientes</router-link>
          <button @click="handleLogout" class="btn-danger ml-4">Salir</button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Clientes</h2>
          <button @click="showModal = true" class="btn-primary">Nuevo Cliente</button>
        </div>

        <!-- Search -->
        <div class="mb-6">
          <input 
            v-model="search" 
            type="text" 
            placeholder="Buscar cliente..." 
            class="input-field max-w-md"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Teléfono</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Compras</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="customer in filteredCustomers" 
                :key="customer.id" 
                class="border-t"
              >
                <td class="px-4 py-3 text-sm">{{ customer.name }}</td>
                <td class="px-4 py-3 text-sm">{{ customer.email }}</td>
                <td class="px-4 py-3 text-sm">{{ customer.phone }}</td>
                <td class="px-4 py-3 text-sm">${{ customer.totalPurchases.toFixed(2) }}</td>
                <td class="px-4 py-3 text-sm">
                  <button class="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                  <button class="text-red-600 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredCustomers.length === 0" class="text-center py-8 text-gray-500">
          No se encontraron clientes
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="card w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Nuevo Cliente</h3>
        
        <form @submit.prevent="saveCustomer" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input v-model="newCustomer.name" type="text" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input v-model="newCustomer.email" type="email" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input v-model="newCustomer.phone" type="tel" class="input-field" />
          </div>
          
          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" class="flex-1 btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const search = ref('')
const showModal = ref(false)

const customers = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@email.com', phone: '555-1234', totalPurchases: 150.00 },
  { id: 2, name: 'María García', email: 'maria@email.com', phone: '555-5678', totalPurchases: 280.50 },
  { id: 3, name: 'Carlos López', email: 'carlos@email.com', phone: '555-9012', totalPurchases: 95.00 },
])

const newCustomer = ref({
  name: '',
  email: '',
  phone: '',
})

const filteredCustomers = computed(() => {
  if (!search.value) return customers.value
  
  const term = search.value.toLowerCase()
  return customers.value.filter(c => 
    c.name.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.phone?.includes(term)
  )
})

function saveCustomer() {
  customers.value.push({
    id: Date.now(),
    ...newCustomer.value,
    totalPurchases: 0,
  })
  
  newCustomer.value = { name: '', email: '', phone: '' }
  showModal.value = false
  alert('Cliente guardado (modo demo)')
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>
