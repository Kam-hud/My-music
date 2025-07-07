<script setup>
import { inject } from 'vue';
const likeSonglist = inject('likeSonglist');
const playSong = inject('playSong');


const handleLikeMusicClick = (song) => {
    playSong(song)
}

</script>

<template>
    <div class="like-music">
        <h1>我喜欢的音乐</h1>

        <div v-if="likeSonglist.songs.length === 0" class="empty-music">
            <p>你还没有喜欢的音乐</p>
        </div>

        <div v-else>
            <div v-for="(song, index) in likeSonglist.songs" :key="song.id" class="like-music-list"
                @click="handleLikeMusicClick(song)">
                <div class="cover">
                    <img :src="song.cover" alt="封面" />
                </div>
                <div class="info">
                    <h2>{{ song.title }}</h2>
                    <p>{{ song.artist || '未知' }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.like-music {
    padding: 20px;

    h1 {
        font-size: 28px;
        margin-bottom: 20px;
    }

    .empty-music {
        text-align: center;
        padding: 40px;

        p {
            margin-bottom: 20px;
            font-size: 18px;
            opacity: 0.8;
        }
    }

    .like-music-list {
        display: flex;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
        cursor: pointer;

        &:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-3px);
        }

        .cover {
            width: 150px;
            height: 150px;
            margin-right: 20px;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            }
        }

        .info {
            flex: 1;

            h2 {
                font-size: 24px;
                margin-bottom: 10px;
            }

            p {
                margin-bottom: 15px;
                opacity: 0.8;
            }
        }
    }




}
</style>