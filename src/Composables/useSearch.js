import { ref } from "vue"

export function useSearch(recommendedPlaylists, playlist, playHistory) {
    const searchQuery = ref('')
    const searchResults = ref([])
    const isSearching = ref(false)

    // 搜索歌曲函数
    const performSearch = (query) => {
        if (!query.trim()) {
            searchResults.value = []
            isSearching.value = false
            return
        }

        isSearching.value = true
        searchQuery.value = query

        // 收集所有可搜索的歌曲
        const allSongs = new Map()

        // 从推荐歌单中收集歌曲
        recommendedPlaylists.value.forEach(playlist => {
            playlist.songs?.forEach(song => {
                if (!allSongs.has(song)) {
                    allSongs.set(song.id, {
                        ...song,
                        playlistName: playlist.name
                    })
                }
            })
        })

        // 从播放列表中收集歌曲
        playlist.value.forEach(song => {
            if (!allSongs.has(song.id)) {
                allSongs.set(song.id, {
                    ...song,
                    playlistName: ''
                })
            }
        })

        // 从历史播放列表中收集歌曲
        playHistory.value.forEach(item => {
            if (!allSongs.has(item.id)) {
                allSongs.set(item.id, {
                    ...item,
                    playlistName: ''
                })
            }
        })

        // 执行搜索
        const results = Array.from(allSongs.values()).filter(song => {
            const searchTerm = query.toLowerCase()
            return (
                song.title.toLowerCase().includes(searchTerm) ||
                song.artist.toLowerCase().includes(searchTerm) ||
                song.album?.toLowerCase().includes(searchTerm)
            )
        })

        searchResults.value = results
        isSearching.value = false
    }

    const clearSearch = () => {
        searchQuery.value = ''
        searchResults.value = []
        isSearching.value = false
    }

    return {
        searchQuery,
        searchResults,
        isSearching,

        performSearch,
        clearSearch
    }

}

