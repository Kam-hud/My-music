/**
 * 本地音乐代理服务（Node 原生 http，无第三方依赖）
 * ------------------------------------------------------------------
 * 职责：收敛所有第三方音乐接口的跨域 / 请求头 / 鉴权细节，对前端暴露统一 JSON。
 * 启动：npm run server（默认 http://localhost:3001）
 *
 * 路由：
 *   GET /api/health           健康检查
 *   GET /api/search           关键词搜索（?keyword=&source=netease|qq&limit=）
 *   GET /api/song/url         播放直链（?id=&source=）
 *   GET /api/lyric            歌词（?id=&source=）
 *   GET /api/playlist         歌单详情（?id=&source=，默认网易云）
 *   GET /api/toplist          推荐歌单
 *   GET /api/download         代理下载封面/壁纸（?url=&filename=）
 *   GET /任意前端路由          dist 构建产物（先 npm run build）
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import netease from './providers/netease.js'
import qq from './providers/qq.js'

const PORT = Number(process.env.PORT) || 3001

// 构建产物目录：存在时由本服务一并托管，实现「npm run build && npm start」单端口跑通
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.resolve(__dirname, '..', 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
}

/** 托管 dist 静态资源；未命中的非资源路径回落到 index.html（hash 路由） */
function serveStatic(res, pathname) {
  const decoded = decodeURIComponent(pathname)
  const target = path.join(DIST_DIR, decoded)
  // 防目录穿越：只允许访问 dist 目录内部
  if (!path.resolve(target).startsWith(DIST_DIR)) {
    sendError(res, 403, 'FORBIDDEN', '非法路径')
    return true
  }

  let filePath = target
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const hasExt = path.extname(decoded) !== ''
    if (hasExt) return false
    filePath = path.join(DIST_DIR, 'index.html')
    if (!fs.existsSync(filePath)) return false
  }

  const ext = path.extname(filePath).toLowerCase()
  const stream = fs.createReadStream(filePath)
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  stream.pipe(res)
  return true
}

const PROVIDERS = { netease, qq }

// 允许经代理下载的图片域名后缀（防止被当作任意 URL 代理滥用）
const DOWNLOAD_HOST_SUFFIX = ['music.126.net', '126.net', 'gtimg.cn', 'y.qq.com', 'qq.com']

/** 把远端封面/壁纸以附件形式流式回传，前端因此可以同源触发下载 */
async function handleDownload(res, query) {
  const raw = query.get('url') || ''
  const rawName = query.get('filename') || 'my-music-wallpaper.jpg'
  const filename = rawName.replace(/[^\w.\-\u4e00-\u9fa5]/g, '_') || 'my-music-wallpaper.jpg'

  let target
  try {
    target = new URL(raw)
  } catch (e) {
    sendError(res, 400, 'BAD_REQUEST', '下载地址不合法')
    return
  }
  const hostOk = DOWNLOAD_HOST_SUFFIX.some((suffix) => target.hostname === suffix || target.hostname.endsWith('.' + suffix))
  if (!/^https?:$/.test(target.protocol) || !hostOk) {
    sendError(res, 403, 'FORBIDDEN', '该地址不允许下载')
    return
  }

  try {
    const upstream = await fetch(target.href, {
      headers: { Referer: 'https://music.163.com/', 'User-Agent': 'Mozilla/5.0' }
    })
    if (!upstream.ok || !upstream.body) {
      sendError(res, 502, 'UPSTREAM_ERROR', `图片获取失败（HTTP ${upstream.status}）`)
      return
    }
    res.writeHead(200, {
      'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Allow-Origin': '*'
    })
    const { Readable } = await import('node:stream')
    Readable.fromWeb(upstream.body).pipe(res)
  } catch (e) {
    sendError(res, 502, 'UPSTREAM_ERROR', e.message || '图片下载失败')
  }
}

function getProvider(source) {
  return PROVIDERS[source] || netease
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    // 开发期允许跨域，方便直接用静态服务打开前端产物
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(body)
}

function sendError(res, status, code, message) {
  sendJson(res, status, { error: { code, message } })
}

