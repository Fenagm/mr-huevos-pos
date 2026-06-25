<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Mr Huevos POS</h1>
        <nav class="flex items-center space-x-4">
          <router-link to="/pos" class="text-blue-600 font-medium">POS</router-link>
          <router-link to="/reports" class="text-gray-600 hover:text-gray-800">Reportes</router-link>
          <router-link to="/customers" class="text-gray-600 hover:text-gray-800">Clientes</router-link>
          <router-link v-if="authStore.user?.role === 'admin'" to="/logistics" class="text-gray-600 hover:text-gray-800">Logística</router-link>
          <button @click="handleLogout" class="btn-danger ml-4">Salir</button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Products -->
        <div class="lg:col-span-2">
          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Productos</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button 
                v-for="product in products" 
                :key="product.id"
                @click="addToCart(product)"
                class="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-left"
              >
                <div class="font-medium">{{ product.name }}</div>
                <div class="text-sm text-gray-600">${{ product.price.toFixed(2) }}</div>
                <div class="text-xs text-gray-500">Stock: {{ product.stock }}</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart -->
        <div>
          <div class="card sticky top-4">
            <h2 class="text-xl font-semibold mb-4">Carrito</h2>
            
            <div v-if="cart.length === 0" class="text-gray-500 text-center py-8">
              Carrito vacío
            </div>

            <div v-else class="space-y-3 mb-4">
              <div 
                v-for="(item, index) in cart" 
                :key="index"
                class="flex justify-between items-center py-2 border-b"
              >
                <div>
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-gray-600">
                    ${{ item.price.toFixed(2) }} x {{ item.quantity }}
                  </div>
                </div>
                <button 
                  @click="removeFromCart(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between text-lg font-semibold mb-4">
                <span>Total:</span>
                <span>${{ total.toFixed(2) }}</span>
              </div>

              <!-- For Delivery Checkbox (Admin only) -->
              <div v-if="authStore.user?.role === 'admin'" class="mb-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    v-model="isForDelivery" 
                    type="checkbox" 
                    class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span class="text-gray-700 font-medium">📦 Para Envío</span>
                </label>
              </div>

              <!-- Delivery Options (shown when For Delivery is checked) -->
              <div v-if="isForDelivery" class="mb-4 p-3 bg-blue-50 rounded-lg space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
                  <input 
                    v-model="deliveryDate" 
                    type="date" 
                    class="input-field"
                    :min="today"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select v-model="selectedCustomerId" class="input-field">
                    <option value="">-- Seleccionar Cliente --</option>
                    <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                      {{ customer.name }}
                    </option>
                  </select>
                </div>
                <div v-if="selectedCustomer">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input 
                    v-model="deliveryAddress" 
                    type="text" 
                    class="input-field"
                    placeholder="Dirección de entrega"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Total Bultos</label>
                  <input 
                    v-model.number="totalBultos" 
                    type="number" 
                    class="input-field"
                    placeholder="Cantidad de maples/bultos"
                  />
                </div>
              </div>

              <button 
                @click="processSale"
                :disabled="cart.length === 0 || processing || (isForDelivery && !validateDeliveryForm())"
                class="btn-primary w-full"
              >
                {{ processing ? 'Procesando...' : (isForDelivery ? 'Registrar para Envío' : 'Cobrar') }}
              </button>
              
              <p v-if="isForDelivery && !validateDeliveryForm()" class="text-xs text-red-600 mt-2">
                ⚠️ Complete todos los campos de entrega
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Customer Modal -->
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
import { useLogisticsStore } from '@/stores/logistics'

const router = useRouter()
const authStore = useAuthStore()
const logisticsStore = useLogisticsStore()

// Demo products
const products = ref([
  { id: 1, name: 'Huevo Blanco (30u)', price: 4.50, stock: 100 },
  { id: 2, name: 'Huevo Rojo (30u)', price: 4.80, stock: 80 },
  { id: 3, name: 'Huevo Orgánico (15u)', price: 3.20, stock: 50 },
  { id: 4, name: 'Huevo de Codorniz (24u)', price: 2.50, stock: 60 },
  { id: 5, name: 'Huevo Azul (30u)', price: 5.00, stock: 40 },
  { id: 6, name: 'Cartón Vacío', price: 0.50, stock: 200 },
])

