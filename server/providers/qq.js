/**
 * QQ 音乐接口封装
 * 统一输出结构与网易云保持一致，便于前端无感切换音源。
 */
import { UA, ApiError, fetchJson, fetchText } from './http.js'

const BASE_HEADERS = {
  'User-Agent': UA,
  Referer: 'https://y.qq.com/',
  Origin: 'https://y.qq.com'
}

const SOURCE = 'qq'

function coverOf(albumMid) {
  if (!albumMid) return ''
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumMid}.jpg`
}

function normalizeSong(raw) {
  if (!raw) return null
  return {
    id: String(raw.songmid || raw.mid || ''),
    name: raw.songname || raw.name || '未知歌曲',
    artist: (raw.singer || []).map((s) => s.name).filter(Boolean).join(' / ') || '未知歌手',
    album: raw.albumname || '',
    cover: coverOf(raw.albummid),
    duration: Number(raw.interval) || 0,
    source: SOURCE
  }
}

/**
 * 关键词搜索：search_for_qq_cp 接口，format=json 直接返回 JSON。
 * 返回字段含 songmid / songname / singer / albummid / interval，可直接归一化。
 */
export async function search(keyword, limit = 30) {
  if (!keyword) return []
  const url =
    'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp?p=1&n=' +
    `${encodeURIComponent(limit)}&w=${encodeURIComponent(keyword)}` +
    '&format=json&platform=yqq.json&needNewCode=0&remoteplace=txt.yqq.song'
  const data = await fetchJson(url, { headers: BASE_HEADERS })
  const list = (data && data.data && data.data.song && data.data.song.list) || []
  return list.map(normalizeSong).filter(Boolean)
}

/**
 * 播放直链：
 * 通过 musicu.fcg 的 vkey.GetVkeyServer 拿到 purl（文件名），再拼上 CDN 域名。
 * 关键点：
 *   1) 必须同时传 filename（前缀 + mid + mid + 后缀），否则 purl 恒为空；
 *   2) 不同歌曲可用的音质档位不同，一次性带上 mp3 128k/320k、m4a、flac 四种候选文件名，
 *      取第一个有值的 purl；
 *   3) result=104003 表示会员 / 独家版权歌曲（匿名不可播），101404 表示无可用资源。
 */
export async function songUrl(mid) {
  const songmid = String(mid)
  const CANDIDATES = [
    { prefix: 'M800', ext: '.mp3' },
    { prefix: 'M500', ext: '.mp3' },
    { prefix: 'C400', ext: '.m4a' },
    { prefix: 'F000', ext: '.flac' }
  ]
  const filenames = CANDIDATES.map((c) => `${c.prefix}${songmid}${songmid}${c.ext}`)

  const payload = {
    req_0: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        guid: '10000',
        songmid: filenames.map(() => songmid),
        songtype: filenames.map(() => 0),
        uin: '0',
        loginflag: 1,
        platform: '20',
        filename: filenames
      }
    },
    comm: { uin: 0, format: 'json', ct: 24, cv: 0 }
  }
  const url =
    'https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=' +
    encodeURIComponent(JSON.stringify(payload))
  const data = await fetchJson(url, { headers: BASE_HEADERS })
  const reqData = data && data.req_0 && data.req_0.data
  const infos = (reqData && reqData.midurlinfo) || []

  const hit = infos.find((it) => it && it.purl)
  if (hit) {
    const host = (reqData.sip && reqData.sip[0]) || 'https://dl.stream.qqmusic.qq.com/'
    return host.replace(/\/$/, '/') + hit.purl
  }

  // 全部候选都拿不到 purl：按上游返回码给出更准确的提示
  const code = infos[0] && infos[0].result
  if (code === 104003) {
    throw new ApiError('该歌曲为 QQ 音乐会员 / 独家版权，匿名无法播放，可切换网易云音源', 'VIP_SONG')
  }
  throw new ApiError('该歌曲暂无可用播放资源，可切换网易云音源试试', 'NO_SONG_URL')
}

/** 歌词：nobase64=1 直接返回明文 LRC（需带完整参数，否则返回 retcode -1901） */
export async function lyric(mid) {
  const url =
    'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg' +
    `?songmid=${encodeURIComponent(mid)}&format=json&nobase64=1&g_tk=5381` +
    '&loginUin=0&hostUin=0&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0'
  const text = await fetchText(url, {
    headers: { ...BASE_HEADERS, Referer: 'https://y.qq.com/portal/player.html' }
  })
  // 接口返回是 JSONP：MusicJsonCallback({...})
  const cleaned = text.replace(/^[^({[]*\(/, '').replace(/\)\s*;?\s*$/, '')
  let json = {}
  try {
    json = JSON.parse(cleaned)
  } catch (e) {
    json = {}
  }
  return {
    lrc: json.lyric || '',
    translation: json.trans || ''
  }
}

/** QQ 音乐歌单详情（可选能力，失败时抛错由路由层兜底） */
export async function playlist(id) {
  const payload = {
    req_0: {
      module: 'music.srfDissInfo.aiDissInfo',
      method: 'uniform_get_Dissinfo',
      param: { disstid: Number(id), enc: 1, song_begin: 0, song_num: 100, userinfo: 1 }
    },
    comm: { g_tk: 5381, uin: 0, format: 'json', ct: 6, cv: 80600, platform: 'wk_v17' }
  }
  const url =
    'https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=' +
    encodeURIComponent(JSON.stringify(payload))
  const data = await fetchJson(url, { headers: BASE_HEADERS })
  const info = data && data.req_0 && data.req_0.data
  if (!info) throw new ApiError('歌单不存在或已被删除', 'PLAYLIST_NOT_FOUND')
  const songsRaw = (info.songlist || []).map((s) => ({
    songmid: s.mid,
    songname: s.name,
    singer: s.singer,
    albumname: s.album && s.album.name,
    albummid: s.album && s.album.mid,
    interval: s.interval
  }))
  return {
    id: String(id),
    name: info.dissinfo && info.dissinfo.title ? info.dissinfo.title : 'QQ 音乐歌单',
    cover: '',
    description: info.dissinfo && info.dissinfo.desc ? info.dissinfo.desc : '',
    playCount: 0,
    songs: songsRaw.map(normalizeSong).filter(Boolean)
  }
}

// QQ 音乐没有稳定的榜单接口，推荐歌单统一走网易云；此导出仅为接口对齐
export async function toplist() {
  return { playlists: [] }
}

export default { search, songUrl, lyric, playlist, toplist }
