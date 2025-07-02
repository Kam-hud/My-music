<script setup>
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 从根组件注入的状态和方法
const currentSong = inject('currentSong')
const playlist = inject('playlist')
const playPrevious = inject('playPrevious')
const playNext = inject('playNext')
const playSong = inject('playSong')
const togglePlay = inject('togglePlay')
const audio = inject('audio')

// 播放器状态
const currentPosition = ref(0)
const totalDuration = ref(0)
const volume = ref(80)
const showVolumeControls = ref(false)
const playMode = ref('顺序') // 顺序/单曲循环/随机
const showLyrics = ref(false)
const isHovering = ref(false)
const isPlayingListVisible = ref(false)

// 播放模式图标映射
const playModeIcons = computed(() => ({
    '顺序': 'sync',
    '单曲循环': 'repeat',
    '随机': 'random'
}))

// 操作图标
const actionIcons = ref([
    { id: 1, icon: 'heart', name: '喜欢' },
    { id: 2, icon: 'comment', name: '评论' },
    { id: 3, icon: 'share-alt', name: '分享' },
    { id: 4, icon: 'download', name: '下载' }
])

// 更新进度条
const updateProgress = () => {
    currentPosition.value = audio.value.currentTime
    if (audio.value.duration && !isNaN(audio.value.duration)) {
        totalDuration.value = audio.value.duration
    }
}

// 设置音量
const changeVolume = (e) => {
    volume.value = e.target.value
    audio.value.volume = volume.value / 100
}

// 切换音量控制显示
const toggleVolumeControl = () => {
    showVolumeControls.value = !showVolumeControls.value
}

// 切换播放模式
const togglePlayMode = () => {
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
    const time = e.target.value
    audio.value.currentTime = time
    currentPosition.value = time
}

// 设置播放位置
const setPlayPosition = (percent) => {
    const newTime = (percent / 100) * totalDuration.value
    audio.value.currentTime = newTime
    currentPosition.value = newTime
}

// 监听音频事件
onMounted(() => {
    audio.value.addEventListener('timeupdate', updateProgress)
    audio.value.addEventListener('loadedmetadata', () => {
        if (audio.value.duration && !isNaN(audio.value.duration)) {
            totalDuration.value = audio.value.duration
        }
    })
    audio.value.volume = volume.value / 100
})

// 卸载组件
onUnmounted(() => {
    audio.value.removeEventListener('timeupdate', updateProgress)
})
</script>

