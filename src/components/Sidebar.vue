<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
    backgroundColor: String,
    textColor: String,
    isShowModal: Boolean
})

const emit = defineEmits(['toggle-collapse', 'change-background'])

// 当前路由信息
const router = useRouter()

// 用户登录状态
const isLoggedIn = ref(false)
const userInfo = ref({
    name: '',
    avatar: ''
})

// 导航项
const navItems = ref([
    { path: '/recommended', name: '推荐', icon: 'star', section: 'nav' },
    { path: '/winnow', name: '精选', icon: 'gem', section: 'nav' },
])

// 个人项
const myItems = computed(() => {
    const baseItems = [
        { path: '/recentlyPlayed', name: '最近播放', icon: 'clock', section: 'my' },
        { path: '/localMusic', name: '本地音乐', icon: 'music', section: 'my' },
        { path: '/download', name: '本地和下载', icon: 'download', section: 'my' },
    ]

    // 只有登录时才显示'我喜欢的音乐'
    if (isLoggedIn.value) {
        baseItems.unshift({ path: '/likeMusic', name: '我喜欢的音乐', icon: 'heart', section: 'my' })
    }

    return baseItems
})

// 控制状态
const isCollapsed = ref(false)

// 计算显示的我的项
const displayedMyItems = computed(() => {
    return myItems.value.filter(item => {
        if (item.requireLogin && !isLoggedIn.value) return false
        return !item.showMore || showMore.value
    })
})

// 检查登录状态
const checkLoginStatus = () => {
    const userData = localStorage.getItem('userInfo')
    if (userData) {
        userInfo.value = JSON.parse(userData)
        isLoggedIn.value = true
    } else {
        isLoggedIn.value = false
        userInfo.value = { name: '', avatar: '' }
    }
}

// 跳转到登录界面
const goToLogin = () => {
    router.push('/login')
}

// 用户注销
const logout = () => {
    localStorage.removeItem('userInfo')
    isLoggedIn.value = false
    userInfo.value = { name: '', avatar: '' }
}

// 检查当前路由是否激活
const isActive = (path) => {
    return router.currentRoute.value.path === path
}

