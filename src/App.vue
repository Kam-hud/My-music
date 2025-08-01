<script setup>
import { ref, provide } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import MusicPlayer from "@/components/MusicPlayer.vue";
import Setting from "@/components/Setting.vue";
import SongsPlayList from "@/PlayList/SongsPlayList.vue";
import LoginDialog from "./components/LoginDialog.vue";
import { useBackgroundColor } from "@/Composables/useBackgroundColor";
import { useMusicPlayer } from "@/Composables/useMusicPlayer";
import { useLikeMusic } from "@/Composables/useLikeMusic";
import { useLoginRegister } from "@/Composables/useLoginRegister";

// 背景颜色逻辑
const { backgroundColor, textColor, changeBackgroundColor } =
    useBackgroundColor();

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
} = useMusicPlayer();

const { likeSonglist, likeSong, downloadSong, isLiked } = useLikeMusic();

const {
    isLogin,
    currentUser,
    login,
    logout,
    showLoginRegister,
    openLoginResgister,
} = useLoginRegister();

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

// 登录注册
provide("isLogin", isLogin);
provide(" currentUser", currentUser)
provide("login", login);
provide("logout", logout);
provide("showLoginRegister", showLoginRegister);
provide("openLoginResgister", openLoginResgister);

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

// 背景颜色提供状态和方法给子组件
provide("textColor", textColor);
provide("backgroundColor", backgroundColor);
provide("changeBackgroundColor", changeBackgroundColor);

provide("isSidebarCollapsed", isSidebarCollapsed);
</script>

<template>
    <div :style="{ backgroundColor: backgroundColor, color: textColor }" id="app">
        <Sidebar :background-color="backgroundColor" :text-color="textColor" :isCollapsed="isSidebarCollapsed"
            @toggle-collapse="handleCollapseChange" @change-background="handleBackgroundChange" />

        <div class="main" :style="{ marginLeft: isSidebarCollapsed ? '64px' : '224px' }">
            <LoginDialog v-if="showLoginRegister && currentRoute.startsWith('/LoginDialog')" @logo="login" />
            <Setting />
            <MusicPlayer :isCollapsed="isSidebarCollapsed" />
            <SongsPlayList v-if="showPlaylistDetail && currentRoute.startsWith('/playlist/')" />
            <router-view v-else style="padding: 20px; height: 100%"></router-view>
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
    flex: 1;
    overflow: auto;
    height: calc(100vh - 110px);
    box-sizing: border-box;
    transition: margin-left 0.3s ease;
    padding: 0 10px;

    /* 隐藏所有滚动条 */
    &::-webkit-scrollbar {
        display: none;
    }
}

@media screen and (max-width: 768px) {
    .main {
        margin-left: 0;
        padding: 0 5px;
    }
}
</style>