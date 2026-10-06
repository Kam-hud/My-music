# My Music · 在线音乐播放器

参考 [music.mmp.cc](https://music.mmp.cc)（MKOnlinePlayer 类站点）实现的在线音乐播放器，完全从零构建。

- 前端：Vue 3 + Vite + Tailwind CSS + vue-router（hash 模式）
- 后端：Node 原生 HTTP 代理服务（零第三方依赖），统一收敛第三方音乐接口的跨域与请求头
- 音源：网易云音乐 + QQ 音乐（双音源聚合搜索）

## 一、快速开始

需要先安装 [Node.js](https://nodejs.org/)（18 及以上版本）。

```bash
cd D:\my-music

# 1. 安装依赖
npm install

# 2. 启动代理服务（新开一个终端窗口，保持运行）
npm run server

# 3. 启动前端开发服务（再开一个终端窗口）
npm run dev
```

浏览器打开终端里提示的地址（默认 http://localhost:5173 ）即可使用。

> 两个服务需要**同时运行**：`npm run server` 提供 `/api` 接口，`npm run dev` 提供页面。
> 若代理未启动，页面会给出「服务未连接」提示，而不是白屏。

## 二、生产构建与预览

```bash
npm run build     # 产物输出到 dist/
npm run preview   # 本地预览构建产物（默认 4173 端口）
```

构建产物为纯静态文件，由于路由使用 hash 模式，可直接用任意静态服务器托管。
也可以只启动代理服务直接访问构建产物（代理会自动托管 `dist/`）：`npm run build` 后执行 `npm run server`，浏览器打开 http://localhost:3001 即可。

自测脚本：`npm run smoke` 会用 Vite SSR 逐个渲染各路由，确认页面不会渲染报错（无需启动浏览器）。

## 三、功能清单

| 模块 | 说明 |
|---|---|
| 播放内核 | 单例 `Audio`，播放/暂停/上一首/下一首/seek，全局状态响应式共享 |
| 播放模式 | 顺序播放 / 单曲循环 / 随机播放 |
| 倍速播放 | 0.75x ~ 2.0x 循环切换 |
| 音量控制 | 滑块 + 静音，带记忆恢复 |
| 双音源搜索 | 网易云 / QQ 音乐一键切换，关键词搜索歌曲 |
| 歌单 | 推荐歌单广场、歌单详情、播放全部；支持粘贴歌单 ID 或链接直接打开 |
| 歌词 | LRC 解析，浮层展示，当前行自动高亮滚动 |
| 收藏 | 本地持久化（localStorage），刷新不丢失 |
| 背景特效 | 高斯模糊强度调节、canvas 粒子动效、当前封面设为壁纸并下载 |
| 队列 | 加入播放队列、清除队列、当前播放高亮 |

## 四、目录结构

```
D:\my-music
├─ index.html                 入口 HTML
├─ package.json               依赖与脚本
├─ vite.config.js             构建配置 + /api 代理
├─ tailwind.config.js         Tailwind 配置
├─ postcss.config.js          PostCSS 配置
├─ server/                    Node 代理服务
│  ├─ index.js                HTTP 服务与路由分发
│  └─ providers/
│     ├─ netease.js           网易云接口封装
│     └─ qq.js                QQ 音乐接口封装
├─ src/
│  ├─ main.js                 应用入口
│  ├─ App.vue                 根组件（背景层 / 外壳 / 歌词层 / 提示层）
│  ├─ api/index.js            前端请求封装（统一走 /api）
│  ├─ router/index.js         路由表
│  ├─ styles/main.css         全局样式与设计 token
│  ├─ utils/format.js         时间 / 播放量 / 链接解析工具
│  ├─ composables/
│  │  ├─ usePlayer.js         播放内核（单例）
│  │  ├─ useLyrics.js         歌词解析
│  │  ├─ useLiked.js          收藏
│  │  └─ useBackground.js     背景特效
│  ├─ components/             通用组件（外壳 / 播放条 / 列表 / 卡片 …）
│  └─ views/                  页面（首页 / 歌单广场 / 歌单详情 / 搜索 / 收藏）
└─ docs/superpowers/          设计文档与实现计划
```

## 五、代理接口一览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| GET | `/api/search?keyword=&source=&limit=` | 搜索歌曲，`source` 取 `netease` / `qq`（兼容 `keywords` 参数名） |
| GET | `/api/song/url?id=&source=` | 获取播放地址 |
| GET | `/api/lyric?id=&source=` | 获取歌词 |
| GET | `/api/playlist?id=&source=` | 歌单详情 |
| GET | `/api/toplist?source=` | 推荐歌单列表 |
| GET | `/api/download?url=&filename=` | 代理下载歌曲封面/壁纸（同源落盘，规避第三方 CDN 的跨域限制） |

## 六、常见问题

- **页面提示「服务未连接」**：代理服务没启动，执行 `npm run server` 后刷新页面。
- **某首歌无法播放**：不同音源版权不同，切到另一个音源（搜索页右上角）重试；同时歌曲会自动临时切源。
- **搜索无结果**：第三方接口偶有限流，稍等几秒重试或切换音源。
- **端口被占用**：代理端口在 `server/index.js` 中调整，前端代理目标同步修改 `vite.config.js` 的 `server.proxy`。
