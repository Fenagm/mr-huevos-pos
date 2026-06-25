<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Logística - Rutas de Envío</h1>
        <nav class="flex items-center space-x-4">
          <router-link to="/pos" class="text-gray-600 hover:text-gray-800">POS</router-link>
          <router-link to="/reports" class="text-gray-600 hover:text-gray-800">Reportes</router-link>
          <router-link to="/customers" class="text-gray-600 hover:text-gray-800">Clientes</router-link>
          <router-link to="/logistics" class="text-blue-600 font-medium">Logística</router-link>
          <button @click="handleLogout" class="btn-danger ml-4">Salir</button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Flota de reparto</h2>
          <button @click="showVehicleForm = !showVehicleForm" class="btn-primary">+ Vehículo</button>
        </div>
        <form v-if="showVehicleForm" @submit.prevent="saveVehicle" class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <input v-model="vehicleForm.name" class="input-field" placeholder="Nombre del vehículo" required />
          <input v-model="vehicleForm.license_plate" class="input-field" placeholder="Patente" />
          <input v-model.number="vehicleForm.capacity" type="number" min="1" class="input-field" placeholder="Capacidad máx. bultos/maples" required />
          <button class="btn-primary">Guardar vehículo</button>
        </form>
      </div>

      <!-- Date Selector -->
      <div class="card mb-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Seleccionar Fecha de Entrega</h2>
          <input 
            v-model="selectedDate" 
            type="date" 
            @change="loadDeliveriesForDate"
            class="input-field max-w-xs"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Pending Deliveries (Left Column) -->
        <div class="lg:col-span-1">
          <div class="card sticky top-4">
            <h3 class="text-lg font-semibold mb-4">Entregas Pendientes</h3>
            <p class="text-sm text-gray-500 mb-4">Fecha: {{ formatDate(selectedDate) }}</p>
            
            <div v-if="pendingDeliveries.length === 0" class="text-gray-500 text-center py-8">
              No hay entregas pendientes para esta fecha
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="delivery in pendingDeliveries" 
                :key="delivery.id"
                class="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="font-medium">{{ delivery.customer_name }}</span>
                  <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pendiente</span>
                </div>
                <div class="text-sm text-gray-600 mb-1">
                  📍 {{ delivery.customer_address }}
                </div>
                <div class="text-sm text-gray-600 mb-1">
                  📦 {{ delivery.total_bultos }} bultos
                </div>
                <div class="text-sm text-gray-600 mb-3">
                  📞 {{ delivery.customer_phone }}
                </div>
                
                <label class="block text-sm font-medium text-gray-700 mb-1">Asignar vehículo:</label>
                <select 
                  v-model="delivery.temp_vehicle_id"
                  @change="confirmAssignment(delivery)"
                  class="input-field text-sm"
                >
                  <option value="">-- Seleccionar --</option>
                  <option 
                    v-for="vehicle in availableVehicles" 
                    :key="vehicle.id"
                    :value="vehicle.id"
                  >
                    {{ vehicle.name }} (Cap: {{ vehicle.capacity }})
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Vehicle Routes (Right Column - 2 columns) -->
        <div class="lg:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="vehicle in vehicles" 
              :key="vehicle.id"
              class="card"
              :class="{ 'ring-2 ring-blue-500': getVehicleLoad(vehicle.id) > 0 }"
            >
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">{{ vehicle.name }}</h3>
                <span class="text-xs bg-gray-200 px-2 py-1 rounded">{{ vehicle.license_plate }}</span>
              </div>
              <button
                v-if="getVehicleDeliveries(vehicle.id).length > 1"
                @click="generateOptimalRoute(vehicle.id)"
                class="w-full mb-4 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Generar hoja de ruta óptima
              </button>
              
              <!-- Capacity Indicator -->
              <div class="mb-4">
                <div class="flex justify-between text-sm mb-1">
                  <span>Carga: {{ getVehicleLoad(vehicle.id) }} / {{ vehicle.capacity }} bultos</span>
                  <span 
                    class="font-medium"
                    :class="{
                      'text-green-600': getVehicleRemainingCapacity(vehicle.id) >= 50,
                      'text-yellow-600': getVehicleRemainingCapacity(vehicle.id) > 0 && getVehicleRemainingCapacity(vehicle.id) < 50,
                      'text-red-600': getVehicleRemainingCapacity(vehicle.id) <= 0
                    }"
                  >
                    Restante: {{ getVehicleRemainingCapacity(vehicle.id) }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    class="h-3 rounded-full transition-all duration-300"
                    :class="{
                      'bg-green-500': getVehicleLoadPercentage(vehicle.id) < 70,
                      'bg-yellow-500': getVehicleLoadPercentage(vehicle.id) >= 70 && getVehicleLoadPercentage(vehicle.id) < 90,
                      'bg-red-500': getVehicleLoadPercentage(vehicle.id) >= 90
                    }"
                    :style="{ width: Math.min(getVehicleLoadPercentage(vehicle.id), 100) + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Assigned Deliveries -->
              <div v-if="getVehicleDeliveries(vehicle.id).length === 0" class="text-gray-400 text-sm text-center py-4">
                Sin entregas asignadas
              </div>

              <div v-else class="space-y-2">
                <div 
                  v-for="(delivery, index) in getVehicleDeliveries(vehicle.id)" 
                  :key="delivery.id"
                  class="border rounded-lg p-3 bg-gray-50"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="bg-blue-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                        {{ delivery.route_order || index + 1 }}
                      </span>
                      <span class="font-medium text-sm">{{ delivery.customer_name }}</span>
                    </div>
                    <button 
                      @click="unassignDelivery(delivery)"
                      class="text-red-600 hover:text-red-800 text-sm"
                      title="Quitar de ruta"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="text-xs text-gray-600 ml-8">
                    📍 {{ delivery.customer_address }}
                  </div>
                  <div class="text-xs text-gray-600 ml-8">
                    📦 {{ delivery.total_bultos }} bultos
                  </div>
                  
                  <!-- Route Order Controls -->
                  <div class="flex items-center space-x-2 mt-2 ml-8">
                    <button 
                      @click="moveDeliveryUp(delivery, vehicle.id)"
                      :disabled="index === 0"
                      class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded disabled:opacity-50"
                    >
                      ↑ Subir
                    </button>
                    <button 
                      @click="moveDeliveryDown(delivery, vehicle.id)"
                      :disabled="index === getVehicleDeliveries(vehicle.id).length - 1"
                      class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded disabled:opacity-50"
                    >
                      ↓ Bajar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="routeSheet" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="card w-full max-w-2xl">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold">Hoja de ruta óptima</h3>
            <p class="text-sm text-gray-500">{{ routeSheet.vehicleName }} · {{ formatDate(selectedDate) }}</p>
          </div>
          <button @click="routeSheet = null" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <ol class="space-y-3 list-decimal list-inside">
          <li v-for="delivery in routeSheet.deliveries" :key="delivery.id" class="border rounded-lg p-3 bg-gray-50">
            <strong>{{ delivery.customer_name }}</strong> — {{ delivery.customer_address }}
            <div class="text-xs text-gray-600 ml-5">{{ delivery.total_bultos }} bultos · Tel: {{ delivery.customer_phone }}</div>
          </li>
        </ol>
        <p class="mt-4 text-xs text-gray-500">Criterio demo: ordenamiento por dirección para agrupar paradas cercanas; listo para reemplazar por integración geográfica en producción.</p>
      </div>
    </div>

    <!-- Capacity Warning Modal -->
    <div v-if="showCapacityWarning" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="card w-full max-w-md bg-red-50 border-2 border-red-500">
        <div class="flex items-center space-x-3 mb-4">
          <span class="text-3xl">⚠️</span>
          <h3 class="text-lg font-bold text-red-800">¡Excede Capacidad!</h3>
        </div>
        <p class="text-red-700 mb-4">{{ capacityWarningMessage }}</p>
        <div class="flex justify-end">
          <button @click="showCapacityWarning = false" class="btn-primary bg-red-600 hover:bg-red-700">
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLogisticsStore } from '@/stores/logistics'

