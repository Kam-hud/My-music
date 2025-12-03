<script setup>
import { ref, provide } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";
import Setting from "./components/Setting.vue";
import SearchResults from '@/components/SearchResults.vue'
import SongsPlayList from "@/PlayList/SongsPlayList.vue";
import { useBackgroundColor } from "@/Composables/useBackgroundColor";
import { useMusicPlayer } from "@/Composables/useMusicPlayer";
import { useLikeMusic } from "@/Composables/useLikeMusic";
import { useSearch } from "./Composables/useSearch";
import { useRoute } from 'vue-router'

const currentRoute = useRoute()

// 背景颜色逻辑
const {
    backgroundColor,
    backgroundImage,
    backgroundType,
    textColor,
    changeBackgroundColor,
    changeBackgroundImage,
    clearBackground
} = useBackgroundColor();

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
    showPlaylistDetail,
    playHistory,
    formattedCurrentTime,
    formattedDuration,
    progressPercentage,
    seekToTime,
    seekToPercentage,
    getPlayHistory,
    clearPlayHistory,
    playMode,
    togglePlayMode
} = useMusicPlayer();

//搜索功能
const {
    searchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch
} = useSearch(recommendedPlaylists, playlist, playHistory)


const { likeSonglist, likeSong, downloadSong, isLiked } = useLikeMusic();

// 侧边栏折叠状态
const isSidebarCollapsed = ref(false);

// 处理折叠状态变更
const handleCollapseChange = (collapsed) => {
    isSidebarCollapsed.value = collapsed;
};

// 处理背景颜色变更
const handleBackgroundChange = (color) => {
    changeBackgroundColor(color);
};

// 音乐提供状态和方法给子组件
provide("recommendedPlaylists", recommendedPlaylists);
provide("currentPlaylist", currentPlaylist);
provide("playlist", playlist);
provide("currentSong", currentSong);
provide("audio", audio);
provide("playPrevious", playPrevious);
provide("playNext", playNext);
provide("playSong", playSong);
provide("togglePlay", togglePlay);
provide("addSongToPlaylist", addSongToPlaylist);
provide("openPlaylistDetail", openPlaylistDetail);
provide("likeSong", likeSong);
provide("downloadSong", downloadSong);
provide("likeSonglist", likeSonglist);
provide("isLiked", isLiked);
provide("showPlaylistDetail", showPlaylistDetail);
provide("playHistory", playHistory);
provide("formattedCurrentTime", formattedCurrentTime);
provide("formattedDuration", formattedDuration);
provide("progressPercentage", progressPercentage);
provide("seekToTime", seekToTime);
provide("seekToPercentage", seekToPercentage);
provide("getPlayHistory", getPlayHistory);
provide("clearPlayHistory", clearPlayHistory);
provide("playMode", playMode)
provide("togglePlayMode", togglePlayMode)

// 背景颜色提供状态和方法给子组件
provide("textColor", textColor);
provide("backgroundColor", backgroundColor);
provide("changeBackgroundColor", changeBackgroundColor);
provide("backgroundImage", backgroundImage);
provide("backgroundType", backgroundType);
provide("changeBackgroundImage", changeBackgroundImage);
provide("clearBackground", clearBackground);

provide("isSidebarCollapsed", isSidebarCollapsed);

// 搜索相关内容
provide("searchQuery", searchQuery);
provide("searchResults", searchResults);
provide("isSearching", isSearching);
provide("performSearch", performSearch);
provide("clearSearch", clearSearch);
</script>

<template>
    <div :style="{
        backgroundColor: backgroundType === 'color' ? backgroundColor : '#0a0a1a',
        color: textColor,
        backgroundImage: backgroundType === 'image' ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    }" id="app">
        <Sidebar :background-color="backgroundType === 'color' ? backgroundColor : 'transparent'"
            :background-image="backgroundType === 'image' ? backgroundImage : ''" :text-color="textColor"
            :isCollapsed="isSidebarCollapsed" @toggle-collapse="handleCollapseChange"
            @change-background="handleBackgroundChange" />

        <div class="main" :style="{ marginLeft: isSidebarCollapsed ? '64px' : '224px' }">  
            <MusicPlayer />
            <Setting></Setting>
            <SongsPlayList v-if="showPlaylistDetail && currentRoute.path.startsWith('/playlist/')" />
            <router-view v-else class="page-content"></router-view>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    
    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &[style*="background-image"]::before {
        opacity: 1;
    }
}

.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 120px);
    overflow: hidden;
    padding: 0 10px;
    transition: margin-left 0.3s ease;
}

.page-content {
    flex: 1;
    overflow: auto;
    padding: 16px;
}

@media screen and (min-width: 769px) {
    #app {
        flex-direction: row;
    }
    
    .main {
        margin-left: 224px;
        transition: margin-left 0.3s ease;
    }
}

@media screen and (max-width: 768px) {
    .page-content {
        padding: 12px;
        padding-bottom: 140px;
    }
    .main{
        margin-left: 0px!important;
    }
}
</style>