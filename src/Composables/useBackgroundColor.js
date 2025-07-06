import { ref, onMounted } from 'vue';

export function useBackgroundColor() {
    const backgroundColor = ref('#0a0a1a'); // 默认深色背景
    const textColor = ref('#ffffff'); // 默认白色文本

    // 计算颜色亮度（0-255）
    const calculateLuminance = (color) => {
        // 处理6位和3位十六进制颜色
        let hex = color.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        // 转换为RGB值
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        // 计算相对亮度（WCAG标准）
        const rSRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const gSRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const bSRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

        return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB;
    };

    // 根据背景色自动选择文本颜色
    const getContrastTextColor = (bgColor) => {
        const luminance = calculateLuminance(bgColor);
        // 根据亮度阈值选择文本颜色（0.179是WCAG建议值）
        return luminance > 0.179 ? '#000000' : '#ffffff';
    };

    // 改变背景颜色
    const changeBackgroundColor = (color) => {
        backgroundColor.value = color;
        textColor.value = getContrastTextColor(color);

        // 保存到localStorage
        localStorage.setItem('backgroundColor', color);
        localStorage.setItem('textColor', textColor.value);
    };

    // 初始化时加载保存的颜色
    onMounted(() => {
        const savedBgColor = localStorage.getItem('backgroundColor');
        const savedTextColor = localStorage.getItem('textColor');

        if (savedBgColor) {
            backgroundColor.value = savedBgColor;
            textColor.value = savedTextColor || getContrastTextColor(savedBgColor);
        }
    });

    return {
        backgroundColor,
        textColor,
        changeBackgroundColor
    };
}