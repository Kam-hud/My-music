# 在线音乐播放器 实现计划

- 日期：2026-10-03
- 项目根目录：`D:\my-music`
- 关联设计文档：`D:\my-music\docs\superpowers\specs\2026-10-03-online-music-player-design.md`

## 阶段 1 — 脚手架 + 外壳 + 播放内核（里程碑 1）

| 文件 | 内容 |
|---|---|
| `package.json` | Vue 3 / Vite / Tailwind / vue-router 依赖与脚本 |
| `vite.config.js` | Tailwind PostCSS 配置；`/api` 代理到 `http://localhost:3001` |
| `tailwind.config.js` | Tailwind 基础配置 |
| `index.html` | 入口 |
| `src/main.js` | `createApp(App)` → 挂载 router |
| `src/App.vue` | 应用根 |
| `src/router/index.js` | 路由：`/`、`/playlist/:id`、`/search`、`/liked`（hash 模式） |
| `src/styles/main.css` | Tailwind 指令 + 自定义 CSS 变量（配色 tokens） |
| `src/composables/usePlayer.js` | **核心**：单例 `new Audio()` + 响应式 state + actions + 事件绑定 + localStorage 持久化 |
| `src/components/AppShell.vue` | 外壳：`Sidebar` + `<router-view>` + `PlayerBar` |
| `src/components/Sidebar.vue` | 4 个导航项，激活高亮，`router-link` |
| `src/components/PlayerBar.vue` | 歌曲信息 + 控件 + 进度 + 音量 + 模式 |
| `src/components/ProgressBar.vue` | 进度条（拖动/点击跳转） |
| `src/components/VolumeControl.vue` | 音量滑块与图标 |
| `src/components/ModeToggle.vue` | 顺序/单曲/随机 |

交付：`vite dev` 可运行，三栏布局成型，路由跳转可用，播放内核可测试。

## 阶段 2 — 代理层 + 搜索 + 真实播放（里程碑 2）

| 文件 | 内容 |
|---|---|
| `server/index.js` | Node HTTP 服务：`GET /api/search`、`GET /api/song/url`、`GET /api/playlist` |
| `server/providers/netease.js` | 网易云接口封装，统一返回结构 |
| `server/providers/qq.js` | QQ 音乐接口封装，统一返回结构 |
| `src/api/index.js` | `search(keyword, source)` / `getSongUrl(id, source)` / `getPlaylist(id)` |
| `src/views/HomeView.vue` | 搜索栏 + 推荐歌单网格 |
| `src/views/SearchView.vue` | 搜索页：源切换 + 结果列表 |
| `src/views/PlaylistView.vue` | 歌单详情 + 歌曲列表 |
| `src/views/LikedView.vue` | 收藏列表 |
| `src/components/SongList.vue` | 歌曲列表容器 |
| `src/components/SongRow.vue` | 单行歌曲，点击播放 |

交付：单独启动代理 → 前端可真实搜索 → 点击播放 → 切歌 → 进度条走动。

## 阶段 3 — 歌词 + 收藏持久化（里程碑 3）

| 文件 | 内容 |
|---|---|
| `src/composables/useLyrics.js` | 解析 LRC，按 `currentTime` 输出当前行索引 |
| `src/api/index.js`（补充） | 新增 `getLyric(id, source)` |
| `src/components/LyricsPanel.vue` | 歌词浮层，当前行高亮，含关闭按钮 |
| `src/views/HomeView.vue`（补充） | 「加载网易云歌单」输入框（歌单 ID/链接 → 详情） |

交付：歌词浮层随播放滚动；收藏可切换，刷新不丢（localStorage）。

## 阶段 4 — 背景特效 + 倍速 + 打磨与验收（里程碑 4）

| 文件 | 内容 |
|---|---|
| `src/composables/useBackground.js` | 背景状态（blur / particles / wallpaper）+ 持久化 + 封面取色 |
| `src/components/BackgroundLayer.vue` | 背景渐变 / 模糊 / canvas 粒子 |
| `src/views/HomeView.vue`（补充） | 「壁纸下载」按钮 |

## 验收清单

1. `npm install` 成功，`npm run build` 通过。
2. 代理 + 前端同时启动，链路验证：搜索 → 播放 → 切歌 → 进度/音量/倍速 → 歌词 → 收藏 → 背景模糊/粒子 → 壁纸下载。
3. 无头浏览器截图目视验收（Python 静态服务 + Edge headless，注意端口就绪与编码）。
4. 代理不可用时 UI 给出「服务未连接」提示而非白屏。

## 实施结果（2026-10-03 补充）

四个阶段全部实现完毕，验收清单 4 项全部通过。

| 验证项 | 结果 |
|---|---|
| `npm install` | 通过（up to date，无缺失依赖） |
| `npm run build` | 通过，`✓ built in 1.15s`，入口 chunk 125.10 kB / gzip 48.75 kB |
| `npm run smoke`（路由 SSR 冒烟） | 通过：`/` `/playlists` `/playlist/:id` `/search` `/liked` 均渲染正常 |
| 代理接口 14 项逐一校验 | 全部符合预期（含 403 域名白名单、404 业务错误码映射、静态托管） |
| 端到端验收（Edge + playwright-core） | EXIT=0，15 项 [OK]，控制台无未预期报错 |

补充实现（计划外，验收中发现后修复）：

- 播放异常新增 `SERVICE_DOWN` 特判，代理未启动时提示「服务未连接」而非连环跳歌。
- 新增代理通道 `GET /api/download?url=&filename=`（域名白名单 + 流式附件返回），解决第三方 CDN 封面/壁纸下载的跨域限制。
- `/api/search` 兼容 `keyword` / `keywords` 两种参数名，缺参返回 400 `BAD_REQUEST`（此前静默返回空列表）。
- 新增 `scripts/dev-all.mjs`（`npm run dev` 一键同启代理与前端）与 `scripts/smoke-ssr.mjs`（`npm run smoke` 路由自测）。

遗留说明：QQ 音乐热门曲目多为会员版权，匿名取直链返回 `VIP_SONG`，前端会自动切换网易云音源；第三方接口偶发限流时搜索可能为空，重试或切换音源即可。

