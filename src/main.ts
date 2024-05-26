import { createApp } from 'vue'
import './style.css'
import index from "./index.vue"
import router from './router'
//创建一个应用
const app = createApp(index)
app.use(router)
//挂在整个应用的到index容器
app.mount("#index")


