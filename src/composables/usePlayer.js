/**
 * 播放内核（单例）
 * ------------------------------------------------------------------
 * 全应用共享同一个 Audio 实例与同一份响应式 state，避免多个组件
 * 各自 new Audio 导致「同时播放多首 / 进度不同步」。
 * 持久化：音量、播放模式、倍速、收藏列表写入 localStorage。
 */
import { reactive } from 'vue'
import { getSongUrl, getLyric } from '../api'

const STORAGE_KEY = 'my-music:prefs'

const DEFAULTS = {
  volume: 0.8,
  mode: 'order', // order（顺序）| single（单曲）| random（随机）
  playbackRate: 1,
  likedSongs: []
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw)
    return {
      volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULTS.volume,
      mode: ['order', 'single', 'random'].includes(parsed.mode) ? parsed.mode : DEFAULTS.mode,
      playbackRate: typeof parsed.playbackRate === 'number' ? parsed.playbackRate : DEFAULTS.playbackRate,
      likedSongs: Array.isArray(parsed.likedSongs) ? parsed.likedSongs : []
    }
  } catch (e) {
    return { ...DEFAULTS }
  }
}

const prefs = loadPrefs()

export const state = reactive({
  currentSong: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: prefs.volume,
  mode: prefs.mode,
  playbackRate: prefs.playbackRate,
  likedSongs: prefs.likedSongs,
  loading: false,
  showLyrics: false,
  lyric: { lrc: '', translation: '' },
  toast: { visible: false, message: '', type: 'info' }
})

/** 歌曲唯一键：不同音源可能存在相同数字 id */
export function songKey(song) {
  if (!song) return ''
  return `${song.source || 'netease'}-${song.id}`
}

function savePrefs() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        volume: state.volume,
        mode: state.mode,
        playbackRate: state.playbackRate,
        likedSongs: state.likedSongs
      })
    )
  } catch (e) {
    /* 隐私模式下写入失败可忽略 */
  }
}

/* ------------------------------ Toast ------------------------------ */
let toastTimer = null

export function showToast(message, type = 'info', duration = 2600) {
  state.toast = { visible: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    state.toast.visible = false
  }, duration)
}

/* ------------------------------ Audio ------------------------------ */
let audio = null
let playToken = 0 // 防止快速切歌时旧请求回填覆盖
let failCount = 0 // 连续失败计数，避免整队列都失败时无限跳歌

function ensureAudio() {
  if (audio) return audio
  audio = new Audio()
  audio.preload = 'auto'
  audio.volume = state.volume
  audio.playbackRate = state.playbackRate

  audio.addEventListener('timeupdate', () => {
    state.currentTime = audio.currentTime
  })
  audio.addEventListener('loadedmetadata', () => {
    state.duration = Number.isFinite(audio.duration) ? audio.duration : 0
  })
  audio.addEventListener('durationchange', () => {
    state.duration = Number.isFinite(audio.duration) ? audio.duration : 0
  })
  audio.addEventListener('play', () => {
    state.isPlaying = true
  })
  audio.addEventListener('pause', () => {
    state.isPlaying = false
  })
  audio.addEventListener('ended', handleEnded)
  audio.addEventListener('error', () => {
    if (audio && audio.src) skipToNext('音频加载失败，已跳到下一首')
  })
  return audio
}

function skipToNext(reason) {
  if (!state.queue.length) return
  if (failCount >= state.queue.length) {
    state.isPlaying = false
    state.loading = false
    showToast('队列中的歌曲都无法播放，请更换音源或换一首', 'error')
    return
  }
  failCount += 1
  showToast(reason || '播放失败，已跳到下一首', 'error')
  next(true)
}

function handleEnded() {
  if (state.mode === 'single') {
    replay()
    return
  }
  next(true)
}

function replay() {
  const a = ensureAudio()
  a.currentTime = 0
  a.play().catch(() => skipToNext('重播失败，已跳到下一首'))
}

/* ------------------------------ 歌词 ------------------------------ */
async function loadLyric(song) {
  try {
    const data = await getLyric(song.id, song.source)
    state.lyric = {
      lrc: (data && data.lrc) || '',
      translation: (data && data.translation) || ''
    }
  } catch (e) {
    // 歌词属于增强信息，失败不阻塞播放
    state.lyric = { lrc: '', translation: '' }
  }
}

/* ------------------------------ 核心动作 ------------------------------ */

/** 播放队列中指定位置（index 支持负数 / 越界，自动取模） */
export async function playAt(index) {
  if (!state.queue.length) return
  const len = state.queue.length
  const i = ((index % len) + len) % len
  state.currentIndex = i

  const song = state.queue[i]
  state.currentSong = song
  state.currentTime = 0
  state.duration = 0
  state.lyric = { lrc: '', translation: '' }
  state.loading = true

  const token = ++playToken
  // 歌词并行拉取，不阻塞播放
  loadLyric(song)

  try {
    const data = await getSongUrl(song.id, song.source)
    if (token !== playToken) return
    if (!data || !data.url) throw new Error('无可用播放地址')

    const a = ensureAudio()
    a.src = data.url
    a.playbackRate = state.playbackRate
    a.volume = state.volume
    await a.play()
    if (token === playToken) {
      failCount = 0
      state.loading = false
    }
  } catch (e) {
    if (token !== playToken) return
    state.loading = false
    // 代理服务整体不可用（fetch 直接失败 / 5xx）：不做"跳下一首"的无意义重试，
    // 直接把真实原因告诉用户，避免首页一片空白却不知为何
    if (e && e.code === 'SERVICE_DOWN') {
      state.isPlaying = false
      failCount = 0
      showToast('服务未连接，请启动代理服务（npm run server）', 'error')
      return
    }
    skipToNext(`${song.name} 播放失败：${e.message || '未知错误'}`)
  }
}

