import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/pos',
    name: 'POS',
    component: () => import('@/views/POSView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('@/views/CustomersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/InventoryView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'manager'] },
  },
  {
    path: '/purchases',
    name: 'Purchases',
    component: () => import('@/views/PurchasesView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'manager'] },
  },
  {
    path: '/accounts-receivable',
    name: 'AccountsReceivable',
    component: () => import('@/views/AccountsReceivableView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'manager'] },
  },
  {
    path: '/logistics',
    name: 'Logistics',
    component: () => import('@/views/LogisticsView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'manager'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    alert('Acceso denegado para su perfil.')
    next('/pos')
  } else if (to.path === '/' && authStore.isAuthenticated) {
    next('/pos')
  } else {
    next()
  }
})

export default router
