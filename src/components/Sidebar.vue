<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import DraggableList from '@/components/DraggableList.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
    backgroundColor: String,
    textColor: String
})

// 当前路由信息
const route = useRoute()

// 导航项
const navItems = ref([
    { path: '/recommended', name: '推荐', icon: 'star' },
    { path: '/winnow', name: '精选', icon: 'gem' },
])

// 个人项
const myItems = ref([
    { path: '/likeMusic', name: '我喜欢的音乐', icon: 'heart' },
    { path: '/recentlyPlayed', name: '最近播放', icon: 'clock' },
    { path: '/download', name: '下载管理', icon: 'download', showMore: true },
    { path: '/localMusic', name: '本地音乐', icon: 'music', showMore: true },
])

// 控制状态
const showMore = ref(false)
const edit = ref(false)
const isShowModal = ref(false)

// 计算显示的我的项
const displayedMyItems = computed(() => {
    return myItems.value.filter(item => !item.showMore || showMore.value)
})

// 切换"更多"按钮的显示状态
const toggleShowMore = () => {
    showMore.value = !showMore.value
}

// 检查当前路由是否激活
const isActive = (path) => {
    return route.path === path
}

// 更新用户列表的顺序
function handleUpdateOrder(newOrder) {
    const itemsMap = new Map()
    myItems.value.forEach(item => itemsMap.set(item.name, item))

    myItems.value = newOrder.map(item => {
        const original = itemsMap.get(item.name)
        return {
            path: original.path,
            name: item.name,
            icon: item.icon,
            showMore: original.showMore
        }
    })
}

// 打开列表
const openModal = () => {
    isShowModal.value = true
}

// 关闭列表
const closeModal = () => {
    isShowModal.value = false
}
</script>

<template>
    <div class="sidebar" :style="{ backgroundColor: backgroundColor, color: textColor }">
        <div class="sidebar-header">
            <img src="@/assets/images/music_logo.png" alt="音乐Logo" class="music-logo">
            <h4>莫小音音乐</h4>
        </div>

        <nav>
            <router-link v-for="item in navItems" :key="item.path" :to="item.path"
                :class="{ active: isActive(item.path) }" class="sidebar-item">
                <font-awesome-icon :icon="item.icon" style="margin-right: 10px;" />{{ item.name }}
            </router-link>
            <span class="divider"></span>
        </nav>

        <div class="sidebar-my">
            <div class="my" @mouseover="edit = true" @mouseleave="edit = false">
                <h4 class="my-title">我的</h4>
                <font-awesome-icon icon="edit" class="edit-icon" :class="{ visible: edit }" @click="openModal" />
            </div>

            <div v-for="item in displayedMyItems" :key="`${item.path}-${item.showMore}`" class="sidebar-item-container">
                <router-link :to="item.path" :class="{ active: isActive(item.path) }" class="sidebar-item">
                    <font-awesome-icon :icon="item.icon" style="margin-right: 10px;" />{{ item.name }}
                </router-link>
            </div>

            <span @click="toggleShowMore" class="more-toggle">
                <font-awesome-icon :icon="showMore ? 'angle-up' : 'angle-down'" style="margin-right: 5px;" />
                {{ showMore ? '收起' : '更多' }}
            </span>
        </div>

        <DraggableList v-if="isShowModal" @update-order="handleUpdateOrder" @close="closeModal" />
    </div>
</template>

<style lang="scss" scoped>
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 244px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    z-index: 100;

    .sidebar-header {
        padding: 20px;
        text-align: left;
        font-size: 24px;
        display: flex;
        align-items: center;

        .music-logo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            margin-left: 10px;
        }
    }

    nav,
    .sidebar-my {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        margin-left: 20px;
        position: relative;
        margin-bottom: 20px;

        .divider {
            border-bottom: 1px solid currentColor;
            display: inline-block;
            width: 200px;
            margin-top: 10px;
            opacity: 0.2;
        }

        .sidebar-item-container {
            width: 100%;
            display: block;
            padding: 15px;
            margin-left: -16px;
        }

        .my {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;

            .my-title {
                margin-left: 10px;
                opacity: 0.7;
            }

            .edit-icon {
                margin-left: auto;
                margin-right: 10px;
                opacity: 0;
                transition: opacity 0.3s;
                cursor: pointer;

                &.visible {
                    opacity: 1;
                }
            }
        }

        .sidebar-item {
            width: 180px;
            padding: 8px;
            text-decoration: none;
            font-size: 16px;
            transition: background-color 0.3s, color 0.3s;
            margin-top: 6px;
            display: block;
            border-radius: 5px;
            opacity: 0.9;
            color: inherit;

            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
                opacity: 1;
            }

            &.active {
                background-color: rgba(232, 185, 170, 0.7);
                opacity: 1;
            }
        }

        .more-toggle {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 5px 14px;
            opacity: 0.7;
            transition: opacity 0.3s;

            &:hover {
                opacity: 1;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .sidebar {
        width: 100%;
        position: relative;
        height: auto;
        flex-direction: row;
        justify-content: space-around;
        z-index: 1000;
    }
}
</style>