<script setup>
import { ref, inject } from 'vue'
// 用户名
const username = ref('Kam')

// 注入共享状态和方法
// 当前歌曲
const currentSong = inject('currentSong')
// 歌单
const recommendedPlaylists = inject('recommendedPlaylists')
const openPlaylistDetail = inject('openPlaylistDetail')

// 处理歌单点击
const handlePlaylistClick = (playlist) => {
    openPlaylistDetail(playlist)
}
</script>

<template>
    <div class="recommended">
        <!-- 标题区域 -->
        <h1 class="title">推荐</h1>
        <h2 class="subtitle">Hi {{ username }} 今日为你推荐</h2>

        <!-- 推荐卡片区域 -->
        <div class="playlists-grid">
            <div v-for="playlist in recommendedPlaylists" :key="playlist.id" class="playlist-card"
                @click="handlePlaylistClick(playlist)">
                <div class="card-content">
                    <h3>{{ playlist.name }}</h3>
                    <p>{{ playlist.description }}</p>
                    <div class="playlist-stats">
                        <span>{{ playlist.songs?.length || 0 }} 首歌曲</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$primary-bg: #0a0a1a;
$card-bg: #1a1a2e;
$button-bg: #2a2a3e;
$text-color: white;
$text-secondary: rgba(255, 255, 255, 0.9);

.recommended {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    background-color: $primary-bg;
    height: calc(100vh - 90px);
    border-radius: 8px;
    box-sizing: border-box;
    // overflow: auto;

    .title {
        font-size: 32px;
        margin-bottom: 8px;
    }

    .subtitle {
        font-size: 24px;
        margin-bottom: 24px;
        color: $text-secondary;
    }

    /* 新增紧凑卡片网格布局 */
    .playlists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;

        .playlist-card {
            background: $card-bg;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: transform 0.2s ease;

            &:hover {
                transform: translateY(-5px);
                background: lighten($card-bg, 5%);
            }

            .card-content {
                h3 {
                    margin: 0 0 10px 0;
                    font-size: 18px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                p {
                    margin: 0 0 10px 0;
                    color: $text-secondary;
                    font-size: 14px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .playlist-stats {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 12px;
                }
            }
        }
    }
}
</style>