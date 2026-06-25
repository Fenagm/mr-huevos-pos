import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const products = ref([])
  const branches = ref([
    { id: 1, name: 'Centenario', active: true },
    { id: 2, name: 'Caaguazú', active: false }
  ])
  
  // Demo products with full inventory data
  const demoProducts = [
    { 
      id: 1, 
      name: 'Huevo Blanco (30u)', 
      retailPrice: 4.50, 
      wholesalePrice: 4.00, 
      costPrice: 3.50,
      stock: 100, 
      active: true,
      branchId: 1
    },
    { 
      id: 2, 
      name: 'Huevo Rojo (30u)', 
      retailPrice: 4.80, 
      wholesalePrice: 4.30, 
      costPrice: 3.70,
      stock: 80, 
      active: true,
      branchId: 1
    },
    { 
      id: 3, 
      name: 'Huevo Orgánico (15u)', 
      retailPrice: 3.20, 
      wholesalePrice: 2.80, 
      costPrice: 2.50,
      stock: 50, 
      active: true,
      branchId: 1
    },
    { 
      id: 4, 
      name: 'Huevo de Codorniz (24u)', 
      retailPrice: 2.50, 
      wholesalePrice: 2.20, 
      costPrice: 2.00,
      stock: 60, 
      active: true,
      branchId: 1
    },
    { 
      id: 5, 
      name: 'Huevo Azul (30u)', 
      retailPrice: 5.00, 
      wholesalePrice: 4.50, 
      costPrice: 4.00,
      stock: 40, 
      active: true,
      branchId: 1
    },
    { 
      id: 6, 
      name: 'Cartón Vacío', 
      retailPrice: 0.50, 
      wholesalePrice: 0.40, 
      costPrice: 0.30,
      stock: 200, 
      active: true,
      branchId: 1
    },
  ]

  const spoilages = ref([])
  const loading = ref(false)

  // Computed
  const activeProducts = computed(() => products.value.filter(p => p.active))
  
  const totalInventoryValue = computed(() => {
    return products.value.reduce((sum, p) => sum + (p.costPrice * p.stock), 0)
  })

  const lowStockProducts = computed(() => {
    return products.value.filter(p => p.stock < 20 && p.active)
  })

  // Actions
  async function loadProducts(branchId = null) {
    loading.value = true
    try {
      const url = branchId 
        ? `/.netlify/functions/get-products?branchId=${branchId}`
        : '/.netlify/functions/get-products'
      
      const response = await fetch(url)
      if (response.ok) {
        products.value = await response.json()
      } else {
        throw new Error('Failed to load products')
      }
    } catch (error) {
      // Demo mode
      products.value = [...demoProducts]
    } finally {
      loading.value = false
    }
  }

  async function saveProduct(product) {
    try {
      const response = await fetch('/.netlify/functions/save-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })

      if (response.ok) {
        const savedProduct = await response.json()
        if (product.id) {
          const index = products.value.findIndex(p => p.id === product.id)
          if (index !== -1) {
            products.value[index] = savedProduct
          }
        } else {
          products.value.push(savedProduct)
        }
        return { success: true, product: savedProduct }
      } else {
        throw new Error('Failed to save product')
      }
    } catch (error) {
      // Demo mode
      if (product.id) {
        const index = products.value.findIndex(p => p.id === product.id)
        if (index !== -1) {
          products.value[index] = { ...product }
        }
      } else {
        products.value.push({ ...product, id: Date.now() })
      }
      return { success: true, product }
    }
  }

  async function deleteProduct(productId) {
    try {
      const response = await fetch('/.netlify/functions/delete-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        products.value = products.value.filter(p => p.id !== productId)
        return { success: true }
      } else {
        throw new Error('Failed to delete product')
      }
    } catch (error) {
      // Demo mode
      products.value = products.value.filter(p => p.id !== productId)
      return { success: true }
    }
  }

  async function updateStock(productId, quantity, type = 'add') {
    const product = products.value.find(p => p.id === productId)
    if (!product) return { success: false, error: 'Producto no encontrado' }

    if (type === 'add') {
      product.stock += quantity
    } else if (type === 'remove') {
      if (product.stock < quantity) {
        return { success: false, error: 'Stock insuficiente' }
      }
      product.stock -= quantity
    }

    try {
      const response = await fetch('/.netlify/functions/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, type }),
      })

      if (response.ok) {
        return { success: true }
      } else {
        throw new Error('Failed to update stock')
      }
    } catch (error) {
      // Demo mode - already updated locally
      return { success: true }
    }
  }

  async function registerSpoilage(spoilageData) {
    const result = await updateStock(spoilageData.productId, spoilageData.quantity, 'remove')
    if (!result.success) return result

    const newSpoilage = {
      id: Date.now(),
      ...spoilageData,
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch('/.netlify/functions/register-spoilage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpoilage),
      })

      if (response.ok) {
        const savedSpoilage = await response.json()
        spoilages.value.push(savedSpoilage)
        return { success: true, spoilage: savedSpoilage }
      } else {
        throw new Error('Failed to register spoilage')
      }
    } catch (error) {
      // Demo mode
      spoilages.value.push(newSpoilage)
      return { success: true, spoilage: newSpoilage }
    }
  }

  async function loadSpoilages(startDate, endDate) {
    try {
      const response = await fetch(`/.netlify/functions/get-spoilages?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        spoilages.value = await response.json()
      } else {
        throw new Error('Failed to load spoilages')
      }
    } catch (error) {
      // Demo mode
      spoilages.value = []
    }
  }

  function setActiveBranch(branchId) {
    branches.value.forEach(b => {
      b.active = b.id === branchId
    })
  }

  return {
    products,
    branches,
    spoilages,
    loading,
    activeProducts,
    totalInventoryValue,
    lowStockProducts,
    loadProducts,
    saveProduct,
    deleteProduct,
    updateStock,
    registerSpoilage,
    loadSpoilages,
    setActiveBranch,
  }
})
