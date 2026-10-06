<script setup>
// 底部常驻播放条：歌曲信息 + 播放控制 + 进度 + 模式 / 倍速 / 音量 / 歌词
import { computed } from 'vue'
import Icon from './Icon.vue'
import ProgressBar from './ProgressBar.vue'
import VolumeControl from './VolumeControl.vue'
import ModeToggle from './ModeToggle.vue'
import { usePlayer } from '../composables/usePlayer'
import { setWallpaper } from '../composables/useBackground'

const player = usePlayer()
const { state } = player

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]

const song = computed(() => state.currentSong)
const coverText = computed(() => (song.value && song.value.name ? song.value.name.slice(0, 1) : '♪'))

function onSpeedChange(e) {
  player.setPlaybackRate(Number(e.target.value))
}

function useAsWallpaper() {
  if (!song.value || !song.value.cover) {
    player.showToast('当前歌曲没有可用封面', 'info')
    return
  }
  setWallpaper(song.value.cover)
  player.showToast('已把当前封面设为背景壁纸', 'success')
}
</script>

<template>
  <footer class="player-bar">
    <!-- 左：封面 + 歌曲信息 -->
    <div class="pb-left">
      <div class="pb-cover" :class="{ 'pb-cover--spin': state.isPlaying }">
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
        <Icon name="image" :size="16" />
      </button>
    </div>

    <!-- 中：控制 + 进度 -->
    <div class="pb-center">
      <div class="pb-controls">
        <button class="btn-icon" title="上一首" @click="player.prev()">
          <Icon name="prev" :size="18" />
        </button>
        <button class="pb-play" :title="state.isPlaying ? '暂停' : '播放'" @click="player.togglePlay()">
          <Icon :name="state.isPlaying ? 'pause' : 'play'" :size="18" />
        </button>
        <button class="btn-icon" title="下一首" @click="player.next()">
          <Icon name="next" :size="18" />
        </button>
      </div>
      <ProgressBar
        :current="state.currentTime"
        :duration="state.duration"
        @seek="(t) => player.seek(t)"
      />
    </div>

    <!-- 右：模式 / 倍速 / 音量 / 歌词 -->
    <div class="pb-right">
      <ModeToggle />

      <div class="pb-speed" title="播放倍速">
        <select :value="state.playbackRate" @change="onSpeedChange">
          <option v-for="s in SPEEDS" :key="s" :value="s">{{ s }}x</option>
        </select>
      </div>

      <VolumeControl />

      <button
        class="btn-icon"
        :class="{ 'pb-lyric--on': state.showLyrics }"
        title="歌词"
        @click="player.toggleLyrics()"
      >
        <Icon name="lyrics" :size="17" />
      </button>
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
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 18px;
  background: rgba(15, 15, 30, 0.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.09);
}

/* 左区 */
.pb-left {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 268px;
  flex-shrink: 0;
}

.pb-cover {
  position: relative;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  border: 2px solid rgba(255, 255, 255, 0.12);
}

.pb-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pb-cover--spin {
  animation: spin-slow 14s linear infinite;
}

.pb-cover-ph {
  font-size: 16px;
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
  font-size: 13px;
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
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pb-wall {
  width: 28px;
  height: 28px;
  opacity: 0.5;
}

.pb-wall:hover {
  opacity: 1;
}

/* 中区 */
.pb-center {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.pb-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.pb-controls .btn-icon {
  width: 30px;
  height: 30px;
}

.pb-play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  box-shadow: 0 6px 18px rgba(124, 108, 240, 0.4);
  cursor: pointer;
  transition: transform 0.18s ease;
}

.pb-play:hover {
  transform: scale(1.06);
}

/* 右区 */
.pb-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: 300px;
  flex-shrink: 0;
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

.pb-lyric--on {
  color: #35d6c8;
  background: rgba(53, 214, 200, 0.14);
}
</style>
