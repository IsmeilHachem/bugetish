import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

import { useAuthStore } from './stores/auth'
import { useCategoriesStore } from './stores/categories'

const authStore = useAuthStore()
authStore.init()

const categoriesStore = useCategoriesStore()
categoriesStore.initialize()

app.mount('#app')
