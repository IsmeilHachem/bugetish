import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

import { useCategoriesStore } from './stores/categories'
import { useTransactionsStore } from './stores/transactions'

const categoriesStore = useCategoriesStore()
categoriesStore.initialize()

const transactionsStore = useTransactionsStore()
transactionsStore.initialize()

app.mount('#app')
