import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// ADD THIS BLOCK:
import { useTransactionsStore } from './stores/transactions'
const transactionsStore = useTransactionsStore()
transactionsStore.initialize()

app.mount('#app')
