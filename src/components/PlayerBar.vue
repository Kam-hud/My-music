<script setup>
/**
 * 底部常驻播放条（重构版）
 * 左侧：圆形播放/暂停键 + 歌曲信息（封面/歌名/歌手）+ 进度条
 * 右侧：上一首 / 下一首 / 音量 / 歌词 / HQ 音质 / 全屏（窄屏时倍速与模式收进次级区）
 * 说明：HQ 为播放偏好开关（本地持久化），全屏走浏览器全屏 API，均不改变后端接口
 */
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'
import ProgressBar from './ProgressBar.vue'
import VolumeControl from './VolumeControl.vue'
import ModeToggle from './ModeToggle.vue'
import { usePlayer } from '../composables/usePlayer'
import { setWallpaper } from '../composables/useBackground'

const player = usePlayer()
const { state } = player

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]
const HQ_KEY = 'my-music:hq'

const song = computed(() => state.currentSong)
const coverText = computed(() => (song.value && song.value.name ? song.value.name.slice(0, 1) : '♪'))

// HQ 音质偏好（本地持久化）
const hqOn = ref(true)
// 全屏状态（跟随浏览器全屏事件同步）
const isFullscreen = ref(false)

function onSpeedChange(e) {
  player.setPlaybackRate(Number(e.target.value))
}

function toggleHq() {
  hqOn.value = !hqOn.value
  try {
    localStorage.setItem(HQ_KEY, hqOn.value ? '1' : '0')
  } catch (e) {
    /* 隐私模式下写入失败可忽略 */
  }
  player.showToast(hqOn.value ? '已开启 HQ 音质偏好' : '已关闭 HQ 音质偏好', 'info')
}

function syncFullscreen() {
  isFullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement)
}

function toggleFullscreen() {
  const el = document.documentElement
  if (isFullscreen.value) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen
    if (exit) exit.call(document)
    return
  }
  const req = el.requestFullscreen || el.webkitRequestFullscreen
  if (!req) {
    player.showToast('当前环境不支持全屏', 'info')
    return
  }
  const ret = req.call(el)
  if (ret && typeof ret.catch === 'function') {
    ret.catch(() => player.showToast('全屏切换被浏览器拒绝', 'info'))
  }
}

function useAsWallpaper() {
  if (!song.value || !song.value.cover) {
    player.showToast('当前歌曲没有可用封面', 'info')
    return
  }
  setWallpaper(song.value.cover)
  player.showToast('已把当前封面设为背景壁纸', 'success')
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(HQ_KEY)
    hqOn.value = raw === null ? true : raw === '1'
  } catch (e) {
    /* 忽略读取失败 */
  }
  document.addEventListener('fullscreenchange', syncFullscreen)
  document.addEventListener('webkitfullscreenchange', syncFullscreen)
  syncFullscreen()
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
  document.removeEventListener('webkitfullscreenchange', syncFullscreen)
})
</script>

