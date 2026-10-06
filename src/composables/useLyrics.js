/**
 * 歌词解析（LRC）
 * - parseLrc：把 LRC 文本解析为 [{ time, text }]（支持一行多时间戳）
 * - useLyrics：组合式 API，根据播放进度实时输出当前行索引
 */
import { computed } from 'vue'
import { state as playerState } from './usePlayer'

const TIME_TAG = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g

/** 解析 LRC 文本 */
export function parseLrc(text) {
  if (!text || typeof text !== 'string') return []
  const lines = []

  text.split(/\r?\n/).forEach((raw) => {
    if (!raw) return
    // 跳过元信息标签（[ti:] [ar:] [al:] 等），它们不含时间
    const times = []
    let m
    TIME_TAG.lastIndex = 0
    while ((m = TIME_TAG.exec(raw)) !== null) {
      const min = parseInt(m[1], 10) || 0
      const sec = parseInt(m[2], 10) || 0
      // 毫秒位补齐到 3 位：'5' → 500ms，'05' → 50ms
      const ms = m[3] ? parseInt(String(m[3]).padEnd(3, '0').slice(0, 3), 10) : 0
      times.push(min * 60 + sec + ms / 1000)
    }
    if (!times.length) return

    TIME_TAG.lastIndex = 0
    const content = raw.replace(TIME_TAG, '').trim()
    times.forEach((t) => lines.push({ time: t, text: content }))
  })

  lines.sort((a, b) => a.time - b.time)
  return lines
}

/** 按时间戳（保留 2 位小数）把译文合并进主歌词 */
export function mergeTranslation(main, translation) {
  if (!main.length) return []
  if (!translation.length) return main.map((l) => ({ ...l, translation: '' }))
  const map = new Map(translation.map((l) => [l.time.toFixed(2), l.text]))
  return main.map((l) => ({ ...l, translation: map.get(l.time.toFixed(2)) || '' }))
}

export function useLyrics() {
  const lines = computed(() => {
    const main = parseLrc(playerState.lyric.lrc)
    const trans = parseLrc(playerState.lyric.translation)
    return mergeTranslation(main, trans)
  })

  const currentIndex = computed(() => {
    const arr = lines.value
    if (!arr.length) return -1
    const t = playerState.currentTime + 0.15 // 轻微提前，视觉更跟手
    let idx = -1
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].time <= t) idx = i
      else break
    }
    return idx
  })

  const empty = computed(() => lines.value.length === 0)

  return { lines, currentIndex, empty }
}
