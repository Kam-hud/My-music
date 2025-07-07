<script setup>
import { inject } from 'vue';

// 注入共享状态和方法
const currentPlaylist = inject('currentPlaylist');
const playSong = inject('playSong');
const addSongToPlaylist = inject('addSongToPlaylist');
const closePlaylistDetail = inject('closePlaylistDetail');

const likeSong = inject('likeSong');
const downloadSong = inject('downloadSong');

// 处理歌曲点击
const handleSongClick = (song) => {
    addSongToPlaylist(song);
    playSong(song);
};

</script>

<template>
    <div class="playlist-detail" v-if="currentPlaylist">
        <div class="playlist-header">
            <button class="back-button" @click="closePlaylistDetail">
                <font-awesome-icon icon="fa-solid fa-arrow-left" />
            </button>
            <div class="playlist-info">
                <div class="playlist-text">
                    <h2>{{ currentPlaylist.name }}</h2>
                    <p>{{ currentPlaylist.description }}</p>
                    <div class="playlist-stats">
                        <span>歌曲{{ currentPlaylist.songs.length }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="songs-list">
            <div class="list-header">
                <div class="header-cover">歌曲封面</div>
                <div class="header-title">歌曲/歌手</div>
                <div class="header-duration">时长</div>
                <div class="header-actions">操作</div>
            </div>

            <div v-for="song in currentPlaylist.songs" :key="song.id" class="song-item" @click="handleSongClick(song)">
                <div class="song-cover">
                    <img :src="song.cover" alt="歌曲封面" />
                </div>
                <div class="song-info">
                    <div class="song-title">{{ song.title }}</div>
                    <div class="song-artist">{{ song.artist }}</div>
                </div>
                <div class="song-duration">{{ song.duration || '00:00:00' }}</div>
                <div class="song-actions">
                    <button class="action-btn" @click.stop="likeSong(song.id)">
                        <font-awesome-icon icon="heart" />
                    </button>
                    <button class="action-btn" @click.stop="downloadSong(song.id)">
                        <font-awesome-icon icon="download" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playlist-detail {
    position: absolute;
    left: 0;
    right: 0;
    background: #1a1a2e;
    z-index: 1000;
    padding: 20px;
    overflow: auto;
    border-radius: 16px;
    box-sizing: border-box;
    height: calc(100vh - 110px);

    &::-webkit-scrollbar {
        display: none;
    }

    .playlist-header {
        display: flex;
        flex-direction: column;
        margin-bottom: 30px;

        .back-button {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            margin-bottom: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
                background: rgba(255, 255, 255, 0.1);
            }
        }

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
            display: flex;
            align-items: center;
            padding: 15px 20px;

            .header-cover {
                width: 80px;
                text-align: center;
            }

            .header-title {
                flex: 2;
                padding-left: 20px;
                text-align: left;
            }

            .header-duration {
                width: 100px;
                text-align: center;
            }

            .header-actions {
                width: 120px;
                text-align: center;
            }
        }

        .song-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            cursor: pointer;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);

            &:hover {
                background: rgba(255, 255, 255, 0.08);
            }

            .song-cover {
                width: 80px;
                height: 80px;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: visible;

                img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                }
            }

            .song-info {
                flex: 2;
                padding-left: 20px;
                text-align: left;

                .song-title {
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 5px;
                }

                .song-artist {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                }
            }

            .song-duration {
                width: 100px;
                text-align: center;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
            }

            .song-actions {
                width: 120px;
                text-align: center;
                display: flex;
                justify-content: center;
                gap: 15px;

                .action-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;

                    &:hover {
                        background: rgba(255, 255, 255, 0.2);
                        transform: scale(1.1);
                    }

                    &.active {
                        color: #e52e71;

                        &.like:hover {
                            color: #ff6b9c;
                        }
                    }

                    &.download.active {
                        color: #4cc9f0;

                        &:hover {
                            color: #7ad0f0;
                        }
                    }
                }
            }
        }
    }
}
</style>