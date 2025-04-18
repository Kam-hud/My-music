<script setup>
import { onMounted, ref, watch, provide } from 'vue'
// 引入vue-router的useRoute方法
import { useRoute } from 'vue-router'
import draggableList from '@/components/DraggableList.vue'
import player from './components/Player.vue';
import Setting from './components/Setting.vue';
// 导入图片
import coverImage from '@/assets/images/pig5.jpg'

// 播放列表数据
const playlist = ref([
    {
        id: 1,
        title: '跳楼机',
        artist: 'LBI利比',
        cover: coverImage,
        url: '/src/assets/music/LBI利比（时柏尘） - 跳楼机.ogg'
    },
    {
        id: 2,
        title: '像晴天像雨天',
        artist: '汪苏泷',
        cover: coverImage,
        url: '/src/assets/music/汪苏泷 - 像晴天像雨天.flac'
    },
    {
        id: 3,
        title: '第一人称',
        artist: '李润祺',
        cover: coverImage,
        url: '/src/assets/music/第一人称.mp3'  
    }
])

// 当前播放的歌曲状态
const currentSong = ref({
    id: null,
    title: '',
    artist: '',
    cover: '',
    url: '',
    isPlaying: false
})

// 音频对象
const audio = ref(new Audio())

// 播放上一首
const playPrevious = () => {
    // 获取当前歌曲的索引
    const currentIndex = playlist.value.findIndex(song => song.id === currentSong.value.id)
    // 如果当前歌曲不是第一首，则播放上一首
    if (currentIndex > 0) {
        // 获取上一首歌曲
        const prevSong = playlist.value[currentIndex - 1]
        // 更新当前歌曲状态
        currentSong.value = { ...prevSong, isPlaying: true }
        // 更新音频源
        audio.value.src = prevSong.url
        // 播放音频
        audio.value.play()
    }
}

// 播放下一首
const playNext = () => {
    // 获取当前歌曲的索引
    const currentIndex = playlist.value.findIndex(song => song.id === currentSong.value.id)
    // 如果当前歌曲不是最后一首，则播放下一首
    if (currentIndex < playlist.value.length - 1) {
        // 获取下一首歌曲
        const nextSong = playlist.value[currentIndex + 1]
        // 更新当前歌曲状态
        currentSong.value = { ...nextSong, isPlaying: true }
        // 更新音频源
        audio.value.src = nextSong.url
        // 播放音频
        audio.value.play()
    }
}

// 播放指定歌曲
const playSong = (song) => {    
    // 更新当前歌曲状态
    currentSong.value = { ...song, isPlaying: true }
    // 更新音频源
    audio.value.src = song.url
    // 播放音频
    audio.value.play()
}

// 暂停/播放切换
const togglePlay = () => {
    // 如果当前歌曲正在播放，则暂停
    if (currentSong.value.isPlaying) {
        audio.value.pause()
    } else {
        // 如果当前歌曲未播放，则播放
        audio.value.play()
    }
    // 更新当前歌曲状态
    currentSong.value.isPlaying = !currentSong.value.isPlaying
}

// 监听音频事件     
onMounted(() => {
    // 监听音频结束事件
    audio.value.addEventListener('ended', () => {
        // 歌曲播放结束时自动播放下一首
        playNext()
    })
})

// 提供状态和方法给子组件
provide('currentSong', currentSong)
provide('playlist', playlist)
provide('playPrevious', playPrevious)
provide('playNext', playNext)
provide('playSong', playSong)
provide('togglePlay', togglePlay)
provide('audio', audio)

// 存储从路由传递过来的导航项
const navItems = ref([
    { path: '/recommended', name: '推荐', icon: 'star' },
    { path: '/winnow', name: '精选', icon: 'gem' },
    { path: '/dynamic', name: '动态', icon: 'bolt' }
]);
// 存储从路由传递过来的值
const myItems = ref([
    { path: '/likeMusic', name: '我喜欢的音乐', icon: 'heart' },
    { path: '/recentlyPlayed', name: '最近播放', icon: 'clock' },
    { path: '/myCollection', name: '我的收藏', icon: 'star', showMore: true },
    { path: '/download', name: '下载管理', icon: 'download', showMore: true },
    { path: '/localMusic', name: '本地音乐', icon: 'music', showMore: true },
]);

// 控制"更多"按钮的状态
const showMore = ref(false)
// 获取当前路由的信息
const route = useRoute()
// 控制"编辑"icon的显示状态
const edit = ref(false)
// 控制列表框的显示状态
const isShowModal = ref(false)
// 存储背景颜色
const backgroundColor = ref('#f4f4f4')

// 切换"更多"按钮的显示状态
const toggleShowMore = () => {
    showMore.value = !showMore.value
}

// 检查当前路由是否为给定的路径
const isActive = (path) => {
    return  route.path === path
}

// 更新用户列表的顺序
function handleUpdateOrder(newOrder) { 
    // 创建一个Map对象，用于存储列表原始的数据
    const itemsMap = new Map()
    // 遍历当前的myItems,将每个列表的名称作为一个键，整个列表作为值存储进Map中
    myItems.value.forEach(item => itemsMap.set(item.name, item))

    // 使用newOrder数组来更新myItems
    myItems.value = newOrder.map(item => {
         // 根据新顺序中的项目名称，从 itemsMap 中获取原始项目
        const original = itemsMap.get(item.name);
        // 返回一个新的对象，包含原始路径、名称、图标和 showMore 状态
        return {
            path: original.path, // 保留原始路径
            name: item.name, //新顺序的名称
            icon: item.icon, //新顺序的icon
            showMore: original.showMore // 保留原始的 showMore 状态
        };
    });
}

