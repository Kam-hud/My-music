<script setup>
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const isSidebarCollapsed = inject('isSidebarCollapsed', ref(false))

const progressSaveTimer = ref(null)

// 从根组件注入的状态和方法
const currentSong = inject('currentSong')
const playlist = inject('playlist')
const playHistory = inject('playHistory')
const playPrevious = inject('playPrevious')
const playNext = inject('playNext')
const playSong = inject('playSong')
const togglePlay = inject('togglePlay')
const audio = inject('audio')
const seekToTime = inject('seekToTime')
const seekToPercentage = inject('seekToPercentage')
// const formattedCurrentTime = inject('formattedCurrentTime')
// const formattedDuration = inject('formattedDuration')
const progressPercentage = inject('progressPercentage')
const getPlayHistory = inject('getPlayHistory')
const clearPlayHistory = inject('clearPlayHistory')
const playMode = inject('playMode')
const togglePlayMode = inject('togglePlayMode')

// 播放器状态
const volume = ref(80)
const showVolumeControls = ref(false)
const showLyrics = ref(false)
const isHovering = ref(false)
const showPlaylistPanel = ref(false)
const showHistoryPanel = ref(false)


// 格式化时间函数
const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

// 本地计算属性
const formattedCurrentTime = computed(() => {
    return formatTime(currentSong.value.currentTime)
})

const formattedDuration = computed(() => {
    return formatTime(currentSong.value.duration)
})

// 播放模式图标映射
const playModeIcons = computed(() => ({
    '顺序': 'sync',
    '单曲循环': 'repeat',
    '随机': 'random'
}))

// 操作图标
const actionIcons = ref([
    { id: 1, icon: 'heart', name: '喜欢', action: (song) => likeSong(song) },
    { id: 2, icon: 'comment', name: '评论' },
    { id: 3, icon: 'share-alt', name: '分享' },
    { id: 4, icon: 'download', name: '下载' }
])

// 设置音量
const changeVolume = (e) => {
    volume.value = e.target.value
    audio.value.volume = volume.value / 100
}

// 切换音量控制显示
const toggleVolumeControl = () => {
    showVolumeControls.value = !showVolumeControls.value
}

// 切换歌词显示
const toggleLyrics = () => {
    showLyrics.value = !showLyrics.value
}

// 点击进度条跳转
const handleProgressClick = (e) => {
    const progressBar = e.currentTarget
    const clickPosition = e.offsetX
    const progressBarWidth = progressBar.clientWidth
    const percentage = (clickPosition / progressBarWidth) * 100
    seekToPercentage(percentage)
}

// 播放列表的显示和隐藏
const togglePlaylistPanel = () => {
    showPlaylistPanel.value = !showPlaylistPanel.value
    showHistoryPanel.value = false
}

// 播放历史的显示和隐藏
const toggleHistoryPanel = () => {
    showHistoryPanel.value = !showHistoryPanel.value
    showPlaylistPanel.value = false
}

// 播放列表中删除歌曲
const removeFromPlaylist = (songId) => {
    const index = playlist.value.findIndex(song => song.id === songId)
    if (index !== -1) {
        const isCurrentSong = currentSong.value.id === songId
        playlist.value.splice(index, 1)
        if (isCurrentSong) {
            if (playlist.value.length > 0) {
                const nextIndex = index < playlist.value.length ? index : 0
                playSong(playlist.value[nextIndex])
            } else {
                currentSong.value = { id: null, title: '', artist: '', cover: '', isPlaying: false }
                audio.value.pause()
            }
        }
    }
}

// 从历史记录播放歌曲
const playFromHistory = (song) => {
    playSong(song)
    showHistoryPanel.value = false
}

// 格式化播放时间
const formatPlayTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 喜欢功能
const likeSong = inject('likeSong')
const isLiked = inject('isLiked')

onMounted(() => {
    audio.value.volume = volume.value / 100
})

onUnmounted(() => {
    if (progressSaveTimer.value) {
        clearInterval(progressSaveTimer.value)
    }
})
</script>

