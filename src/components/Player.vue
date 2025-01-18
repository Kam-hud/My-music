<script setup>
import { ref } from 'vue'

const songList = ref([
    { id: 1, icon: 'heart' },
    { id: 2, icon: 'comment' },
    { id: 3, icon: 'share-alt' },
    { id: 4, icon: 'download' }
])

const currentPosition = ref(0)
const totalDuration = ref(240) // 假设总时长为240秒
const volume = ref(50) // 初始音量
const showVolumeControls = ref(false) //控制音量调节的显示
const playMode = ref('顺序')
const showOptions = ref(false) // 控制播放列表选项的显示
const showLyrics = ref(false) // 控制歌词的显示
const isPlaying = ref(false) // 播放状态

const seekSong = () => { 
    console.log(`当前进度: ${currentPosition.value}`);
}

const changeVolume = (e) => { 
    volume.value = e.target.value
    console.log(`当前音量:${volume.value}`);
}

const toggleVolumeControl = () => { 
    showVolumeControls.value = !showVolumeControls.value
}

const togglePlayMode = () => { 
    if (playMode.value === '顺序') {
        playMode.value = '单曲循环'
    } else if (playMode.value === '单曲循环') {
        playMode.value = '随机'
    } else { 
        playMode.value = '顺序'
    }
    console.log(`当前播放模式: ${playMode.value}`);   
}

const formatTime = (time) => { 
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const toggleLyrics = () => { 
    showLyrics.value = !showLyrics.value
    console.log(`显示歌词:${showLyrics.value}`);
    
}

const togglePause = () => { 
    isPlaying.value = !isPlaying.value
    console.log(`当前状态:${isPlaying ? '播放' : '暂停'}`);
}
</script>

<template>
    <div class="music-player">
        <input type="range" min="0" v-model="currentPosition" @input="seekSong" class="progress-bar">

        <div class="player-info">
            <div class="song-info">
                <img src="@/assets/images/pig6.jpg" alt="Song cover" class="song-cover">
                <div class="song-details">
                    <div class="text-info">
                        <p class="song-name">单车</p>
                        <p class="singer">-莫奕迅</p>
                    </div>
                    <div class="icon-container">
                        <p v-for="item in songList" :key="item.id">
                            <font-awesome-icon :icon="item.icon" style="margin-right: 10px;" />
                        </p>
                    </div> 
                </div>
            </div>
            <div class="player-controls">
                <!-- 歌曲的状态 -->
                <button @click="togglePlayMode">
                    <font-awesome-icon :icon="playMode === '顺序' ? 'sync' : playMode === '单曲循环' ? 'repeat' : 'random'" />
                </button>
                <!-- 下一首 -->
                <button @click="prevSong">
                    <font-awesome-icon icon="fa-solid fa-step-backward" />
                </button>
                <!-- 暂停或播放 -->
                <button @click="togglePause">
                    <font-awesome-icon :icon="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'" />
                </button>
                <!-- 下一首 -->
                <button @click="nextSong">
                    <font-awesome-icon icon="fa-solid fa-step-forward" />
                </button>
                <div class="volume-container"> 
                    <div class="volume-control" @click="toggleVolumeControl">
                        <font-awesome-icon icon="fa-solid fa-volume-up" />
                    </div>
                    <div class="volume-slider" v-if="showVolumeControls">
                        <input type="range" min="0" max="100" v-model="volume" @input="changeVolume" class="volume-range" />
                        <span class="volume-percentage">{{ volume }}%</span>
                    </div>
                </div>

            </div>
            <div class="player-time">
                <div class="time-display" @mouseover="showOptions = true" @mouseleave="showOptions = false">
                    <div class="time-display" v-if="!showOptions">
                        <span>{{ formatTime(currentPosition) }}</span> / 
                        <span>{{ formatTime(totalDuration) }}</span>
                    </div>
                    <div class="options" v-if="showOptions">
                        <p>倍速</p>
                        <p>音质</p>
                        <p>音效</p>
                    </div>
                </div>

                <!-- 歌词按钮 -->
                <p @click="toggleLyrics" class="song-word">词</p>

                <!-- 播放列表图标 -->
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
    background-color: #222;
    color: white;
    padding: 5px;
    height: 100px; /* 增加高度以容纳进度条和其他内容 */
    z-index: 1000;

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
                        color: #7d7192;
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