const cart = ref([])
const processing = ref(false)

// Delivery-related state
const isForDelivery = ref(false)
const deliveryDate = ref('')
const selectedCustomerId = ref('')
const deliveryAddress = ref('')
const totalBultos = ref(0)
const showModal = ref(false)
const newCustomer = ref({ name: '', email: '', phone: '' })

// Demo customers
const customers = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@email.com', phone: '555-1234', address: 'Calle Falsa 123' },
  { id: 2, name: 'María García', email: 'maria@email.com', phone: '555-5678', address: 'Av. Siempre Viva 742' },
  { id: 3, name: 'Carlos López', email: 'carlos@email.com', phone: '555-9012', address: 'Belgrano 456' },
])

const today = new Date().toISOString().split('T')[0]

const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const selectedCustomer = computed(() => {
  return customers.value.find(c => c.id === selectedCustomerId.value)
})

function addToCart(product) {
  const existingItem = cart.value.find(item => item.id === product.id)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.value.push({ ...product, quantity: 1 })
  }
}

function removeFromCart(index) {
  cart.value.splice(index, 1)
}

function validateDeliveryForm() {
  return deliveryDate.value && selectedCustomerId.value && deliveryAddress.value && totalBultos.value > 0
}

async function processSale() {
  processing.value = true

  try {
    const saleData = {
      items: cart.value,
      total: total.value,
      userId: authStore.user?.id,
    }

    // If it's for delivery, include delivery information
    if (isForDelivery.value) {
      const customer = customers.value.find(c => c.id === selectedCustomerId.value)
      saleData.isForDelivery = true
      saleData.deliveryDate = deliveryDate.value
      saleData.customerId = selectedCustomerId.value
      saleData.customerName = customer?.name
      saleData.customerAddress = deliveryAddress.value
      saleData.customerPhone = customer?.phone
      saleData.totalBultos = totalBultos.value
    }

    const response = await fetch('/.netlify/functions/create-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData),
    })

    if (response.ok) {
      alert('Venta registrada con éxito')
      
      // If it's for delivery, create a delivery record
      if (isForDelivery.value) {
        const customer = customers.value.find(c => c.id === selectedCustomerId.value)
        await logisticsStore.createDelivery({
          saleId: Date.now(), // In real app, this would come from the sale response
          customerName: customer?.name,
          customerAddress: deliveryAddress.value,
          customerPhone: customer?.phone,
          deliveryDate: deliveryDate.value,
          totalBultos: totalBultos.value,
        })
        alert('Entrega programada exitosamente')
        
        // Reset delivery form
        isForDelivery.value = false
        deliveryDate.value = ''
        selectedCustomerId.value = ''
        deliveryAddress.value = ''
        totalBultos.value = 0
      }
      
      cart.value = []
    } else {
      throw new Error('Error al registrar venta')
    }
  } catch (error) {
    // Demo mode
    alert('Venta registrada (modo demo)')
    
    // If it's for delivery in demo mode
    if (isForDelivery.value) {
      const customer = customers.value.find(c => c.id === selectedCustomerId.value)
      await logisticsStore.createDelivery({
        saleId: Date.now(),
        customerName: customer?.name,
        customerAddress: deliveryAddress.value,
        customerPhone: customer?.phone,
        deliveryDate: deliveryDate.value,
        totalBultos: totalBultos.value,
      })
      alert('Entrega programada exitosamente (modo demo)')
      
      // Reset delivery form
      isForDelivery.value = false
      deliveryDate.value = ''
      selectedCustomerId.value = ''
      deliveryAddress.value = ''
      totalBultos.value = 0
    }
    
    cart.value = []
  } finally {
    processing.value = false
  }
}

function saveCustomer() {
  customers.value.push({
    id: Date.now(),
    ...newCustomer.value,
    address: '',
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
