<script setup>
import { inject} from 'vue'
const playHistory = inject('playHistory')
const playSong = inject('playSong')
const clearPlayHistory = inject('clearPlayHistory')
// const formatPlayTime = inject('formatPlayTime')

const playFromHistory = (song) => { 
    playSong(song)
}
</script>

<template>
   <div class="floating-panel history-panel">
        <div class="panel-header">
            <h3>播放历史 ({{ playHistory.length }})</h3>
            <div class="panel-actions">
                <button @click="clearPlayHistory" class="action-btn" title="清空历史" v-if="playHistory.length > 0">
                    <font-awesome-icon icon="trash" />
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
</template>

<style lang="scss" scoped>
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

        .close-btn,
        .action-btn {
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
</style>