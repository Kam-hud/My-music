import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import recommendedPlaylistsData from "@/data/recommendedPlaylists.json";

export function useMusicPlayer() {
    const router = useRouter();

    const recommendedPlaylists = ref(recommendedPlaylistsData.playlists);

    // 核心状态:
    // 当前查看的歌单
    const currentPlaylist = ref(null);
    // 是否显示歌单详情
    const showPlaylistDetail = ref(false);
    // 播放列表数据
    const playlist = ref([]);
    const playHistory = ref([]);
    // 音频对象
    const audio = ref(new Audio());
    // 播放模式
    const playMode = ref("顺序");
    // 播放历史
    const playModeHistory = ref([]);

    // 当前播放的歌曲状态
    const currentSong = ref({
        id: null,
        title: "",
        artist: "",
        cover: "",
        url: "",
        album: "",
        isPlaying: false,
        duration: 0,
    });

    // 计算属性
    const formattedCurrentTime = computed(() => {
        formatTime(currentSong.value.currentTime);
    });
    const formattedDuration = computed(() => {
        formatTime(currentSong.value.duration);
    });
    const progressPercentage = computed(() => {
        return currentSong.value.duration
            ? (currentSong.value.currentTime / currentSong.value.duration) * 100
            : 0;
    });

    // 存储工具函数
    const saveToStorage = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`加载${key}失败`, error);
            return defaultValue;
        }
    };

    const loadFromStorage = (key, defaultValue = []) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`加载${key}失败`, error);
            return defaultValue;
        }
    };

    // 播放进度管理
    const saveSongProgress = (songId, currentTime) => {
        const progressData = JSON.parse(
            localStorage.getItem("songProgress") || "{}"
        );
        progressData[songId] = {
            currentTime,
            timestamp: Date.now(),
            duration: audio.value.duration,
        };
        localStorage.setItem("songProgress", JSON.stringify(progressData));
    };

    const loadSongProgress = (songId) => {
        try {
            const progressData = JSON.parse(
                localStorage.getItem("songProgress") || "{}"
            );
            const songProgress = progressData[songId];

            if (songProgress) {
                const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
                if (Date.now() - songProgress.timestamp > TWENTY_FOUR_HOURS) {
                    delete progressData[songId];
                    localStorage.setItem("songProgress", JSON.stringify(progressData));
                    return 0;
                }
                return songProgress.currentTime || 0;
            }
        } catch {
            return 0;
        }
        return 0;
    };

    // 播放历史
    const addToPlayHistory = (song) => {
        playHistory.value = playHistory.value.filter((item) => item.id !== song.id);
        playHistory.value.unshift({
            ...song,
            playTime: new Date().toISOString(),
            playCount:
                (playHistory.value.find((item) => item.id === song.id)?.playCount ||
                    0) + 1,
        });
        // 限制历史记录数量
        if (playHistory.value.length > 50) {
            playHistory.value = playHistory.value.slice(0, 50);
        }

        saveToStorage("playHistory", playHistory.value);
    };

    const getPlayHistory = () => {
        return [...playHistory.value];
    };

    const clearPlayHistory = () => {
        playHistory.value = [];
        localStorage.removeItem("playHistory");
    };

    const clearSongProgress = (songId) => {
        try {
            const progressData = JSON.parse(
                localStorage.getItem("songProgress") || "{}"
            );
            delete progressData[songId];
            localStorage.setItem("songProgress", JSON.stringify(progressData));
        } catch (error) {
            console.error("清除播放进度失败:", error);
        }
    };

    // 播放控制
    const playSong = async (song, resetProgress = false) => {
        try {
            console.log("开始播放歌曲", song.title, "URL:", song.url);

            if (!song.url) {
                console.error("歌曲URL为空", song);
                return;
            }

            // 暂停当前音频
            audio.value.pause();

            // 检查是否是同一首歌
            const isSameSong = currentSong.value.id === song.id;

            // 更新当前歌曲状态
            currentSong.value = {
                ...song,
                isPlaying: true,
                currentTime: 0,
                duration: 0,
            };
            // 更新当前音源
            audio.value.src = song.url;

            await new Promise((resolve, reject) => {
                audio.value.oncanplaythrough = () => {
                    console.log("音频加载完成,可以播放");
                    resolve();
                };
                audio.value.onerror = (e) => {
                    console.error("音频加载失败", e);
                    reject(new Error("音频加载失败"));
                };
                audio.value.load();

                setTimeout(() => {
                    reject(new Error("音频加载超时"));
                }, 5000);
            });

            // 断点续播
            const savedProgress = loadSongProgress(song.id);
            let startTime = savedProgress;

            if (resetProgress || isSameSong || !savedProgress || savedProgress <= 0) {
                startTime = 0;
                // 清除保存的进度
                clearSongProgress(song.id);
            }

            // 设置播放位置
            audio.value.currentTime = startTime;
            currentSong.value.currentTime = startTime;

            // 播放音频
            await audio.value.play();
            console.log("歌曲开始播放");

            // 添加到播放历史
            addToPlayHistory(song);
            console.log("播放歌曲:", song.title, "进度:", savedProgress);
        } catch (error) {
            console.error("播放歌曲失败", error);
            currentSong.value.isPlaying = false;
        }
    };

    // 暂停/播放切换
    const togglePlay = async () => {
        try {
            if (currentSong.value.isPlaying) {
                audio.value.pause();
                currentSong.value.isPlaying = false;
            } else {
                if (currentSong.value.url) {
                    await audio.value.play();
                    currentSong.value.isPlaying = true;
                } else if (playlist.value.length > 0) {
                    await playSong(playlist.value[0]);
                }
            }
        } catch (error) {
            console.error("播放控制失败", error);
        }
    };

    // 播放上一首
    const playPrevious = () => {
        if (playlist.value.length === 0) return;

        // 获取当前歌曲的索引
        const currentIndex = playlist.value.findIndex(
            (song) => song.id === currentSong.value.id
        );

        let prevIndex = -1;

        switch (playMode.value) {
            case "顺序":
                if (currentIndex > 0) {
                    prevIndex = currentIndex - 1;
                }
                break;
            case "单曲循环":
                playSong(currentSong.value, true);
                return;
            case "随机播放":
                if (playlist.value.length === 1) {
                    prevIndex = 0;
                } else {
                    let randomIndex;
                    do {
                        randomIndex = Math.floor(Math.random() * playlist.value.length);
                    } while (randomIndex === currentIndex && playlist.value.length > 1);
                    prevIndex = randomIndex;
                }
                break;
        }

        if (prevIndex !== -1) {
            playSong(playlist.value[prevIndex]);
        }
    };

    // 播放下一首
    const playNext = () => {
        if (playlist.value.length === 0) return;

        // 获取当前歌曲的索引
        const currentIndex = playlist.value.findIndex(
            (song) => song.id === currentSong.value.id
        );
        let nextIndex = -1;

        switch (playMode.value) {
            case "顺序":
                if (currentIndex < playlist.value.length - 1) {
                    nextIndex = currentIndex + 1;
                } else {
                    currentSong.value.isPlaying = false;
                    audio.value.pause();
                    return;
                }
                break;
            case "单曲循环":
                // 播放同一首歌
                playSong(currentSong.value, true);
                return;
            case "随机播放":
                if (playlist.value.length === 1) {
                    nextIndex = 0;
                } else {
                    // 生成不重复的随机索引
                    let randomIndex;
                    do {
                        randomIndex = Math.floor(Math.random() * playlist.value.length);
                    } while (randomIndex === currentIndex && playlist.value.length > 1);
                    nextIndex = randomIndex;
                }
                break;
        }

        if (nextIndex !== -1) {
            playSong(playlist.value[nextIndex]);
        }
    };

    // 切换播放模式函数
    const togglePlayMode = () => {
        const modes = ["顺序", "单曲循环", "随机播放"];
        const currentIndex = modes.indexOf(playMode.value);
        const nextIndex = (currentIndex + 1) % modes.length;
        playMode.value = modes[nextIndex];

        // 保存播放模式
        localStorage.setItem("playMode", playMode.value);
        console.log("切换播放模式:", playMode.value);
    };

    // 进度控制
    const seekToTime = (timeInSeconds) => {
        if (audio.value.duration) {
            const validTime = Math.max(
                0,
                Math.min(timeInSeconds, audio.value.duration)
            );
            audio.value.currentTime = validTime;
            currentSong.value.currentTime = validTime;
            saveSongProgress(currentSong.value.id, validTime);
        }
    };

    const seekToPercentage = (percentage) => {
        if (audio.value.duration) {
            const time = (percentage / 100) * audio.value.duration;
            seekToTime(time);
        }
    };

    // 添加歌曲到播放列表
    const addSongToPlaylist = (song) => {
        // 检查歌曲是否已经存在
        const isSongExist = playlist.value.some((item) => item.id === song.id);
        if (!isSongExist) {
            playlist.value.push(song);
        }
    };

    // 打开歌单详情
    const openPlaylistDetail = (playlist) => {
        console.log("打开歌单详情:", playlist);
        currentPlaylist.value = playlist;
        showPlaylistDetail.value = true;

        // 确保数据正确保存到本地存储
        localStorage.setItem("currentPlaylist", JSON.stringify(playlist));
        localStorage.setItem("showPlaylistDetail", JSON.stringify(true));
        router.push(`/playlist/${playlist.id}`);
    };

    // 工具函数
    const formatTime = (time) => {
        if (!time || isNaN(time) || time === Infinity) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const updateProgress = () => {
        if (audio.value) {
            currentSong.value.currentTime = audio.value.currentTime;
            currentSong.value.duration = audio.value.duration || 0;
        }
    };

    // 初始化
    onMounted(() => {
        // 加载播放模式
        const savedPlayMode = localStorage.getItem("playMode");
        if (savedPlayMode) {
            playMode.value = savedPlayMode;
        }

        // 加载保存的数据
        playlist.value = loadFromStorage("userPlaylist");
        playHistory.value = loadFromStorage("playHistory");

        // 增强:加载当前歌单和显示状态
        const savedCurrentPlaylist = localStorage.getItem("currentPlaylist");
        const savedShowDetail = localStorage.getItem("showPlaylistDetail");

        if (savedCurrentPlaylist) {
            try {
                currentPlaylist.value = JSON.parse(savedCurrentPlaylist);
            } catch (error) {
                console.error("解析当前歌单失败", error);
            }
        }

        if (savedShowDetail) {
            showPlaylistDetail.value = JSON.parse(savedShowDetail);
        }

        // 增强:根据当前路由自动恢复歌单显示状态
        const currentPath = router.currentRoute.value.path;
        if (currentPath.startsWith("/playlist/")) {
            showPlaylistDetail.value = true;

            // 如果没有当前歌单数据,尝试从路由参数获取
            if (!currentPlaylist.value) {
                const playlistId = router.currentRoute.value.params.id;
                const foundPlaylist = recommendedPlaylists.validTime.find(
                    (p) => p.id == playlistId
                );
                if (foundPlaylist) {
                    currentPlaylist.value = foundPlaylist;
                }
            }
        }

        // 加载当前歌曲
        const savedSong = localStorage.getItem("currentSong");
        if (savedSong) {
            const parsedSong = JSON.parse(savedSong);
            currentSong.value = {
                ...parsedSong,
                isPlaying: false,
                currentTime: 0,
                duration: 0,
            };
            if (parsedSong.url) {
                audio.value.src = parsedSong.url;
                // 加载保存的播放进度
                const savedProgress = loadSongProgress(parsedSong.id);
                if (savedProgress > 0) {
                    audio.value.currentTime = savedProgress;
                    currentSong.value.currentTime = savedProgress;
                }
            }
        }

        // 音频事件监听
        audio.value.addEventListener("timeupdate", updateProgress);
        audio.value.addEventListener("loadedmetadata", () => {
            if (audio.value.duration) {
                currentSong.value.duration = audio.value.duration;
            }
        });
        audio.value.addEventListener("ended", () => {
            currentSong.value.isPlaying = false;
            if (playMode.value === "单曲循环") {
                playSong(currentSong.value, true);
            } else {
                playNext();
            }
        });
        audio.value.addEventListener("error", () => {
            console.error("音频播放错误", error);
            currentSong.value.isPlaying = false;
        });

        // 自动保存进度
        const progressSaveTimer = setInterval(() => {
            if (currentSong.value.id && audio.value.currentTime > 0) {
                saveSongProgress(currentSong.value.id, audio.value.currentTime);
            }
        }, 5000);

        // 页面关闭保存数据
        window.addEventListener("beforeunload", () => {
            if (currentSong.value.id && audio.value.currentTime > 0) {
                saveSongProgress(currentSong.value.id, audio.value.currentTime);
            }
            saveToStorage("currentSong", currentSong.value);
        });

        return () => {
            clearInterval(progressSaveTimer);
        };
    });

    // 监听变化自动保存
    watch(
        currentSong,
        () => {
            saveToStorage("currentSong", currentSong.value);
        },
        { deep: true }
    );

    watch(
        playlist,
        () => {
            saveToStorage("userPlaylist", playlist.value);
        },
        { deep: true }
    );

    watch(
        () => router.currentRoute.value.path,
        (newPath) => {
            console.log("路由变化:", newPath);

            if (!newPath.startsWith("/playlist/")) {
                // 离开歌单详情页时隐藏
                showPlaylistDetail.value = false;
                localStorage.setItem("showPlaylistDetail", JSON.stringify(false));
            } else {
                // 进入歌单详情页时显示
                showPlaylistDetail.value = true;
                localStorage.setItem("showPlaylistDetail", JSON.stringify(true));

                // 如果当前歌单为空，尝试从路由恢复
                if (!currentPlaylist.value) {
                    const playlistId = router.currentRoute.value.params.id;
                    const foundPlaylist = recommendedPlaylists.validTime.find(
                        (p) => p.id == playlistId
                    );
                    if (foundPlaylist) {
                        currentPlaylist.value = foundPlaylist;
                        localStorage.setItem(
                            "currentPlaylist",
                            JSON.stringify(foundPlaylist)
                        );
                    }
                }
            }
        }
    );

    return {
        // 状态
        recommendedPlaylists,
        currentPlaylist,
        playlist,
        currentSong,
        audio,
        playHistory,
        showPlaylistDetail,
        playMode,

        // 计算属性
        formattedCurrentTime,
        formattedDuration,
        progressPercentage,

        // 播放控制
        playPrevious,
        playNext,
        playSong,
        togglePlay,

        // 进度控制
        seekToTime,
        seekToPercentage,

        // 播放列表管理
        addSongToPlaylist,
        openPlaylistDetail,

        // 播放历史管理
        getPlayHistory,
        clearPlayHistory,
        clearSongProgress,

        // 播放模式
        togglePlayMode,

        // 工具函数
        formatTime,
    };
}
