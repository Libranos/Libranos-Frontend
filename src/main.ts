import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, { plugins: {} })

// Suprime o erro interno do Quasar no gesto onClosePan quando
// um q-drawer ou q-dialog é desmontado no meio de um touch/swipe.
// Esse erro vem do próprio Quasar e não afeta a funcionalidade.
app.config.errorHandler = (err) => {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('direction') || msg.includes('onClosePan')) return
  console.error(err)
}

app.mount('#app')