<script setup>
/**
 * 首页（重构版）
 * 结构：欢迎条「Hi Kam 今日为你推荐」+ 4 张横排推荐卡 + 「你的私存歌单」横向滚动区
 * 数据：全部来自项目真实接口 /api/toplist（网易云精选歌单），不使用参考图中的演示假数据
 * 次要入口：「打开指定歌单」输入框与「背景特效」面板收纳进折叠区，功能与原实现一致
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SongCard from '../components/SongCard.vue'
import Icon from '../components/Icon.vue'
import { getToplist } from '../api'
import { usePlayer } from '../composables/usePlayer'
import { bgState, setBlur, toggleParticles, resetBackground, downloadWallpaper } from '../composables/useBackground'
import { extractPlaylistId } from '../utils/format'

const router = useRouter()
const player = usePlayer()
const { state } = player

const playlistInput = ref('')
const playlists = ref([])
const loading = ref(true)
const error = ref('')
const downloading = ref(false)
const toolsOpen = ref(false)

// 4 张横排推荐卡：取真实榜单前 4 张
const recommendCards = computed(() => playlists.value.slice(0, 4))
// 你的私存歌单：真实歌单全量横向滚动
const savedPlaylists = computed(() => playlists.value)

// 欢迎条副标题：用真实统计数据渲染（歌单数量 / 收藏数量）
const welcomeSub = computed(() => {
  if (loading.value) return '正在同步你的音乐数据…'
  if (error.value) return '服务未连接，暂时无法获取推荐数据'
  return `为你精选 ${playlists.value.length} 组歌单 · 已收藏 ${state.likedSongs.length} 首`
})

async function loadToplist() {
  loading.value = true
  error.value = ''
  try {
    const data = await getToplist()
    playlists.value = (data && data.playlists) || []
  } catch (e) {
    error.value = e.message || '推荐歌单加载失败'
    playlists.value = []
  } finally {
    loading.value = false
  }
}

function openPlaylist(id) {
  router.push(`/playlist/${id}`)
}

function playPlaylist(id) {
  router.push({ path: `/playlist/${id}`, query: { autoplay: '1' } })
}

function openReport() {
  // 听歌报告页尚未上线：先跳到收藏页，并明确告知用户
  player.showToast('听歌报告暂未上线，先看看你收藏的歌吧', 'info')
  router.push('/liked')
}

function openByInput() {
  const id = extractPlaylistId(playlistInput.value)
  if (!id) {
    player.showToast('请输入正确的歌单 ID 或歌单链接', 'error')
    return
  }
  router.push(`/playlist/${id}`)
}

function onBlurInput(e) {
  setBlur(e.target.value)
}

async function onDownloadWallpaper() {
  if (!bgState.wallpaper) {
    player.showToast('请先点播放条上的「设为壁纸」按钮，用当前封面作为壁纸', 'info')
    return
  }
  downloading.value = true
  try {
    await downloadWallpaper()
    player.showToast('壁纸已开始下载', 'success')
  } catch (e) {
    player.showToast(e.message || '壁纸下载失败', 'error')
  } finally {
    downloading.value = false
  }
}

function onResetBackground() {
  resetBackground()
  player.showToast('背景已恢复默认', 'success')
}

onMounted(loadToplist)
</script>

<template>
  <div class="home">
    <!-- 欢迎条 -->
    <section class="welcome">
      <div class="welcome-text">
        <h1 class="welcome-title">
          Hi Kam <span class="accent">今日为你推荐</span>
        </h1>
        <p class="welcome-sub">{{ welcomeSub }}</p>
      </div>
      <button class="welcome-link" @click="openReport">
        查看你的听歌报告
        <Icon name="chevron-right" :size="14" />
      </button>
    </section>

    <!-- 服务未连接提示 -->
    <div v-if="error" class="alert">
      <Icon name="close" :size="16" />
      <div class="alert-body">
        <strong>{{ error }}</strong>
        <span>请确认已启动代理服务：在项目根目录执行 npm run server</span>
      </div>
      <button class="ghost-btn" @click="loadToplist">重试</button>
    </div>

    <!-- 4 张横排推荐卡（真实榜单数据） -->
    <section class="section">
      <div class="rec-grid">
        <template v-if="loading">
          <div v-for="n in 4" :key="`sk-${n}`" class="rec-card rec-card--skeleton">
            <div class="skeleton" />
          </div>
        </template>

        <template v-else>
          <article
            v-for="pl in recommendCards"
            :key="pl.id"
            class="rec-card"
            :title="pl.name"
            @click="openPlaylist(pl.id)"
          >
            <img v-if="pl.cover" class="rec-cover" :src="pl.cover" :alt="pl.name" loading="lazy" />
            <div v-else class="rec-cover rec-cover--ph">♪</div>
            <div class="rec-mask" />
            <div class="rec-body">
              <div class="rec-title">{{ pl.name }}</div>
              <div class="rec-sub">{{ pl.playCount ? `播放 ${pl.playCount}` : '精选歌单' }}</div>
            </div>
            <button class="rec-play" title="播放" @click.stop="playPlaylist(pl.id)">
              <Icon name="play" :size="16" />
            </button>
          </article>
        </template>
      </div>
    </section>

    <!-- 你的私存歌单：横向滚动 -->
    <section class="section">
      <header class="section-head">
        <h2 class="section-title">你的私存歌单</h2>
        <button class="ghost-btn" @click="loadToplist">
          <Icon name="refresh" :size="14" />
          刷新
        </button>
      </header>

      <div v-if="loading" class="hscroll">
        <div v-for="n in 5" :key="`sc-${n}`" class="hitem card-skeleton">
          <div class="skeleton skeleton-cover" />
          <div class="skeleton skeleton-name" />
        </div>
      </div>

      <div v-else-if="savedPlaylists.length" class="hscroll">
        <SongCard
          v-for="pl in savedPlaylists"
          :key="pl.id"
          class="hitem"
          :playlist="pl"
          @open="openPlaylist(pl.id)"
          @play="playPlaylist(pl.id)"
        />
      </div>

      <div v-else class="empty">
        <Icon name="list" :size="28" />
        <p>暂无歌单数据，点击刷新重试</p>
      </div>
    </section>

    <!-- 次要入口：打开指定歌单 + 背景特效（功能保留，默认折叠） -->
    <section class="tools">
      <button class="tools-toggle" :class="{ 'tools-toggle--open': toolsOpen }" @click="toolsOpen = !toolsOpen">
        <Icon :name="toolsOpen ? 'chevron-down' : 'chevron-right'" :size="14" />
        <span>更多工具（打开指定歌单 / 背景特效）</span>
      </button>

      <div v-show="toolsOpen" class="tool-grid">
        <div class="panel">
          <div class="panel-head">
            <Icon name="link" :size="15" />
            <span>打开指定歌单</span>
          </div>
          <div class="panel-row">
            <input
              v-model="playlistInput"
              class="field"
              type="text"
              placeholder="粘贴歌单 ID 或歌单链接"
              @keyup.enter="openByInput"
            />
            <button class="primary-btn" @click="openByInput">打开</button>
          </div>
          <p class="panel-tip">例如 3778678，或 https://music.163.com/playlist?id=3778678</p>
        </div>

        <div class="panel">
          <div class="panel-head">
            <Icon name="sparkle" :size="15" />
            <span>背景特效</span>
          </div>
          <div class="bg-row">
            <span class="bg-label">模糊</span>
            <input
              class="range-slider bg-range"
              type="range"
              min="0"
              max="40"
              step="1"
              :value="bgState.blur"
              @input="onBlurInput"
            />
            <span class="bg-value tnum">{{ bgState.blur }}px</span>
          </div>
          <div class="bg-row">
            <span class="bg-label">粒子</span>
            <button class="switch" :class="{ 'switch--on': bgState.particles }" @click="toggleParticles()">
              <span class="switch-knob" />
            </button>
            <span class="bg-value">{{ bgState.particles ? '已开启' : '已关闭' }}</span>
          </div>
          <div class="bg-actions">
            <button class="ghost-btn" :disabled="downloading" @click="onDownloadWallpaper">
              <Icon name="download" :size="14" />
              {{ downloading ? '下载中' : '下载壁纸' }}
            </button>
            <button class="ghost-btn" @click="onResetBackground">
              <Icon name="refresh" :size="14" />
              重置背景
            </button>
          </div>
          <p class="panel-tip">壁纸来源：播放条上的「设为壁纸」按钮，一键把当前封面设为背景</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1180px;
}

/* ===== 欢迎条 ===== */
.welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 26px;
  border-radius: var(--radius-lg);
  background: linear-gradient(120deg, rgba(124, 108, 240, 0.3), rgba(90, 167, 255, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.welcome-text {
  min-width: 0;
}

.welcome-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.accent {
  background: linear-gradient(90deg, #7c6cf0, #35d6c8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.welcome-sub {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.55);
}

.welcome-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 12.5px;
  font-family: inherit;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: all 0.2s ease;
}

.welcome-link:hover {
  background: rgba(124, 108, 240, 0.28);
  border-color: rgba(124, 108, 240, 0.55);
}

/* ===== 提示条 ===== */
.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-radius: var(--radius-sm);
  color: #ffc6cf;
  background: rgba(255, 107, 129, 0.12);
  border: 1px solid rgba(255, 107, 129, 0.32);
}

.alert-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  font-size: 12.5px;
}

