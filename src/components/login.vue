<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const activeTab = ref('login')
const showPassword = ref(false)
const form = ref({
    username: '',
    password: ''
})

const handleSubmit = () => { 
    // 模拟登录/注册成功
    const userInfo = {
        name: form.value.username,
        avatar: '@/assets/images/pig6.jpg'
    }

    localStorage.setItem('userInfo', JSON.stringify(userInfo))

    // 触发storage事件以便侧边栏更新
    window.dispatchEvent(new Event('storage'))

    router.back()
}

const closeLogin = () => { 
    router.back()
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>登录/注册</h2>
                <button @click="closeLogin" class="close-btn">
                    <font-awesome-icon icon="times"/>
                </button>
            </div>

            <div class="login-tabs">
                <button :class="['tab-btn', { active: activeTab === 'login'}]" @click="activeTab = 'login'">登录</button>
                <button :class="['tab-btn', { active: activeTab === 'register'}]" @click="activeTab = 'register'">注册</button>
            </div>

            <form @submit.prevent="handleSubmit" class="login-form">
                <div class="form-group">
                    <label>用户名</label>
                    <input 
                        type="text" 
                        v-model="form.username" 
                        required 
                        placeholder="请输入用户名"
                    >
                </div>
                
                <div class="form-group">
                    <label>密码</label>
                    <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="form.password" 
                        required 
                        placeholder="请输入密码"
                    >
                    <button type="button" @click="showPassword = !showPassword" class="password-toggle">
                        <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
                    </button>
                </div>
                
                <button type="submit" class="submit-btn">
                    {{ activeTab === 'login' ? '登录' : '注册' }}
                </button>
            </form>

            <div class="login-footer">
                <p>登录后即可收藏喜欢的音乐和下载歌曲</p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.login-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    color: #333;
}

.login-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
        margin: 0;
        color: #333;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        
        &:hover {
            color: #333;
        }
    }
}

.login-tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    
    .tab-btn {
        flex: 1;
        padding: 10px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        border-bottom: 2px solid transparent;
        
        &.active {
            color: #e8b9aa;
            border-bottom-color: #e8b9aa;
        }
    }
}

.login-form {
    .form-group {
        margin-bottom: 20px;
        position: relative;
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #333;
        }
        
        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
            
            &:focus {
                outline: none;
                border-color: #e8b9aa;
            }
        }
        
        .password-toggle {
            position: absolute;
            right: 10px;
            top: 35px;
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
        }
    }
    
    .submit-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #ff6b6b, #e8b9aa);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(232, 185, 170, 0.3);
        }
    }
}

.login-footer {
    margin-top: 20px;
    text-align: center;
    
    p {
        margin: 0;
        font-size: 12px;
        color: #666;
    }
}
</style>
