<script setup>
import { onMounted, ref, watch, provide } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import SettingPanel from '@/components/SettingPanel.vue'
import { useBackgroundColor } from '@/Composables/useBackgroundColor'
import { useMusicPlayer } from '@/Composables/useMusicPlayer'

// // 背景颜色逻辑
const { backgroundColor, textColor, changeBackgroundColor } = useBackgroundColor()

// 音乐播放器逻辑
const { recommendedSongs, playlist, currentSong, audio, playPrevious, playNext, playSong, togglePlay, addSongToPlaylist } = useMusicPlayer()


// 提供状态和方法给子组件
provide('currentSong', currentSong)
provide('recommendedSongs', recommendedSongs)
provide('playlist', playlist)
provide('playPrevious', playPrevious)
provide('playNext', playNext)
provide('playSong', playSong)
provide('togglePlay', togglePlay)
provide('audio', audio)
provide('textColor', textColor)
provide('addSongToPlaylist', addSongToPlaylist)
</script>

<template>
    <div :style="{ backgroundColor: backgroundColor, color: textColor }" id="app">
        <Sidebar :background-color="backgroundColor" :text-color="textColor" />
        <!-- 路由出口 → 匹配的组件所展示的位置  -->
        <div class="main">
            <SettingPanel :background-color="backgroundColor" @change-background="changeBackgroundColor" />
            <MusicPlayer />
            <router-view style="padding: 20px; height: 100%;"></router-view>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#app {
    display: flex;
    height: 100vh !important;
}

.main {
    margin-left: 244px;
    flex: 1;
    overflow-y: auto;
    height: calc(100vh - 110px);
    box-sizing: border-box;

    /* 隐藏所有滚动条 */
    &::-webkit-scrollbar {
        display: none;
    }
}

@media screen and (max-width: 768px) {
    .main {
        margin-left: 0;
    }
}
</style>
