import JaySongs from '@/data/jaySongs.json'

export class qqMusicApi {
    static async searchSongs(keyword, page = 1, limit = 20) {
        try {
            const response = await fetch(
                `/qqmusic/soso/fcgi-bin/client_search_cp?p=${page}&n=${limit}&w=${encodeURIComponent(keyword)}`
            )

            if (!response.ok) {
                throw new Error('API请求失败')
            }

            const text = await response.text()
            const jsonpData = text.match(/callback\((.+)\)/)
            if (jsonpData && jsonpData[1]) {
                return JSON.parse(jsonpData[1])
            } else {
                throw new Error('数据格式错误')
            }
        } catch (error) {
            console.error('获取QQ音乐数据失败', error);
            throw error

        }
    }

    static transformQQMusicData(apiData) {
        if (!apiData.data || !apiData.data.song) {
            return []
        }

        const songs = apiData.data.song.list.map((song, index) => ({
            id: `qq_${song.songid}_${index}`,
            title: song.songname,
            artist: song.singer[0]?.name || '未知歌手',
            cover: `https://y.qq.com/music/photo_new/T002R300x300M000${song.albummid}.jpg?max_age=2592000`,
            url: song.url,
            duration: this.formatDuration(song.interval)
        }))

        return songs;
    }

    static getLocalPlayList(songmid) {
        return JaySongs.JaySongs[songmid]
    }

    static formatDuration(time) {
        if (!time) return '00:00'
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    static async getJayChouPlaylist() {
        try {
            const data = await this.searchSongs('周杰伦')
            const songs = this.transformQQMusicData(data)

            return {
                id: 3,
                name: '周杰伦精选',
                cover: songs[0]?.cover || '/src/assets/images/music3.jpg',
                description: '来自QQ音乐的周杰伦热门歌曲',
                songs: songs
            }
        } catch (error) {
            console.error('获取歌单失败', error);
            throw error
        }
    }
}