<script setup>
import { inject, computed } from 'vue'

const playHistory = inject('playHistory')
const playSong = inject('playSong')
const likeSong = inject('likeSong');
const isLiked = inject('isLiked');
const clearPlayHistory = inject('clearPlayHistory')
const currentSong = inject('currentSong')

// 处理歌曲点击播放
const handleSongClick = (song) => {
    playSong(song)
}

// 清空播放历史
const handleClearHistory = () => {
    clearPlayHistory()
}

// 计算属性:是否有播放历史
const handlePlayHistory = computed(() => playHistory.value.length > 0)
</script>

<template>
    <div class="recently-played">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">播放历史</h1>
                <p class="page-subtitle">最近播放的 {{ playHistory.length }} 首歌曲</p>
            </div>
            <div class="header-actions">
                <button v-if="handlePlayHistory" @click="handleClearHistory" class="clear-btn" title="清空所有播放历史">
                    <font-awesome-icon icon="trash" />
                    <span>清空历史</span>
                </button>
            </div>
        </div>

        <!-- 歌曲列表 -->
        <div class="songs-container">
            <div v-if="!handlePlayHistory" class="empty-state">
                <font-awesome-icon icon="history" />
                <h3>暂无播放历史</h3>
                <p>播放一些歌曲后，这里会显示您的播放记录</p>
            </div>

            <div v-else class="songs-list">
                <!-- 列表表头 -->
                <div class="list-header">
                    <div class="header-item header-cover">歌曲封面</div>
                    <div class="header-item header-title">歌曲/歌手</div>
                    <div class="header-item header-album">专辑</div>
                    <div class="header-item header-duration">时长</div>
                </div>

                <!-- 歌曲列表 -->
                <div v-for="(song, index) in playHistory" :key="song.id + '-' + index" class="song-item"
                    :class="{ active: currentSong && currentSong.id === song.id }" @click="handleSongClick(song)">

                    <div class="song-cover">
                        <img :src="song.cover" alt="专辑封面" />
                    </div>

                    <div class="song-info">
                        <div class="song-info-content">
                            <div class="song-title">{{ song.title }}</div>
                            <div class="song-artist">{{ song.artist }}</div>
                        </div>
                        <div class="song-actions">
                            <button class="like-btn" :class="{ 'active': isLiked(song.id) }" @click.stop="likeSong(song)">
                                <font-awesome-icon icon="heart" />
                            </button>
                        </div>
                    </div>

                    <div class="song-album">
                        {{ song.album || '未知专辑' }}
                    </div>

                    <div class="song-duration">
                        {{ song.duration || '00:00:00' }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.recently-played {
    padding: 20px;
    height: calc(100vh - 110px);
    overflow: auto;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .header-content {
            .page-title {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                background: linear-gradient(135deg, #ff6b6b, #e8b9aa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .page-subtitle {
                font-size: 16px;
                opacity: 0.8;
                margin: 0;
            }
        }

        .header-actions {
            .clear-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(255, 107, 107, 0.1);
                color: #ff6b6b;
                border: 1px solid rgba(255, 107, 107, 0.2);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;

                &:hover {
                    background: rgba(255, 107, 107, 0.2);
                    transform: translateY(-2px);
                }
            }
        }
    }

    .songs-container {
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: rgba(255, 255, 255, 0.6);

            svg {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }

            h3 {
                margin-bottom: 8px;
                color: rgba(255, 255, 255, 0.8);
            }
        }

        .songs-list {
            .list-header {
                display: grid;
                grid-template-columns: 80px 2fr 1.5fr 100px;
                align-items: center;
                padding: 15px 20px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.7);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);

                .header-item {
                    &.header-title {
                        padding-left: 20px;
                    }

                    &.header-album {
                        padding-left: 20px;
                    }

                    &.header-duration {
                        text-align: center;
                    }
                }
            }

            .song-item {
                display: grid;
                grid-template-columns: 80px 2fr 1.5fr 100px;
                align-items: center;
                padding: 12px 20px;
                margin-bottom: 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                    background: rgba(255, 255, 255, 0.08);
                }

                &.active {
                    background: rgba(232, 185, 170, 0.2);
                    border-left: 3px solid #e8b9aa;

                    .song-title {
                        color: #e8b9aa;
                    }

                    .like-btn {
                        color: #ff6b6b;
                    }
                }

                .song-cover {
                    width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    overflow: hidden;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .song-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-left: 20px;
                    min-width: 0;

                    .song-info-content {
                        flex: 1;
                        min-width: 0;

                        .song-title {
                            font-size: 16px;
                            font-weight: 500;
                            margin-bottom: 4px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        .song-artist {
                            font-size: 14px;
                            color: rgba(255, 255, 255, 0.7);
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }

                    .song-actions {
                        margin-right: 200px;

                        .like-btn {
                            background: none;
                            border: none;
                            color: rgba(255, 255, 255, 0.5);
                            cursor: pointer;
                            padding: 8px;
                            border-radius: 50%;
                            transition: all 0.2s ease;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 40px;
                            height: 40px;

                            &:hover {
                                background: rgba(255, 255, 255, 0.1);
                                color: #ff6b6b;
                                transform: scale(1.1);
                            }

                            svg {
                                font-size: 28px;
                            }
                        }
                    }
                }

                .song-album {
                    padding-left: 20px;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .song-duration {
                    text-align: center;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                }
            }
        }
    }
}

// 移动端适配
@media (max-width: 768px) {
    .recently-played {
        padding: 16px;

        .page-header {
            h1 {
                font-size: 24px;
            }
        }

        .songs-container .songs-list {
            .list-header {
                grid-template-columns: 60px 1fr 80px;

                .header-album,
                .header-duration {
                    display: none;
                }
            }

            .song-item {
                grid-template-columns: 60px 1fr 80px;
                padding: 10px 12px;

                .song-cover {
                    width: 40px;
                    height: 40px;
                }

                .song-album,
                .song-duration {
                    display: none;
                }

                .song-info {
                    .song-info-content {
                        .song-title {
                            font-size: 15px;
                        }

                        .song-artist {
                            font-size: 13px;
                        }
                    }

                    .song-actions {
                        margin-left: 10px;

                        .like-btn {
                            width: 36px;
                            height: 36px;
                        }
                    }
                }
            }
        }
    }
}
</style>