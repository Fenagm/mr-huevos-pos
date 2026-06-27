<template>
  <div class="min-h-screen" style="background: var(--bg);">
    <AppHeader title="Cuentas Corrientes" active="accounts" />

    <main class="max-w-7xl mx-auto px-4 py-5">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-5">

        <!-- Sidebar resumen -->
        <div class="lg:col-span-1 space-y-4">
          <div class="card-accent">
            <p class="text-xs font-medium" style="color: var(--muted);">Total a cobrar</p>
            <p class="font-mono text-2xl font-medium mt-1" style="color: var(--primary);">
              ${{ accountsStore.totalReceivable.toFixed(2) }}
            </p>
          </div>
          <div class="card space-y-3">
            <div class="flex justify-between text-sm">
              <span style="color: var(--muted);">Total clientes</span>
              <span class="font-mono font-medium">{{ accountsStore.customers.length }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color: var(--warning);">Con deuda</span>
              <span class="font-mono font-medium" style="color: var(--warning);">{{ accountsStore.customersWithDebt.length }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color: var(--danger);">Límite excedido</span>
              <span class="font-mono font-medium" style="color: var(--danger);">{{ accountsStore.overCreditLimitCustomers.length }}</span>
            </div>
          </div>
        </div>

        <!-- Tabla clientes -->
        <div class="lg:col-span-3">
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-base" style="color: var(--text);">Clientes con cuenta corriente</h2>
              <input v-model="search" type="text" placeholder="Buscar…" class="input-field max-w-xs text-sm" />
            </div>

            <!-- Desktop: tabla -->
            <div class="hidden sm:block overflow-x-auto">
              <table class="table-base">
                <thead>
                  <tr>
                    <th>Nombre</th><th>Teléfono</th><th>Saldo</th><th>Límite</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="customer in filteredCustomers"
                    :key="customer.id"
                    :style="customer.accountBalance > (customer.creditLimit || 500) ? 'background: #FEF2F2' :
                            customer.accountBalance > 0 ? 'background: #FFFBEB' : ''"
                  >
                    <td class="font-medium text-sm">{{ customer.name }}</td>
                    <td class="text-sm" style="color: var(--muted);">{{ customer.phone }}</td>
                    <td>
                      <span class="font-mono text-sm font-medium" :style="customer.accountBalance > 0 ? 'color: var(--danger)' : 'color: var(--success)'">
                        ${{ (customer.accountBalance || 0).toFixed(2) }}
                      </span>
                    </td>
                    <td class="font-mono text-sm">${{ (customer.creditLimit || 500).toFixed(2) }}</td>
                    <td>
                      <span :class="['badge', customer.active ? 'badge-green' : 'badge-gray']">{{ customer.active ? 'Activo' : 'Inactivo' }}</span>
                      <span v-if="customer.accountBalance > (customer.creditLimit || 500)" class="badge badge-red ml-1">Límite exc.</span>
                    </td>
                    <td>
                      <div class="flex gap-3 text-sm">
                        <button @click="viewMovements(customer)" style="color: var(--primary);" class="font-medium">Movimientos</button>
                        <button @click="openPayment(customer)" style="color: var(--success);" class="font-medium">Pago</button>
                        <button @click="editCreditLimit(customer)" style="color: var(--muted);">Límite</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile: cards -->
            <div class="sm:hidden space-y-2">
              <div
                v-for="customer in filteredCustomers"
                :key="customer.id"
                class="card-row"
                :style="customer.accountBalance > (customer.creditLimit || 500) ? 'background: #FEF2F2; border-color: #FECACA' :
                        customer.accountBalance > 0 ? 'background: #FFFBEB; border-color: #FDE68A' : ''"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <p class="font-semibold text-sm">{{ customer.name }}</p>
                    <p class="text-xs" style="color: var(--muted);">{{ customer.phone }}</p>
                  </div>
                  <span :class="['badge', customer.active ? 'badge-green' : 'badge-gray']">{{ customer.active ? 'Activo' : 'Inactivo' }}</span>
                </div>
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <p class="text-xs" style="color: var(--muted);">Saldo</p>
                    <p class="font-mono font-semibold text-base" :style="customer.accountBalance > 0 ? 'color: var(--danger)' : 'color: var(--success)'">
                      ${{ (customer.accountBalance || 0).toFixed(2) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs" style="color: var(--muted);">Límite</p>
                    <p class="font-mono text-sm">${{ (customer.creditLimit || 500).toFixed(2) }}</p>
                  </div>
                </div>
                <span v-if="customer.accountBalance > (customer.creditLimit || 500)" class="badge badge-red mb-2">⚠ Límite excedido</span>
                <div class="flex gap-2">
                  <button @click="viewMovements(customer)" class="btn-secondary flex-1 text-xs py-2">Movimientos</button>
                  <button @click="openPayment(customer)" class="btn-success flex-1 text-xs py-2">Registrar pago</button>
                  <button @click="editCreditLimit(customer)" class="btn-secondary text-xs py-2 px-3">Límite</button>
                </div>
              </div>
            </div>
            <p v-if="filteredCustomers.length === 0" class="text-center py-8 text-sm" style="color: var(--muted);">Sin clientes</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal pago -->
    <div v-if="showPaymentModal && selectedCustomer" class="modal-backdrop">
      <div class="card w-full max-w-md">
        <h3 class="font-semibold text-base mb-1">Registrar pago</h3>
        <p class="text-sm mb-4" style="color: var(--muted);">{{ selectedCustomer.name }}</p>

        <div class="card-accent mb-4">
          <p class="text-xs" style="color: var(--muted);">Saldo actual</p>
          <p class="font-mono text-lg font-medium" style="color: var(--danger);">
            ${{ (selectedCustomer.accountBalance || 0).toFixed(2) }}
          </p>
        </div>

        <form @submit.prevent="recordPayment" class="space-y-3">
          <div>
            <label class="block text-xs font-medium mb-1" style="color: var(--muted);">Monto</label>
            <input v-model.number="paymentForm.amount" type="number" step="0.01" min="0.01" :max="selectedCustomer.accountBalance" class="input-field" required />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1" style="color: var(--muted);">Medio de pago</label>
            <select v-model="paymentForm.method" class="input-field">
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1" style="color: var(--muted);">Observaciones</label>
            <textarea v-model="paymentForm.notes" class="input-field" rows="2"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showPaymentModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-success flex-1">Registrar pago</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal movimientos -->
    <div v-if="showMovementsModal && selectedCustomer" class="modal-backdrop">
      <div class="card w-full max-w-2xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-base">Movimientos</h3>
            <p class="text-sm" style="color: var(--muted);">{{ selectedCustomer.name }}</p>
          </div>
          <button @click="showMovementsModal = false" style="color: var(--muted);">✕</button>
        </div>
        <div class="overflow-x-auto max-h-96 overflow-y-auto">
          <table class="table-base">
            <thead class="sticky top-0" style="background: var(--surface);">
              <tr>
                <th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Monto</th><th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in movements" :key="m.id">
                <td class="text-sm">{{ formatDate(m.date) }}</td>
                <td>
                  <span :class="['badge', m.type === 'sale' ? 'badge-red' : 'badge-green']">
                    {{ m.type === 'sale' ? '📦 Venta' : '💵 Pago' }}
                  </span>
                </td>
                <td class="text-sm" style="color: var(--muted);">{{ m.description }}</td>
                <td class="font-mono text-sm" :style="m.type === 'sale' ? 'color: var(--danger)' : 'color: var(--success)'">
                  {{ m.type === 'sale' ? '+' : '-' }}${{ Math.abs(m.amount).toFixed(2) }}
                </td>
                <td class="font-mono text-sm font-medium">${{ m.balanceAfter.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="movements.length === 0" class="text-center py-6 text-sm" style="color: var(--muted);">Sin movimientos</p>
        </div>
        <div class="flex justify-end pt-4">
          <button @click="showMovementsModal = false" class="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Modal límite de crédito -->
    <div v-if="showCreditLimitModal && selectedCustomer" class="modal-backdrop">
      <div class="card w-full max-w-sm">
        <h3 class="font-semibold text-base mb-1">Límite de crédito</h3>
        <p class="text-sm mb-4" style="color: var(--muted);">{{ selectedCustomer.name }}</p>
        <form @submit.prevent="updateCreditLimit" class="space-y-3">
          <div>
            <label class="block text-xs font-medium mb-1" style="color: var(--muted);">Nuevo límite</label>
            <input v-model.number="creditLimitForm.limit" type="number" step="0.01" min="0" class="input-field" required />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCreditLimitModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" class="btn-primary flex-1">Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAccountsReceivableStore } from '@/stores/accountsReceivable'
import AppHeader from '@/components/AppHeader.vue'

const authStore = useAuthStore()
const accountsStore = useAccountsReceivableStore()

const search = ref('')
const showPaymentModal = ref(false)
const showMovementsModal = ref(false)
const showCreditLimitModal = ref(false)
const selectedCustomer = ref(null)
const movements = ref([])
const paymentForm = ref({ amount: 0, method: 'cash', notes: '' })
const creditLimitForm = ref({ limit: 500 })

const filteredCustomers = computed(() => {
  if (!search.value) return accountsStore.customers
  const t = search.value.toLowerCase()
  return accountsStore.customers.filter(c => c.name.toLowerCase().includes(t))
})

function formatDate(d) { return new Date(d).toLocaleDateString('es-AR') }

function openPayment(customer) { selectedCustomer.value = customer; paymentForm.value = { amount: 0, method: 'cash', notes: '' }; showPaymentModal.value = true }
function editCreditLimit(customer) { selectedCustomer.value = customer; creditLimitForm.value.limit = customer.creditLimit || 500; showCreditLimitModal.value = true }

async function viewMovements(customer) {
  selectedCustomer.value = customer
  const result = await accountsStore.getCustomerMovements(customer.id, '2000-01-01', '2099-12-31')
  movements.value = result.movements || []
  showMovementsModal.value = true
}

async function recordPayment() {
  if (!selectedCustomer.value || paymentForm.value.amount <= 0) return
  const result = await accountsStore.recordPayment(selectedCustomer.value.id, paymentForm.value.amount, paymentForm.value.method, paymentForm.value.notes, authStore.user.id)
  if (result.success) { showPaymentModal.value = false; alert('Pago registrado ✓') }
  else alert(result.error)
}

async function updateCreditLimit() {
  if (!selectedCustomer.value) return
  const result = await accountsStore.updateCustomerCreditLimit(selectedCustomer.value.id, creditLimitForm.value.limit)
  if (result.success) { showCreditLimitModal.value = false; alert('Límite actualizado ✓') }
}

onMounted(() => accountsStore.loadCustomers())
</script>
