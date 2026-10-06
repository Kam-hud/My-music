/**
 * 网易云音乐接口封装
 * 统一输出结构：{ id, name, artist, album, cover, duration, source }
 */
import { UA, ApiError, fetchJson, fetchWithTimeout } from './http.js'

const BASE_HEADERS = {
  'User-Agent': UA,
  Referer: 'https://music.163.com/',
  Cookie: 'appver=2.0.2; os=pc; NMTID=00Oo'
}

const SOURCE = 'netease'

/** 网易云不同接口返回的字段名不一致（旧版 artists/album/duration，新版 ar/al/dt），这里做归一 */
function normalizeSong(raw) {
  if (!raw) return null
  const artists = raw.artists || raw.ar || []
  const album = raw.album || raw.al || {}
  const durationMs = raw.duration || raw.dt || 0
  return {
    id: String(raw.id),
    name: raw.name || '未知歌曲',
    artist: artists.map((a) => a.name).filter(Boolean).join(' / ') || '未知歌手',
    album: album.name || '',
    cover: album.picUrl || '',
    duration: Math.round(durationMs / 1000),
    source: SOURCE
  }
}

/**
 * 关键词搜索：type=1 表示单曲
 * 主接口用 cloudsearch/pc（返回 al/ar/dt，带封面图），
 * 失败时退回旧版 search/get/web（字段为 album/artists/duration，无封面）。
 */
export async function search(keyword, limit = 30) {
  if (!keyword) return []
  const kw = encodeURIComponent(keyword)
  const lim = encodeURIComponent(limit)

  try {
    const url = `https://music.163.com/api/cloudsearch/pc?s=${kw}&type=1&limit=${lim}&offset=0`
    const data = await fetchJson(url, { headers: BASE_HEADERS })
    const songs = (data && data.result && data.result.songs) || []
    if (songs.length) return songs.map(normalizeSong).filter(Boolean)
  } catch (e) {
    /* 走下方备用接口 */
  }

  const url =
    'https://music.163.com/api/search/get/web?csrf_token=&type=1&offset=0&total=true' +
    `&limit=${lim}&s=${kw}`
  const data = await fetchJson(url, { headers: BASE_HEADERS })
  const songs = (data && data.result && data.result.songs) || []
  return songs.map(normalizeSong).filter(Boolean)
}

/**
 * 播放直链：
 * 1) 先走 song/media/outer/url 外链（302 跳转到真实音频地址，不下载音频本体）
 * 2) 失败时退回官方 player/url 接口
 */
export async function songUrl(id) {
  const outer = `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(id)}.mp3`
  try {
    const res = await fetchWithTimeout(outer, { headers: BASE_HEADERS, redirect: 'manual' }, 8000)
    const location = res.headers.get('location')
    if (location && !location.includes('/404')) {
      return location.startsWith('http') ? location : new URL(location, 'https://music.163.com').href
    }
    // 无跳转且状态正常，说明本地址即直链
    if (res.status === 200 && !location) return outer
  } catch (e) {
    /* 继续走备用方案 */
  }

  const data = await fetchJson(
    `https://music.163.com/api/song/enhance/player/url?ids=[${encodeURIComponent(id)}]&br=320000`,
    { headers: BASE_HEADERS }
  )
  const url = data && data.data && data.data[0] && data.data[0].url
  if (!url) throw new ApiError('无法获取播放地址（可能因版权限制或需要会员）', 'NO_SONG_URL')
  return url
}

/** 歌词：lv 原文 / tv 译文 */
export async function lyric(id) {
  const url = `https://music.163.com/api/song/lyric?id=${encodeURIComponent(id)}&lv=-1&kv=-1&tv=-1`
  const data = await fetchJson(url, { headers: BASE_HEADERS })
  return {
    lrc: (data && data.lrc && data.lrc.lyric) || '',
    translation: (data && data.tlyric && data.tlyric.lyric) || ''
  }
}

/** 歌单详情 */
export async function playlist(id) {
  const url = `https://music.163.com/api/v6/playlist/detail?id=${encodeURIComponent(id)}`
  const data = await fetchJson(url, { headers: BASE_HEADERS })
  const p = data && (data.playlist || (data.result && data.result.playlist))
  if (!p) throw new ApiError('歌单不存在或已被删除', 'PLAYLIST_NOT_FOUND')
  const tracks = p.tracks || []
  return {
    id: String(p.id),
    name: p.name || '未命名歌单',
    cover: p.coverImgUrl || '',
    description: p.description || '',
    playCount: p.playCount || 0,
    songs: tracks.map(normalizeSong).filter(Boolean)
  }
}

// 推荐歌单（精选常见榜单，详情懒加载，失败时降级为静态元数据）
const CURATED = [
  { id: '3778678', name: '云音乐热歌榜' },
  { id: '3779629', name: '云音乐新歌榜' },
  { id: '19723756', name: '云音乐飙升榜' },
  { id: '2884035', name: '云音乐原创榜' },
  { id: '71385702', name: '华语流行精选' },
  { id: '2809578726', name: '欧美热歌精选' },
  { id: '2881526457', name: '轻音乐 · 纯音治愈' },
  { id: '2713521441', name: '国风新语' }
]

async function loadOne(item) {
  try {
    const url = `https://music.163.com/api/v6/playlist/detail?id=${item.id}`
    const data = await fetchJson(url, { headers: BASE_HEADERS }, 6000)
    const p = data && (data.playlist || (data.result && data.result.playlist))
    if (!p) throw new Error('empty')
    return {
      id: String(p.id),
      name: p.name || item.name,
      cover: p.coverImgUrl || '',
      playCount: p.playCount || 0,
      description: p.description || ''
    }
  } catch (e) {
    return { id: item.id, name: item.name, cover: '', playCount: 0, description: '' }
  }
}

/** 推荐歌单：并行取详情，单个失败不影响整体 */
export async function toplist() {
  const list = await Promise.all(CURATED.map(loadOne))
  return { playlists: list }
}

export default { search, songUrl, lyric, playlist, toplist }