<template>
    <div class="floating-music-player" :class="{ expanded: isHovering }" 
        @mouseenter="isHovering = true" @mouseleave="isHovering = false">
        
        <!-- 进度条 -->
        <div class="progress-container">
            <div class="progress-bar" @click="handleProgressClick">
                <div class="progress" :style="{ width: progressPercentage + '%' }">
                    <div class="progress-handle"></div>
                </div>
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
                <div class="time-display">
                    <span>{{ formattedCurrentTime }}</span>
                    <span class="time-separator">/</span>
                    <span>{{ formattedDuration }}</span>
                </div>
            </div>

            <!-- 中间：播放控制 -->
            <div class="player-controls">
                <button class="control-btn" @click="togglePlayMode" :title="'播放模式: ' + playMode">
                    <font-awesome-icon :icon="playModeIcons[playMode]" />
                </button>
                <button class="control-btn" @click="playPrevious" title="上一首">
                    <font-awesome-icon icon="step-backward" />
                </button>
                <button @click="togglePlay" class="play-btn" title="播放/暂停">
                    <font-awesome-icon :icon="currentSong.isPlaying ? 'pause' : 'play'" />
                </button>
                <button class="control-btn" @click="playNext" title="下一首">
                    <font-awesome-icon icon="step-forward" />
                </button>
            </div>

            <!-- 右侧：附加功能 -->
            <div class="player-actions">
                <div class="volume-control">
                    <button @click="toggleVolumeControl" class="action-btn" title="音量控制">
                        <font-awesome-icon :icon="volume > 50 ? 'volume-up' : volume > 0 ? 'volume-down' : 'volume-mute'" />
                    </button>
                    <div v-show="showVolumeControls" class="volume-slider">
                        <input type="range" min="0" max="100" v-model="volume" @input="changeVolume"
                            class="volume-range" />
                    </div>
                </div>

                <button class="action-btn" :class="{ active: isLiked(currentSong.id) }" @click="likeSong(currentSong)" title="喜欢">
                    <font-awesome-icon icon="heart" />
                </button>

                <button class="action-btn" @click="toggleHistoryPanel" title="播放历史">
                    <font-awesome-icon icon="history" />
                </button>

                <button class="action-btn" @click="togglePlaylistPanel" title="播放列表">
                    <font-awesome-icon icon="list" />
                    <span class="badge" v-if="playlist.length > 0">{{ playlist.length }}</span>
                </button>
            </div>
        </div>

        <!-- 播放列表面板 -->
        <div v-if="showPlaylistPanel" class="floating-panel playlist-panel">
            <div class="panel-header">
                <h3>播放列表 ({{ playlist.length }})</h3>
                <button @click="togglePlaylistPanel" class="close-btn">
                    <font-awesome-icon icon="times" />
                </button>
            </div>
            <div class="panel-content">
                <div v-if="playlist.length === 0" class="empty-state">
                    <font-awesome-icon icon="music" />
                    <p>播放列表为空</p>
                </div>
                <div v-else class="panel-items">
                    <div v-for="(song, index) in playlist" :key="song.id" class="panel-item"
                        :class="{ active: currentSong.id === song.id }" @click="playSong(song)">
                        <div class="item-number">{{ index + 1 }}</div>
                        <div class="item-cover">
                            <img :src="song.cover" alt="专辑封面">
                        </div>
                        <div class="item-details">
                            <div class="item-title">{{ song.title }}</div>
                            <div class="item-artist">{{ song.artist }}</div>
                        </div>
                        <button class="item-action" @click.stop="removeFromPlaylist(song.id)" title="移除">
                            <font-awesome-icon icon="times" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 播放历史面板 -->
        <div v-if="showHistoryPanel" class="floating-panel history-panel">
            <div class="panel-header">
                <h3>播放历史 ({{ playHistory.length }})</h3>
                <div class="panel-actions">
                    <button @click="clearPlayHistory" class="action-btn" title="清空历史" v-if="playHistory.length > 0">
                        <font-awesome-icon icon="trash" />
                    </button>
                    <button @click="toggleHistoryPanel" class="close-btn">
                        <font-awesome-icon icon="times" />
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div v-if="playHistory.length === 0" class="empty-state">
                    <font-awesome-icon icon="history" />
                    <p>暂无播放历史</p>
                </div>
                <div v-else class="panel-items">
                    <div v-for="(item, index) in playHistory" :key="item.id + '-' + index" class="panel-item"
                        @click="playFromHistory(item)">
                        <div class="item-number">{{ index + 1 }}</div>
                        <div class="item-cover">
                            <img :src="item.cover" alt="专辑封面">
                        </div>
                        <div class="item-details">
                            <div class="item-title">{{ item.title }}</div>
                            <div class="item-artist">{{ item.artist }}</div>
                            <div class="item-meta">
                                <span class="play-time">{{ formatPlayTime(item.playTime) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.floating-music-player {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 800px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 12px 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    z-index: 1000;
    transition: all 0.3s ease;

    &.expanded {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        transform: translateX(-50%) translateY(-5px);
    }

    .progress-container {
        margin-bottom: 12px;

        .progress-bar {
            height: 3px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
            cursor: pointer;
            position: relative;

            .progress {
                height: 100%;
                background: linear-gradient(90deg, #ff6b6b, #e8b9aa);
                border-radius: 2px;
                position: relative;
                transition: width 0.1s;

                .progress-handle {
                    width: 12px;
                    height: 12px;
                    background: #fff;
                    border: 2px solid #ff6b6b;
                    border-radius: 50%;
                    position: absolute;
                    right: -6px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0;
                    transition: opacity 0.2s;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                }
            }

            &:hover {
                .progress-handle {
                    opacity: 1;
                }
            }
        }
    }

    .player-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;

        .song-info {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;

            .album-cover {
                width: 48px;
                height: 48px;
                border-radius: 8px;
                overflow: hidden;
                margin-right: 12px;
                flex-shrink: 0;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }

            .track-details {
                flex: 1;
                min-width: 0;

                .track-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .track-artist {
                    font-size: 12px;
                    color: #666;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

            .time-display {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #999;
                margin-left: 12px;
                flex-shrink: 0;

                .time-separator {
                    margin: 0 4px;
                }
            }
        }

        .player-controls {
            display: flex;
            align-items: center;
            gap: 8px;

            .control-btn, .play-btn {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;

                &:hover {
                    background: rgba(0, 0, 0, 0.05);
                    color: #333;
                }
            }

            .play-btn {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #ff6b6b, #e8b9aa);
                color: white;
                box-shadow: 0 4px 12px rgba(232, 185, 170, 0.3);

                &:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(232, 185, 170, 0.4);
                }
            }
        }

        .player-actions {
            display: flex;
            align-items: center;
            gap: 8px;

            .volume-control {
                position: relative;

                .action-btn {
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;

                    &:hover {
                        background: rgba(0, 0, 0, 0.05);
                        color: #333;
                    }
                }

                .volume-slider {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    padding: 12px 8px;
                    border-radius: 20px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.2);

                    .volume-range {
                        height: 80px;
                        width: 6px;
                        -webkit-appearance: slider-vertical;
                        writing-mode: bt-lr;
                    }
                }
            }

            .action-btn {
                position: relative;
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;

                &:hover {
                    background: rgba(0, 0, 0, 0.05);
                    color: #333;
                }

                &.active {
                    color: #ff6b6b;
                }

                .badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #ff6b6b;
                    color: white;
                    font-size: 10px;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }
    }

    .floating-panel {
        position: absolute;
        bottom: 100%;
        right: 0;
        width: 360px;
        max-height: 400px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
        margin-bottom: 10px;
        z-index: 1001;

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);

            h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }

            .panel-actions {
                display: flex;
                gap: 8px;
            }

            .close-btn, .action-btn {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;

                &:hover {
                    background: rgba(0, 0, 0, 0.05);
                    color: #333;
                }
            }
        }

        .panel-content {
            flex: 1;
            overflow-y: auto;
            max-height: 320px;

            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                color: #999;

                svg {
                    font-size: 32px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                p {
                    margin: 0;
                    font-size: 14px;
                }
            }

            .panel-items {
                .panel-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    cursor: pointer;
                    transition: background 0.2s ease;

                    &:hover {
                        background: rgba(0, 0, 0, 0.03);
                    }

                    &.active {
                        background: rgba(232, 185, 170, 0.1);

                        .item-title {
                            color: #e8b9aa;
                        }
                    }

                    .item-number {
                        width: 20px;
                        font-size: 12px;
                        color: #999;
                        text-align: center;
                        margin-right: 12px;
                    }

                    .item-cover {
                        width: 40px;
                        height: 40px;
                        border-radius: 6px;
                        overflow: hidden;
                        margin-right: 12px;
                        flex-shrink: 0;

                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                    }

                    .item-details {
                        flex: 1;
                        min-width: 0;

                        .item-title {
                            font-size: 14px;
                            font-weight: 500;
                            color: #333;
                            margin-bottom: 2px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        .item-artist {
                            font-size: 12px;
                            color: #666;
                            margin-bottom: 4px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        .item-meta {
                            font-size: 11px;
                            color: #999;
                        }
                    }

                    .item-action {
                        background: none;
                        border: none;
                        color: #999;
                        cursor: pointer;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        opacity: 0;

                        &:hover {
                            background: rgba(255, 107, 107, 0.1);
                            color: #ff6b6b;
                        }
                    }

                    &:hover .item-action {
                        opacity: 1;
                    }
                }
            }
        }
    }
}

// 响应式设计
@media screen and (max-width: 768px) {
    .floating-music-player {
        width: 95%;
        bottom: 10px;
        padding: 10px 16px;

        .player-content {
            gap: 12px;

            .song-info {
                .time-display {
                    display: none;
                }
            }

            .player-controls {
                gap: 4px;

                .control-btn, .play-btn {
                    width: 32px;
                    height: 32px;
                }

                .play-btn {
                    width: 36px;
                    height: 36px;
                }
            }

            .player-actions {
                gap: 4px;

                .action-btn {
                    width: 28px;
                    height: 28px;
                }
            }
        }

        .floating-panel {
            width: 300px;
            right: 10px;
        }
    }
}

@media screen and (max-width: 480px) {
    .floating-music-player {
        .player-content {
            flex-wrap: wrap;
            gap: 8px;

            .song-info {
                order: 1;
                flex: 1 0 100%;
                margin-bottom: 8px;
            }

            .player-controls {
                order: 2;
                flex: 1;
                justify-content: center;
            }

            .player-actions {
                order: 3;
                flex: 1;
                justify-content: flex-end;
            }
        }

        .floating-panel {
            width: calc(100vw - 40px);
            right: 20px;
        }
    }
}
</style>