<template>
  <footer class="player-bar">
    <!-- 左：皮肤按钮 -->
    <div class="pb-left">
      <button class="btn-icon" title="皮肤" @click="player.showToast('皮肤功能开发中', 'info')">
        <Icon name="palette" :size="18" />
      </button>
    </div>

    <!-- 居中：上排播放控制，下排歌曲信息（左）+ 进度条（右） -->
    <div class="pb-center">
      <!-- 上部：上一首 / 暂停 / 下一首 -->
      <div class="pb-controls">
        <button class="btn-icon" title="上一首" @click="player.prev()">
          <Icon name="prev" :size="18" />
        </button>
        <button
          class="pb-play-right"
          :class="{ 'pb-play-right--on': state.isPlaying }"
          :title="state.isPlaying ? '暂停' : '播放'"
          @click="player.togglePlay()"
        >
          <Icon :name="state.isPlaying ? 'pause' : 'play'" :size="18" />
        </button>
        <button class="btn-icon" title="下一首" @click="player.next()">
          <Icon name="next" :size="18" />
        </button>
      </div>

      <!-- 下部：歌曲信息（左） + 进度条（右），同一行横向排列 -->
      <div class="pb-main">
        <!-- 左：封面小图 + 歌名 + 歌手 + 壁纸 -->
        <div class="pb-info">
          <div class="pb-line">
            <div class="pb-cover">
              <img v-if="song && song.cover" :src="song.cover" alt="cover" />
              <span v-else class="pb-cover-ph">{{ coverText }}</span>
            </div>
            <div class="pb-meta">
              <div class="pb-name" :title="song ? song.name : ''">
                <span v-if="state.loading" class="pb-dot" />
                {{ song ? song.name : '未在播放' }}
              </div>
              <div class="pb-artist">{{ song ? song.artist : '选一首歌开始聆听' }}</div>
            </div>
            <button v-if="song" class="btn-icon pb-wall" title="用当前封面作为背景壁纸" @click="useAsWallpaper">
              <Icon name="image" :size="15" />
            </button>
          </div>
        </div>

        <!-- 右：进度条 -->
        <div class="pb-progress-wrap">
          <ProgressBar
            :current="state.currentTime"
            :duration="state.duration"
            @seek="(t) => player.seek(t)"
          />
        </div>
      </div>
    </div>

    <!-- 右：音量 / 歌词 / HQ / 全屏 / 次级控制 -->
    <div class="pb-right">
      <VolumeControl />

      <button
        class="btn-icon"
        :class="{ 'pb-lyric--on': state.showLyrics }"
        title="歌词"
        @click="player.toggleLyrics()"
      >
        <Icon name="lyrics" :size="17" />
      </button>

      <button class="pb-hq" :class="{ 'pb-hq--on': hqOn }" :title="hqOn ? 'HQ 音质已开启' : 'HQ 音质已关闭'" @click="toggleHq">
        HQ
      </button>

      <button class="btn-icon" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
        <Icon :name="isFullscreen ? 'shrink' : 'expand'" :size="17" />
      </button>

      <span class="pb-divider" />

      <!-- 次级控制：倍速与播放模式（窄屏自动隐藏） -->
      <div class="pb-extra">
        <div class="pb-speed" title="播放倍速">
          <select :value="state.playbackRate" @change="onSpeedChange">
            <option v-for="s in SPEEDS" :key="s" :value="s">{{ s }}x</option>
          </select>
        </div>
        <ModeToggle />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.player-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--playerbar-h);
  z-index: 40;
  /* 三列网格：左右等宽 1fr，中间 auto → 居中区域永远处于播放条正中 */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  background: rgba(13, 9, 26, 0.93);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* ===== 左区：皮肤按钮 ===== */
.pb-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  justify-self: start;
  min-width: 0;
}

/* ===== 居中区域（网格中列，天然居中） ===== */
.pb-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 0;
}

/* 上部：上一首 / 暂停 / 下一首 */
.pb-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 下部：歌曲信息 + 进度条 同一行（信息在左、进度条在右） */
.pb-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-width: 0;
}

/* 左：封面 + 歌名 + 歌手 + 壁纸 */
.pb-info {
  width: 190px;
  flex-shrink: 0;
}

/* 右：进度条 */
.pb-progress-wrap {
  width: 360px;
  flex-shrink: 0;
  max-width: 100%;
}

.pb-line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.pb-cover {
  position: relative;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.pb-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pb-cover-ph {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.pb-meta {
  min-width: 0;
  flex: 1;
}

.pb-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pb-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #35d6c8;
  animation: pulse-soft 1.2s ease-in-out infinite;
}

.pb-artist {
  margin-top: 2px;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pb-wall {
  width: 26px;
  height: 26px;
  opacity: 0.5;
  flex-shrink: 0;
}

.pb-wall:hover {
  opacity: 1;
}

/* ===== 右区 ===== */
.pb-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  gap: 6px;
  min-width: 0;
}

.pb-right .btn-icon {
  width: 32px;
  height: 32px;
}

/* 暂停按钮（上一首 / 下一首中间） */
.pb-play-right {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  box-shadow: 0 4px 12px rgba(124, 108, 240, 0.38);
  cursor: pointer;
  transition: transform 0.18s ease;
}

.pb-play-right:hover {
  transform: scale(1.06);
}

.pb-play-right--on {
  box-shadow: 0 4px 18px rgba(124, 108, 240, 0.55);
}

.pb-divider {
  width: 1px;
  height: 22px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.1);
}

/* HQ 音质开关 */
.pb-hq {
  min-width: 38px;
  height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.18s ease;
}

.pb-hq--on {
  color: #0f0b1e;
  background: linear-gradient(135deg, #ffd166, #ffb347);
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(255, 209, 102, 0.3);
}

.pb-lyric--on {
  color: #35d6c8;
  background: rgba(53, 214, 200, 0.14);
}

/* 次级控制区 */
.pb-extra {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pb-speed select {
  appearance: none;
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
}

.pb-speed select option {
  background: #1b1b30;
  color: #fff;
}

@media (max-width: 1320px) {
  .pb-extra {
    display: none;
  }
}

/* 窄屏：压缩歌曲信息与进度条宽度，保证居中区不被挤压 */
@media (max-width: 1100px) {
  .pb-info {
    width: 140px;
  }

  .pb-progress-wrap {
    width: 240px;
  }
}
</style>
