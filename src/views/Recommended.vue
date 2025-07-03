<script setup>
import { ref, inject } from 'vue'
// 用户名
const username = ref('Kam')

// 注入共享状态和方法
// 当前歌曲
const currentSong = inject('currentSong')
// 歌单
const recommendedSongs = inject('recommendedSongs')
// 播放歌曲
const playSong = inject('playSong')
// 添加歌曲到播放列表
const addSongToPlaylist = inject('addSongToPlaylist')

// 处理歌曲点击
const handleSongClick = (song) => {
    addSongToPlaylist(song)
    playSong(song)
}
</script>

<template>
    <div class="recommended">
        <!-- 标题区域 -->
        <h1 class="title">推荐</h1>
        <h2 class="subtitle">Hi {{ username }} 今日为你推荐</h2>

        <!-- 推荐卡片区域 -->
        <div class="recommendation-cards">
            <div v-for="song in recommendedSongs" :key="song.id" class="card" @click="handleSongClick(song)"
                :class="{ 'active': currentSong.id === song.id }">
                <div class="card-image placeholder">
                    <img :src="song.cover" alt="" class="card-logo">
                </div>
                <div class="card-content">
                    <h3>{{ song.title }}</h3>
                    <p>{{ song.artist }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$primary-bg: #0a0a1a;
$card-bg: #1a1a2e;
$button-bg: #2a2a3e;
$placeholder-bg: #2a2a4e;
$text-color: white;
$text-secondary: rgba(255, 255, 255, 0.9);

@use "sass:color";

// Mixins
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

@mixin card-base {
    background: $card-bg;
    border-radius: 12px;
    overflow: hidden;
}

@mixin placeholder {
    background: $placeholder-bg;
    border-radius: 8px;
    width: 100%;
}

.recommended {
    padding: 20px;
    background: $primary-bg;
    min-height: 100vh;
    color: $text-color;

    .title {
        font-size: 32px;
        margin-bottom: 8px;
    }

    .subtitle {
        font-size: 24px;
        margin-bottom: 24px;
        color: $text-secondary;
    }
}

.recommendation-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;

    .card {
        @include card-base;
        cursor: pointer;
        transition: transform 0.2s ease;

        &-image {
            &.placeholder {
                @include placeholder;
                height: 200px;
            }

            .card-logo {
                width: 100%;
                height: 100%;
                object-fit: cover
            }
        }

        &-content {
            padding: 16px;
        }

        &-actions {
            display: flex;
            gap: 12px;
            margin-top: 12px;

            button {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                background: $button-bg;
                color: $text-color;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    background: color.adjust($button-bg, $lightness: 10%);
                }
            }
        }

        &:hover {
            transform: scale(1.02);
        }

        &.active {
            border: 2px solid #e8b9aa;
        }
    }
}

.playlist-section {
    .section-title {
        font-size: 24px;
        margin-bottom: 20px;
    }

    .playlist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;

        .playlist-item {
            .placeholder {
                @include placeholder;
                aspect-ratio: 1;
            }
        }
    }
}
</style>