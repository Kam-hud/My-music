<script setup>
import { ref, defineEmits} from 'vue';

// 定义可以发出的事件
const emit = defineEmits(['close','update-order']);

// 创建一个响应式引用，用于存储编辑的列表
const edits = ref([
    { id: 1, name: "我喜欢的音乐", icon: 'heart' },
    { id: 2, name: '最近播放', icon: 'play-circle' },
    { id: 3, name: '我的收藏', icon: 'heart' },
    { id: 4, name: '下载管理', icon: 'download' },
    { id: 5, name: '本地音乐', icon: 'hdd' },
])

// 存储被拖动的项目
let draggedItem = null;

// 拖动事件处理函数
function dragStart(event, item) {
    draggedItem = item; // 记录被拖动的项目
    event.dataTransfer.effectAllowed = 'move'; // 设置拖动效果为移动
}

// 放置事件处理函数
function drop(event, targetItem) { 
    // 如果目标项目是“我喜欢的音乐”，则不允许放置
    if (targetItem.name === '我喜欢的音乐') return
    // 获取被拖动项目和目标项目的索引
    const draggedIndex = edits.value.indexOf(draggedItem)
    const targetIndex = edits.value.indexOf(targetItem)

    // 更新项目的顺序
    edits.value.splice(draggedIndex, 1) // 从原位置移除被拖动项目
    edits.value.splice(targetIndex, 0 , draggedItem) // 插入到目标位置
}

// 确认设置函数
function confirmSettings() { 
    // 发出更新顺序的事件，并传递当前的编辑项目列表
    emit('update-order', edits.value.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon
    })));
    alert("设置已完成")
}

// 关闭设置窗口的函数
const closeSettings = () => {
    emit('close'); // 发出关闭事件
}
</script>

<template>
    <div class="settings-container">
        <div class="settings-menu">
            <h2 class="edit-model">编辑我的模块</h2>
            <font-awesome-icon icon="times" class="close-icon" @click="closeSettings"/>
            <p class="info-text top">拖动可调整功能常驻和排列顺序</p>
            <ul id="draggableList">
                <li v-for="item in edits" :key="item.id" :draggable="item.name !== '我喜欢的音乐'"
                    @dragstart="dragStart($event, item)" @dragover.prevent @drop="drop($event, item)"
                    :class="{ 'non-draggable': item.name === '我喜欢的音乐' }">
                    <div class="item-content">
                        <span class="icon-text">
                            <font-awesome-icon :icon="item.icon" class="icon" />
                            <span>{{ item.name }}</span>
                        </span>
                        <font-awesome-icon v-if="item.name !== '我喜欢的音乐'" icon="bars" class="drag-icon" />
                    </div>
                </li>
            </ul>
            <button @click="confirmSettings">完成</button>
        </div>
    </div>    
</template>


<style lang="scss" scoped>
.settings-container{
    position: fixed;
    top: 50%; 
    left: 50%;
    transform: translate(-50%, -50%); 
    z-index: 1000; 
    display: flex;
    justify-content: center;
    align-items: center;

    .settings-menu {
        position: relative; // 为了绝对定位关闭图标
        width: 540px;
        height: 500px;
        padding: 20px;
        background-color: #2d2d38;
        border-radius: 18px;

        .edit-model{
            text-align: center;
            color: #fff;
        }

        .close-icon {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            color: #8a8a91;
            padding: 10px;
            width: 30px;
            height: 30px;
        }

        .info-text {
            color: #ccc;
            font-size: 14px;
            text-align: center;
            margin: 10px 0;
            &.top {
                margin-bottom: 10px;
            }
            &.bottom {
                margin-top: -200px;
                color: #444;
            }
        }

        ul#draggableList {
            list-style: none;
            padding: 0;
            background-color: #34343e;
            border-radius: 8px;
            height: 320px;
            li {
                width: 500px;
                padding: 10px;
                cursor: move;
                color: #d6d6d8 ;
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                margin-left: 10px;

                &.non-draggable {
                    cursor: default;
                    color:grey;
                    opacity: 0.5;
                }

                &:hover {
                    background-color: #404049;
                    border-radius: 8px;
                }
                .item-content {
                    display: flex; 
                    align-items: center;
                    flex-grow: 1; 
                    justify-content: space-between; 
                }

                .icon-text {
                    display: flex;
                    align-items: center; 
                    margin: 0 10px; 
                    margin-top: 5px; 
                    margin-bottom: 5px;
                    .icon{
                        margin-right: 10px;
                    }
                }
                .drag-icon{
                    color: #95959a;
                }
            }
        }

        button {
            width: 200px;
            padding: 10px;
            margin: 20px auto 0;
            background-color: #e9baab;
            color: white;
            border: none;
            border-radius: 28px;
            cursor: pointer;
            font-size: 18px;
            display: block;
            text-align: center;
            &:hover {
                background-color: #d1a699;
            }
        }
    }
}

</style>
