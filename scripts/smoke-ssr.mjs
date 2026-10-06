/**
 * SSR 冒烟自测脚本（npm run smoke）
 * ------------------------------------------------------------------
 * 目的：不打开浏览器，用 Vite 的 SSR 能力加载真实源码并逐路由渲染，
 *       尽早暴露「模板语法错误 / 组件导入错误 / setup 运行时报错 / provide-inject 缺失」。
 * 做法：
 *   1) 注入最小化浏览器垫片（localStorage / document / history / location / Audio）；
 *   2) 用 ssrLoadModule 预加载全部视图组件（避免运行时动态 import 的不确定性）；
 *   3) 用内存路由逐个访问路由并 renderToString，断言关键内容。
 */
import { createServer } from 'vite'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'

const log = (msg) => process.stdout.write(msg + '\n')

// 看门狗：任何一步卡住 25 秒直接失败退出，避免自测挂死
const watchdog = setTimeout(() => {
  log('[FAIL] 冒烟测试超时（25s），可能某处存在未结束的异步等待')
  process.exit(2)
}, 25000)

/* ---------------- 浏览器环境垫片 ---------------- */
const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
}

globalThis.addEventListener = () => {}
globalThis.removeEventListener = () => {}
globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
globalThis.scrollTo = () => {}

globalThis.location = {
  href: 'http://localhost:5173/',
  origin: 'http://localhost:5173',
  protocol: 'http:',
  host: 'localhost:5173',
  hostname: 'localhost',
  port: '5173',
  pathname: '/',
  search: '',
  hash: ''
}
globalThis.history = { state: null, length: 1, pushState() {}, replaceState() {}, go() {}, back() {}, forward() {} }
globalThis.window = globalThis
globalThis.window.scrollTo = () => {}

globalThis.document = {
  title: '',
  addEventListener() {},
  removeEventListener() {},
  documentElement: { style: { setProperty() {}, removeProperty() {} }, classList: { add() {}, remove() {}, toggle() {} } },
  body: { appendChild() {}, removeChild() {}, classList: { add() {}, remove() {}, toggle() {} }, style: {} },
  head: { appendChild() {}, removeChild() {} },
  createElement() {
    return {
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {},
      appendChild() {},
      removeChild() {},
      addEventListener() {},
      click() {},
      getContext: () => null,
      width: 0,
      height: 0
    }
  },
  createElementNS() {
    return this.createElement()
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null
}

class FakeAudio {
  constructor() {
    this.src = ''
    this.paused = true
    this.volume = 1
    this.playbackRate = 1
    this.currentTime = 0
    this.duration = 0
    this.listeners = {}
  }
  addEventListener(t, fn) {
    ;(this.listeners[t] = this.listeners[t] || []).push(fn)
  }
  removeEventListener() {}
  removeAttribute() {}
  play() {
    this.paused = false
    return Promise.resolve()
  }
  pause() {
    this.paused = true
  }
  load() {}
}
globalThis.Audio = FakeAudio

/* ---------------- 逐路由渲染 ---------------- */
const vite = await createServer({
  root: process.cwd(),
  configFile: false,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  plugins: [(await import('@vitejs/plugin-vue')).default()]
})

let failed = 0
try {
  log('· 加载应用模块（App / 路由 / 视图 / 组合式函数）...')
  const { default: App } = await vite.ssrLoadModule('/src/App.vue')
  const views = {
    home: (await vite.ssrLoadModule('/src/views/HomeView.vue')).default,
    playlists: (await vite.ssrLoadModule('/src/views/PlaylistsView.vue')).default,
    playlist: (await vite.ssrLoadModule('/src/views/PlaylistView.vue')).default,
    search: (await vite.ssrLoadModule('/src/views/SearchView.vue')).default,
    liked: (await vite.ssrLoadModule('/src/views/LikedView.vue')).default
  }
  // 组合式函数单独加载一次，确保模块顶层代码（如读取 localStorage）不报错
  await vite.ssrLoadModule('/src/composables/usePlayer.js')
  await vite.ssrLoadModule('/src/composables/useBackground.js')
  await vite.ssrLoadModule('/src/composables/useLiked.js')
  await vite.ssrLoadModule('/src/composables/useLyrics.js')
  await vite.ssrLoadModule('/src/api/index.js')
  log('· 模块加载完成，开始逐路由渲染')

  const cases = [
    { path: '/', name: 'home', component: views.home },
    { path: '/playlists', name: 'playlists', component: views.playlists },
    { path: '/playlist/3778678', name: 'playlist', component: views.playlist },
    { path: '/search', name: 'search', component: views.search },
    { path: '/liked', name: 'liked', component: views.liked }
  ]

  for (const c of cases) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: c.path, name: c.name, component: c.component },
        { path: '/:pathMatch(.*)*', redirect: '/' }
      ]
    })
    try {
      const app = createSSRApp(App)
      app.use(router)
      await router.push(c.path)
      await router.isReady()
      const html = await renderToString(app)
      if (!html || html.length < 200) {
        failed += 1
        log(`[FAIL] ${c.path} 渲染内容过少（${html.length} 字符）`)
      } else {
        log(`[ OK ] ${c.path} → 渲染 ${html.length} 字符`)
      }
    } catch (e) {
      failed += 1
      log(`[FAIL] ${c.path} → ${(e && e.message) || e}`)
    }
  }
} catch (e) {
  failed += 1
  log('[FAIL] 模块加载失败：' + (e && (e.stack || e.message)))
} finally {
  clearTimeout(watchdog)
  await vite.close()
}

log(failed === 0 ? '\n冒烟测试通过：全部路由渲染正常' : `\n冒烟测试存在 ${failed} 项失败`)
process.exit(failed === 0 ? 0 : 1)
