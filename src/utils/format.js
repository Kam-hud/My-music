/**
 * 通用格式化工具
 */

// 秒 → mm:ss（非法值返回 00:00）
export function formatTime(seconds) {
  const s = Number(seconds)
  if (!Number.isFinite(s) || s < 0) return '00:00'
  const total = Math.floor(s)
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// 播放量 → 万 / 亿
export function formatCount(count) {
  const n = Number(count) || 0
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}亿`
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return String(n)
}

// 从网易云歌单链接 / 纯数字中提取歌单 id
export function extractPlaylistId(input) {
  if (!input) return ''
  const text = String(input).trim()
  if (/^\d+$/.test(text)) return text
  const m = text.match(/playlist\?id=(\d+)/) || text.match(/\/playlist\/(\d+)/) || text.match(/id=(\d+)/)
  return m ? m[1] : ''
}
