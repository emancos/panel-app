import { createApp } from 'vue'
import axios from 'axios'
import App from './App.vue'
import store from './store'
import router from './router'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

console.log('Renderer process started')
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded')
})

const app = createApp(App)

app.config.globalProperties.$http = axios

app.use(store)
app.use(router)
app.use(VueSweetalert2)

store.dispatch('loadConfig')

app.config.globalProperties.$trans = (value) => {
  const dict = store.state.dict || {}
  if (dict[value]) {
    return dict[value]
  }
  return value
}

// Global mixin for electron (replacing vue-electron)
app.config.globalProperties.$electron = window.require ? window.require('electron') : null

app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

window.onerror = function (message, source, lineno, colno, error) {
  console.error('Window Error:', message, error)
}

app.mount('#app')
