<script setup>
/**
 * 底部常驻播放条（参考图重构版）
 * 左侧：皮肤按钮（始终位于最左）
 * 中部：歌曲信息（封面/歌名/歌手）与上一首/播放暂停/下一首同一水平行，进度条位于其下方
 * 右侧：音量 / SQ 音质 / 歌词 / 全屏（窄屏时倍速与模式收进次级区）
 * 说明：SQ 为播放偏好开关（本地持久化），全屏走浏览器全屏 API，均不改变后端接口
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
  player.showToast(hqOn.value ? '已开启 SQ 音质偏好' : '已关闭 SQ 音质偏好', 'info')
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
    <!-- 最左：皮肤按钮 -->
    <div class="pb-left">
      <button class="btn-icon" title="皮肤" @click="player.showToast('皮肤功能开发中', 'info')">
        <Icon name="palette" :size="18" />
      </button>
    </div>

    <!-- 中：歌曲信息（左） + 播放控制+进度条整体（右） -->
    <div class="pb-center">
      <!-- 歌曲信息：封面 + 歌名 + 歌手 + 壁纸 -->
      <div class="pb-info">
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

      <!-- 播放控制 + 进度条（整体模块） -->
      <div class="pb-controls-wrap">
        <!-- 上排：上一首 / 播放暂停 / 下一首 -->
        <div class="pb-controls">
          <button class="btn-icon" title="上一首" @click="player.prev()">
            <Icon name="prev" :size="18" />
          </button>
          <button
            class="pb-play-main"
            :class="{ 'pb-play-main--on': state.isPlaying }"
            :title="state.isPlaying ? '暂停' : '播放'"
            @click="player.togglePlay()"
          >
            <Icon :name="state.isPlaying ? 'pause' : 'play'" :size="19" />
          </button>
          <button class="btn-icon" title="下一首" @click="player.next()">
            <Icon name="next" :size="18" />
          </button>
        </div>

        <!-- 下排：进度条 -->
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
        class="pb-sq"
        :class="{ 'pb-sq--on': hqOn, 'pb-sq--off': !hqOn }"
        :title="hqOn ? 'SQ 音质已开启' : 'SQ 音质已关闭'"
        @click="toggleHq"
      >
        SQ
      </button>

      <button
        class="btn-icon pb-lyric"
        :class="{ 'pb-lyric--on': state.showLyrics }"
        title="歌词"
        @click="player.toggleLyrics()"
      >
        <Icon name="lyrics" :size="17" />
      </button>

      <button class="btn-icon pb-full" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
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

/* ===== 最左：皮肤按钮 ===== */
.pb-left {
  display: flex;
  align-items: center;
  justify-self: start;
  min-width: 0;
}

/* ===== 中间区域：歌曲信息（左） + 播放控制+进度条整体（右） ===== */
.pb-center {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-width: 0;
  flex: 1;
}

/* 歌曲信息：封面 + 歌名 + 歌手 + 壁纸 */
.pb-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  max-width: 160px;
  flex-shrink: 0;
}

/* 播放控制 + 进度条（整体模块） */
.pb-controls-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

/* 上排：上一首 / 播放暂停 / 下一首 */
.pb-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
}

/* 进度条 */
.pb-progress-wrap {
  width: 600px;
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

/* 播放/暂停按钮：圆形 + 浅蓝发光高亮（上一首 / 下一首中间） */
.pb-play-main {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: radial-gradient(circle at 32% 26%, #a8daff 0%, #55a2ff 58%, #3b82f6 100%);
  box-shadow: 0 0 0 5px rgba(96, 165, 250, 0.14), 0 6px 16px rgba(59, 130, 246, 0.5);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.pb-play-main:hover {
  transform: scale(1.06);
}

/* 播放中：浅蓝光晕更亮，形成醒目的圆形高亮 */
.pb-play-main--on {
  box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.22), 0 6px 22px rgba(59, 130, 246, 0.72);
}

.pb-divider {
  width: 1px;
  height: 22px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.1);
}

/* SQ 音质按钮（方形 + 橙色边框，橙底橙字 SQ） */
.pb-sq {
  min-width: 34px;
  height: 26px;
  padding: 0 7px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: 0.6px;
  color: #ff8c1a;
  background: rgba(255, 140, 26, 0.14);
  border: 1.5px solid #ff8c1a;
  cursor: pointer;
  transition: all 0.18s ease;
}

.pb-sq--on {
  color: #ffa64d;
  background: rgba(255, 140, 26, 0.2);
  box-shadow: 0 0 10px rgba(255, 140, 26, 0.28);
}

.pb-sq--off {
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.18);
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

/* 窄屏：压缩歌曲信息区宽度 */
@media (max-width: 1100px) {
  .pb-info {
    max-width: 170px;
    gap: 6px;
  }

  .pb-cover {
    width: 28px;
    height: 28px;
  }

  .pb-name {
    font-size: 11.5px;
  }

  .pb-artist {
    font-size: 10px;
  }
}

/* 更窄屏：隐藏壁纸按钮 */
@media (max-width: 900px) {
  .pb-wall {
    display: none;
  }
}

/* ===== 移动端（≤768px）：播放条改为两层紧凑结构 =====
   第 1 行：[封面 + 歌名/歌手]  [上一首/播放/下一首]  [歌词]  [全屏]
   第 2 行：进度条整行铺满
   音量 / SQ / 倍速 / 播放模式等次级控制在移动端隐藏（音量交由系统控制） */
@media (max-width: 768px) {
  .player-bar {
    height: auto;
    min-height: var(--playerbar-h);
    grid-template-columns: minmax(0, 1fr) auto auto auto;
    grid-template-areas:
      'info ctrls lyric full'
      'prog prog prog prog';
    align-items: center;
    column-gap: 4px;
    row-gap: 6px;
    padding: 8px 12px 10px;
  }

  /* 拆解中间与右侧容器，让子元素直接参与播放条网格排布 */
  .pb-left {
    display: none;
  }

  .pb-center,
  .pb-controls-wrap,
  .pb-right {
    display: contents;
  }

  .pb-info {
    grid-area: info;
    max-width: none;
    gap: 8px;
  }

  .pb-cover {
    width: 34px;
    height: 34px;
  }

  .pb-name {
    font-size: 12px;
  }

  .pb-artist {
    font-size: 10px;
  }

  .pb-controls {
    grid-area: ctrls;
    gap: 4px;
  }

  .pb-play-main {
    width: 36px;
    height: 36px;
    box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14), 0 4px 12px rgba(59, 130, 246, 0.5);
  }

  .pb-play-main--on {
    box-shadow: 0 0 0 5px rgba(96, 165, 250, 0.22), 0 4px 16px rgba(59, 130, 246, 0.72);
  }

  .pb-progress-wrap {
    grid-area: prog;
    width: 100%;
  }

  .pb-lyric {
    grid-area: lyric;
  }

  .pb-full {
    grid-area: full;
  }

  /* 次级控制在移动端隐藏 */
  .volume,
  .pb-sq,
  .pb-divider,
  .pb-extra {
    display: none;
  }
}

/* 小屏手机：进一步压缩字号与按钮尺寸 */
@media (max-width: 480px) {
  .player-bar {
    padding: 7px 10px 9px;
  }

  .pb-right .btn-icon,
  .pb-lyric,
  .pb-full {
    width: 28px;
    height: 28px;
  }

  .pb-info {
    gap: 7px;
  }

  .pb-cover {
    width: 32px;
    height: 32px;
  }
}
</style>
