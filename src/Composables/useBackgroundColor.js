import { ref, computed } from 'vue'

export function useBackgroundColor() {
    const backgroundColor = ref('#0a0a1a')
    const backgroundImage = ref('')
    const textColor = ref('#ffffff')
    const backgroundType = ref('color')

    // 保存设置到本地存储
    const saveToLocalStorage = () => {
        const settings = {
            backgroundColor: backgroundColor.value,
            backgroundImage: backgroundImage.value,
            backgroundType: backgroundType.value,
            textColor: textColor.value
        }
        localStorage.setItem("themeSettings", JSON.stringify(settings))
    }

    // 从本地存储加载设置
    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem("themeSettings")
        if (saved) {
            try {
                const settings = JSON.parse(saved)
                backgroundColor.value = settings.backgroundColor || '#0a0a1a'
                backgroundImage.value = settings.backgroundImage || ''
                backgroundType.value = settings.backgroundType || 'color'
                textColor.value = settings.textColor || '#ffffff'
            } catch (error) {
                console.error('加载失败', error);
            }
        }
    }

    const getTextColorForImage = () => {
        return new Promise((resolve) => {
            resolve('#ffffff')
        })
    }

    const getLuminance = (color) => {
        if (color.startsWith('#')) {
            const hex = color.replace('#', '')
            const r = parseInt(hex.substr(0, 2), 16) / 255
            const g = parseInt(hex.substr(2, 2), 16) / 255
            const b = parseInt(hex.substr(4, 2), 16) / 255

            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
            return luminance
        }
        return 0.5 // 默认值
    }

    const changeBackgroundColor = (color) => {
        backgroundColor.value = color
        backgroundType.value = 'color'
        backgroundImage.value = ''
        // 根据背景颜色调整文字颜色
        // textColor.value = color === '#ffffff' ? '#333333' : '#ffffff'
        const luminance = getLuminance(color)
        textColor.value = luminance > 0.6 ? '#333333' : '#ffffff'
        saveToLocalStorage()
    }

    const changeBackgroundImage = (imageUrl) => {
        backgroundImage.value = imageUrl
        backgroundType.value = 'image'
        textColor.value = '#ffffff'
        saveToLocalStorage()
    }

    const computedTextColor = computed(() => {
        if (backgroundType.value === 'image') {
            return '#ffffff'
        } else {
            const luminance = getLuminance(backgroundColor.value)
            return luminance > 0.6 ? '#333333' : '#ffffff'
        }
    })

    const clearBackground = () => {
        backgroundImage.value = ''
        backgroundType.value = 'color'
        changeBackgroundColor('#0a0a1a')
    }

    loadFromLocalStorage()

    return {
        backgroundColor,
        backgroundImage,
        backgroundType,
        computedTextColor,
        textColor: computedTextColor,
        changeBackgroundColor,
        changeBackgroundImage,
        clearBackground

    }
}