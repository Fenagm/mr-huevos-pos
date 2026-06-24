<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Mr Huevos POS</h1>
        <nav class="flex items-center space-x-4">
          <router-link to="/pos" class="text-gray-600 hover:text-gray-800">POS</router-link>
          <router-link to="/reports" class="text-blue-600 font-medium">Reportes</router-link>
          <router-link to="/customers" class="text-gray-600 hover:text-gray-800">Clientes</router-link>
          <button @click="handleLogout" class="btn-danger ml-4">Salir</button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="card">
        <h2 class="text-xl font-semibold mb-6">Reportes de Ventas</h2>

        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input v-model="filters.startDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input v-model="filters.endDate" type="date" class="input-field" />
          </div>
          <div class="flex items-end">
            <button @click="loadReports" class="btn-primary w-full">Filtrar</button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-sm text-blue-600">Total Ventas</div>
            <div class="text-2xl font-bold text-blue-800">${{ summary.totalSales }}</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-green-600">Transacciones</div>
            <div class="text-2xl font-bold text-green-800">{{ summary.transactions }}</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-sm text-purple-600">Producto Más Vendido</div>
            <div class="text-lg font-bold text-purple-800">{{ summary.topProduct }}</div>
          </div>
        </div>

        <!-- Sales Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Productos</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Usuario</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in sales" :key="sale.id" class="border-t">
                <td class="px-4 py-3 text-sm">{{ formatDate(sale.date) }}</td>
                <td class="px-4 py-3 text-sm">{{ sale.itemsCount }} items</td>
                <td class="px-4 py-3 text-sm font-medium">${{ sale.total.toFixed(2) }}</td>
                <td class="px-4 py-3 text-sm">{{ sale.user }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="sales.length === 0" class="text-center py-8 text-gray-500">
          No hay ventas en el período seleccionado
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const filters = reactive({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
})

const sales = ref([])
const summary = ref({
  totalSales: '0.00',
  transactions: 0,
  topProduct: '-',
})

async function loadReports() {
  try {
    const response = await fetch('/.netlify/functions/get-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    })

    if (response.ok) {
      const data = await response.json()
      sales.value = data.sales || []
      summary.value = data.summary || summary.value
    }
  } catch (error) {
    // Demo mode
    sales.value = [
      { id: 1, date: '2024-01-15', itemsCount: 5, total: 45.50, user: 'admin' },
      { id: 2, date: '2024-01-15', itemsCount: 3, total: 28.00, user: 'admin' },
      { id: 3, date: '2024-01-14', itemsCount: 10, total: 95.00, user: 'admin' },
    ]
    summary.value = {
      totalSales: '168.50',
      transactions: 3,
      topProduct: 'Huevo Blanco (30u)',
    }
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES')
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

// Load initial data
loadReports()
</script>
