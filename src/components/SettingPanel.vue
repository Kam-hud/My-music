<!--  -->
<script setup>
import { ref, defineEmits, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const emit = defineEmits(['change-background'])

// 预设颜色
const presetColors = [
    '#0a0a1a',
    '#ffffff',
    '#1a1a2e',
    '#16213e',
    '#1E90FF',
    '#9370DB',
    '#FF69B4',
    '#FFA500',
    '#00CED1',
]

// 当前选择的颜色
const selectedColor = ref(null)

// 更新背景颜色
const updateBackground = (color) => {
    selectedColor.value = color
    emit('change-background', color)
    localStorage.setItem('selectedColor', color)
}

// 在组件挂载时检查是否有保存的颜色
onMounted(() => {
    const savedColor = localStorage.getItem('selectedColor')
    if (savedColor) {
        selectedColor.value = savedColor
        emit('change-background', savedColor)
    }
})
</script>

<template>
    <div class="setting-panel">
        <div class="setting-toggle">
            <font-awesome-icon icon="palette" />
            <span>主题设置</span>
        </div>

        <div class="color-picker">
            <div v-for="color in presetColors" :key="color" class="color-option" :style="{ backgroundColor: color }"
                :class="{ selected: selectedColor === color }" @click="updateBackground(color)"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.setting-panel {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px 20px;
    gap: 15px;

    .setting-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0.8;
        transition: opacity 0.3s;
        cursor: default;

        &:hover {
            opacity: 1;
        }
    }

    .color-picker {
        display: flex;
        gap: 8px;

        .color-option {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            border: 2px solid transparent;

            &:hover {
                transform: scale(1.1);
            }

            &.selected {
                transform: scale(1.15);
                box-shadow: 0 0 0 2px white;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .setting-panel {
        justify-content: center;
        padding: 10px;
    }
}
</style>