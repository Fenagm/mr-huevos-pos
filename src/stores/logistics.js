import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLogisticsStore = defineStore('logistics', () => {
  // State
  const vehicles = ref([])
  const deliveries = ref([])
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  
  // Demo data for vehicles
  const demoVehicles = [
    { id: 1, name: 'Camión A - Grande', license_plate: 'ABC-123', capacity: 500, active: true },
    { id: 2, name: 'Camión B - Mediano', license_plate: 'DEF-456', capacity: 300, active: true },
    { id: 3, name: 'Furgoneta C - Pequeña', license_plate: 'GHI-789', capacity: 100, active: true },
  ]
  
  // Demo data for deliveries
  const demoDeliveries = [
    { 
      id: 1, 
      sale_id: 1, 
      customer_name: 'Juan Pérez', 
      customer_address: 'Calle Falsa 123', 
      customer_phone: '555-1234',
      delivery_date: new Date().toISOString().split('T')[0],
      vehicle_id: null,
      route_order: null,
      status: 'pending',
      total_bultos: 50,
      notes: ''
    },
    { 
      id: 2, 
      sale_id: 2, 
      customer_name: 'María García', 
      customer_address: 'Av. Siempre Viva 742', 
      customer_phone: '555-5678',
      delivery_date: new Date().toISOString().split('T')[0],
      vehicle_id: null,
      route_order: null,
      status: 'pending',
      total_bultos: 30,
      notes: ''
    },
    { 
      id: 3, 
      sale_id: 3, 
      customer_name: 'Carlos López', 
      customer_address: 'Belgrano 456', 
      customer_phone: '555-9012',
      delivery_date: new Date().toISOString().split('T')[0],
      vehicle_id: null,
      route_order: null,
      status: 'pending',
      total_bultos: 80,
      notes: ''
    },
  ]

  // Computed
  const pendingDeliveriesForDate = computed(() => {
    return deliveries.value.filter(d => d.delivery_date === selectedDate.value && d.status === 'pending')
  })
  
  const assignedDeliveriesForDate = computed(() => {
    return deliveries.value.filter(d => d.delivery_date === selectedDate.value && d.status !== 'pending')
  })

  function getVehicleLoad(vehicleId) {
    return deliveries.value
      .filter(d => d.vehicle_id === vehicleId && d.delivery_date === selectedDate.value)
      .reduce((sum, d) => sum + (d.total_bultos || 0), 0)
  }

  function getVehicleRemainingCapacity(vehicleId) {
    const vehicle = vehicles.value.find(v => v.id === vehicleId)
    if (!vehicle) return 0
    const currentLoad = getVehicleLoad(vehicleId)
    return vehicle.capacity - currentLoad
  }

  function wouldExceedCapacity(vehicleId, additionalBultos) {
    const remaining = getVehicleRemainingCapacity(vehicleId)
    return additionalBultos > remaining
  }

  // Actions
  async function saveVehicle(vehicle) {
    const payload = { ...vehicle, id: vehicle.id || Date.now(), active: vehicle.active ?? true }
    const index = vehicles.value.findIndex(v => v.id === payload.id)
    if (index === -1) vehicles.value.push(payload)
    else vehicles.value[index] = payload
    return { success: true, vehicle: payload }
  }

  async function loadVehicles() {
    try {
      const response = await fetch('/.netlify/functions/get-vehicles')
      if (response.ok) {
        const data = await response.json()
        vehicles.value = data.vehicles || []
      } else {
        throw new Error('Failed to load vehicles')
      }
    } catch (error) {
      // Demo mode
      vehicles.value = [...demoVehicles]
    }
  }

  async function loadDeliveries(date) {
    selectedDate.value = date
    try {
      const response = await fetch(`/.netlify/functions/get-deliveries?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        deliveries.value = data.deliveries || []
      } else {
        throw new Error('Failed to load deliveries')
      }
    } catch (error) {
      // Demo mode
      deliveries.value = demoDeliveries.map(d => ({ ...d, delivery_date: date }))
    }
  }

  async function assignDeliveryToVehicle(deliveryId, vehicleId) {
    const delivery = deliveries.value.find(d => d.id === deliveryId)
    if (!delivery) return { success: false, error: 'Entrega no encontrada' }
    
    if (!vehicleId) {
      return { success: false, error: 'Seleccione un vehículo' }
    }
    
    // Check capacity before assigning
    if (wouldExceedCapacity(vehicleId, delivery.total_bultos)) {
      return { 
        success: false, 
        error: `Excede capacidad del vehículo. Capacidad restante: ${getVehicleRemainingCapacity(vehicleId)} bultos` 
      }
    }

    try {
      const response = await fetch('/.netlify/functions/assign-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId, vehicleId }),
      })

      if (response.ok) {
        const updatedDelivery = await response.json()
        const index = deliveries.value.findIndex(d => d.id === deliveryId)
        if (index !== -1) {
          deliveries.value[index] = updatedDelivery
        }
        return { success: true }
      } else {
        throw new Error('Failed to assign delivery')
      }
    } catch (error) {
      // Demo mode - update local state
      const index = deliveries.value.findIndex(d => d.id === deliveryId)
      if (index !== -1) {
        deliveries.value[index].vehicle_id = vehicleId
        deliveries.value[index].status = 'assigned'
        // Assign next available route order
        const vehicleDeliveries = deliveries.value.filter(d => d.vehicle_id === vehicleId && d.delivery_date === selectedDate.value)
        const nextOrder = vehicleDeliveries.length + 1
        deliveries.value[index].route_order = nextOrder
      }
      return { success: true }
    }
  }

  async function updateRouteOrder(deliveryId, newOrder) {
    try {
      const response = await fetch('/.netlify/functions/update-route-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId, routeOrder: newOrder }),
      })

      if (response.ok) {
        const updatedDelivery = await response.json()
        const index = deliveries.value.findIndex(d => d.id === deliveryId)
        if (index !== -1) {
          deliveries.value[index] = updatedDelivery
        }
        return { success: true }
      } else {
        throw new Error('Failed to update route order')
      }
    } catch (error) {
      // Demo mode
      const index = deliveries.value.findIndex(d => d.id === deliveryId)
      if (index !== -1) {
        deliveries.value[index].route_order = newOrder
      }
      return { success: true }
    }
  }

  async function createDelivery(saleData) {
    const newDelivery = {
      id: Date.now(),
      sale_id: saleData.saleId,
      customer_name: saleData.customerName,
      customer_address: saleData.customerAddress,
      customer_phone: saleData.customerPhone,
      delivery_date: saleData.deliveryDate,
      vehicle_id: null,
      route_order: null,
      status: 'pending',
      total_bultos: saleData.totalBultos,
      notes: saleData.notes || '',
    }

    try {
      const response = await fetch('/.netlify/functions/create-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDelivery),
      })

      if (response.ok) {
        const createdDelivery = await response.json()
        deliveries.value.push(createdDelivery)
        return { success: true, delivery: createdDelivery }
      } else {
        throw new Error('Failed to create delivery')
      }
    } catch (error) {
      // Demo mode
      deliveries.value.push(newDelivery)
      return { success: true, delivery: newDelivery }
    }
  }

  async function unassignDelivery(deliveryId) {
    try {
      const response = await fetch('/.netlify/functions/unassign-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId }),
      })

      if (response.ok) {
        const updatedDelivery = await response.json()
        const index = deliveries.value.findIndex(d => d.id === deliveryId)
        if (index !== -1) {
          deliveries.value[index] = updatedDelivery
        }
        return { success: true }
      } else {
        throw new Error('Failed to unassign delivery')
      }
    } catch (error) {
      // Demo mode
      const index = deliveries.value.findIndex(d => d.id === deliveryId)
      if (index !== -1) {
        deliveries.value[index].vehicle_id = null
        deliveries.value[index].status = 'pending'
        deliveries.value[index].route_order = null
      }
      return { success: true }
    }
  }

  async function updateDeliveryStatus(deliveryId, status) {
    try {
      const response = await fetch('/.netlify/functions/update-delivery-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId, status }),
      })

      if (response.ok) {
        const updatedDelivery = await response.json()
        const index = deliveries.value.findIndex(d => d.id === deliveryId)
        if (index !== -1) {
          deliveries.value[index] = updatedDelivery
        }
        return { success: true }
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      // Demo mode
      const index = deliveries.value.findIndex(d => d.id === deliveryId)
      if (index !== -1) {
        deliveries.value[index].status = status
      }
      return { success: true }
    }
  }

  return {
    vehicles,
    deliveries,
    selectedDate,
    pendingDeliveriesForDate,
    assignedDeliveriesForDate,
    getVehicleLoad,
    getVehicleRemainingCapacity,
    wouldExceedCapacity,
    saveVehicle,
    loadVehicles,
    loadDeliveries,
    assignDeliveryToVehicle,
    updateRouteOrder,
    createDelivery,
    unassignDelivery,
    updateDeliveryStatus,
  }
})
