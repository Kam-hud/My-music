<script setup>
// 单曲行：双击 / 点击播放按钮播放，支持收藏与加入播放列表
import { computed } from 'vue'
import Icon from './Icon.vue'
import { formatTime } from '../utils/format'
import { useLiked } from '../composables/useLiked'

const props = defineProps({
  song: { type: Object, required: true },
  index: { type: Number, default: 0 },
  active: { type: Boolean, default: false },
  playing: { type: Boolean, default: false }
})

const emit = defineEmits(['play', 'add'])

const { isLiked, toggleLike } = useLiked()

const liked = computed(() => isLiked(props.song))
const sourceTag = computed(() => (props.song.source === 'qq' ? 'QQ' : '网易'))
</script>

<template>
  <div class="song-row" :class="{ 'song-row--active': active }" @dblclick="emit('play')">
    <div class="col-index">
      <span v-if="!active || !playing" class="index-num tnum">{{ String(index + 1).padStart(2, '0') }}</span>
      <span v-if="active && playing" class="playing-bars">
        <i /><i /><i />
      </span>
    </div>

    <div class="col-main">
      <div class="row-cover">
        <img v-if="song.cover" :src="song.cover" alt="cover" loading="lazy" />
        <span v-else class="row-cover-ph">♪</span>
      </div>
      <div class="row-text">
        <div class="row-name" :title="song.name">{{ song.name }}</div>
        <div class="row-artist" :title="song.artist">{{ song.artist }}</div>
      </div>
    </div>

    <div class="col-album" :title="song.album">{{ song.album || '—' }}</div>

    <div class="col-source">
      <span class="tag-source">{{ sourceTag }}</span>
    </div>

    <div class="col-time tnum">{{ song.duration ? formatTime(song.duration) : '--:--' }}</div>

    <div class="col-actions">
      <button
        class="btn-icon row-btn"
        :class="{ 'row-btn--liked': liked }"
        :title="liked ? '取消收藏' : '收藏'"
        @click.stop="toggleLike(song)"
      >
        <Icon :name="liked ? 'heart-fill' : 'heart'" :size="16" />
      </button>
      <button class="btn-icon row-btn" title="加入播放列表" @click.stop="emit('add')">
        <Icon name="plus" :size="16" />
      </button>
      <button class="btn-icon row-btn row-play" title="播放" @click.stop="emit('play')">
        <Icon name="play" :size="15" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.song-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 2.4fr) minmax(0, 1.4fr) 66px 62px 108px;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: default;
  transition: background 0.16s ease;
}

.song-row:hover {
  background: rgba(255, 255, 255, 0.055);
}

.song-row--active {
  background: rgba(124, 108, 240, 0.16);
}

.song-row--active .row-name {
  color: #35d6c8;
}

.col-index {
  display: flex;
  align-items: center;
  justify-content: center;
}

.index-num {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.32);
}

.playing-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 13px;
}

.playing-bars i {
  width: 2.5px;
  border-radius: 2px;
  background: #35d6c8;
  animation: bar-bounce 0.9s ease-in-out infinite;
}

.playing-bars i:nth-child(1) {
  height: 60%;
  animation-delay: 0ms;
}

.playing-bars i:nth-child(2) {
  height: 100%;
  animation-delay: 140ms;
}

.playing-bars i:nth-child(3) {
  height: 45%;
  animation-delay: 280ms;
}

.col-main {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.row-cover {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.35);
}

.row-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-text {
  min-width: 0;
}

.row-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-artist {
  margin-top: 2px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.42);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-album {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.42);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-source {
  display: flex;
}

.tag-source {
  font-size: 10.5px;
  padding: 2px 7px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.col-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  text-align: right;
}

.col-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.row-btn {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.45);
}

.row-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.row-btn--liked {
  color: #ff6b81;
}

.row-play {
  color: rgba(255, 255, 255, 0.8);
}

@keyframes bar-bounce {
  0%,
  100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}
</style>