.alert-body span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11.5px;
}

/* ===== 4 张横排推荐卡 ===== */
.rec-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.rec-card {
  position: relative;
  height: 132px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(124, 108, 240, 0.35), rgba(90, 167, 255, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
}

.rec-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.rec-cover--ph {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: rgba(255, 255, 255, 0.5);
}

.rec-card:hover .rec-cover {
  transform: scale(1.06);
}

.rec-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 7, 20, 0.05) 30%, rgba(10, 7, 20, 0.82));
}

.rec-body {
  position: absolute;
  left: 14px;
  right: 56px;
  bottom: 12px;
}

.rec-title {
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-sub {
  margin-top: 3px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.rec-play {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 36px;
  height: 36px;
  padding-left: 2px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  box-shadow: 0 8px 20px rgba(124, 108, 240, 0.45);
  cursor: pointer;
  opacity: 0;
  transform: translateY(6px);
  transition: all 0.25s ease;
}

.rec-card:hover .rec-play {
  opacity: 1;
  transform: translateY(0);
}

.rec-card--skeleton {
  background: rgba(255, 255, 255, 0.05);
}

.rec-card--skeleton .skeleton {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

/* ===== 区块 ===== */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

/* 横向滚动区：每屏 5 张自适应铺满 + 超出横向滚动 */
.hscroll {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 400px;
  padding-right: 10px;
  scrollbar-width: none;
}

/* 卡片宽度按容器自适应：(容器宽 - 4 个间距) / 5，恰好铺满一屏 */
.hitem {
  flex: 0 0 calc((100% - 48px) / 4);
  min-width: 140px;
}

.card-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton {
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-cover {
  width: 100%;
  aspect-ratio: 1 / 1;
}

.skeleton-name {
  height: 12px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 0;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

/* ===== 次要入口（打开歌单 / 背景特效） ===== */
.tools {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tools-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tools-toggle:hover {
  color: #fff;
  border-color: rgba(124, 108, 240, 0.5);
}

.tools-toggle--open {
  color: #fff;
  background: rgba(124, 108, 240, 0.18);
  border-color: rgba(124, 108, 240, 0.6);
}

.tool-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}

.panel {
  padding: 16px 18px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.panel-row {
  display: flex;
  gap: 9px;
}

.field {
  flex: 1;
  min-width: 0;
  height: 36px;
  padding: 0 13px;
  border-radius: 10px;
  color: #fff;
  font-size: 12.5px;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.11);
  outline: none;
}

.field:focus {
  border-color: rgba(124, 108, 240, 0.6);
}

.field::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.primary-btn {
  flex-shrink: 0;
  height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  font-size: 12.5px;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  cursor: pointer;
}

.panel-tip {
  margin: 10px 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.34);
  line-height: 1.5;
}

.bg-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.bg-label {
  width: 28px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
}

.bg-range {
  flex: 1;
}

.bg-value {
  width: 52px;
  text-align: right;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.switch {
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: background 0.2s ease;
}

.switch--on {
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  border-color: transparent;
}

.switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.switch--on .switch-knob {
  transform: translateX(18px);
}

.bg-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

/* ===== 响应式：窄屏时推荐卡两列 ===== */
@media (max-width: 1180px) {
  .rec-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tool-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== 移动端（≤768px）：欢迎条纵向堆叠、私存歌单改为 2 列横滑 ===== */
@media (max-width: 768px) {
  .home {
    gap: 18px;
  }

  .welcome {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 18px 16px;
  }

  .welcome-title {
    font-size: 21px;
  }

  .welcome-sub {
    margin-top: 6px;
    font-size: 12px;
  }

  .welcome-link {
    height: 32px;
    padding: 0 13px;
    font-size: 12px;
  }

  .alert {
    flex-wrap: wrap;
    gap: 9px;
    padding: 11px 13px;
  }

  .alert-body {
    flex: 1 1 150px;
  }

  .rec-grid {
    gap: 12px;
  }

  .rec-card {
    height: 116px;
  }

  .rec-body {
    left: 11px;
    right: 44px;
    bottom: 10px;
  }

  .rec-title {
    font-size: 12.5px;
  }

  .rec-sub {
    font-size: 10.5px;
  }

  /* 移动端无 hover：播放按钮常显并缩小 */
  .rec-play {
    width: 30px;
    height: 30px;
    right: 9px;
    bottom: 9px;
    opacity: 1;
    transform: none;
  }

  .section-head {
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 15.5px;
  }

  .hscroll {
    gap: 12px;
  }

  /* 一屏约 2.2 张卡片，明确提示可横向滑动 */
  .hitem {
    flex: 0 0 calc((100% - 12px) / 2.2);
    min-width: 0;
  }

  .tools-toggle {
    align-self: stretch;
    justify-content: center;
    height: 36px;
    font-size: 12px;
  }

  .panel {
    padding: 14px;
  }

  .panel-row {
    flex-wrap: wrap;
  }

  .field {
    flex: 1 1 100%;
  }

  .primary-btn {
    flex: 1 1 100%;
  }

  .bg-value {
    width: 46px;
  }

  .bg-actions {
    flex-wrap: wrap;
  }

  .bg-actions .ghost-btn {
    flex: 1 1 auto;
    justify-content: center;
  }
}
</style>