/** 用一份新列表替换播放队列并从 startIndex 开始播放 */
export function playQueue(list, startIndex = 0) {
  if (!Array.isArray(list) || !list.length) return
  state.queue = list.slice()
  failCount = 0
  playAt(startIndex)
}

/** 播放单曲：已在队列中则跳转，否则追加到队尾并播放 */
export function playSong(song) {
  if (!song) return
  failCount = 0
  const idx = state.queue.findIndex((s) => songKey(s) === songKey(song))
  if (idx >= 0) {
    playAt(idx)
    return
  }
  state.queue.push(song)
  playAt(state.queue.length - 1)
}

export function togglePlay() {
  if (!state.currentSong) {
    if (state.queue.length) {
      playAt(state.currentIndex >= 0 ? state.currentIndex : 0)
    } else {
      showToast('播放列表为空，请先选择歌曲', 'info')
    }
    return
  }
  const a = ensureAudio()
  if (a.paused) {
    a.play().catch((e) => skipToNext(`播放失败：${e.message || '未知错误'}`))
  } else {
    a.pause()
  }
}

export function next(auto = false) {
  if (!state.queue.length) return
  if (state.queue.length === 1) {
    playAt(state.currentIndex)
    return
  }
  if (state.mode === 'random') {
    let idx = state.currentIndex
    let guard = 0
    while (idx === state.currentIndex && guard < 20) {
      idx = Math.floor(Math.random() * state.queue.length)
      guard += 1
    }
    playAt(idx)
    return
  }
  playAt(state.currentIndex + 1)
}

export function prev() {
  if (!state.queue.length) return
  // 播放超过 3 秒时，上一首先回到开头（与主流播放器一致）
  if (state.currentTime > 3) {
    seek(0)
    return
  }
  playAt(state.currentIndex - 1)
}

export function seek(seconds) {
  const a = ensureAudio()
  const total = state.duration || 0
  let t = Number(seconds) || 0
  if (t < 0) t = 0
  if (total && t > total) t = total
  try {
    a.currentTime = t
  } catch (e) {
    /* 元数据未就绪时忽略 */
  }
  state.currentTime = t
}

export function setVolume(v) {
  let vol = Number(v)
  if (!Number.isFinite(vol)) vol = 0
  vol = Math.min(1, Math.max(0, vol))
  state.volume = vol
  ensureAudio().volume = vol
  savePrefs()
}

export function setMode(mode) {
  if (!['order', 'single', 'random'].includes(mode)) return
  state.mode = mode
  savePrefs()
}

export function toggleMode() {
  const order = ['order', 'single', 'random']
  const idx = order.indexOf(state.mode)
  setMode(order[(idx + 1) % order.length])
}

export function setPlaybackRate(rate) {
  const r = Number(rate)
  if (!Number.isFinite(r)) return
  state.playbackRate = r
  if (audio) audio.playbackRate = r
  savePrefs()
}

/* ------------------------------ 队列管理 ------------------------------ */
export function addToQueue(song) {
  if (!song) return
  if (state.queue.some((s) => songKey(s) === songKey(song))) {
    showToast('该歌曲已在播放列表中', 'info')
    return
  }
  state.queue.push(song)
  showToast('已加入播放列表', 'success')
}

export function removeFromQueue(index) {
  if (index < 0 || index >= state.queue.length) return
  const wasCurrent = index === state.currentIndex
  state.queue.splice(index, 1)
  if (state.currentIndex > index) state.currentIndex -= 1
  if (wasCurrent) {
    if (!state.queue.length) {
      state.currentSong = null
      state.currentIndex = -1
      state.isPlaying = false
      if (audio) {
        audio.pause()
        audio.removeAttribute('src')
      }
      return
    }
    playAt(Math.min(index, state.queue.length - 1))
  }
}

export function clearQueue() {
  state.queue = []
  state.currentSong = null
  state.currentIndex = -1
  state.isPlaying = false
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
  }
}

/* ------------------------------ 收藏 ------------------------------ */
export function isLiked(song) {
  if (!song) return false
  const k = songKey(song)
  return state.likedSongs.some((s) => songKey(s) === k)
}

export function toggleLike(song) {
  if (!song) return
  const k = songKey(song)
  const idx = state.likedSongs.findIndex((s) => songKey(s) === k)
  if (idx >= 0) {
    state.likedSongs.splice(idx, 1)
    showToast('已取消收藏', 'info')
  } else {
    state.likedSongs.unshift({ ...song })
    showToast('已加入收藏', 'success')
  }
  savePrefs()
}

/* ------------------------------ 歌词浮层 ------------------------------ */
export function toggleLyrics() {
  state.showLyrics = !state.showLyrics
}

/** 组合式入口：组件里 const player = usePlayer() */
export function usePlayer() {
  return {
    state,
    songKey,
    playAt,
    playQueue,
    playSong,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    setMode,
    toggleMode,
    setPlaybackRate,
    addToQueue,
    removeFromQueue,
    clearQueue,
    isLiked,
    toggleLike,
    toggleLyrics,
    showToast
  }
}
