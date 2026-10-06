<script setup>
// 首页：搜索入口 + 打开歌单 + 推荐歌单 + 背景特效设置
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import SongCard from '../components/SongCard.vue'
import Icon from '../components/Icon.vue'
import { getToplist } from '../api'
import { usePlayer } from '../composables/usePlayer'
import { bgState, setBlur, toggleParticles, resetBackground, downloadWallpaper } from '../composables/useBackground'
import { extractPlaylistId } from '../utils/format'

const router = useRouter()
const player = usePlayer()

const keyword = ref('')
const playlistInput = ref('')
const playlists = ref([])
const loading = ref(true)
const error = ref('')
const downloading = ref(false)

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

function doSearch(kw) {
  const k = (kw || '').trim()
  if (!k) {
    router.push('/search')
    return
  }
  router.push({ path: '/search', query: { kw: k } })
}

function openPlaylist(id) {
  router.push(`/playlist/${id}`)
}

function playPlaylist(id) {
  router.push({ path: `/playlist/${id}`, query: { autoplay: '1' } })
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
    player.showToast('请先点播放条右侧的图片按钮，用当前封面作为壁纸', 'info')
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
    <!-- 顶部：标题 + 搜索 -->
    <section class="hero">
      <div class="hero-text">
        <h1 class="hero-title">发现你的<span class="accent">声音</span></h1>
        <p class="hero-sub">网易云 / QQ 双音源聚合搜索，即点即听</p>
      </div>
      <div class="hero-search">
        <SearchBar v-model="keyword" placeholder="搜索歌曲、歌手、专辑" @search="doSearch" />
      </div>
      <div class="hero-vinyl">
        <div class="vinyl-disc"><span class="vinyl-hole" /></div>
      </div>
    </section>

    <!-- 服务未连接提示 -->
    <div v-if="error" class="alert">
      <Icon name="close" :size="16" />
      <div class="alert-body">
        <strong>{{ error }}</strong>
        <span>请确认已启动代理服务：在项目根目录执行 npm run server</span>
      </div>
      <button class="thumb-btn" @click="loadToplist">重试</button>
    </div>

    <!-- 工具行：打开歌单 + 背景设置 -->
    <section class="tool-grid">
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
        <p class="panel-tip">壁纸来源：播放条左侧「图片」按钮，一键把当前封面设为背景</p>
      </div>
    </section>

    <!-- 推荐歌单 -->
    <section class="section">
      <header class="section-head">
        <h2 class="section-title">推荐歌单</h2>
        <button class="ghost-btn" @click="loadToplist">
          <Icon name="refresh" :size="14" />
          刷新
        </button>
      </header>

      <div v-if="loading" class="grid">
        <div v-for="n in 8" :key="`sk-${n}`" class="card-skeleton">
          <div class="skeleton skeleton-cover" />
          <div class="skeleton skeleton-name" />
        </div>
      </div>

      <div v-else-if="playlists.length" class="grid">
        <SongCard
          v-for="pl in playlists"
          :key="pl.id"
          :playlist="pl"
          @open="openPlaylist(pl.id)"
          @play="playPlaylist(pl.id)"
        />
      </div>

      <div v-else class="empty">
        <Icon name="list" :size="28" />
        <p>暂无推荐歌单，点击刷新重试</p>
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

/* Hero */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 24px 26px;
  border-radius: 20px;
  background: linear-gradient(120deg, rgba(124, 108, 240, 0.28), rgba(90, 167, 255, 0.12));
  border: 1px solid rgba(255, 255, 255, 0.09);
  overflow: hidden;
}

.hero-text {
  flex: 1;
  min-width: 0;
}

.hero-title {
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

.hero-sub {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.55);
}

.hero-search {
  width: 330px;
  flex-shrink: 0;
}

.hero-vinyl {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-radial-gradient(circle, #1c1c30 0 4px, #26264099 4px 6px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  animation: spin-slow 16s linear infinite;
}

.vinyl-hole {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
}

/* 提示条 */
.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-radius: 12px;
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

/* 工具面板 */
.tool-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}

.panel {
  padding: 16px 18px;
  border-radius: 16px;
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

/* 区块 */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 18px;
}

.card-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton {
  border-radius: 14px;
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
</style>