// 打开列表
const openModal = () => { 
    isShowModal.value = true
}
// 关闭列表
const closeModal = () => { 
    isShowModal.value = false;
}

// 更新背景颜色
const changeBackgroundColor = (newColor) => { 
    backgroundColor.value = newColor //更新背景颜色
    console.log("Updated Background Color:", newColor);
}

// 监视颜色变化，并将其保存到 localStorage
watch(backgroundColor, (newColor) => { 
    localStorage.setItem('savedColor',newColor)
})
// 在组件挂载时，尝试从 localStorage 中加载保存的颜色
onMounted(() => { 
    const savedColor = localStorage.getItem('savedColor');
    if (savedColor) { 
        backgroundColor.value = savedColor
    }
})
</script>

<template>
    <div :style="{ backgroundColor: backgroundColor}" id="app">
        <div class="sidebar">
            <div class="sidebar-header">
                <img src="@/assets/images/music_logo.png" alt="" class="music-logo">
                <h4> 莫小音音乐</h4>
            </div>
        
            <nav>
                <router-link v-for="item in navItems" :key="item.path" :to="item.path" :class="{ active: isActive(item.path) }" class="sidebar-item">
                    <font-awesome-icon :icon="item.icon" style="margin-right: 10px;" />{{ item.name }}
                </router-link>
                <span style="border-bottom: 1px solid #fff; display: inline-block; width: 200px;margin-top: 10px;"></span>
            </nav>  

            <div class="sidebar-my">
                <div class="my" @mouseover="edit= true" @mouseleave="edit=false">
                    <h4 style="margin-left: 10px; color:#858895">我的</h4>
                    <font-awesome-icon icon="edit" class="edit-icon" v-show="edit" @click="openModal" />
                </div>

                <div v-for="item in myItems" :key="`${item.path}-${item.showMore}`" class="sidebar-item-container" v-show="!item.showMore || showMore">
                    <router-link :to="item.path" :class="{ active: isActive(item.path) }" class="sidebar-item">
                        <font-awesome-icon :icon="item.icon" style="margin-right: 10px;" />{{ item.name }}
                    </router-link>
                </div>
                <span @click="toggleShowMore" class="more-toggle"> 
                    <font-awesome-icon :icon="showMore ? 'angle-up' : 'angle-down'" style="margin-right: 5px;" />
                    {{ showMore ? '收起' : '更多' }} 
                </span>
            </div>
        </div>
        <!-- 路由出口 → 匹配的组件所展示的位置  -->
        <div class="main">
            <Setting :background-color="backgroundColor" @change-background="changeBackgroundColor"></Setting>
            <player></player>
            <draggableList v-if="isShowModal" @update-order="handleUpdateOrder"  @click="closeModal"/>
            <router-view style="padding: 20px; height: 100%;"></router-view>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#app{
    display: flex;
    height: 100vh!important;
    // background-color: #f5f5f5;

    .sidebar{
        position: fixed;
        top: 0;
        left: 0;
        width: 244px;
        height: 100%;
        // background-color: #222;
        color: #fff; 
        display: flex;
        flex-direction: column;
        overflow-y: auto; // 允许垂直滚动
        overflow-x: hidden;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);

        // 隐藏滚动条
        scrollbar-width: thin; 
        scrollbar-color: transparent transparent; 
        
        .sidebar-header{
            padding: 20px;
            text-align: left;
            font-size: 24px;
            display: flex;
            align-items: center;

            .music-logo{
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 10px;
                margin-left: 10px;
            }
        }

        nav,.sidebar-my{
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            // align-items: center;
            margin-left: 20px;
            position: relative;
            margin-bottom: 20px;

            .sidebar-item-container {
                width: 100%;  
                display: block; 
                padding: 15px;
                margin-left: -16px;
            }

            .my{
                position: relative;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .edit-icon{
                    margin-left: auto;
                    margin-right: 10px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    cursor: pointer;
                }
            }

            .my:hover .edit-icon{
                opacity: 1;
                color: #858895;
            }

            .sidebar-item{
                width: 180px;
                color: #a9abb1;
                padding: 8px;
                text-decoration: none;
                font-size: 16px;
                transition: background-color 0.3s,color 0.3s;
                margin-top: 6px;
                &:hover{
                    background-color: rgba(50, 55, 69, 0.8);
                    border-radius: 5px;
                }

                &.active{
                    color: #fff;
                    background-color: #e8b9aa;
                    border-radius: 5px;
                }
            }
            .more-toggle {
                display: flex;
                align-items: center;
                color: #7b8291; 
                cursor: pointer; 
                padding: 5px 14px; 
                &:hover{
                    color: white;
                }
            }
        }
    }
    .main{
        margin-left: 244px;
        flex: 1;
        overflow-y: auto;
        height: calc(100vh - 110px);
        box-sizing: border-box;
         /* 隐藏所有滚动条 */
        &::-webkit-scrollbar {
            display: none;
        }
    }

    @media screen and (max-width: 768px){
        .sidebar{
            width: 100%;
            position: relative;
            height: auto;
            flex-direction: row;
            justify-content: space-around;
        }
        .main{
            margin-left: 0;
        }
        
    }
}
</style>
