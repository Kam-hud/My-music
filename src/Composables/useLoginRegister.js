import { ref } from "vue";
import { useRouter } from 'vue-router'

export function useLoginRegister() {
    const router = useRouter()
    const isLogin = ref(false)
    const currentUser = ref(null)

    const storedUserInfo = localStorage.getItem('currentUser')
    if (storedUserInfo) {
        isLogin.value = true
        currentUser.value = JSON.parse(storedUserInfo)
    }

    const login = (userInfo) => {
        isLogin.value = true
        currentUser.value = userInfo
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
    }

    const logout = () => {
        isLogin.value = false
        currentUser.value = null
        localStorage.removeItem('currentUser')
    }

    const openLoginResgister = () => {
        router.push('/LoginDialog')
    }

    // 更新头像
    const updateUserAvatar = (newAvatar) => {
        if (currentUser.value) {
            currentUser.value.avatar = newAvatar
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }

    return {
        isLogin,
        currentUser,
        login,
        logout,
        openLoginResgister,
        updateUserAvatar
    }
}