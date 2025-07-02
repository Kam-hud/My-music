<!--  -->
<script setup>
import { ref, defineEmits } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const emit = defineEmits(['change-background'])

// 预设颜色
const presetColors = [
    '#FF6347', // Tomato
    '#32CD32', // LimeGreen
    '#FFFF00', // Yellow
    '#1E90FF', // DodgerBlue
    '#9370DB', // MediumPurple
    '#FF69B4', // HotPink
    '#FFA500', // Orange
    '#00CED1', // DarkTurquoise
]

// 当前选择的颜色
const selectedColor = ref('#FF6347')

// 更新背景颜色
const updateBackground = (color) => {
    selectedColor.value = color
    emit('change-background', color)
}
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