const router = useRouter()
const authStore = useAuthStore()
const logisticsStore = useLogisticsStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const showCapacityWarning = ref(false)
const capacityWarningMessage = ref('')
const pendingDeliveryToAssign = ref(null)
const showVehicleForm = ref(false)
const vehicleForm = ref({ name: '', license_plate: '', capacity: 0 })
const routeSheet = ref(null)

// Computed
const vehicles = computed(() => logisticsStore.vehicles)
const pendingDeliveries = computed(() => logisticsStore.pendingDeliveriesForDate)

const availableVehicles = computed(() => {
  return logisticsStore.vehicles.filter(v => v.active)
})

// Methods
function getVehicleLoad(vehicleId) {
  return logisticsStore.getVehicleLoad(vehicleId)
}

function getVehicleRemainingCapacity(vehicleId) {
  return logisticsStore.getVehicleRemainingCapacity(vehicleId)
}

function getVehicleLoadPercentage(vehicleId) {
  const vehicle = vehicles.value.find(v => v.id === vehicleId)
  if (!vehicle || vehicle.capacity === 0) return 0
  return (getVehicleLoad(vehicleId) / vehicle.capacity) * 100
}

function getVehicleDeliveries(vehicleId) {
  return logisticsStore.deliveries
    .filter(d => d.vehicle_id === vehicleId && d.delivery_date === selectedDate.value)
    .sort((a, b) => (a.route_order || 0) - (b.route_order || 0))
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

async function loadDeliveriesForDate() {
  await logisticsStore.loadDeliveries(selectedDate.value)
}

async function saveVehicle() {
  const result = await logisticsStore.saveVehicle(vehicleForm.value)
  if (result.success) {
    vehicleForm.value = { name: '', license_plate: '', capacity: 0 }
    showVehicleForm.value = false
  }
}

async function confirmAssignment(delivery) {
  if (!delivery.temp_vehicle_id) return
  
  const vehicleId = parseInt(delivery.temp_vehicle_id)
  
  // Check if it would exceed capacity
  if (logisticsStore.wouldExceedCapacity(vehicleId, delivery.total_bultos)) {
    capacityWarningMessage.value = `No se puede asignar esta entrega al vehículo seleccionado. 
      La entrega requiere ${delivery.total_bultos} bultos, pero solo quedan ${logisticsStore.getVehicleRemainingCapacity(vehicleId)} bultos disponibles.
      
      Capacidad restante: ${logisticsStore.getVehicleRemainingCapacity(vehicleId)} bultos`
    showCapacityWarning.value = true
    delivery.temp_vehicle_id = ''
    return
  }
  
  // Proceed with assignment
  const result = await logisticsStore.assignDeliveryToVehicle(delivery.id, vehicleId)
  
  if (result.success) {
    delivery.temp_vehicle_id = ''
    // Auto-assign route order if not set
    const vehicleDeliveries = getVehicleDeliveries(vehicleId)
    const nextOrder = vehicleDeliveries.length + 1
    await logisticsStore.updateRouteOrder(delivery.id, nextOrder)
    await loadDeliveriesForDate()
  } else {
    capacityWarningMessage.value = result.error
    showCapacityWarning.value = true
    delivery.temp_vehicle_id = ''
  }
}

async function generateOptimalRoute(vehicleId) {
  const vehicle = vehicles.value.find(v => v.id === vehicleId)
  const optimized = [...getVehicleDeliveries(vehicleId)].sort((a, b) =>
    (a.customer_address || '').localeCompare(b.customer_address || '', 'es')
  )

  for (const [index, delivery] of optimized.entries()) {
    await logisticsStore.updateRouteOrder(delivery.id, index + 1)
  }

  await loadDeliveriesForDate()
  routeSheet.value = {
    vehicleName: vehicle?.name || 'Vehículo',
    deliveries: optimized.map((delivery, index) => ({ ...delivery, route_order: index + 1 })),
  }
}

async function unassignDelivery(delivery) {
  if (!confirm(`¿Quitar "${delivery.customer_name}" de la ruta?`)) return
  
  await logisticsStore.unassignDelivery(delivery.id)
  await loadDeliveriesForDate()
}

async function moveDeliveryUp(delivery, vehicleId) {
  const deliveries = getVehicleDeliveries(vehicleId)
  const currentIndex = deliveries.findIndex(d => d.id === delivery.id)
  
  if (currentIndex > 0) {
    const previousDelivery = deliveries[currentIndex - 1]
    
    // Swap route orders
    await logisticsStore.updateRouteOrder(delivery.id, previousDelivery.route_order || currentIndex)
    await logisticsStore.updateRouteOrder(previousDelivery.id, delivery.route_order || currentIndex + 1)
    
    await loadDeliveriesForDate()
  }
}

async function moveDeliveryDown(delivery, vehicleId) {
  const deliveries = getVehicleDeliveries(vehicleId)
  const currentIndex = deliveries.findIndex(d => d.id === delivery.id)
  
  if (currentIndex < deliveries.length - 1) {
    const nextDelivery = deliveries[currentIndex + 1]
    
    // Swap route orders
    await logisticsStore.updateRouteOrder(delivery.id, nextDelivery.route_order || currentIndex + 2)
    await logisticsStore.updateRouteOrder(nextDelivery.id, delivery.route_order || currentIndex + 1)
    
    await loadDeliveriesForDate()
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

// Load initial data
onMounted(async () => {
  await logisticsStore.loadVehicles()
  await loadDeliveriesForDate()
})
</script>
