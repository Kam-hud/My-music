/**
 * 通用请求助手：带超时、统一 UA / Referer、统一错误。
 */

export const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

export class ApiError extends Error {
  constructor(message, code = 'UPSTREAM_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/** 带超时的 fetch */
export async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (e) {
    if (e.name === 'AbortError') throw new ApiError('上游接口超时，请稍后重试', 'UPSTREAM_TIMEOUT')
    throw new ApiError(`上游接口不可达：${e.message}`, 'UPSTREAM_UNREACHABLE')
  } finally {
    clearTimeout(timer)
  }
}

/** 请求并解析 JSON（自动剥离 JSONP 包裹） */
export async function fetchJson(url, options = {}, timeout = 8000) {
  const res = await fetchWithTimeout(url, options, timeout)
  if (!res.ok) throw new ApiError(`上游接口返回 HTTP ${res.status}`, 'UPSTREAM_BAD_STATUS')
  const text = await res.text()
  const cleaned = text.replace(/^[^({[]*\(/, '').replace(/\)\s*;?\s*$/, '')
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    throw new ApiError('上游接口返回内容无法解析', 'UPSTREAM_BAD_JSON')
  }
}

/** 请求文本（用于歌词等非 JSON 接口） */
export async function fetchText(url, options = {}, timeout = 8000) {
  const res = await fetchWithTimeout(url, options, timeout)
  if (!res.ok) throw new ApiError(`上游接口返回 HTTP ${res.status}`, 'UPSTREAM_BAD_STATUS')
  return res.text()
}
