<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");
const registerUsername = ref("");
const registerPassword = ref("");
const confirmPassword = ref("");
const showRegister = ref(false);
const avatarUrl = ref("");

const emit = defineEmits(["login", "close"]);

const handleLogin = () => {
    emit("login", {
        username: username.value,
        password: password.value,
        avatar: avatarUrl.value || "@/assets/images/pig6.jpg",
    });
};

const handleRegister = () => {
    if (registerPassword.value !== confirmPassword.value) {
        alert("两次密码输入不一致！");
        return;
    }
    emit("login", {
        username: registerUsername.value,
        password: registerPassword.value,
        avatar: avatarUrl.value,
    });
    closeLoginResgister();
};

const closeDialog = () => {
    showRegister.value = false;
    router.push("/");

};

</script>

<template>
    <div class="login-dialog">
        <div class="login" v-if="!showRegister">
            <h2>登录</h2>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <input type="text" id="username" v-model="username" required class="form-control" />
                </div>
                <div class="form-group">
                    <label for="password">密码</label>
                    <input type="password" id="password" v-model="password" required class="form-control" />
                </div>
                <div class="form-actions">
                    <button type="submit" class="login-btn">登录</button>
                    <button type="button" class="cancel-btn" @click="closeDialog">
                        取消
                    </button>
                </div>
            </form>
            <div class="register-link">
                <span>还没有账号？</span>
                <a href="#" @click.prevent="showRegister = true">立即注册</a>
            </div>
        </div>
        <div v-else class="register-section">
            <h3>注册新账号</h3>
            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label for="register-username">用户名</label>
                    <input type="text" id="register-username" v-model="registerUsername" required
                        class="form-control" />
                </div>
                <div class="form-group">
                    <label for="register-password">密码</label>
                    <input type="password" id="register-password" v-model="registerPassword" required
                        class="form-control" />
                </div>
                <div class="form-group">
                    <label for="register-password">确认密码</label>
                    <input type="password" id="register-password" v-model="confirmPassword" required
                        class="form-control" />
                </div>
                <div class="form-group">

                </div>

                <div class="form-actions">
                    <button type="submit" class="register-btn">注册</button>
                    <button type="button" class="back-btn" @click="showRegister = false">
                        返回登录
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.login-dialog {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 20px;
    overflow: auto;
    border-radius: 16px;
    box-sizing: border-box;
    height: calc(100vh - 110px);
    display: flex;
    justify-content: center;
    align-items: center;

    .login,
    .register-section {
        width: 500px;
        padding: 30px;
        border-radius: 10px;

        .form-group {
            margin-bottom: 20px;

            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: rgba(255, 255, 255, 0.1);
                color: inherit;
            }

            .form-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;

                button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
            }

            .login-btn,
            .register-btn {
                background-color: #e8b9aa;
                color: #333;
            }

            .cancel-btn,
            .back-btn {
                background-color: #555;
                color: #fff;
            }
        }

        .register-link {
            margin-top: 20px;
            text-align: center;
        }
    }
}
</style>