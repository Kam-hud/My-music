import { ref, onMounted, watch } from 'vue'
// 导入图片
import coverImage1 from '@/assets/images/music1.jpg'
import coverImage2 from '@/assets/images/music2.jpg'
import coverImage3 from '@/assets/images/music3.jpg'
import coverImage4 from '@/assets/images/music4.jpg'
import coverImage5 from '@/assets/images/music5.jpg'
import coverImage6 from '@/assets/images/songs/free_fall.jpg'

export function useMusicPlayer() {
    const recommendedPlaylists = ref([
        {
            id: 1,
            name: '每日推荐 | 从「我不爱一直想你」听起',
            cover: coverImage1,
            description: '精选每日推荐歌曲,开启美好一天',
            songs: [
                {
                    id: 101,
                    title: '跳楼机',
                    artist: 'LBI利比',
                    cover: coverImage6,
                    url: '/src/assets/music/LBI利比（时柏尘） - 跳楼机.ogg'
                },
                {
                    id: 102,
                    title: '像晴天像雨天',
                    artist: '汪苏泷',
                    cover: coverImage1,
                    url: '/src/assets/music/汪苏泷 - 像晴天像雨天.flac'
                }
            ]
        },
        {
            id: 2,
            name: '私人雷达',
            cover: coverImage2,
            description: '私人雷达，发现更多好音乐',
            songs: [
                {
                    id: 201,
                    title: '热浪与海风',
                    artist: '夏日乐队',
                    cover: coverImage2,
                    url: '/src/assets/music/夏日乐队 - 热浪与海风.mp3',
                },
                {
                    id: 202,
                    title: '夏日回忆',
                    artist: '海岸线乐队',
                    cover: coverImage2,
                    url: '/src/assets/music/海岸线乐队 - 夏日回忆.mp3',
                }
            ]
        },
        {
            id: 3,
            name: '私人雷达',
            cover: coverImage3,
            description: '私人雷达，发现更多好音乐',
            songs: [
                {
                    id: 201,
                    title: '热浪与海风',
                    artist: '夏日乐队',
                    cover: coverImage3,
                    url: '/src/assets/music/夏日乐队 - 热浪与海风.mp3',
                },
                {
                    id: 202,
                    title: '夏日回忆',
                    artist: '海岸线乐队',
                    cover: coverImage3,
                    url: '/src/assets/music/海岸线乐队 - 夏日回忆.mp3',
                }
            ]
        },
        {
            id: 4,
            name: '私人雷达',
            cover: coverImage4,
            description: '私人雷达，发现更多好音乐',
            songs: [
                {
                    id: 201,
                    title: '热浪与海风',
                    artist: '夏日乐队',
                    cover: coverImage4,
                    url: '/src/assets/music/夏日乐队 - 热浪与海风.mp3',
                },
                {
                    id: 202,
                    title: '夏日回忆',
                    artist: '海岸线乐队',
                    cover: coverImage4,
                    url: '/src/assets/music/海岸线乐队 - 夏日回忆.mp3',
                }
            ]
        },
        {
            id: 5,
            name: '私人雷达',
            cover: coverImage5,
            description: '私人雷达，发现更多好音乐',
            songs: [
                {
                    id: 201,
                    title: '热浪与海风',
                    artist: '夏日乐队',
                    cover: coverImage5,
                    url: '/src/assets/music/夏日乐队 - 热浪与海风.mp3',
                },
                {
                    id: 202,
                    title: '夏日回忆',
                    artist: '海岸线乐队',
                    cover: coverImage5,
                    url: '/src/assets/music/海岸线乐队 - 夏日回忆.mp3',
                }
            ]
        },
    ])

    // 当前查看的歌单
    const currentPlaylist = ref(null)

    // 打开歌单详情
    const openPlaylistDetail = (playlist) => {
        currentPlaylist.value = playlist
    }

    // 关闭歌单详情
    const closePlaylistDetail = () => {
        currentPlaylist.value = null
    }

    // 播放列表数据
    const playlist = ref([])

    // 当前播放的歌曲状态
    const currentSong = ref({
        id: null,
        title: '',
        artist: '',
        cover: '',
        url: '',
        isPlaying: false
    })

    // 音频对象
    const audio = ref(new Audio())

    // 播放上一首
    const playPrevious = () => {
        // 获取当前歌曲的索引
        const currentIndex = playlist.value.findIndex(song => song.id === currentSong.value.id)
        // 如果当前歌曲不是第一首，则播放上一首
        if (currentIndex > 0) {
            // 获取上一首歌曲
            const prevSong = playlist.value[currentIndex - 1]
            // 更新当前歌曲状态
            currentSong.value = { ...prevSong, isPlaying: true }
            // 更新音频源
            audio.value.src = prevSong.url
            // 播放音频
            audio.value.play()
        }
    }

    // 播放下一首
    const playNext = () => {
        // 获取当前歌曲的索引
        const currentIndex = playlist.value.findIndex(song => song.id === currentSong.value.id)
        // 如果当前歌曲不是最后一首，则播放下一首
        if (currentIndex < playlist.value.length - 1) {
            // 获取下一首歌曲
            const nextSong = playlist.value[currentIndex + 1]
            // 更新当前歌曲状态
            currentSong.value = { ...nextSong, isPlaying: true }
            // 更新音频源
            audio.value.src = nextSong.url
            // 播放音频
            audio.value.play()
        }
    }


    // 播放指定歌曲
    const playSong = (song) => {
        currentSong.value = { ...song, isPlaying: true }
        audio.value.src = song.url
        audio.value.play()
    }

    // 暂停/播放切换
    const togglePlay = () => {
        if (currentSong.value.isPlaying) {
            audio.value.pause()
        } else {
            audio.value.play()
        }
        currentSong.value.isPlaying = !currentSong.value.isPlaying
    }

    // 添加歌曲到播放列表
    const addSongToPlaylist = (song) => {
        // 检查歌曲是否已经存在
        const isSongExist = playlist.value.some(item => item.id === song.id)
        if (!isSongExist) {
            playlist.value.push(song)
        }
    }

    // 监听音频事件
    onMounted(() => {
        audio.value.addEventListener('ended', () => {
            playNext()
        })
    })

    // 保存当前歌曲到 localStorage
    const saveCurrentSong = () => {
        localStorage.setItem('currentSong', JSON.stringify(currentSong.value))
    }

    // 从 localStorage 加载当前歌曲
    const loadCurrentSong = () => {
        const savedSong = localStorage.getItem('currentSong')
        if (savedSong) {
            const parsedSong = JSON.parse(savedSong)
            currentSong.value = { ...parsedSong, isPlaying: false }
            audio.value.src = parsedSong.url
        }
    }

    // 点击喜欢icon时，会保存到我喜欢这个界面
    const likeSong = (songId) => {
        // 这里可以添加逻辑，将歌曲添加到喜欢列表
        console.log(`喜欢的歌曲ID: ${songId}`)
    }

    // 下载歌曲
    const downloadSong = (songId) => {
        // 这里可以添加逻辑，将歌曲下载到本地
        console.log(`下载的歌曲ID: ${songId}`)
    }

    // 监听当前歌曲变化
    watch(currentSong, () => {
        saveCurrentSong()
    }, { deep: true })

    // 在组件挂载时加载保存的歌曲
    onMounted(() => {
        loadCurrentSong()
    })

    return {
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
        likeSong,
        downloadSong
    }
}