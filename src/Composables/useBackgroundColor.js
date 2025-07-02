import { ref, computed, watch, onMounted } from 'vue'

export function useBackgroundColor() {
    const backgroundColor = ref('#f4f4f4')

    // 计算文本颜色
    const textColor = computed(() => {
        const hex = backgroundColor.value.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        // 计算亮度
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        // 根据亮度返回黑色或白色
        return brightness > 128 ? '#000000' : '#ffffff'
    })
    // 更新背景颜色
    const changeBackgroundColor = (newColor) => {
        backgroundColor.value = newColor
    }

    // 监视颜色变化并保存到 localStorage
    watch(backgroundColor, (newColor) => {
        localStorage.setItem('savedColor', newColor)
    })

    // 在组件挂载时加载保存的颜色
    onMounted(() => {
        const savedColor = localStorage.getItem('savedColor')
        if (savedColor) {
            backgroundColor.value = savedColor
        }
    })

    return {
        backgroundColor,
        textColor,
        changeBackgroundColor
    }
}