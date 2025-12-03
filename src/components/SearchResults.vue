<script setup>
import { inject } from 'vue'

const searchResults = inject('searchResults')
const isSearching = inject('isSearching')
const searchQuery = inject('searchQuery')
const playSong = inject('playSong')
const addSongToPlaylist = inject('addSongToPlaylist')
const currentSong = inject('currentSong')
const likeSong = inject('likeSong')
const isLiked = inject('isLiked')

// 处理点击歌曲
const handleSongClick = (song) => {
    const isSameSong = currentSong.value.id === song.id
    addSongToPlaylist(song)
    playSong(song,isSameSong)
}

</script>

<template>
    <div class="search-results">
        <!-- 搜索头部 -->
        <div class="search-header">
            <h2>搜索结果</h2>
            <p class="search-summary" v-if="searchQuery">
                搜索 "{{ searchQuery }}" 找到 {{ searchResults.length }} 首歌曲
            </p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isSearching" class="loading-state">
            <div class="loading-spinner"></div>
            <p>搜索中...</p>
        </div>

        <div v-else-if="searchResults.length > 0" class="results-list">
            <div class="list-header">
                <div class="header-item header-cover">歌曲</div>
                <div class="header-item header-info">歌手/专辑</div>
                <div class="header-item header-actions">操作</div>
            </div>

            <div v-for="song in searchResults" :key="song.id" class="result-item" @click="handleSongClick(song)"
                :class="{ 'active': currentSong && currentSong.id === song.id }">
                <div class="song-cover">
                    <img :src="song.cover" alt="">
                </div>
                <div class="song-info">
                    <div class="song-title">{{ song.title }}</div>
                    <div class="song-artist">{{ song.artist }}</div>
                    <div class="song-album">{{ song.album || '未知专辑' }}</div>
                </div>
                <div class="song-actions">
                    <button class="action-btn like-btn" :class="{ 'active': isLiked(song.id) }"
                        @click.stop="likeSong(song)" title="喜欢">
                        <font-awesome-icon icon="heart" />
                    </button>
                    <button class="action-btn play-btn" @click.stop="handleSongClick(song)" title="播放">
                        <font-awesome-icon icon="play" />
                    </button>
                </div>
            </div>
        </div>

        <!-- 无结果状态 -->
        <div v-else-if="searchQuery && !isSearching" class="empty-state">
            <font-awesome-icon icon="search" class="empty-icon" />
            <p>没有找到与 "{{ searchQuery }}" 相关的歌曲</p>
            <p class="empty-tip">尝试使用其他关键词搜索</p>
        </div>

        <div v-else class="initial-state">
            <font-awesome-icon icon="search" class="initial-icon" />
            <p>输入关键词搜索歌曲</p>
            <p class="initial-tip">可以搜搜歌曲名,歌手或专辑</p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.search-results {
    padding: 20px;

    .search-header {
        margin-bottom: 30px;
        
        h2 {
            font-size: 28px;
            margin-bottom: 8px;
        }
        
        .search-summary {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: rgba(255, 255, 255, 0.7);
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #e8b9aa;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        
        p {
            margin: 0;
            font-size: 16px;
        }
    }

    .results-list {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        overflow: hidden;

        .list-header {
            display: grid;
            grid-template-columns: 80px 1fr 120px; 
            align-items: center;
            padding: 15px 20px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            
            .header-item {
                &.header-info {
                    padding-left: 20px;
                }
                
                &.header-actions {
                    text-align: center;
                }
            }
        }

        .result-item {
            display: grid;
            grid-template-columns: 80px 1fr 120px; 
            align-items: center;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            background: transparent;

            &:hover {
                background: rgba(255, 255, 255, 0.1); 
                
                .song-cover .play-overlay {
                    opacity: 1;
                }
                
                .song-actions .download-btn {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            &.active {
                .song-title {
                    color: #e8b9aa;
                }
                
                .song-cover .default-cover {
                    background: rgba(232, 185, 170, 0.3);
                }
            }

            .song-cover {
                position: relative;
                width: 50px;
                height: 50px;
                border-radius: 8px;
                overflow: hidden;

                img{
                    width: 50px;
                    height: 50px;
                }
            }

            .song-info {
                padding-left: 20px;
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
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .song-album {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }

            .song-actions {
                display: flex;
                gap: 8px;
                justify-content: center;
                align-items: center;
                
                .action-btn {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    
                    &:hover {
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        transform: scale(1.1);
                    }
                    
                    &.like-btn.active {
                        color: #ff6b6b;
                    }
                    
                    &.play-btn:hover {
                        color: #e8b9aa;
                        background: rgba(232, 185, 170, 0.2);
                    }
                }
            }
        }
    }

    .empty-state, .initial-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 20px;
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        
        .empty-icon, .initial-icon {
            font-size: 48px;
            margin-bottom: 20px;
            opacity: 0.5;
        }
        
        p {
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        
        .empty-tip, .initial-tip {
            font-size: 14px;
            opacity: 0.7;
        }
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media screen and (max-width: 768px) {
    .search-results {
        padding: 12px;
        height: calc(100vh - 160px);
        
        .results-list {
            .list-header {
                grid-template-columns: 50px 1fr 80px;
                
                .header-source {
                    display: none;
                }
            }
            
            .result-item {
                grid-template-columns: 50px 1fr 80px;
                
                .song-info {
                    .song-album {
                        display: none;
                    }
                }
            }
        }
    }
}
</style>