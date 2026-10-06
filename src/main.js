import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// 应用入口：挂载 router 后渲染根组件
createApp(App).use(router).mount('#app')
