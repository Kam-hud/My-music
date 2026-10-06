# 在线音乐播放器 设计文档（复刻 music.mmp.cc）

- 日期：2026-10-03
- 状态：待评审
- 项目根目录：`D:\my-music`

## 1. 背景与目标

参考站点 `https://music.mmp.cc`（Music Awkins，基于 MKOnlinePlayer v2.41 二次开发）是一款在线音乐播放器，具备播放控制、歌单、双音源搜索、歌词、背景特效等能力。

目标：从零构建一个同类的在线音乐播放器 Web 应用，做到**可真实搜索、可真实播放**。

## 2. 范围

### 2.1 范围内（全量复刻）

| 模块 | 内容 |
|---|---|
| 播放控制 | 播放/暂停、上一首/下一首、进度拖拽、音量、倍速 0.5x–4.0x |
| 播放列表 / 歌单 | 队列管理；歌单列表与歌单详情；通过歌单 ID / 链接加载网易云歌单 |
| 搜索 | 网易云 + QQ 音乐双音源切换 |
| 歌词 | 滚动歌词，自带译文时显示翻译 |
| 播放模式 | 顺序 / 单曲 / 随机 |
| 收藏 | 本地收藏（localStorage 持久化） |
| 背景 | 背景模糊、动态粒子、壁纸下载、重置背景 |

### 2.2 范围外

- 用户账号体系、云端同步
- 付费 / 会员 / 下载到本地等能力
- 移动端原生 App

## 3. 技术栈

- 前端：Vue 3 + Vite + Tailwind CSS + vue-router
- 代理层：Node（独立服务），转发第三方音乐接口
- 无额外状态管理库（播放态由 composable 单例承载）

## 4. 总体架构

```
┌─────────────────────────── 前端 SPA (Vite dev / build) ───────────────────────────┐
│  AppShell                                                                          │
│   ├─ Sidebar（导航：首页 / 歌单 / 搜索 / 收藏）                                     │
│   ├─ <router-view>（HomeView / PlaylistView / SearchView / LikedView）             │
│   ├─ PlayerBar（常驻底部：封面 / 信息 / 控件 / 进度 / 音量）                        │
│   └─ BackgroundLayer（背景渐变 + 模糊 / 粒子）                                     │
│                                                                                    │
│  usePlayer（单例 Audio 播放内核，全局共享）                                          │
│  api/index.js（统一请求封装）                                                       │
└───────────────────────────────┬───────────────────────────────────────────────────┘
                                │ HTTP (JSON)
┌───────────────────────────────▼───────────────────────────────────────────────────┐
│  Node 代理层 (server/)                                                              │
│   /api/search   → 网易 / QQ 搜索                                                    │
│   /api/song/url → 歌曲播放直链                                                      │
│   /api/playlist → 网易歌单                                                          │
└────────────────────────────────────────────────────────────────────────────────────┘
```

设计要点：前端只与自有代理通信，第三方接口的跨域、请求头、鉴权细节全部收敛在代理层。

## 5. 目录结构

```
my-music/
├─ index.html
├─ package.json
├─ vite.config.js          # 含 /api 代理到 Node 服务
├─ tailwind.config.js
├─ src/
│  ├─ main.js
│  ├─ App.vue
│  ├─ router/index.js
│  ├─ api/index.js         # search / getSongUrl / getPlaylist 封装
│  ├─ composables/
│  │   ├─ usePlayer.js     # 播放内核
│  │   ├─ useLyrics.js
│  │   └─ useBackground.js
│  ├─ components/
│  │   ├─ AppShell.vue
│  │   ├─ Sidebar.vue
│  │   ├─ PlayerBar.vue
│  │   ├─ SongList.vue
│  │   ├─ SongRow.vue
│  │   ├─ SongCard.vue
│  │   ├─ SearchBar.vue
│  │   ├─ LyricsPanel.vue
│  │   ├─ BackgroundLayer.vue
│  │   ├─ ProgressBar.vue
│  │   ├─ VolumeControl.vue
│  │   └─ ModeToggle.vue
│  ├─ views/
│  │   ├─ HomeView.vue
│  │   ├─ PlaylistView.vue
│  │   ├─ SearchView.vue
│  │   └─ LikedView.vue
│  └─ styles/main.css
├─ server/
│  ├─ index.js             # HTTP 服务与路由
│  └─ providers/
│      ├─ netease.js
│      └─ qq.js
└─ docs/superpowers/specs/2026-10-03-online-music-player-design.md
```

