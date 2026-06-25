<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Cuentas Corrientes</h1>
          <p class="text-sm text-gray-500">{{ authStore.currentBranch?.name || 'Sin sucursal' }}</p>
        </div>
        <nav class="flex items-center space-x-4">
          <router-link to="/pos" class="text-gray-600 hover:text-gray-800">POS</router-link>
          <router-link to="/reports" class="text-gray-600 hover:text-gray-800">Reportes</router-link>
          <router-link to="/inventory" class="text-gray-600 hover:text-gray-800">Inventario</router-link>
          <router-link to="/logistics" class="text-gray-600 hover:text-gray-800">Logística</router-link>
          <button @click="handleLogout" class="btn-danger ml-4">Salir</button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="card mb-6">
            <h3 class="text-lg font-semibold mb-4">Resumen</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Total Clientes:</span>
                <span class="font-medium">{{ accountsStore.customers.length }}</span>
              </div>
              <div class="flex justify-between text-blue-600">
                <span>Con Deuda:</span>
                <span class="font-medium">{{ accountsStore.customersWithDebt.length }}</span>
              </div>
              <div class="flex justify-between text-red-600">
                <span>Límite Excedido:</span>
                <span class="font-medium">{{ accountsStore.overCreditLimitCustomers.length }}</span>
              </div>
              <div class="border-t pt-2 mt-2">
                <div class="flex justify-between font-semibold text-lg">
                  <span>Total a Cobrar:</span>
                  <span>${{ accountsStore.totalReceivable.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customers List -->
        <div class="lg:col-span-3">
          <div class="card">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Clientes con Cuenta Corriente</h2>
              <input 
                v-model="search" 
                type="text" 
                placeholder="Buscar cliente..." 
                class="input-field max-w-xs"
              />
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Teléfono</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Saldo Actual</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Límite Crédito</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="customer in filteredCustomers" 
                    :key="customer.id" 
                    class="border-t"
                    :class="{
                      'bg-red-50': customer.accountBalance > (customer.creditLimit || 500),
                      'bg-yellow-50': customer.accountBalance > 0 && customer.accountBalance <= (customer.creditLimit || 500)
                    }"
                  >
                    <td class="px-4 py-3 text-sm font-medium">{{ customer.name }}</td>
                    <td class="px-4 py-3 text-sm">{{ customer.phone }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="customer.accountBalance > 0 ? 'text-red-600 font-bold' : 'text-green-600'">
                        ${{ customer.accountBalance?.toFixed(2) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm">${{ customer.creditLimit?.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="customer.active ? 'text-green-600' : 'text-gray-400'">
                        {{ customer.active ? '✓ Activo' : '✕ Inactivo' }}
                      </span>
                      <span v-if="customer.accountBalance > (customer.creditLimit || 500)" class="text-xs text-red-600 block">
                        ⚠️ Límite excedido
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <button @click="viewMovements(customer)" class="text-blue-600 hover:text-blue-800 mr-3">Ver Movimientos</button>
                      <button @click="showPaymentModal = true; selectedCustomer = customer" class="text-green-600 hover:text-green-800 mr-3">Registrar Pago</button>
                      <button @click="editCreditLimit(customer)" class="text-gray-600 hover:text-gray-800">Editar Límite</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="filteredCustomers.length === 0" class="text-center py-8 text-gray-500">
              No se encontraron clientes
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal && selectedCustomer" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="card w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Registrar Pago - {{ selectedCustomer.name }}</h3>
        <div class="mb-4 text-sm">
          <div class="flex justify-between">
            <span>Saldo Actual:</span>
            <span class="text-red-600 font-bold">${{ selectedCustomer.accountBalance?.toFixed(2) }}</span>
          </div>
        </div>
        <form @submit.prevent="recordPayment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Monto</label>
            <input v-model.number="paymentForm.amount" type="number" step="0.01" min="0.01" :max="selectedCustomer.accountBalance" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Medio de Pago</label>
            <select v-model="paymentForm.method" class="input-field" required>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
            <textarea v-model="paymentForm.notes" class="input-field" rows="2"></textarea>
          </div>
          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showPaymentModal = false" class="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" class="flex-1 btn-primary">Registrar Pago</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Movements Modal -->
    <div v-if="showMovementsModal && selectedCustomer" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="card w-full max-w-2xl">
        <h3 class="text-lg font-semibold mb-4">Movimientos - {{ selectedCustomer.name }}</h3>
        <div class="mb-4 overflow-x-auto max-h-96 overflow-y-auto">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Descripción</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Monto</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="movement in movements" :key="movement.id" class="border-t">
                <td class="px-4 py-2 text-sm">{{ formatDate(movement.date) }}</td>
                <td class="px-4 py-2 text-sm">
                  <span :class="movement.type === 'sale' ? 'text-red-600' : 'text-green-600'">
                    {{ movement.type === 'sale' ? '📦 Venta' : '💵 Pago' }}
                  </span>
                </td>
                <td class="px-4 py-2 text-sm">{{ movement.description }}</td>
                <td class="px-4 py-2 text-sm" :class="movement.type === 'sale' ? 'text-red-600' : 'text-green-600'">
                  {{ movement.type === 'sale' ? '+' : '-' }}${{ Math.abs(movement.amount).toFixed(2) }}
                </td>
                <td class="px-4 py-2 text-sm font-medium">${{ movement.balanceAfter.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-end pt-4">
          <button @click="showMovementsModal = false" class="btn-primary">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Credit Limit Modal -->
    <div v-if="showCreditLimitModal && selectedCustomer" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="card w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Editar Límite de Crédito - {{ selectedCustomer.name }}</h3>
        <form @submit.prevent="updateCreditLimit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nuevo Límite</label>
            <input v-model.number="creditLimitForm.limit" type="number" step="0.01" min="0" class="input-field" required />
          </div>
          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showCreditLimitModal = false" class="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" class="flex-1 btn-primary">Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountsReceivableStore } from '@/stores/accountsReceivable'

const router = useRouter()
const authStore = useAuthStore()
const accountsStore = useAccountsReceivableStore()

const search = ref('')
const showPaymentModal = ref(false)
const showMovementsModal = ref(false)
const showCreditLimitModal = ref(false)
const selectedCustomer = ref(null)
const movements = ref([])

const paymentForm = ref({
  amount: 0,
  method: 'cash',
  notes: ''
})

const creditLimitForm = ref({
  limit: 500
})

const filteredCustomers = computed(() => {
  if (!search.value) return accountsStore.customers
  const term = search.value.toLowerCase()
  return accountsStore.customers.filter(c => c.name.toLowerCase().includes(term))
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-AR')
}

async function viewMovements(customer) {
  selectedCustomer.value = customer
  // Get all movements (no date filter to show complete history)
  movements.value = await accountsStore.getCustomerMovements(
    customer.id,
    '2000-01-01',
    '2099-12-31'
  )
  showMovementsModal.value = true
}

async function recordPayment() {
  if (!selectedCustomer.value || paymentForm.value.amount <= 0) return
  
  const result = await accountsStore.recordPayment(
    selectedCustomer.value.id,
    paymentForm.value.amount,
    paymentForm.value.method,
    paymentForm.value.notes,
    authStore.user.id
  )
  
  if (result.success) {
    showPaymentModal.value = false
    paymentForm.value = { amount: 0, method: 'cash', notes: '' }
    alert('Pago registrado')
  } else {
    alert(result.error)
  }
}

function editCreditLimit(customer) {
  selectedCustomer.value = customer
  creditLimitForm.value.limit = customer.creditLimit || 500
  showCreditLimitModal.value = true
}

async function updateCreditLimit() {
  if (!selectedCustomer.value) return
  
  const result = await accountsStore.updateCustomerCreditLimit(
    selectedCustomer.value.id,
    creditLimitForm.value.limit
  )
  
  if (result.success) {
    showCreditLimitModal.value = false
    alert('Límite actualizado')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await accountsStore.loadCustomers()
})
</script>
