<script setup>
import { ref } from 'vue';
// 使用 defineEmits 来定义 emit
const emit = defineEmits();  

const changeColor = (color) => {
  // 发出事件，将颜色传递给父组件
  emit('change-background', color); // 触发事件
}

const showTheme = ref(true)

</script>

<template>
    <div class="container-brush">
        <div class="navbar">
            <div class="logo-section">
                <div class="logo" :class="{ 'large-font' : showTheme }" @click="showTheme = true">个性主题</div>
                <div class="desktop-decoration" :class="{ 'large-font' : !showTheme }" @click="showTheme = false">桌面装扮</div>
            </div>
        </div>
        <div class="paint-brush" v-if="showTheme">
            <div class="color-option" style="background-color:#FF6347;" @click="changeColor('#FF6347')">Tomato</div>
            <div class="color-option" style="background-color:#4682B4;" @click="changeColor('#4682B4')">SteelBlue</div>
            <div class="color-option" style="background-color:#32CD32;" @click="changeColor('#32CD32')">LimeGreen</div>
            <div class="color-option" style="background-color:#FFD700;" @click="changeColor('#FFD700')">Yellow</div>
            <div class="color-option" style="background-color:#D2691E;" @click="changeColor('#D2691E')">chocolate</div>
            <div class="color-option" style="background-color:#8A2BE2;" @click="changeColor('#8A2BE2')">modena</div>
        </div>
        <!-- 在这里放置“桌面装扮”相关内容 -->
        <div v-else>
            <h2>桌面装扮内容</h2>
            <p>这里可以放置有关桌面装扮的其他内容。</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container-brush {
    position: fixed;
    display: flex;
    flex-direction: column;
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
    .navbar{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px 0;
        border-bottom: 1px solid #3e3e59;
        width: 100%;
        .logo-section{
            display: flex;
            gap: 20px;
            width: 100%;
            .logo{
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                &.large-font{
                    font-size: 32px;
                }
            }
            .desktop-decoration{
                font-size: 24px;
                padding-top: 5px;
                cursor: pointer;
                &.large-font{
                    font-size: 32px;
                }
            }
        }  
    }
    .paint-brush {
        display: flex;
        flex-wrap: wrap;  // 允许换行
        gap: 10px;  // 项目之间的间距
        .color-option {
            padding: 10px;
            background-color: #ddd;
            cursor: pointer;
            text-align: center;
            flex: 0 0 calc(33.33%);  // 宽度为25%，减去间隔
            box-sizing: border-box;  // 确保填充和边框不影响宽度
        }
    } 
}
</style>