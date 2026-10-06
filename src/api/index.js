/**
 * 前端统一请求封装。
 * 所有请求都打到同源的 /api（开发期由 vite 代理到 http://localhost:3001），
 * 第三方接口的跨域 / 请求头 / 鉴权细节全部收敛在 Node 代理层。
 */

const BASE = '/api'

function buildQuery(params) {
  if (!params) return ''
  const usable = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!usable.length) return ''
  return '?' + new URLSearchParams(usable).toString()
}

async function request(path, params) {
  const url = `${BASE}${path}${buildQuery(params)}`
  let res
  try {
    res = await fetch(url)
  } catch (e) {
    // 网络层直接失败：代理服务没起来
    const err = new Error('服务未连接，请启动代理服务（npm run server）')
    err.code = 'SERVICE_DOWN'
    throw err
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // vite 代理在后端不可用时会返回 5xx
    if (res.status >= 500) {
      const err = new Error('服务未连接，请启动代理服务（npm run server）')
      err.code = 'SERVICE_DOWN'
      throw err
    }
    const message = (data && data.error && data.error.message) || `请求失败（HTTP ${res.status}）`
    const err = new Error(message)
    err.code = (data && data.error && data.error.code) || 'HTTP_ERROR'
    throw err
  }

  if (data && data.error) {
    const err = new Error(data.error.message || '请求失败')
    err.code = data.error.code || 'API_ERROR'
    throw err
  }

  return data
}

/** 双音源搜索：source = 'netease' | 'qq' */
export function search(keyword, source = 'netease', limit = 30) {
  return request('/search', { keyword, source, limit })
}

/** 获取歌曲播放直链 */
export function getSongUrl(id, source = 'netease') {
  return request('/song/url', { id, source })
}

/** 获取歌单详情（含歌曲列表），source = 'netease' | 'qq' */
export function getPlaylist(id, source = 'netease') {
  return request('/playlist', { id, source })
}

/** 获取推荐歌单列表 */
export function getToplist() {
  return request('/toplist')
}

/** 获取歌词（LRC 原文 + 译文，可能为空） */
export function getLyric(id, source = 'netease') {
  return request('/lyric', { id, source })
}

export default { search, getSongUrl, getPlaylist, getToplist, getLyric }