const routes = {
  '/api/health': async () => ({ ok: true, service: 'my-music-proxy', time: Date.now() }),

  '/api/search': async (query) => {
    // 兼容 keyword / keywords 两种写法，避免调用方参数名不一致时静默返回空列表
    const keyword = (query.get('keyword') || query.get('keywords') || '').trim()
    const source = query.get('source') || 'netease'
    const limit = Math.min(60, Math.max(1, Number(query.get('limit')) || 30))
    if (!keyword) throw Object.assign(new Error('缺少参数 keyword'), { status: 400, code: 'BAD_REQUEST' })
    const songs = await getProvider(source).search(keyword, limit)
    return { keyword, source, songs }
  },

  '/api/song/url': async (query) => {
    const id = (query.get('id') || '').trim()
    const source = query.get('source') || 'netease'
    if (!id) throw Object.assign(new Error('缺少参数 id'), { status: 400, code: 'BAD_REQUEST' })
    const url = await getProvider(source).songUrl(id)
    return { id, source, url }
  },

  '/api/lyric': async (query) => {
    const id = (query.get('id') || '').trim()
    const source = query.get('source') || 'netease'
    if (!id) throw Object.assign(new Error('缺少参数 id'), { status: 400, code: 'BAD_REQUEST' })
    const data = await getProvider(source).lyric(id)
    return { id, source, lrc: data.lrc || '', translation: data.translation || '' }
  },

  '/api/playlist': async (query) => {
    const id = (query.get('id') || '').trim()
    const source = query.get('source') || 'netease'
    if (!id) throw Object.assign(new Error('缺少参数 id'), { status: 400, code: 'BAD_REQUEST' })
    return getProvider(source).playlist(id)
  },

  '/api/toplist': async () => netease.toplist()
}

const server = http.createServer(async (req, res) => {
  // 统一 CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end()
    return
  }

  let url
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  } catch (e) {
    sendError(res, 400, 'BAD_REQUEST', '非法请求地址')
    return
  }

  // 图片下载通道（流式返回，不走 JSON 分支）
  if (url.pathname === '/api/download') {
    if (req.method !== 'GET') {
      sendError(res, 405, 'METHOD_NOT_ALLOWED', '仅支持 GET')
      return
    }
    await handleDownload(res, url.searchParams)
    return
  }

  const handler = routes[url.pathname]
  if (!handler) {
    // 非 API 路径：尝试托管前端构建产物（未构建时回落到 404 提示）
    if (!url.pathname.startsWith('/api/')) {
      if (serveStatic(res, url.pathname)) return
      sendError(res, 404, 'STATIC_NOT_FOUND', '未找到静态资源，请先执行 npm run build')
      return
    }
    sendError(res, 404, 'NOT_FOUND', `未定义的路由：${url.pathname}`)
    return
  }

  if (req.method !== 'GET') {
    sendError(res, 405, 'METHOD_NOT_ALLOWED', '仅支持 GET')
    return
  }

  try {
    const data = await handler(url.searchParams)
    sendJson(res, 200, data)
  } catch (e) {
    // 业务型失败（歌曲无版权 / 歌单不存在）用 4xx 返回，
    // 避免被前端统一的"5xx = 服务未连接"文案吞掉真实原因
    const BUSINESS_CODES = ['NO_SONG_URL', 'VIP_SONG', 'PLAYLIST_NOT_FOUND']
    const status = e.status || (BUSINESS_CODES.includes(e.code) ? 404 : 502)
    const code = e.code || 'UPSTREAM_ERROR'
    const message = e.message || '代理请求失败'
    console.error(`[proxy] ${url.pathname} 失败：${message}`)
    sendError(res, status, code, message)
  }
})

server.listen(PORT, () => {
  console.log(`[my-music proxy] 已启动：http://localhost:${PORT}`)
  console.log('  可用路由：/api/search /api/song/url /api/lyric /api/playlist /api/toplist /api/health')
})

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`[my-music proxy] 端口 ${PORT} 已被占用，请先关闭占用进程或设置 PORT 环境变量`)
  } else {
    console.error('[my-music proxy] 启动失败：', e)
  }
  process.exit(1)
})