// 跳转到主题设置页面
const goToThemeSetting = () => {
    router.push('/bgColor')
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

onMounted(() => {
    checkLoginStatus()
    window.addEventListener('storage', checkLoginStatus)
})
</script>

<template>
    <div class="sidebar" :class="{ collapsed: isCollapsed }"
        :style="{ backgroundColor: backgroundColor, color: textColor }">

        <!-- 用户区域 -->
        <div class="user-area">
            <div class="user-info" v-if="!isCollapsed">
                <div class="avatar-container" @click="goToLogin">
                    <img v-if="isLoggedIn && userInfo.avatar" :src="userInfo.avatar" alt="用户头像" class="user-avatar">
                    <div v-else class="default-avatar">
                        <font-awesome-icon icon="user" />
                    </div>
                </div>
                <div class="user-actions">
                    <div v-if="!isLoggedIn" class="login-section">
                        <button @click="goToLogin" class="login-btn">点击登录</button>
                    </div>
                    <div v-else class="user-section">
                        <div class="welcome-text">欢迎回来</div>
                        <div class="username">{{ userInfo.name }}</div>
                        <button @click="logout" class="logout-btn">退出登录</button>
                    </div>
                </div>
            </div>
            <div v-else class="collapsed-avatar" @click="goToLogin">
                <img v-if="isLoggedIn && userInfo.avatar" :src="userInfo.avatar" alt="用户头像" class="user-avatar">
                <div v-else class="default-avatar">
                    <font-awesome-icon icon="user" />
                </div>
            </div>
        </div>

        <!-- 导航区域 -->
        <div class="nav-sections">
            <!-- 导航项区域 -->
            <div class="nav-section" v-if="navItems.length > 0">
                <div class="section-label" v-if="!isCollapsed">导航</div>
                <nav class="section-nav">
                    <router-link v-for="item in navItems" :key="item.path" :to="item.path"
                        :class="{ active: isActive(item.path) }" class="sidebar-item nav-item">
                        <font-awesome-icon :icon="item.icon" class="sidebar-icon" />
                        <span class="item-text">{{ item.name }}</span>
                        <div class="active-indicator"></div>
                    </router-link>
                </nav>
            </div>

            <!-- 个人项区域 -->
            <div class="nav-section" v-if="displayedMyItems.length > 0">
                <div class="section-label" v-if="!isCollapsed">我的音乐</div>
                <nav class="section-nav">
                    <router-link v-for="item in displayedMyItems" :key="`${item.path}-${item.showMore}`" :to="item.path"
                        :class="{ active: isActive(item.path) }" class="sidebar-item my-item">
                        <font-awesome-icon :icon="item.icon" class="sidebar-icon" />
                        <span class="item-text">{{ item.name }}</span>
                        <div class="active-indicator"></div>
                    </router-link>
                </nav>
            </div>
        </div>

        <!-- 底部区域 -->
        <div class="sidebar-footer">
            <div class="footer-actions">
                <!-- 折叠按钮 -->
                <div class="action-item collapse-btn" @click="toggleCollapse">
                    <font-awesome-icon :icon="isCollapsed ? 'arrow-right' : 'arrow-left'" class="action-icon" />
                </div>
                <!-- 主题设置按钮 - 折叠状态下隐藏 -->
                <div class="action-item theme-setting" :class="{ hidden: isCollapsed }" @click="goToThemeSetting">
                    <font-awesome-icon icon="palette" class="action-icon" />
                </div>
            </div>
        </div>

        <!-- 设置面板 -->
        <!-- <div v-if="isShowSettingPanel" class="setting-panel">
            <SettingPanel @change-background="handleUpdateBackground" />
        </div> -->
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 10px;

    &.collapsed {
        width: 64px;
        padding: 10px 5px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        .item-text,
        .section-label,
        .more-toggle,
        .action-text {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        .sidebar-item {
            margin: 0 auto;
            padding: 8px;
            border-radius: 8px;
        }
    }

    .user-area {
        padding: 15px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 15px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
            transition: gap 0.3s ease;

            .avatar-container {
                cursor: pointer;

                .user-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid rgba(232, 185, 170, 0.7);
                    transition: all 0.3s ease;
                }

                .default-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(232, 185, 170, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(232, 185, 170, 0.7);
                    font-size: 20px;
                    transition: all 0.3s ease;

                    &.small {
                        width: 40px;
                        height: 40px;
                        font-size: 16px;
                    }
                }
            }

            .user-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex: 1;

                button {
                    background: rgba(232, 185, 170, 0.3);
                    border: none;
                    border-radius: 4px;
                    padding: 6px 12px;
                    color: inherit;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                    width: 100%;

                    &:hover {
                        background: rgba(232, 185, 170, 0.5);
                        transform: translateY(-1px);
                    }
                }

                .login-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;

                    .login-btn {
                        width: 100%;
                    }
                }

                .user-section {
                    .welcome-text {
                        font-size: 12px;
                        opacity: 0.7;
                    }

                    .username {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 2px 0;
                    }

                    .logout-btn {
                        background: rgba(232, 185, 170, 0.7);
                        color: #333;
                        font-weight: bold;
                        font-size: 12px;
                        padding: 4px 8px;
                    }
                }
            }
        }

        .collapsed-avatar {
            cursor: pointer;
            display: flex;
            justify-content: center;

            .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid rgba(232, 185, 170, 0.7);
                transition: all 0.3s ease;
            }

            .default-avatar.small {
                width: 40px;
                height: 40px;
            }
        }
    }

    .nav-sections {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .nav-section {
        position: relative;

        &::before {
            content: '';
            position: absolute;
            top: -10px;
            left: 10px;
            right: 10px;
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
        }

        &:first-child::before {
            display: none;
        }

        .section-label {
            font-size: 12px;
            font-weight: 600;
            opacity: 0.6;
            margin-bottom: 8px;
            padding: 0 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        }

        .section-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .sidebar-item {
            position: relative;
            width: calc(100% - 20px);
            padding: 10px 15px;
            text-decoration: none;
            font-size: 14px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            border-radius: 8px;
            opacity: 0.8;
            color: inherit;
            margin: 0 10px;
            border: 1px solid transparent;
            background: rgba(255, 255, 255, 0.05);

            .sidebar-icon {
                font-size: 16px;
                width: 20px;
                text-align: center;
                transition: all 0.3s ease;
            }

            .item-text {
                margin-left: 12px;
                font-weight: 500;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                white-space: nowrap;
                overflow: hidden;
            }

            .active-indicator {
                position: absolute;
                left: -10px;
                top: 50%;
                transform: translateY(-50%);
                width: 3px;
                height: 0;
                background: linear-gradient(to bottom, #ff6b6b, #e8b9aa);
                border-radius: 2px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                opacity: 0;
            }

            &:hover {
                background: rgba(255, 255, 255, 0.1);
                opacity: 1;
                border-color: rgba(255, 255, 255, 0.2);
                transform: translateX(2px);
            }

            &.active {
                background: rgba(232, 185, 170, 0.15);
                opacity: 1;
                border-color: rgba(232, 185, 170, 0.3);

                .active-indicator {
                    height: 20px;
                    opacity: 1;
                }

                .sidebar-icon {
                    color: #e8b9aa;
                }

                .item-text {
                    color: #e8b9aa;
                    font-weight: 600;
                }
            }
        }

        .more-toggle {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 8px 15px;
            opacity: 0.7;
            transition: all 0.3s ease;
            margin: 4px 10px 0;
            font-size: 13px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.05);

            .more-icon {
                margin-right: 8px;
                font-size: 12px;
                transition: all 0.3s ease;
            }

            &:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.1);
            }
        }
    }

    .sidebar-footer {
        margin-top: auto;
        padding: 15px 5px 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);

        .footer-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;

            .action-item {
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                padding: 6px 8px;
                border-radius: 4px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                opacity: 0.8;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid transparent;
                flex: 1;
                justify-content: center;
                min-height: 32px;

                &.theme-setting {
                    // 主题设置按钮在折叠状态下隐藏
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

                    &.hidden {
                        opacity: 0;
                        visibility: hidden;
                        width: 0;
                        padding: 10px 0;
                        margin: 0;
                        flex: 0;
                    }
                }

                &.collapse-btn {
                    // 折叠按钮始终可见
                    min-width: auto;
                }

                .action-icon {
                    font-size: 14px;
                    width: 16px;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .action-text {
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                }

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                    opacity: 1;
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                }

                &:active {
                    transform: translateY(0);
                }
            }
        }
    }

    .setting-panel {
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

    /* 隐藏滚动条 */
    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
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

        .user-area {
            display: none;
        }

        .nav-sections {
            flex-direction: row;
            gap: 0;
        }

        .nav-section {
            flex: 1;

            &::before {
                display: none;
            }

            .section-label {
                display: none;
            }

            .section-nav {
                flex-direction: row;
                gap: 0;
            }

            .sidebar-item {
                flex-direction: column;
                padding: 8px 5px;
                margin: 0 2px;

                .item-text {
                    margin-left: 0;
                    margin-top: 4px;
                    font-size: 12px;
                }

                .active-indicator {
                    display: none;
                }
            }

            .more-toggle {
                display: none;
            }
        }

        .sidebar-footer {
            display: none;
        }
    }
}
</style>