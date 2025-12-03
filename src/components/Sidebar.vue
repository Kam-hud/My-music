<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
    backgroundColor: String,
    textColor: String
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

// 移动端导航项 - 只保留推荐和我的
const mobileNavItems = ref([
    { path: '/recommended', name: '推荐', icon: 'star' },
    { path: '/my', name: '我的', icon: 'user' },
])

// 控制状态
const isCollapsed = ref(false)

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

const getAvatarUrl = (avatarPath) => { 
    if (!avatarPath) return ''

    if (avatarPath.startsWith('@/')) { 
        return avatarPath.replace('@/','/src/')
    }

    return avatarPath
}

// 跳转到登录界面
const goToLogin = () => {
    router.push('/login')
}

const handleAvatarClick = () => { 
    if (isLoggedIn.value) {
        if (confirm('确定要退出登录吗?')) {
            logout()
        }
    } else { 
        goToLogin()
    }
}

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

// 切换折叠状态
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
    emit('toggle-collapse', isCollapsed.value)
}

// // 切换我的面板显示
// const toggleMyPanel = () => {
//     showMyPanel.value = !showMyPanel.value
// }

onMounted(() => {
    checkLoginStatus()
    window.addEventListener('storage', checkLoginStatus)
})
</script>

<template>
    <!-- 桌面端侧边栏 -->
    <div class="sidebar desktop-sidebar" :class="{ collapsed: isCollapsed }"
        :style="{ backgroundColor: backgroundColor, color: textColor }">
        <!-- 用户区域 -->
        <div class="user-area">
            <div class="user-info" v-if="!isCollapsed">
                <div class="avatar-container" @click="handleAvatarClick">
                    <img v-if="isLoggedIn && userInfo.avatar" :src="getAvatarUrl(userInfo.avatar)" alt="用户头像" class="user-avatar">
                    <div v-else class="default-avatar">
                        <font-awesome-icon icon="user" />
                    </div>
                </div>
                <div class="user-actions">
                    <div v-if="!isLoggedIn" class="login-section">
                        <button @click="goToLogin" class="login-btn">点击登录</button>
                    </div>
                    <div v-else class="user-section">
                        <div class="username" @click="logout">{{ userInfo.name }}</div>
                    </div>
                </div>
            </div>
            <div v-else class="collapsed-avatar" @click="handleAvatarClick">
                <img v-if="isLoggedIn && userInfo.avatar" :src="getAvatarUrl(userInfo.avatar)" alt="用户头像" class="user-avatar">
                <div v-else class="default-avatar">
                    <font-awesome-icon icon="user" />
                </div>
            </div>
        </div>

        <!-- 导航区域 -->
        <div class="nav-sections">
            <!-- 导航项区域 -->
            <div class="nav-section">
                <div class="section-label" v-if="!isCollapsed">导航</div>
                <nav class="section-nav">
                    <router-link to="/recommended" :class="{ active: isActive('/recommended') }" class="sidebar-item">
                        <font-awesome-icon icon="star" class="sidebar-icon" />
                        <span class="item-text">推荐</span>
                    </router-link>
                    <router-link to="/winnow" :class="{ active: isActive('/winnow') }" class="sidebar-item">
                        <font-awesome-icon icon="robot" class="sidebar-icon" />
                        <span class="item-text">AI</span>
                    </router-link>
                </nav>
            </div>

            <!-- 个人项区域 -->
            <div class="nav-section">
                <div class="section-label" v-if="!isCollapsed">我的音乐</div>
                <nav class="section-nav">
                    <router-link v-if="isLoggedIn" to="/likeMusic" :class="{ active: isActive('/likeMusic') }"
                        class="sidebar-item">
                        <font-awesome-icon icon="heart" class="sidebar-icon" />
                        <span class="item-text">我喜欢的音乐</span>
                    </router-link>
                    <router-link to="/recentlyPlayed" :class="{ active: isActive('/recentlyPlayed') }"
                        class="sidebar-item">
                        <font-awesome-icon icon="clock" class="sidebar-icon" />
                        <span class="item-text">最近播放</span>
                    </router-link>
                    <router-link to="/localMusic" :class="{ active: isActive('/localMusic') }" class="sidebar-item">
                        <font-awesome-icon icon="music" class="sidebar-icon" />
                        <span class="item-text">本地音乐</span>
                    </router-link>
                    <router-link to="/download" :class="{ active: isActive('/download') }" class="sidebar-item">
                        <font-awesome-icon icon="download" class="sidebar-icon" />
                        <span class="item-text">下载管理</span>
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
    </div>

    <!-- 移动端底部导航 -->
    <div class="mobile-bottom-nav">
        <router-link v-for="item in mobileNavItems" :key="item.path" :to="item.path"
            :class="{ active: isActive(item.path) }" class="nav-item"
            @click="item.path === '/my' ? toggleMyPanel() : null">
            <font-awesome-icon :icon="item.icon" class="nav-icon" />
            <span class="nav-text">{{ item.name }}</span>
        </router-link>
    </div>
