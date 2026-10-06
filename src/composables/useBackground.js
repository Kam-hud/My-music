/**
 * 背景特效状态
 * - blur：背景模糊强度（0–40px）
 * - particles：动态粒子开关
 * - wallpaper：自定义壁纸（本地图片 dataURL / 图片地址），空表示使用默认渐变
 * 状态持久化到 localStorage；下载壁纸会联网取图并以文件形式保存到本地。
 */
import { reactive } from 'vue'

const STORAGE_KEY = 'my-music:background'

const DEFAULTS = {
  blur: 0,
  particles: true,
  wallpaper: ''
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw)
    return {
      blur: typeof parsed.blur === 'number' ? parsed.blur : DEFAULTS.blur,
      particles: typeof parsed.particles === 'boolean' ? parsed.particles : DEFAULTS.particles,
      wallpaper: typeof parsed.wallpaper === 'string' ? parsed.wallpaper : ''
    }
  } catch (e) {
    return { ...DEFAULTS }
  }
}

export const bgState = reactive(load())

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ blur: bgState.blur, particles: bgState.particles, wallpaper: bgState.wallpaper })
    )
  } catch (e) {
    /* 忽略写入失败 */
  }
}

export function setBlur(value) {
  let v = Number(value)
  if (!Number.isFinite(v)) v = 0
  bgState.blur = Math.min(40, Math.max(0, Math.round(v)))
  persist()
}

export function toggleParticles(force) {
  bgState.particles = typeof force === 'boolean' ? force : !bgState.particles
  persist()
}

export function setWallpaper(url) {
  bgState.wallpaper = url || ''
  persist()
}

/** 重置背景：回到默认渐变，关闭模糊，恢复粒子 */
export function resetBackground() {
  bgState.blur = DEFAULTS.blur
  bgState.particles = DEFAULTS.particles
  bgState.wallpaper = ''
  persist()
}

/**
 * 下载壁纸：走本地代理的 /api/download 通道。
 * 第三方图片 CDN 不提供 CORS 头，浏览器里直接 fetch 会失败；
 * 交给代理以附件形式流式回传后，同源触发下载即可稳定落盘。
 */
export async function downloadWallpaper(url, filename = 'my-music-wallpaper.jpg') {
  const target = url || bgState.wallpaper
  if (!target) throw new Error('暂无可下载的壁纸，请先选择一张歌曲封面')
  const apiUrl = `/api/download?url=${encodeURIComponent(target)}&filename=${encodeURIComponent(filename)}`

  // 先探测一次，把"代理未启动 / 地址不被允许"这类失败如实抛出给用户
  const probe = await fetch(apiUrl, { method: 'GET' }).catch(() => {
    throw new Error('服务未连接，请启动代理服务（npm run server）')
  })
  if (!probe.ok) {
    const data = await probe.json().catch(() => null)
    throw new Error((data && data.error && data.error.message) || `壁纸下载失败（HTTP ${probe.status}）`)
  }
  await probe.arrayBuffer() // 丢弃探测内容，仅为确认通道可用

  const a = document.createElement('a')
  a.href = apiUrl
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function useBackground() {
  return { bgState, setBlur, toggleParticles, setWallpaper, resetBackground, downloadWallpaper }
}
