<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'

// 歌单
const songList = ref([
    { id: 1, icon: 'heart' },
    { id: 2, icon: 'comment' },
    { id: 3, icon: 'share-alt' },
    { id: 4, icon: 'download' }
])
// 当前歌曲
const currentPosition = ref(0)
// 总时长   
const totalDuration = ref(0)
// 音量
const volume = ref(50)
// 音量控制显示
const showVolumeControls = ref(false)
// 播放模式
const playMode = ref('顺序')
// 显示选项
const showOptions = ref(false)
// 显示歌词
const showLyrics = ref(false)

// 当前歌曲
const currentSong = inject('currentSong')
// 音频
const audio = inject('audio')
// 播放上一首
const playPrevious = inject('playPrevious')
// 播放下一首
const playNext = inject('playNext')
// 切换播放
const togglePlay = inject('togglePlay')

// 更新进度条
const updateProgress = () => {
    // 更新当前歌曲进度
    currentPosition.value = audio.value.currentTime
    // 更新总时长
    totalDuration.value = audio.value.duration
}

// 设置音量
const changeVolume = (e) => { 
    // 更新音量
    volume.value = e.target.value
    // 更新音频音量
    audio.value.volume = volume.value / 100
}

// 切换音量控制显示
const toggleVolumeControl = () => { 
    // 切换音量控制显示
    showVolumeControls.value = !showVolumeControls.value
}

// 切换播放模式
const togglePlayMode = () => { 
    // 切换播放模式
    if (playMode.value === '顺序') {
        playMode.value = '单曲循环'
    } else if (playMode.value === '单曲循环') {
        playMode.value = '随机'
    } else { 
        playMode.value = '顺序'
    }
}

