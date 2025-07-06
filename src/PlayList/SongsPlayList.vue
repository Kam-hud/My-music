<script setup>
import { inject } from 'vue';

// 注入共享状态和方法
const currentPlaylist = inject('currentPlaylist');
const playSong = inject('playSong');
const addSongToPlaylist = inject('addSongToPlaylist');
const closePlaylistDetail = inject('closePlaylistDetail');

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
                        <span>歌曲: {{ currentPlaylist.songs.length }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="songs-grid">
            <div v-for="(song, index) in currentPlaylist.songs" :key="song.id" class="song-card"
                @click="handleSongClick(song)">
                <div class="card-index">{{ index + 1 }}</div>
                <div class="card-content">
                    <h3 class="song-title">{{ song.title }}</h3>
                    <p class="song-artist">{{ song.artist }}</p>
                </div>
                <div class="song-duration">{{ song.duration || '0:00' }}</div>
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
    overflow-y: auto;
    border-radius: 16px;
    box-sizing: border-box;
    height: calc(100vh - 110px);

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
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 15px;
                    font-size: 16px;
                }

                .playlist-stats {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 14px;
                }
            }
        }
    }

    /* 新增卡片网格样式 */
    .songs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;

        .song-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;

            &:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-5px);
            }

            .card-index {
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 10px;
            }

            .song-title {
                font-size: 16px;
                margin: 0 0 5px 0;
            }

            .song-artist {
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                margin: 0;
            }

            .song-duration {
                color: rgba(255, 255, 255, 0.6);
                font-size: 12px;
                text-align: right;
                margin-top: 10px;
            }
        }
    }
}
</style>