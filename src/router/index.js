import { createRouter, createWebHashHistory } from 'vue-router'

// 路由表（hash 模式，便于用静态服务直接打开构建产物）
const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '首页' } },
  { path: '/playlists', name: 'playlists', component: () => import('../views/PlaylistsView.vue'), meta: { title: '歌单' } },
  { path: '/playlist/:id', name: 'playlist', component: () => import('../views/PlaylistView.vue'), meta: { title: '歌单详情' } },
  { path: '/search', name: 'search', component: () => import('../views/SearchView.vue'), meta: { title: '搜索' } },
  { path: '/liked', name: 'liked', component: () => import('../views/LikedView.vue'), meta: { title: '收藏' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  const title = to.meta && to.meta.title ? to.meta.title : ''
  document.title = title ? `${title} · My Music` : 'My Music · 在线音乐播放器'
})

export default router
