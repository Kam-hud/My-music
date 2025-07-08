<script setup>
import { provide } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import SettingPanel from '@/components/SettingPanel.vue'
import { useBackgroundColor } from '@/Composables/useBackgroundColor'
import { useMusicPlayer } from '@/Composables/useMusicPlayer'
import { useLikeMusic } from '@/Composables/useLikeMusic'
import Setting from '@/components/Setting.vue'
import SongsPlayList from '@/PlayList/SongsPlayList.vue'

// // 背景颜色逻辑
const { backgroundColor, textColor, changeBackgroundColor } = useBackgroundColor()

// 音乐播放器逻辑
const {
    recommendedPlaylists,
    currentPlaylist,
    playlist,
    currentSong,
    audio,
    playPrevious,
    playNext,
    playSong,
    togglePlay,
    addSongToPlaylist,
    openPlaylistDetail,
    closePlaylistDetail,
} = useMusicPlayer()

const { likeSonglist, likeSong, downloadSong, isLiked } = useLikeMusic()

// 音乐提供状态和方法给子组件
provide('recommendedPlaylists', recommendedPlaylists)
provide('currentPlaylist', currentPlaylist)
provide('playlist', playlist)
provide('currentSong', currentSong)
provide('audio', audio)
provide('playPrevious', playPrevious)
provide('playNext', playNext)
provide('playSong', playSong)
provide('togglePlay', togglePlay)
provide('addSongToPlaylist', addSongToPlaylist)
provide('openPlaylistDetail', openPlaylistDetail)
provide('closePlaylistDetail', closePlaylistDetail)
provide('likeSong', likeSong)
provide('downloadSong', downloadSong)
provide('likeSonglist', likeSonglist)
provide('isLiked', isLiked)

// 背景颜色提供状态和方法给子组件
provide('textColor', textColor)
provide('backgroundColor', backgroundColor)
provide('changeBackgroundColor', changeBackgroundColor)
</script>

<template>
    <div :style="{ backgroundColor: backgroundColor, color: textColor }" id="app">
        <Sidebar :background-color="backgroundColor" :text-color="textColor" />
        <!-- 路由出口 → 匹配的组件所展示的位置  -->
        <div class="main">
            <Setting />
            <SettingPanel :background-color="backgroundColor" @change-background="changeBackgroundColor" />
            <MusicPlayer />
            <SongsPlayList v-if="currentPlaylist" />
            <router-view style="padding: 20px; height: 100%;"></router-view>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#app {
    display: flex;
    height: 100vh;
}

.main {
    position: relative;
    margin-left: 244px;
    flex: 1;
    overflow: auto;
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
