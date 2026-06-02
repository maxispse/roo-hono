import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles.css'
import { auth } from './stores/auth'

const app = createApp(App)
app.use(router)
app.mount('#app')

// always after mount
auth.fetchMe()

createApp(App).use(router).mount('#app')