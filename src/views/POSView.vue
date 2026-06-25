<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Mr Huevos POS</h1>
          <p class="text-sm text-gray-500">Sucursal activa: {{ authStore.currentBranch?.name || 'Sin sucursal' }} · {{ roleLabel }}</p>
        </div>
        <nav class="flex items-center space-x-4">
          <router-link to="/pos" class="text-blue-600 font-medium">POS</router-link>
          <router-link v-if="authStore.canViewReports()" to="/reports" class="text-gray-600 hover:text-gray-800">Balances</router-link>
          <router-link v-if="authStore.canAccessInventory()" to="/inventory" class="text-gray-600 hover:text-gray-800">Configuración</router-link>
          <router-link v-if="authStore.canAccessAccountsReceivable()" to="/accounts-receivable" class="text-gray-600 hover:text-gray-800">Cuentas Corrientes</router-link>
          <router-link v-if="authStore.canAccessLogistics()" to="/logistics" class="text-gray-600 hover:text-gray-800">Logística</router-link>
          <button @click="handleLogout" class="btn-danger ml-4">Salir</button>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <section class="lg:col-span-3 space-y-6">
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">Mostrador rápido</h2>
              <div class="flex gap-2">
                <button v-for="quick in quickFormats" :key="quick.name" @click="addQuickFormat(quick)" class="bg-yellow-100 hover:bg-yellow-200 px-4 py-3 rounded-lg font-semibold">
                  {{ quick.name }}<br><span class="text-xs">${{ quick.price.toFixed(2) }}</span>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <button v-for="product in branchProducts" :key="product.id" @click="addToCart(product)" class="p-4 border rounded-lg bg-white hover:bg-blue-50 hover:border-blue-500 transition-colors text-left">
                <div class="font-medium">{{ product.name }}</div>
                <div class="text-sm text-gray-600">Minorista ${{ product.price.toFixed(2) }}</div>
                <div class="text-xs text-gray-500">Stock sucursal: {{ product.stock }}</div>
              </button>
            </div>
          </div>

          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Caja diaria</h2>
            <div v-if="!cashStore.isOpen" class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Efectivo inicial</label>
                <input v-model.number="initialCash" type="number" min="0" step="0.01" class="input-field" />
              </div>
              <button @click="openCash" class="btn-primary">Abrir caja</button>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div class="text-sm"><strong>Caja abierta</strong><br>Inicial: ${{ cashStore.currentSession.initialCash.toFixed(2) }}</div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gasto caja chica</label>
                <input v-model="expense.description" placeholder="Concepto" class="input-field mb-1" />
                <input v-model.number="expense.amount" type="number" min="0" step="0.01" placeholder="Monto" class="input-field" />
              </div>
              <button @click="addExpense" class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Registrar gasto</button>
              <div>
                <input v-model.number="finalCash" type="number" min="0" step="0.01" placeholder="Recuento final" class="input-field mb-1" />
                <button @click="closeCash" class="btn-danger w-full">Cerrar caja</button>
              </div>
            </div>
          </div>
        </section>

        <aside>
          <div class="card sticky top-4">
            <h2 class="text-xl font-semibold mb-4">Carrito</h2>
            <div v-if="cart.length === 0" class="text-gray-500 text-center py-8">Carrito vacío</div>
            <div v-else class="space-y-3 mb-4">
              <div v-for="(item, index) in cart" :key="`${item.id}-${index}`" class="flex justify-between items-center py-2 border-b">
                <div>
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-gray-600">${{ item.price.toFixed(2) }} x {{ item.quantity }}</div>
                </div>
                <button @click="removeFromCart(index)" class="text-red-600 hover:text-red-800">✕</button>
              </div>
            </div>

            <div class="space-y-3 border-t pt-4">
              <label class="block text-sm font-medium text-gray-700">Monto libre</label>
              <div class="flex gap-2">
                <input v-model.number="freeAmount" type="number" min="0" step="0.01" class="input-field" />
                <button @click="addFreeAmount" class="btn-primary">+</button>
              </div>

              <label class="block text-sm font-medium text-gray-700">Cliente frecuente</label>
              <select v-model.number="selectedCustomerId" @change="syncDeliveryAddress" class="input-field">
                <option value="">Venta mostrador</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">{{ customer.name }}</option>
              </select>

              <label class="block text-sm font-medium text-gray-700">Medio de pago obligatorio</label>
              <select v-model="paymentMethod" class="input-field" required>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="card">Tarjeta</option>
                <option :disabled="!selectedCustomer" value="account">Cuenta Corriente</option>
              </select>
              <p v-if="paymentMethod === 'account' && !selectedCustomer" class="text-xs text-red-600">Seleccione un cliente frecuente para fiar.</p>

              <div v-if="authStore.canAccessLogistics()" class="p-3 bg-blue-50 rounded-lg space-y-2">
                <label class="flex items-center space-x-2 cursor-pointer"><input v-model="isForDelivery" type="checkbox" /> <span>📦 Para Envío</span></label>
                <input v-if="isForDelivery" v-model="deliveryDate" type="date" :min="today" class="input-field" />
                <input v-if="isForDelivery" v-model="deliveryAddress" placeholder="Dirección del cliente" class="input-field" />
                <input v-if="isForDelivery" v-model.number="totalBultos" type="number" min="1" placeholder="Maples / bultos" class="input-field" />
              </div>

              <div class="flex justify-between text-lg font-semibold"><span>Total:</span><span>${{ total.toFixed(2) }}</span></div>
              <button @click="processSale" :disabled="!canCharge" class="btn-primary w-full">{{ processing ? 'Procesando...' : 'Cobrar' }}</button>
              <p v-if="!cashStore.isOpen" class="text-xs text-red-600">Debe abrir caja antes de vender.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLogisticsStore } from '@/stores/logistics'