</template>

<style lang="scss" scoped>
.desktop-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 224px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    z-index: 100;
    transition: width 0.3s ease;

    &.collapsed {
        width: 64px;
        padding: 5px;

        .item-text,
        .section-label,
        .action-text {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        }



        .sidebar-item {
            height: 44px;
            padding: 8px 5px;
            justify-content: center;
            margin: 2px 0;
        }

        .sidebar-icon {
            margin-right: 0;
            margin-left: 24px;
        }
    }

    &::-webkit-scrollbar {
        display: none;
    }

    .user-area {
        padding: 15px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 15px;

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;

            .avatar-container {
                cursor: pointer;

                .user-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid rgba(232, 185, 170, 0.7);
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
                }
            }

            .user-actions {
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
                    }
                }
            }
        }

        .collapsed-avatar {
            display: flex;
            justify-content: center;
            cursor: pointer;
            padding: 5px 0;

            .user-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                object-fit: cover;
                border: 1px solid rgba(232, 185, 170, 0.7);
            }

            .default-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(232, 185, 170, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(232, 185, 170, 0.7);
                font-size: 14px;
            }
        }
    }

    .nav-sections {
        flex: 1;

        .nav-section {
            margin-bottom: 15px;

            .section-label {
                font-size: 12px;
                opacity: 0.6;
                margin-bottom: 8px;
                padding: 0 10px;
                text-transform: uppercase;
                transition: all 0.3s ease;
            }

            .sidebar-item {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                text-decoration: none;
                color: inherit;
                border-radius: 6px;
                margin: 2px 0;
                transition: all 0.3s;

                .sidebar-icon {
                    width: 18px;
                    margin-right: 12px;
                    transition: margin-right 0.3s ease;
                }

                &.active {
                    background: rgba(232, 185, 170, 0.15);
                    color: #e8b9aa;
                }

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            }
        }
    }

    .sidebar-footer {
        margin-top: auto;
        padding: 15px 5px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);

        .footer-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 5px;

            .action-item {
                display: flex;
                align-items: center;
                gap: 6px;   
                cursor: pointer;
                padding: 5px 6px;
                border-radius: 4px;
                transition: all 0.3s;
                opacity: 0.8;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid transparent;
                flex: 1;
                justify-content: center;
                min-height: 28px;

                &.theme-setting {
                    transition: all 0.3s;

                    &.hidden {
                        opacity: 0;
                        visibility: hidden;
                        width: 0;
                        padding: 10px 0;
                        margin: 0;
                        flex: 0;
                    }
                }

                .action-icon {
                    font-size: 14px;
                    width: 16px;
                    text-align: center;
                }

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                    opacity: 1;
                    border-color: rgba(255, 255, 255, 0.2);
                }
            }
        }
    }
}

.mobile-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    padding: 8px 0;
    z-index: 1000;

    .nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-decoration: none;
        color: #666;
        padding: 8px 0;
        transition: all 0.3s;
        border: none;
        background: none;
        cursor: pointer;

        .nav-icon {
            font-size: 20px;
            margin-bottom: 4px;
        }

        .nav-text {
            font-size: 10px;
        }

        &.active {
            color: #e8b9aa;
        }
    }
}

@media screen and (max-width: 768px) {
    .desktop-sidebar {
        display: none;
    }
}

@media screen and (min-width: 769px) {

    .mobile-bottom-nav{
        display: none;
    }
}
</style>