import { ref, onMounted } from 'vue'

export function useLikeMusic() {
    const likeSonglist = ref({
        songs: []
    })

    // 使用Set存储喜欢歌曲，提高查找效率
    const likedSongsSet = ref(new Set())

    // 检查是否已登录
    const isLoggedIn = () => {
        return !!localStorage.getItem('userInfo')
    }

    // 加载本地存储的喜欢歌曲
    const loadLikedSongs = () => {
        const likedSongs = localStorage.getItem('likeSongs')
        if (likedSongs) {
            likeSonglist.value.songs = JSON.parse(likedSongs)
            // 将歌曲ID存入Set
            likedSongsSet.value = new Set(likeSonglist.value.songs.map(s => s.id))
        }
    }

    // 在组件挂载时加载喜欢的歌曲
    onMounted(loadLikedSongs)

    // 检查歌曲是否被喜欢
    const isLiked = (songId) => {
        return likedSongsSet.value.has(songId)
    }

    // 点击喜欢icon时，会保存到我喜欢这个界面
    const likeSong = (song) => {
        // 检查登录状态
        if (!isLoggedIn()) {
            alert('请先登录后再收藏歌曲')
            return
        }

        const isLiked = likeSonglist.value.songs.some(s => s.id === song.id)
        if (isLiked) {
            likeSonglist.value.songs = likeSonglist.value.songs.filter(
                s => s.id !== song.id
            )
            likedSongsSet.value.delete(song.id)
            song.liked = false
        } else {
            likeSonglist.value.songs.push({ ...song, liked: true })
            likedSongsSet.value.add(song.id)
            song.liked = true
        }

        localStorage.setItem('likeSongs', JSON.stringify(likeSonglist.value.songs))

        // 修复日志输出
        console.log('喜欢的歌曲:', song)
        console.log(`喜欢的歌曲ID: ${song.id}, 标题: ${song.title}`)
    }

    // 下载歌曲
    const downloadSong = (song) => {
        // 检查登录状态
        if (!isLoggedIn()) {
            alert('请先登录后再下载歌曲')
            return
        }

        // 修复日志输出
        console.log('下载的歌曲:', song)
        console.log(`下载的歌曲ID: ${song.id}, 标题: ${song.title}`)
    }

    return {
        likeSonglist,
        likeSong,
        downloadSong,
        isLiked,
        isLoggedIn
    }
}