import { useCashRegisterStore } from '@/stores/cashRegister'
import { useAccountsReceivableStore } from '@/stores/accountsReceivable'

const router = useRouter()
const authStore = useAuthStore()
const logisticsStore = useLogisticsStore()
const cashStore = useCashRegisterStore()
const accountsStore = useAccountsReceivableStore()

const products = ref([
  { id: 1, name: 'Huevo Blanco (30u)', price: 4.50, stock: 100, branchId: 1 },
  { id: 2, name: 'Huevo Rojo (30u)', price: 4.80, stock: 80, branchId: 1 },
  { id: 3, name: 'Huevo Orgánico (15u)', price: 3.20, stock: 50, branchId: 1 },
  { id: 4, name: 'Huevo Blanco (30u)', price: 4.60, stock: 70, branchId: 2 },
  { id: 5, name: 'Huevo Rojo (30u)', price: 4.90, stock: 55, branchId: 2 },
])
const quickFormats = [{ name: 'Maple', price: 4.50, bultos: 1 }, { name: 'Docena', price: 2.00, bultos: 0.4 }]
const cart = ref([])
const processing = ref(false)
const paymentMethod = ref('cash')
const freeAmount = ref(0)
const initialCash = ref(0)
const finalCash = ref(0)
const expense = ref({ description: '', amount: 0 })
const isForDelivery = ref(false)
const deliveryDate = ref('')
const deliveryAddress = ref('')
const totalBultos = ref(0)
const selectedCustomerId = ref('')
const today = new Date().toISOString().split('T')[0]

const customers = computed(() => accountsStore.customers.filter((c) => c.active))
const selectedCustomer = computed(() => customers.value.find((c) => c.id === selectedCustomerId.value))
const branchProducts = computed(() => products.value.filter((p) => p.branchId === authStore.currentBranch?.id))
const total = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const roleLabel = computed(() => ({ admin: 'Administrador', manager: 'Encargado', seller: 'Vendedor' }[authStore.user?.role] || ''))
const canCharge = computed(() => cart.value.length > 0 && cashStore.isOpen && !processing.value && paymentMethod.value && (paymentMethod.value !== 'account' || selectedCustomer.value) && (!isForDelivery.value || (deliveryDate.value && selectedCustomer.value && deliveryAddress.value && totalBultos.value > 0)))

function addToCart(product) {
  const existingItem = cart.value.find((item) => item.id === product.id)
  if (existingItem) existingItem.quantity++
  else cart.value.push({ ...product, quantity: 1 })
}
function addQuickFormat(quick) { cart.value.push({ id: `quick-${Date.now()}`, name: quick.name, price: quick.price, quantity: 1, bultos: quick.bultos }) }
function addFreeAmount() { if (freeAmount.value > 0) { cart.value.push({ id: `free-${Date.now()}`, name: 'Monto libre', price: freeAmount.value, quantity: 1 }); freeAmount.value = 0 } }
function removeFromCart(index) { cart.value.splice(index, 1) }
function syncDeliveryAddress() { deliveryAddress.value = selectedCustomer.value?.address || '' }
async function openCash() { const r = await cashStore.openSession(initialCash.value || 0, authStore.user.id, authStore.currentBranch.id); if (!r.success) alert(r.error) }
async function addExpense() { if (!expense.value.description || !expense.value.amount) return; await cashStore.addExpense(expense.value.description, expense.value.amount); expense.value = { description: '', amount: 0 } }
async function closeCash() { const r = await cashStore.closeSession(finalCash.value || 0); alert(`Caja cerrada. Diferencia: $${(r.difference || 0).toFixed(2)}`); finalCash.value = 0 }

async function processSale() {
  processing.value = true
  try {
    if (paymentMethod.value === 'account') {
      const accountResult = await accountsStore.addToAccount(selectedCustomer.value.id, total.value, 'Venta POS a cuenta corriente', authStore.user.id)
      if (!accountResult.success) throw new Error(accountResult.error)
    }
    const salePayload = { items: cart.value, total: total.value, userId: authStore.user.id, branchId: authStore.currentBranch.id, paymentMethod: paymentMethod.value, customerId: selectedCustomer.value?.id || null, isForDelivery: isForDelivery.value }
    const response = await fetch('/.netlify/functions/create-sale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(salePayload) })
    const data = response.ok ? await response.json() : { saleId: Date.now() }
    await cashStore.recordSale(total.value, paymentMethod.value)
    if (isForDelivery.value) await logisticsStore.createDelivery({ saleId: data.saleId || Date.now(), customerName: selectedCustomer.value.name, customerAddress: deliveryAddress.value, customerPhone: selectedCustomer.value.phone, deliveryDate: deliveryDate.value, totalBultos: totalBultos.value })
    cart.value = []; isForDelivery.value = false; deliveryDate.value = ''; totalBultos.value = 0; paymentMethod.value = 'cash'
    alert('Venta registrada con éxito')
  } catch (error) {
    alert(error.message || 'Error al registrar venta')
  } finally { processing.value = false }
}
function handleLogout() { authStore.logout(); router.push('/') }
onMounted(() => accountsStore.loadCustomers())
</script>
