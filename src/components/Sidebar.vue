<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import SettingPanel from '@/components/SettingPanel.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
    backgroundColor: String,
    textColor: String,
    isShowModal: Boolean
})

const emit = defineEmits(['toggle-collapse', 'change-background'])

// 当前路由信息
const router = useRouter()

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
const isCollapsed = ref(false)
const isShowSettingPanel = ref(false)

// 登录注册状态
const isLogin = inject('isLogin')
const logout = inject('logout')
const openLoginResgister = inject('openLoginResgister')

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
    return router.path === path
}

// 切换主题设置面板的显示与关闭
const toggleSettingPanel = () => {
    isShowSettingPanel.value = !isShowSettingPanel.value
}

// 处理背景颜色
const handleUpdateBackground = (color) => {
    emit('change-background', color)
}

// 切换折叠状态
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
    emit('toggle-collapse', isCollapsed.value)
}    
</script>

<template>
    <div class="sidebar" :class="{ collapsed: isCollapsed }"
        :style="{ backgroundColor: backgroundColor, color: textColor }">
        <!-- 用户区域 -->
        <div class="user-area">
            <div class="user-info" v-if="!isCollapsed">
                <!-- 登录状态 -->
                <div v-if="isLogin" class="flex items-center">
                    <img :src="currentUser.avatar || '@/assets/images/pig6.jpg'" alt="用户头像" class="user-avatar">
                    <div class="user-actions ml-3">
                        <span class="username">{{ currentUser.username || '用户名' }}</span>
                        <button class="logout-btn" @click="logout">退出登录</button>
                    </div>
                </div>

                <!-- 未登录状态 -->
                <div v-else class="flex items-center">
                    <img src="@/assets/images/pig6.jpg" alt="默认头像" class="user-avatar">
                    <button class="login-btn ml-3" @click="openLoginResgister">登录/注册</button>
                </div>
            </div>

            <!-- 折叠状态 -->
            <img v-if="isCollapsed && isLogin" :src="currentUser.avatar || '@/assets/images/pig6.jpg'" alt="用户头像"
                class="collapsed-avatar" @click="logout">

            <img v-else-if="isCollapsed" src="@/assets/images/pig6.jpg" alt="默认头像" class="collapsed-avatar"
                @click="openLoginResgister">
        </div>

        <!-- 导航区域 -->
        <nav>
            <router-link v-for="item in navItems" :key="item.path" :to="item.path"
                :class="{ active: isActive(item.path) }" class="sidebar-item">
                <font-awesome-icon :icon="item.icon" :class="{ 'icon-only': isCollapsed }" class="sidebar-icon" />
                <span v-if="!isCollapsed">{{ item.name }}</span>
            </router-link>

            <router-link v-for="item in displayedMyItems" :key="`${item.path}-${item.showMore}`" :to="item.path"
                :class="{ active: isActive(item.path) }" class="sidebar-item">
                <font-awesome-icon :icon="item.icon" :class="{ 'icon-only': isCollapsed }" class="sidebar-icon" />
                <span v-if="!isCollapsed">{{ item.name }}</span>
            </router-link>

            <span @click="toggleShowMore" class="more-toggle" v-if="!isCollapsed">
                <font-awesome-icon :icon="showMore ? 'angle-up' : 'angle-down'" style="margin-right: 5px;" />
                {{ showMore ? '收起' : '更多' }}
            </span>
        </nav>

        <!-- 底部区域 -->
        <div class="sidebar-footer">
            <div class="action-item" @click="toggleSettingPanel">
                <font-awesome-icon icon="palette" />
                <span v-if="!isCollapsed">主题设置</span>
            </div>
            <div class="action-item" @click="toggleCollapse">
                <font-awesome-icon :icon="isCollapsed ? 'arrow-right' : 'arrow-left'" />
                <span v-if="!isCollapsed">收起侧边栏</span>
            </div>
        </div>

        <!-- 设置面板 -->
        <div v-if="isShowSettingPanel" class="setting-panel">
            <settingPanel @change-background="handleUpdateBackground" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 224px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    z-index: 100;
    transition: all 0.3s ease;
    padding: 10px;

    &.collapsed {
        width: 64px;
        padding: 10px 5px;
        transition: all 0.3s ease;

        .sidebar-item span,
        .more-toggle,
        .user-actions,
        .edit-icon {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        .sidebar-item {
            margin: 0 auto;
        }
    }

    .user-area {
        padding: 15px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transition: padding 0.3s ease;

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
            transition: gap 0.3s ease;

            .user-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid rgba(232, 185, 170, 0.7);
                transition: all 0.3s ease;
            }

            .user-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;

                button {
                    background: rgba(232, 185, 170, 0.3);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    color: inherit;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;

                    &:hover {
                        background: rgba(232, 185, 170, 0.5);
                        transform: translateY(-1px);
                    }
                }

                .login-btn,
                .register-btn {
                    width: 100%;
                }

                .divider {
                    text-align: center;
                    opacity: 0.6;
                }

                .logout-btn {
                    background: rgba(232, 185, 170, 0.7);
                    color: #333;
                    font-weight: bold;
                }
            }
        }

        .collapsed-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin: 0 auto;
            display: block;
            border: 2px solid rgba(232, 185, 170, 0.7);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                transform: scale(1.05);
            }
        }
    }

    .sidebar-item {
        width: calc(100% - 20px);
        padding: 8px 10px;
        text-decoration: none;
        font-size: 16px;
        transition: background-color 0.3s, color 0.3s;
        margin-top: 6px;
        display: flex;
        align-items: center;
        border-radius: 5px;
        opacity: 0.9;
        color: inherit;
        margin-left: 5px;
        transition: all 0.3s ease;

        .icon-only {
            margin-right: 0;
            font-size: 18px;
            margin: 0 auto;
        }

        span {
            margin-left: 10px;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }

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
        padding: 5px 10px;
        opacity: 0.7;
        transition: opacity 0.3s;
        margin-left: 5px;

        &:hover {
            opacity: 1;
        }
    }


    .sidebar-footer {
        margin-top: auto;
        padding: 10px 5px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .action-item {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            padding: 8px 10px;
            border-radius: 5px;
            transition: background-color 0.3s;

            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
        }
    }

    .setting-panel-container {
        position: absolute;
        bottom: 70px;
        left: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 8px;
        padding: 15px;
        z-index: 200;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
        padding: 5px;
    }
}
</style>