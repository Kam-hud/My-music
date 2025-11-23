<script setup></script>

<template>
    <div class="my-page">
        <div class="page-header">
            <h1>我的音乐</h1>
        </div>
        <div class="my-sections">
            <router-link to="/likeMusic" class="section-card">
                <font-awesome-icon icon="heart" class="section-icon" />
                <div class="section-info">
                    <h3>我喜欢的音乐</h3>
                    <p>收藏的歌曲</p>
                </div>
            </router-link>

            <router-link to="/recentlyPlayed" class="section-card">
                <font-awesome-icon icon="clock" class="section-icon" />
                <div class="section-info">
                    <h3>最近播放</h3>
                    <p>播放历史记录</p>
                </div>
            </router-link>

            <router-link to="/localMusic" class="section-card">
                <font-awesome-icon icon="music" class="section-icon" />
                <div class="section-info">
                    <h3>本地音乐</h3>
                    <p>设备上的音乐</p>
                </div>
            </router-link>

            <router-link to="/download" class="section-card">
                <font-awesome-icon icon="download" class="section-icon" />
                <div class="section-info">
                    <h3>下载管理</h3>
                    <p>已下载的音乐</p>
                </div>
            </router-link>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.my-page {
    padding: 20px;

    .page-header {
        margin-bottom: 30px;

        h1 {
            font-size: 28px;
            margin: 0;
        }
    }

    .my-sections {
        display: grid;
        gap: 16px;

        .section-card {
            display: flex;
            align-items: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }

            .section-icon {
                font-size: 24px;
                margin-right: 16px;
                color: #e8b9aa;
            }

            .section-info {
                flex: 1;

                h3 {
                    margin: 0 0 4px 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                p {
                    margin: 0;
                    font-size: 14px;
                    opacity: 0.7;
                }
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .my-page {
        padding: 16px;

        .page-header h1 {
            font-size: 24px;
        }

        .my-sections {
            .section-card {
                padding: 16px;
            }
        }
    }
}
</style>