// 格式化时间
const formatTime = (time) => { 
    // 格式化时间
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

// 切换歌词显示
const toggleLyrics = () => { 
    showLyrics.value = !showLyrics.value
}

// 拖动进度条
const seekSong = (e) => { 
    // 拖动进度条
    const time = e.target.value
    // 更新音频进度
    audio.value.currentTime = time
    // 更新当前歌曲进度
    currentPosition.value = time
}

// 监听音频事件
onMounted(() => {
    // 监听音频进度
    audio.value.addEventListener('timeupdate', updateProgress)
    // 监听音频加载元数据
    audio.value.addEventListener('loadedmetadata', () => {
        // 更新总时长
        totalDuration.value = audio.value.duration
    })
})

// 卸载组件
onUnmounted(() => {
    // 移除音频进度监听
    audio.value.removeEventListener('timeupdate', updateProgress)
})
</script>

<template>
    <div class="music-player">
        <!-- 进度条 -->
        <input type="range" min="0" :max="totalDuration" v-model="currentPosition" @input="seekSong" class="progress-bar">
        <!-- 播放器信息 -->
        <div class="player-info">
            <!-- 歌曲信息 -->
            <div class="song-info">
                <!-- 歌曲封面 -->
                <img :src="currentSong.cover" alt="Song cover" class="song-cover">
                <!-- 歌曲详情 -->
                <div class="song-details">
                    <div class="text-info"> 
                        <!-- 歌曲名称 -->
                        <p class="song-name">{{ currentSong.title }}</p>
                        <!-- 歌手 -->
                        <p class="singer">-{{ currentSong.artist }}</p>
                    </div>
                    <!-- 图标容器 -->
                    <div class="icon-container">
                        <!-- 图标 -->
                        <p v-for="item in songList" :key="item.id">
                            <font-awesome-icon :icon="item.icon" style="margin-right: 10px;" />
                        </p>
                    </div> 
                </div>
            </div>
            <!-- 播放器控制 -->
            <div class="player-controls">
                <!-- 切换播放模式 -->
                <button @click="togglePlayMode">
                    <font-awesome-icon :icon="playMode === '顺序' ? 'sync' : playMode === '单曲循环' ? 'repeat' : 'random'" />
                </button>
                <!-- 播放上一首 -->
                <button @click="playPrevious">
                    <font-awesome-icon icon="fa-solid fa-step-backward" />
                </button>
                <!-- 切换播放 -->
                <button @click="togglePlay">
                    <font-awesome-icon :icon="currentSong.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'" />
                </button>
                <!-- 播放下一首 -->
                <button @click="playNext">
                    <font-awesome-icon icon="fa-solid fa-step-forward" />
                </button>
                <!-- 音量容器 -->
                <div class="volume-container"> 
                    <!-- 音量控制 -->
                    <div class="volume-control" @click="toggleVolumeControl">
                        <font-awesome-icon icon="fa-solid fa-volume-up" />
                    </div>
                    <!-- 音量滑块 -->
                    <div class="volume-slider" v-if="showVolumeControls">
                        <!-- 音量范围 -->
                        <input type="range" min="0" max="100" v-model="volume" @input="changeVolume" class="volume-range" />
                        <!-- 音量百分比 -->
                        <span class="volume-percentage">{{ volume }}%</span>
                    </div>
                </div>
            </div>
            <!-- 播放器时间 -->
            <div class="player-time">
                <!-- 时间显示 -->
                <div class="time-display" >
                    <!-- 时间显示 -->
                    <div class="time-display">
                        <span>{{ formatTime(currentPosition) }}</span> / 
                        <span>{{ formatTime(totalDuration) }}</span>
                    </div> 
                </div>
                <!-- 歌词 -->
                <p @click="toggleLyrics" class="song-word">词</p>
                <!-- 歌单图标 -->
                <div class="playlist-icon">
                    <font-awesome-icon icon="music" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.music-player {
    position: fixed;
    bottom: 0;
    left: 244px;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    // background-color: #222;
    color: white;
    padding: 5px;
    height: 100px; /* 增加高度以容纳进度条和其他内容 */
    z-index: 1000;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);

    .progress-bar {
        width: 100%;
        margin-bottom: 5px; /* 进度条和其他内容之间的间距 */
    }

    .player-info {
        display: flex;
        justify-content: space-between; /* 调整为两端对齐 */
        align-items: center; /* 垂直居中对齐 */
        width: 100%; /* 使其占满整个宽度 */
        
        .song-info {
            display: flex;
            justify-content: flex-start; /* 靠左对齐 */
            margin-left: 20px;

            .song-cover {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                margin-right: 10px;
                margin-top: 4px;
            }
            .song-details {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                .text-info {
                    display: flex;
                    .singer {
                        padding: 8px; 
                        font-size: 12px;
                    }
                }
                .icon-container {
                    display: flex;
                    p {
                        margin-top: -10px;
                        opacity: 0.5;
                    }
                }
            }
        }

        .player-controls {
            display: flex;
            align-items: center;
            justify-content: center; /* 居中对齐 */
            flex: 1;
            
            button {
                margin-right: 10px;
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 20px; // 调整图标大小
            }

            .volume-container {
                position: relative;
                .volume-control {
                    cursor: pointer;
                }

                .volume-slider {
                    position: absolute;
                    bottom: 100%; /* 把音量滑块放在图标的上方 */
                    left: 50%;
                    transform: translateX(-50%) rotate(-360deg); /* 旋转滑块为竖向 */
                    width: 150px; /* 设置竖向滑块的宽度 */
                    height: 200px; /* 设置滑块的高度 */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 999;
                    .volume-range {
                        width: 100%;
                        height: 100%;
                        transform: rotate(270deg); /* 将范围条旋转以适应竖向 */
                    }
                    .volume-percentage {
                        color: white;
                        margin-top: 5px;
                    }
                }
            }
        }

        .player-time {
            display: flex;
            align-items: center; /* 垂直居中对齐 */
            position: relative;
            margin-right: 20px; /* 右侧间距 */

            .time-display {
                display: flex;
                align-items: center; /* 垂直居中对齐 */
            }

            .options {
                display: flex; /* 横向显示 */
                margin-left: 10px; /* 选项与时间的间距 */
                p {
                    margin-right: 10px; /* 选项之间的间距 */
                    cursor: pointer; /* 鼠标悬停时显示为手指 */
                }
            }

            .song-word{
                margin-left: 10px;
                margin-right: 10px;
                cursor: pointer;
            }

            .playlist-icon{
                cursor: pointer;
            }
        }
    }
}
</style>