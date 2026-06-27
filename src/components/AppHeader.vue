<template>
  <header class="app-header">
    <div class="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold" style="color: var(--text);">{{ title }}</h1>
        <p v-if="branchName" class="text-xs sm:text-sm" style="color: var(--muted);">
          Sucursal: {{ branchName }}
          <span v-if="roleLabel" class="hidden sm:inline">· {{ roleLabel }}</span>
        </p>
      </div>
      <nav class="flex flex-wrap items-center gap-2 sm:gap-3">
        <router-link to="/pos" :class="['nav-tab', active === 'pos' ? 'nav-tab-active' : 'nav-tab-inactive']">POS</router-link>
        <router-link v-if="canViewReports" to="/reports" :class="['nav-tab', active === 'reports' ? 'nav-tab-active' : 'nav-tab-inactive']">Balances</router-link>
        <router-link v-if="canAccessInventory" to="/inventory" :class="['nav-tab', active === 'inventory' ? 'nav-tab-active' : 'nav-tab-inactive']">Config</router-link>
        <router-link v-if="canAccessAccounts" to="/accounts-receivable" :class="['nav-tab', active === 'accounts' ? 'nav-tab-active' : 'nav-tab-inactive']">Ctas Ctes</router-link>
        <router-link v-if="canAccessLogistics" to="/logistics" :class="['nav-tab', active === 'logistics' ? 'nav-tab-active' : 'nav-tab-inactive']">Logística</router-link>
        <router-link v-if="canAccessPurchases" to="/purchases" :class="['nav-tab', active === 'purchases' ? 'nav-tab-active' : 'nav-tab-inactive']">Compras</router-link>
        <router-link v-if="canAccessCustomers" to="/customers" :class="['nav-tab', active === 'customers' ? 'nav-tab-active' : 'nav-tab-inactive']">Clientes</router-link>
        <button @click="handleLogout" class="btn-danger ml-2 sm:ml-0 text-sm">Salir</button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  title: { type: String, required: true },
  active: { type: String, default: '' }
})

const router = useRouter()
const authStore = useAuthStore()

const branchName = computed(() => authStore.currentBranch?.name || '')
const roleLabel = computed(() => {
  const map = { admin: 'Administrador', manager: 'Encargado', seller: 'Vendedor' }
  return map[authStore.user?.role] || ''
})

const canViewReports = computed(() => authStore.canViewReports())
const canAccessInventory = computed(() => authStore.canAccessInventory())
const canAccessAccounts = computed(() => authStore.canAccessAccountsReceivable())
const canAccessLogistics = computed(() => authStore.canAccessLogistics())
const canAccessPurchases = computed(() => authStore.canAccessPurchases())
const canAccessCustomers = computed(() => true)

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>
