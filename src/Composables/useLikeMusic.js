import { ref, onMounted } from 'vue'

export function useLikeMusic() {
    const likeSonglist = ref({
        songs: []
    })

    // 加载本地存储的喜欢歌曲
    const loadLikedSongs = () => {
        const likedSongs = localStorage.getItem('likeSongs')
        if (likedSongs) {
            likeSonglist.value.songs = JSON.parse(likedSongs)
        }
    }

    // 在组件挂载时加载喜欢的歌曲
    onMounted(loadLikedSongs)

    // 点击喜欢icon时，会保存到我喜欢这个界面
    const likeSong = (song) => {
        const isLiked = likeSonglist.value.songs.some(s => s.id === song.id)
        if (isLiked) {
            likeSonglist.value.songs = likeSonglist.value.songs.filter(
                s => s.id !== song.id
            )
            song.liked = false
        } else {
            likeSonglist.value.songs.push({ ...song, liked: true })
            song.liked = true
        }

        localStorage.setItem('likeSongs', JSON.stringify(likeSonglist.value.songs))

        // 修复日志输出
        console.log('喜欢的歌曲:', song)
        console.log(`喜欢的歌曲ID: ${song.id}, 标题: ${song.title}`)
    }

    // 下载歌曲
    const downloadSong = (song) => {
        // 修复日志输出
        console.log('下载的歌曲:', song)
        console.log(`下载的歌曲ID: ${song.id}, 标题: ${song.title}`)
    }

    return {
        likeSonglist,
        likeSong,
        downloadSong
    }
}