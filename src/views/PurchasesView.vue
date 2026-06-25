<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Compras</h1>
          <p class="text-sm text-gray-500">Sucursal: {{ authStore.currentBranch?.name || 'Sin sucursal' }}</p>
        </div>
        <nav class="flex items-center space-x-4">
          <router-link to="/pos" class="text-gray-600 hover:text-gray-800">POS</router-link>
          <router-link to="/inventory" class="text-gray-600 hover:text-gray-800">Inventario</router-link>
          <router-link to="/purchases" class="text-blue-600 font-medium">Compras</router-link>
          <button @click="handleLogout" class="btn-danger ml-4">Salir</button>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section class="card lg:col-span-1">
          <h2 class="text-xl font-semibold mb-4">Registrar compra</h2>
          <form @submit.prevent="savePurchase" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
              <input v-model="form.product" class="input-field" placeholder="Ej: Huevo Blanco (30u)" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
              <input v-model="form.supplier" class="input-field" placeholder="Nombre del proveedor" required />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <input v-model.number="form.quantity" type="number" min="1" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Precio total</label>
                <input v-model.number="form.totalPrice" type="number" min="0" step="0.01" class="input-field" required />
              </div>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              Precio por unidad: <strong>${{ unitPrice.toFixed(2) }}</strong>
            </div>
            <button class="btn-primary w-full">Guardar compra</button>
          </form>
        </section>

        <section class="card lg:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Historial de compras</h2>
            <span class="text-sm text-gray-500">Total compras: ${{ totalPurchases.toFixed(2) }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Proveedor</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Cantidad</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Precio total</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Precio unidad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in branchPurchases" :key="purchase.id" class="border-t">
                  <td class="px-4 py-3 text-sm">{{ formatDate(purchase.date) }}</td>
                  <td class="px-4 py-3 text-sm font-medium">{{ purchase.product }}</td>
                  <td class="px-4 py-3 text-sm">{{ purchase.supplier }}</td>
                  <td class="px-4 py-3 text-sm">{{ purchase.quantity }}</td>
                  <td class="px-4 py-3 text-sm">${{ purchase.totalPrice.toFixed(2) }}</td>
                  <td class="px-4 py-3 text-sm">${{ purchase.unitPrice.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'

const router = useRouter()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

const purchases = ref([])
const form = ref({ product: '', supplier: '', quantity: 1, totalPrice: 0 })
const unitPrice = computed(() => form.value.quantity > 0 ? Number(form.value.totalPrice || 0) / form.value.quantity : 0)
const branchPurchases = computed(() => purchases.value.filter((p) => p.branchId === authStore.currentBranch?.id))
const totalPurchases = computed(() => branchPurchases.value.reduce((sum, p) => sum + p.totalPrice, 0))

function savePurchase() {
  const newPurchase = {
    id: Date.now(),
    ...form.value,
    unitPrice: unitPrice.value,
    branchId: authStore.currentBranch?.id,
    date: new Date().toISOString(),
  }
  purchases.value.unshift(newPurchase)
  
  // Actualizar el costo del producto si existe en el inventario
  const existingProduct = inventoryStore.products.find(p => p.name === form.value.product && p.branchId === authStore.currentBranch?.id)
  if (existingProduct) {
    existingProduct.costPrice = unitPrice.value
  }
  
  form.value = { product: '', supplier: '', quantity: 1, totalPrice: 0 }
}
function formatDate(value) { return new Date(value).toLocaleDateString('es-AR') }
function handleLogout() { authStore.logout(); router.push('/') }

onMounted(() => {
  inventoryStore.loadProducts(authStore.currentBranch?.id)
})
</script>
