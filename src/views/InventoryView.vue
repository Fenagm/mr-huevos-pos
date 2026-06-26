<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Inventario</h1>
          <p class="text-sm text-gray-500">{{ authStore.currentBranch?.name || 'Sin sucursal' }}</p>
        </div>
        <nav class="flex items-center space-x-4">
          <router-link to="/pos" class="text-gray-600 hover:text-gray-800">POS</router-link>
          <router-link to="/reports" class="text-gray-600 hover:text-gray-800">Reportes</router-link>
          <router-link to="/customers" class="text-gray-600 hover:text-gray-800">Clientes</router-link>
          <router-link to="/inventory" class="text-blue-600 font-medium">Inventario</router-link>
          <router-link to="/purchases" class="text-gray-600 hover:text-gray-800">Compras</router-link>
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
            <h3 class="text-lg font-semibold mb-4">Acciones</h3>
            <button v-if="authStore.isAdmin" @click="showProductModal = true; editingProduct = null" class="w-full btn-primary mb-2">
              + Nuevo Producto
            </button>
            <button v-if="authStore.isAdmin" @click="showSpoilageModal = true" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              🗑️ Registrar Merma
            </button>
          </div>

          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Resumen</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Total Productos:</span>
                <span class="font-medium">{{ inventoryStore.products.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Valor Inventario:</span>
                <span class="font-medium">${{ inventoryStore.totalInventoryValue.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-red-600">
                <span>Stock Bajo:</span>
                <span class="font-medium">{{ inventoryStore.lowStockProducts.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="lg:col-span-3">
          <div class="card">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Productos</h2>
              <input 
                v-model="search" 
                type="text" 
                placeholder="Buscar producto..." 
                class="input-field max-w-xs"
              />
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Minorista</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Mayorista</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="product in filteredProducts" 
                    :key="product.id" 
                    class="border-t"
                    :class="{'bg-red-50': product.stock < 20}"
                  >
                    <td class="px-4 py-3 text-sm font-medium">{{ product.name }}</td>
                    <td class="px-4 py-3 text-sm">${{ product.retailPrice?.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-sm">${{ product.wholesalePrice?.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="product.stock < 20 ? 'text-red-600 font-bold' : ''">
                        {{ product.stock }}
                      </span>
                      <span v-if="product.stock < 20" class="text-xs text-red-600 ml-1">(Bajo)</span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <span :class="product.active ? 'text-green-600' : 'text-gray-400'">
                        {{ product.active ? '✓ Activo' : '✕ Inactivo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <button @click="editProduct(product)" class="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                      <button v-if="authStore.isAdmin" @click="toggleProductActive(product)" class="text-gray-600 hover:text-gray-800">
                        {{ product.active ? 'Desactivar' : 'Activar' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="filteredProducts.length === 0" class="text-center py-8 text-gray-500">
              No se encontraron productos
            </div>
          </div>

          <!-- Spoilages Section -->
          <div class="card mt-6">
            <h3 class="text-lg font-semibold mb-4">Mermas y Roturas</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Cantidad</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Motivo</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Pérdida</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="spoilage in inventoryStore.spoilages" :key="spoilage.id" class="border-t">
                    <td class="px-4 py-3 text-sm">{{ formatDate(spoilage.createdAt) }}</td>
                    <td class="px-4 py-3 text-sm">{{ getProductName(spoilage.productId) }}</td>
                    <td class="px-4 py-3 text-sm">{{ spoilage.quantity }}</td>
                    <td class="px-4 py-3 text-sm">{{ spoilage.reason }}</td>
                    <td class="px-4 py-3 text-sm text-red-600">${{ calculateLoss(spoilage).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="inventoryStore.spoilages.length === 0" class="text-center py-4 text-gray-500">
              No hay mermas registradas
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Product Modal -->
    <div v-if="showProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="card w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
        <form @submit.prevent="saveProduct" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input v-model="productForm.name" type="text" class="input-field" :disabled="authStore.isManager && !authStore.isAdmin" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Costo de Compra</label>
            <input v-model.number="productForm.costPrice" type="number" step="0.01" min="0" class="input-field" :disabled="authStore.isManager && !authStore.isAdmin" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Precio Minorista</label>
            <input v-model.number="productForm.retailPrice" type="number" step="0.01" min="0" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Precio Mayorista</label>
            <input v-model.number="productForm.wholesalePrice" type="number" step="0.01" min="0" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Stock Inicial</label>
            <input v-model.number="productForm.stock" type="number" min="0" class="input-field" :disabled="authStore.isManager && !authStore.isAdmin" required />
          </div>
          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showProductModal = false" class="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" class="flex-1 btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Spoilage Modal -->
    <div v-if="showSpoilageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="card w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4 text-red-600">Registrar Merma/Rotura</h3>
        <form @submit.prevent="registerSpoilage" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
            <select v-model="spoilageForm.productId" class="input-field" required>
              <option value="">-- Seleccionar --</option>
              <option v-for="product in inventoryStore.products" :key="product.id" :value="product.id">
                {{ product.name }} (Stock: {{ product.stock }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
            <input v-model.number="spoilageForm.quantity" type="number" min="1" class="input-field" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
            <select v-model="spoilageForm.reason" class="input-field" required>
              <option value="Roto">Roto</option>
              <option value="Vencido">Vencido</option>
              <option value="Dañado">Dañado</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
            <textarea v-model="spoilageForm.notes" class="input-field" rows="2"></textarea>
          </div>
          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showSpoilageModal = false" class="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Registrar Pérdida</button>
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
import { useInventoryStore } from '@/stores/inventory'

const router = useRouter()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

const search = ref('')
const showProductModal = ref(false)
const showSpoilageModal = ref(false)
const editingProduct = ref(null)

const productForm = ref({
  name: '',
  costPrice: 0,
  retailPrice: 0,
  wholesalePrice: 0,
  stock: 0,
  branchId: 1
})

const spoilageForm = ref({
  productId: '',
  quantity: 1,
  reason: 'Roto',
  notes: ''
})

const filteredProducts = computed(() => {
  if (!search.value) return inventoryStore.products
  const term = search.value.toLowerCase()
  return inventoryStore.products.filter(p => p.name.toLowerCase().includes(term))
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-AR')
}

function getProductName(productId) {
  const product = inventoryStore.products.find(p => p.id === productId)
  return product ? product.name : 'Desconocido'
}

function calculateLoss(spoilage) {
  const product = inventoryStore.products.find(p => p.id === spoilage.productId)
  return product ? product.costPrice * spoilage.quantity : 0
}

function editProduct(product) {
  editingProduct.value = product
  productForm.value = { ...product }
  showProductModal.value = true
}

async function saveProduct() {
  const result = await inventoryStore.saveProduct({
    ...productForm.value,
    id: editingProduct.value?.id,
    branchId: authStore.currentBranch?.id || productForm.value.branchId
  })
  
  if (result.success) {
    showProductModal.value = false
    editingProduct.value = null
    productForm.value = { name: '', costPrice: 0, retailPrice: 0, wholesalePrice: 0, stock: 0, branchId: 1 }
    alert('Producto guardado')
  }
}

async function toggleProductActive(product) {
  const previous = product.active
  product.active = !product.active
  const result = await inventoryStore.saveProduct(product)
  if (!result.success) {
    product.active = previous
    alert('Error al cambiar el estado del producto')
  }
}

async function registerSpoilage() {
  if (!spoilageForm.value.productId) {
    alert('Seleccione un producto')
    return
  }
  
  const result = await inventoryStore.registerSpoilage({
    productId: parseInt(spoilageForm.value.productId),
    quantity: spoilageForm.value.quantity,
    reason: spoilageForm.value.reason,
    notes: spoilageForm.value.notes,
    userId: authStore.user.id,
    branchId: authStore.currentBranch?.id
  })
  
  if (result.success) {
    showSpoilageModal.value = false
    spoilageForm.value = { productId: '', quantity: 1, reason: 'Roto', notes: '' }
    alert('Merma registrada')
  } else {
    alert(result.error)
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await inventoryStore.loadProducts(authStore.currentBranch?.id)
})
</script>
