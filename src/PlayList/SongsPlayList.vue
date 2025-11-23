<script setup>
import { inject } from 'vue';

// 注入共享状态和方法
const currentPlaylist = inject('currentPlaylist');
const currentSong = inject('currentSong')
const playSong = inject('playSong');
const addSongToPlaylist = inject('addSongToPlaylist');
const likeSong = inject('likeSong');
const isLiked = inject('isLiked');
const downloadSong = inject('downloadSong');

// 处理歌曲点击
const handleSongClick = (song) => {
    console.log('点击歌曲', song);
    console.log('当前播放歌曲', playSong);

    // 如果是同一首歌，强制重置进度
    const isSameSong = currentSong.value.id === song.id
    // 确保歌曲添加到播放列表
    addSongToPlaylist(song);
    // 播放歌曲
    playSong(song, isSameSong);
};

</script>

<template>
    <div class="playlist-detail" v-if="currentPlaylist">
        <div class="playlist-header">
            <div class="playlist-info">
                <div class="playlist-text">
                    <h2>{{ currentPlaylist.name }}</h2>
                    <p>{{ currentPlaylist.description }}</p>
                    <div class="playlist-stats">
                        <span>歌曲{{ currentPlaylist.songs?.length || 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="songs-list">
            <!-- 列表表头 -->
            <div class="list-header">
                <div class="header-item header-cover">歌曲封面</div>
                <div class="header-item header-title">歌曲/歌手</div>
                <div class="header-item header-album">专辑</div>
                <div class="header-item header-duration">时长</div>
            </div>

            <div v-for="song in currentPlaylist.songs" :key="song.id" class="song-item" @click="handleSongClick(song)"
                :class="{ 'active': currentSong && currentSong.id === song.id}">
                <div class="song-cover">
                    <img :src="song.cover" alt="歌曲封面" />
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
                        <button class="download-btn" @click.stop="downloadSong(song)">
                            <font-awesome-icon icon="download" />
                        </button>
                    </div>
                </div>
                <div class="song-album">
                    {{ song.album || '未知专辑' }}
                </div>
                <div class="song-duration">{{ song.duration || '00:00:00' }}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playlist-detail {
    padding: 20px;
    overflow: auto;
    border-radius: 16px;
    height: calc(100vh - 110px);

    &::-webkit-scrollbar {
        display: none;
    }

    .playlist-header {
        margin-bottom: 30px;

        .playlist-info {
            .playlist-text {
                h2 {
                    font-size: 28px;
                    margin-bottom: 10px;
                }

                p {
                    margin-bottom: 15px;
                    font-size: 16px;
                }

                .playlist-stats {
                    font-size: 14px;
                }
            }
        }
    }

    .songs-list {
        display: flex;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 25px;

        .list-header {
            display: grid;
            grid-template-columns: 80px 2fr 1.5fr 100px;
            align-items: center;
            padding: 15px 20px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            .header-item {
                &.header-album,&.header-title {
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
            transition: all 0.3s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.1);

                .song-info{
                    .song-actions{
                        .download-btn{
                            opacity: 1;
                        }
                    }
                }
            }

            &.active {
                background: rgba(232, 185, 170, 0.2);
                border-left: 3px solid #e8b9aa;

                .song-title {
                    color: #e8b9aa;
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
                    display: flex;
                    align-items: center;
                    gap: 8px;

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

                        &.active {
                            color: #ff6b6b;
                        }

                        svg {
                            font-size: 28px;
                        }
                    }

                    .download-btn {
                        border: none;
                        background: none;
                        color: rgba(255, 255, 255, 0.5);
                        cursor: pointer;
                        padding: 8px;
                        border-radius: 50%;
                        transition: all 0.3s ease;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 40px;
                        height: 40px;
                        opacity: 0;
                        transform: scale(0.8);

                        &:hover {
                            background: rgba(255, 255, 255, 0.1);
                            color: #4fc3f7;
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

@media screen and (max-width: 768px) {
    .playlist-detail {
        padding: 12px;
        height: calc(100vh - 140px); // 调整高度适应移动端布局

        .playlist-header {
            margin-bottom: 20px;

            .playlist-info .playlist-text {
                h2 {
                    font-size: 24px;
                }
                
                p {
                    font-size: 14px;
                }
            }
        }

        .songs-list {
            .list-header {
                grid-template-columns: 50px 1fr 60px;
                
                .header-album,
                .header-duration {
                    display: none;
                }
            }

            .song-item {
                grid-template-columns: 50px 1fr 60px;
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
                    padding-left: 12px;

                    .song-info-content {
                        .song-title {
                            font-size: 15px;
                        }
                        
                        .song-artist {
                            font-size: 13px;
                        }
                    }

                    .song-actions {
                        gap: 4px;

                        .like-btn,
                        .download-btn {
                            width: 36px;
                            height: 36px;
                            
                            svg {
                                font-size: 20px;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>