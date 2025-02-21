import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/recommended'
    },
    {
        path: '/recommended',
        name: '推荐',
        component: () => import('@/views/Recommended.vue')
    },
    {
        path: '/winnow',
        name: '精选',
        component: () => import('@/views/Winnow.vue')
    },
    {
        path: '/dynamic',
        name: '动态',
        component: () => import('@/views/DynamicState.vue')
    },
    {
        path: '/likeMusic',
        name: '喜欢的音乐',
        component: () => import('@/views/LikeMusic.vue')
    },
    {
        path: '/recentlyPlayed',
        name: '最近播放',
        component: () => import('@/views/RecentlyPlayed.vue')
    },
    {
        path: '/myCollection',
        name: '我的收藏',
        component: () => import('@/views/MyCollection.vue')
    },
    {
        path: '/download',
        name: '下载的音乐',
        component: () => import('@/views/Download.vue')
    },
    {
        path: '/localMusic',
        name: '本地音乐',
        component: () => import('@/views/LocalMusic.vue')
    }
]

const router = createRouter({
    // history: createMemoryHistory(),
    history: createWebHistory(),
    routes
})

export default router