import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('@/views/Cadastro.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'modulos',
          name: 'modulos',
          component: () => import('@/views/Modulos.vue'),
        },
        {
          path: 'modulos/:id',
          name: 'modulo-detalhe',
          component: () => import('@/views/ModuloDetalhe.vue'),
        },
        {
          path: 'conteudo',
          name: 'conteudo',
          component: () => import('@/views/Conteudo.vue'),
        },
        {
          path: 'ver-tudo',
          name: 'ver-tudo',
          component: () => import('@/views/VerTudo.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