<template>
    <div class="music-player" :class="{ expanded: isHovering }" @mouseenter="isHovering = true"
        @mouseleave="isHovering = false">
        <!-- 进度条 -->
        <div class="progress-container">
            <div class="progress-bar" @click="setPlayPosition">
                <div class="progress" :style="{ width: (currentPosition / totalDuration) * 100 + '%' }">
                    <div class="progress-handle"></div>
                </div>
            </div>
            <div class="time-display">
                <span>{{ formatTime(currentPosition) }}</span>
                <span>{{ formatTime(totalDuration) }}</span>
            </div>
        </div>

        <div class="player-content">
            <!-- 左侧：歌曲信息 -->
            <div class="song-info">
                <div class="album-cover">
                    <img :src="currentSong.cover || 'https://via.placeholder.com/80'" alt="专辑封面">
                    <div class="play-icon" :class="{ playing: currentSong.isPlaying }" @click="togglePlay">
                        <font-awesome-icon :icon="currentSong.isPlaying ? 'pause' : 'play'" />
                    </div>
                </div>
                <div class="track-details">
                    <div class="track-title">{{ currentSong.title || '未播放' }}</div>
                    <div class="track-artist">{{ currentSong.artist || '选择歌曲开始播放' }}</div>
                </div>
                <div class="action-icons">
                    <div v-for="item in actionIcons" :key="item.id" class="action-icon" :title="item.name">
                        <font-awesome-icon :icon="item.icon" />
                    </div>
                </div>
            </div>

            <!-- 中间：播放控制 -->
            <div class="player-controls">
                <button class="mode-btn" :title="'播放模式: ' + playMode" @click="togglePlayMode">
                    <font-awesome-icon :icon="playModeIcons[playMode]" />
                </button>
                <button @click="playPrevious" title="上一首">
                    <font-awesome-icon icon="step-backward" />
                </button>
                <button @click="togglePlay" class="play-btn" title="播放/暂停">
                    <font-awesome-icon :icon="currentSong.isPlaying ? 'pause' : 'play'" />
                </button>
                <button @click="playNext" title="下一首">
                    <font-awesome-icon icon="step-forward" />
                </button>
            </div>

            <!-- 右侧：附加功能 -->
            <div class="player-actions">
                <div class="volume-control">
                    <button @click="toggleVolumeControl" title="音量控制">
                        <font-awesome-icon
                            :icon="volume > 50 ? 'volume-up' : volume > 0 ? 'volume-down' : 'volume-mute'" />
                    </button>
                    <div v-show="showVolumeControls || isHovering" class="volume-slider">
                        <input type="range" min="0" max="100" v-model="volume" @input="changeVolume"
                            class="volume-range" />
                    </div>
                </div>

                <button class="lyrics-btn" :class="{ active: showLyrics }" @click="toggleLyrics" title="歌词">
                    <font-awesome-icon icon="music" />
                </button>

                <button class="playlist-btn" title="播放列表">
                    <font-awesome-icon icon="bars" />
                </button>
            </div>
        </div>

        <!-- 歌词面板 -->
        <div v-if="showLyrics" class="lyrics-panel">
            <div class="lyrics-header">
                <h3>歌词</h3>
                <button @click="toggleLyrics" class="close-btn">
                    <font-awesome-icon icon="times" />
                </button>
            </div>
            <div class="lyrics-content">
                <p>这里是歌词内容...</p>
                <p>当前播放的歌词行会高亮显示</p>
                <p>支持滚动和同步显示</p>
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
    background: rgba(30, 30, 40, 0.95);
    color: white;
    padding: 10px 20px;
    height: 90px;
    z-index: 1000;
    box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    &.expanded {
        height: 110px;
        background: rgba(20, 20, 30, 0.98);
    }

    .progress-container {
        width: 100%;
        margin-bottom: 10px;

        .progress-bar {
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            cursor: pointer;
            position: relative;
            margin-bottom: 5px;

            .progress {
                height: 100%;
                background: linear-gradient(90deg, #e8b9aa, #ff6b6b);
                border-radius: 2px;
                position: relative;
                transition: width 0.1s;

                .progress-handle {
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    right: -6px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0;
                    transition: opacity 0.2s;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                }
            }

            &:hover {
                .progress-handle {
                    opacity: 1;
                }
            }
        }

        .time-display {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
        }
    }

    .player-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;

        .song-info {
            display: flex;
            align-items: center;
            flex: 1;
            max-width: 35%;

            .album-cover {
                position: relative;
                width: 60px;
                height: 60px;
                margin-right: 15px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .play-icon {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                    cursor: pointer;
                    font-size: 20px;

                    &.playing {
                        opacity: 1;
                        background: rgba(232, 185, 170, 0.7);
                    }
                }

                &:hover .play-icon {
                    opacity: 1;
                }
            }

            .track-details {
                flex: 1;
                min-width: 0;

                .track-title {
                    font-weight: bold;
                    font-size: 16px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .track-artist {
                    font-size: 14px;
                    opacity: 0.8;
                    margin-top: 3px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

            .action-icons {
                display: flex;
                margin-left: 15px;

                .action-icon {
                    margin-left: 15px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.3s, color 0.3s;
                    font-size: 18px;

                    &:hover {
                        opacity: 1;
                        color: #e8b9aa;
                    }
                }
            }
        }

        .player-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;

            button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                margin: 0 8px;
                transition: background-color 0.3s;
                opacity: 0.9;

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                    opacity: 1;
                }

                &.mode-btn {
                    font-size: 16px;
                }

                &.play-btn {
                    width: 45px;
                    height: 45px;
                    background: rgba(232, 185, 170, 0.8);
                    font-size: 20px;

                    &:hover {
                        background: rgba(232, 185, 170, 1);
                    }
                }
            }
        }

        .player-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            flex: 1;
            max-width: 35%;

            .volume-control {
                position: relative;
                display: flex;
                align-items: center;

                button {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 18px;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    opacity: 0.9;

                    &:hover {
                        background: rgba(255, 255, 255, 0.1);
                        opacity: 1;
                    }
                }

                .volume-slider {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(50, 50, 60, 0.95);
                    padding: 15px 8px;
                    border-radius: 25px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

                    .volume-range {
                        height: 120px;
                        width: 8px;
                        -webkit-appearance: slider-vertical;
                        writing-mode: bt-lr;
                    }
                }
            }

            .lyrics-btn,
            .playlist-btn {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                margin-left: 15px;
                opacity: 0.9;
                transition: all 0.3s;

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                    opacity: 1;
                }

                &.active {
                    color: #e8b9aa;
                    background: rgba(232, 185, 170, 0.2);
                }
            }
        }
    }

    .lyrics-panel {
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        background: rgba(20, 20, 30, 0.98);
        padding: 15px;
        border-radius: 10px 10px 0 0;
        box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.3);
        max-height: 300px;
        overflow-y: auto;

        .lyrics-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            h3 {
                margin: 0;
                font-size: 18px;
            }

            .close-btn {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                opacity: 0.7;

                &:hover {
                    opacity: 1;
                }
            }
        }

        .lyrics-content {
            p {
                margin: 10px 0;
                line-height: 1.6;
                opacity: 0.7;

                &:nth-child(2) {
                    color: #e8b9aa;
                    opacity: 1;
                    font-weight: bold;
                }
            }
        }
    }
}

@media screen and (max-width: 1200px) {
    .music-player {
        .player-content {
            flex-wrap: wrap;

            .song-info {
                max-width: 100%;
                margin-bottom: 10px;
            }

            .player-controls {
                order: 2;
                flex: 1 0 100%;
                margin: 10px 0;
            }

            .player-actions {
                max-width: 100%;
                justify-content: center;
                order: 3;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .music-player {
        left: 0;
        height: auto;
        padding: 10px;

        .player-content {
            .song-info {
                .action-icons {
                    display: none;
                }
            }

            .player-controls {
                button {
                    margin: 0 5px;
                }
            }

            .player-actions {
                .volume-control .volume-slider {
                    left: 0;
                    transform: none;
                }
            }
        }
    }
}
</style>