import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/Home')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/Settings')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
