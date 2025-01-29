<script setup>
import { ref } from 'vue'

const registeredUsers = ref([]) // 存储已注册用户的数据 
const isRegistering = ref(false) // 控制登录和注册的状态
const isLoggedIn = ref(false)

// 登录
const loginAccount =ref('')
const loginPassword = ref('')

// 注册
const registerAccount = ref('')
const registerPassword = ref('')

const loadRegisteredUsers = () => { 
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || []
    registeredUsers.value = users
}


// 检查账号是否已经注册
const checkUserExists = (account) => { 
    return registeredUsers.value.some(user => user.account === account)
}

// 保存用户到 localStorage
const saveUserToLocalStorage = () => { 
    localStorage.setItem('registeredUsers',JSON.stringify(registeredUsers.value))
}
// 登录
const handleLogin = () => { 
    if (checkUserExists(loginAccount.value) && registeredUsers.value.find(user => user.account === loginAccount.value).password === loginPassword.value) { 
        alert("登录成功")
        isLoggedIn.value = false
    } else {
        alert('账号或密码错误');
    }
}

// 注册
const handleRegister = () => {
    if (!registerAccount.value || !registerPassword.value) {
        alert('请输入账号和密码。');
        return; // 不返回登录界面
    }
    if (!checkUserExists(registerAccount.value)) {
        registeredUsers.value.push({ account: registerAccount.value, password: registerPassword.value });
        alert('注册成功！');
        saveUserToLocalStorage()
        isRegistering.value = false;    
    } else {
        alert('账号已注册！');
    }
};


// 立即注册
const goToRegister = () => { 
    isRegistering.value = true
}

// 返回登录
const goToLogin = () => { 
    isRegistering.value = false
}

loadRegisteredUsers()
</script>

<template>
    <div class="container">
        <h1>欢迎来到莫小音音乐</h1>
        <div class="login-info" v-if="!isRegistering">
            <h2>登录</h2>
            <div class="input-group">
                <span>账号:</span>
                <input type="text" v-model="loginAccount">
            </div>
            <div class="input-group">
                <span>密码:</span>
                <input type="password" v-model="loginPassword">
            </div>
            <div class="login-actions">
                <div class="forget-password">
                    <span>忘记密码</span>
                </div>
                <div class="register-now" @click="goToRegister">
                    <span>立即注册</span>
                </div>
            </div>
            <div class="login-now" @click="handleLogin">
                <span>立即登录</span>
            </div>
        </div>
        <div class="register-info" v-else>
            <h2>注册</h2>
            <div class="input-group">
                <span>账号:</span>
                <input type="text" v-model="registerAccount">
            </div>
            <div class="input-group">
                <span>密码:</span>
                <input type="password" v-model="registerPassword">
            </div>
            <div class="register-actions">
                <div class="register" @click="handleRegister">
                    <span>立即注册</span>
                </div>
                <div class="back-login"  @click="goToLogin">
                    <span>返回登录</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container{
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center; // 垂直居中
    align-items: center; // 水平居中
    font-family: Arial, sans-serif;
    background: #222;
    color: white;
    max-width: 1252px;
    max-height: 580px;
    width: 100%;
    height: 100%; 
    padding: 20px;
    margin: 0 auto;
    border-radius: 8px;
    .login-info{
        width: 600px;
        height: 260px;
        border-radius: 8px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        // justify-content: center;
        align-items: center;
        padding: 20px;
        h2{
            color: #333;
            top: 0;
        }
        .input-group {
            display: flex; 
            align-items: center; /* 垂直居中标签和输入框 */
            width: 100%; 
            margin-bottom: 15px;
            justify-content: center;
            span {
                color: #222;
                margin-right: 10px;
            }
            input {
                width: 200px;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
        }

        .login-actions {
            display: flex;
            justify-content: space-between; // 两个元素之间的空间
            width: 100%; 

            .forget-password{
                color: #333;
                cursor: pointer;
                margin-left: 170px;
                &:hover{
                    color: #a5a6af;
                }
            }
            .register-now {
                color: #333;
                cursor: pointer;
                margin-right: 170px; 
                &:hover{
                    color: #a5a6af;
                }
            }
        }
        .login-now{
            width: 250px;
            height: 20px;
            padding: 10px;
            border-radius: 5px;
            background-color: #00BFFF;
            color: #333;
            text-align: center;
            cursor: pointer;
            margin-top: 20px;
        }
    }
    .register-info{
        width: 600px;
        height: 260px;
        border-radius: 8px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        // justify-content: center;
        align-items: center;
        padding: 20px;
        h2{
            color: #333;
            top: 0;
        }
        .input-group {
            display: flex; 
            align-items: center; /* 垂直居中标签和输入框 */
            width: 100%; 
            margin-bottom: 15px;
            justify-content: center;
            span {
                color: #222;
                margin-right: 10px;
            }
            input {
                width: 200px;
                padding: 8px; /* 输入框内边距 */
                border: 1px solid #ccc;
                border-radius: 4px;
            }
        }
        .register-actions {
            display: flex;
            justify-content: space-between; // 两个元素之间的空间
            width: 100%; 
            .register{
                color: #333;
                cursor: pointer;
                margin-left: 170px;
            }
            .back-login {
                color: #333;
                cursor: pointer;
                margin-right: 170px; 
            }
        }
    }
}
</style>