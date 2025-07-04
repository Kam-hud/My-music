<script setup>
import { onMounted, ref } from 'vue';
import login from './login.vue';

// 接收父组件传递的背景颜色
const props = defineProps({
    backgroundColor: String // 接收传递的背景颜色
})

// 控制登录界面的显示和隐藏
const isOpenLogin = ref(false)
// 控制下拉菜单的显示和隐藏
const showDropdown = ref(false)
// 存储登录用户的数据
const loggedInUser = ref('')

// 返回上一页和下一页
const goBack = () => {
    window.history.back()
}
const goForward = () => {
    window.history.forward()
}

// 打开画板
const openBrush = () => {
    isShowBrush.value = !isShowBrush.value
}

// 登录成功后的回调函数
const handleUserLoggedIn = (username) => {
    loggedInUser.value = username
    // isOpenLogin.value = false
    localStorage.setItem('loggedInUser', username) // 将登录用户的数据存储到 localStorage
    isOpenLogin.value = false
}

// 退出登录后的回调函数
const handleUserLoggedOut = () => {
    loggedInUser.value = ''
    // localStorage.removeItem('loggedInUser') // 从 localStorage 中移除登录用户的数据
    showDropdown.value = false;
}

// 打开登录界面
const openLogin = () => {
    if (!loggedInUser.value) {
        isOpenLogin.value = !isOpenLogin.value
        return
    }
}

// 下拉菜单的显示和隐藏
const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
}

// 监听页面加载时
onMounted(() => {
    const user = localStorage.getItem('loggedInUser') // 从 localStorage 中获取登录用户的数据
    if (user) {
        loggedInUser.value = user // 将登录用户的数据赋值给 loggedInUser
    }
})
</script>

<template>
    <div class="navbar">
        <div class="navbar-left">
            <p class="icon-left" @click="goBack">
                <font-awesome-icon icon="arrow-left" />
            </p>
            <p class="icon-left" @click="goForward">
                <font-awesome-icon icon="arrow-right" />
            </p>
            <div class="search-container">
                <font-awesome-icon icon="search" class="search-icon " />
                <input type="text" class="search-bar" placeholder="搜索音乐">
            </div>
        </div>
        <div class="navbar-right">
            <button class="icon-button" @click="openLogin">
                <template v-if="loggedInUser">
                    {{ loggedInUser }}
                    <font-awesome-icon icon="caret-down" @click.stop="toggleDropdown" />
                    <div v-if="showDropdown" class="dropdown-menu">
                        <button @click="handleUserLoggedOut">退出登录</button>
                    </div>
                </template>
                <template v-else>
                    <font-awesome-icon icon="user-circle" />
                </template>
            </button>
        </div>
    </div>
    <login v-if="isOpenLogin" @user-logged-in="handleUserLoggedIn"></login>

</template>

<style lang="scss" scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    color: white;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);

    .navbar-left {
        display: flex;
        align-items: center;

        .icon-left {
            background: none;
            border: none;
            color: white;
            margin: 0 10px;
            cursor: pointer;
            font-size: 18px;
        }

        .search-container {
            position: relative;
            display: flex;
            align-items: center;
            border: none;
            background-color: #fff;
            margin-left: 12px;
            border-radius: 25px;


            .search-bar {
                padding: 8px 8px 8px 30px;
                font-size: 16px;
                border-radius: 24px;
                border: none;
                width: 240px;
                background: none;
            }

            .search-icon {
                position: absolute;
                left: 10px;
                color: grey;
                font-size: 16px;
                pointer-events: none;
            }
        }
    }

    .navbar-right {
        display: flex;
        align-items: center;

        .icon-button {
            background: none;
            border: none;
            color: white;
            margin-left: 10px;
            cursor: pointer;
            font-size: 18px;

            .dropdown-menu {
                position: absolute;
                background-color: #f9f9f9;
                min-width: 50px;
                box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
                z-index: 100;
                right: 10;

                button {
                    color: black;
                    padding: 12px 16px;
                    text-decoration: none;
                    display: block;
                    text-align: left;
                    border: none;
                    background: none;
                    width: 100%;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>