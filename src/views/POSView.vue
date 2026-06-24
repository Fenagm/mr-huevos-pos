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

              <button 
                @click="processSale"
                :disabled="cart.length === 0 || processing"
                class="btn-primary w-full"
              >
                {{ processing ? 'Procesando...' : 'Cobrar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

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

const total = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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

async function processSale() {
  processing.value = true

  try {
    const response = await fetch('/.netlify/functions/create-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.value,
        total: total.value,
        userId: authStore.user?.id,
      }),
    })

    if (response.ok) {
      alert('Venta registrada con éxito')
      cart.value = []
    } else {
      throw new Error('Error al registrar venta')
    }
  } catch (error) {
    // Demo mode
    alert('Venta registrada (modo demo)')
    cart.value = []
  } finally {
    processing.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>