## 6. 播放内核 usePlayer

单例 `Audio` + 响应式 state，所有组件共享同一实例（避免多组件各自 new Audio）。

- **state**：`currentSong`、`queue`、`currentIndex`、`isPlaying`、`currentTime`、`duration`、`volume`、`mode`（`order` / `single` / `random`）、`likedIds`
- **actions**：`playQueue(list, index)`、`playSong(song)`、`togglePlay()`、`next()`、`prev()`、`seek(t)`、`setVolume(v)`、`setMode(m)`、`toggleLike(id)`、`isLiked(id)`
- **内部事件**：`timeupdate → currentTime`；`ended → 按 mode 自动下一首`；`error → 跳过并提示`
- **持久化**：`likedIds`、`volume`、`mode` 写 localStorage

## 7. 数据流

1. 用户操作 → 调用 `usePlayer` 方法 → 修改响应式 state → 组件订阅渲染。
2. 播放：选歌 → `api.getSongUrl(id, source)` → 代理返回直链 → 设置 `Audio.src` 并播放（播放前先把队列写入内核）。
3. 搜索：`SearchView` → `api.search(keyword, source)` → 代理 → 结果列表渲染。
4. 歌单：`HomeView`/歌单入口 → `api.getPlaylist(id)` → 详情 → 点选整单入队。
5. 歌词：切歌时 `api.getLyric(id, source)` → 解析 LRC → `useLyrics` 输出当前行索引。

## 8. 代理层（server/）

- 独立 Node 服务（默认端口 3001），仅本机访问。
- 路由：
  - `GET /api/search?keyword=&source=netease|qq` → 统一结构 `{ id, name, artist, album, cover, source, duration }[]`
  - `GET /api/song/url?id=&source=` → `{ url }`
  - `GET /api/playlist?id=` → `{ name, cover, songs[] }`
- 统一错误结构 `{ error: { code, message } }`。
- 前端通过 `vite.config.js` 的 `server.proxy` 把 `/api` 转发到该服务，避免开发期跨域。

## 9. 视觉规范

- 背景：`linear-gradient(135deg, #1a1a2e, #16213e, #0f0f1a)`
- 主强调：`#7c6cf0`；强调渐变：`#7c6cf0 → #5aa7ff`
- 进度 / 播放态：`#35d6c8`
- 侧栏：`rgba(15,15,30,0.85)` + `backdrop-blur`
- 卡片：`rgba(255,255,255,0.05)` + 边框 `rgba(255,255,255,0.08)`
- 字体：系统字体栈；数字/时间用等宽字形
- 布局：左导航（168px）+ 中内容 + 底部常驻播放条（64px）

## 10. 错误处理

| 场景 | 处理 |
|---|---|
| 代理未启动 / 请求失败 | 页面提示「服务未连接，请启动代理」，不白屏、不阻塞其它 UI |
| 音频不可播放（版权 / 404） | toast 提示并自动跳到下一首 |
| 搜索无结果 | 空态文案 |
| 歌词缺失 | 歌词面板显示「暂无歌词」，不报错 |
| 播放直链接口失败 | 提示并跳过，不卡住队列 |

## 11. 验收方式

1. `npm run build` 构建通过，无阻断性报错。
2. 启动前端 + 代理，真实验证链路：搜索 → 播放 → 切歌 → 进度/音量/倍速 → 歌词 → 收藏持久化。
3. 无头浏览器截图目视验收（Python 静态服务 + Edge `--headless=new --screenshot`，先轮询端口就绪；避免依赖中文 DOM 关键字匹配）。

## 12. 里程碑

| 阶段 | 交付 |
|---|---|
| 1 | 脚手架（Vite + Vue3 + Tailwind + router）+ AppShell 外壳 + usePlayer 播放内核 |
| 2 | Node 代理层 + 搜索 + 真实播放打通 |
| 3 | 歌单 / 收藏 / 歌词 |
| 4 | 背景特效（模糊 / 粒子 / 壁纸）+ 倍速 + 打磨与验收 |
