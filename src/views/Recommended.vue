<script setup>
import { ref, inject, onMounted,computed } from 'vue'
import { qqMusicApi } from '../services/qqMusicApi'

// 用户名
const username = ref('Kam')
// 注入推荐歌单列表和打开歌单详情方法
const recommendedPlaylists = inject('recommendedPlaylists')
const openPlaylistDetail = inject('openPlaylistDetail')

const qqMusicPlaylists = ref([])
const isLoading = ref(false)

// 处理歌单点击
const handlePlaylistClick = (playlist) => {
    openPlaylistDetail(playlist)
}

// 获取封面图片路径
const getCoverImage = (playlist) => {
    return playlist.cover || require('@/assets/images/');
}

const loadQQMusicData = async () => {
    isLoading.value = true
    try {
        const jayChouPlaylist = await qqMusicApi.getJayChouPlaylist()
        qqMusicPlaylists.value = [jayChouPlaylist]
    } catch (error) {
        console.error('加载数据失败', error);

    } finally {
        isLoading.value = false
    }
}

const allPlaylists = computed(() => {
    return [
        ...qqMusicPlaylists.value,
        ...(recommendedPlaylists?.value || [])
    ]
})

onMounted(async () => {
    await loadQQMusicData()
})
</script>

<template>
    <div class="recommended">
        <!-- 标题区域 -->
        <h1 class="title">推荐</h1>
        <h2 class="subtitle">Hi {{ username }} 今日为你推荐</h2>

        <!-- 推荐卡片区域 -->
        <div class="playlists-grid">
            <div v-for="playlist in allPlaylists" :key="playlist.id" class="playlist-card"
                @click="handlePlaylistClick(playlist)">
                <!-- 封面图片 -->
                <div class="card-cover">
                    <img :src="getCoverImage(playlist)" alt="歌单封面">
                    <div class="playlist-stats">
                        <span>{{ playlist.songs?.length || 0 }} 首</span>
                    </div>
                    <div v-if="playlist.id === 3" class="qq-music-badge">
                        QQ音乐
                    </div>
                </div>

                <div class="card-content">
                    <h3>{{ playlist.name }}</h3>
                    <p>{{ playlist.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.recommended {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: calc(100vh - 90px);
    border-radius: 8px;
    box-sizing: border-box;

    .title {
        font-size: 32px;
        margin-bottom: 8px;
    }

    .subtitle {
        font-size: 24px;
        margin-bottom: 24px;
        opacity: 0.9;
    }

    /* 卡片网格布局 */
    .playlists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;

        .playlist-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;

            &:hover {
                transform: translateY(-8px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            }

            /* 封面样式 */
            .card-cover {
                position: relative;
                height: 180px;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                &:hover img {
                    transform: scale(1.05);
                }

                .playlist-stats {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }
            }

            .card-content {
                padding: 15px;

                h3 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 600;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    min-height: 44px;
                }

                p {
                    margin: 0;
                    font-size: 13px;
                    opacity: 0.8;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    min-height: 38px;
                }
            }
        }
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .playlists-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));

        .playlist-card .card-cover {
            height: 140px;
        }
    }
}
</style>