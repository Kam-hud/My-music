<script setup>
// 歌单卡片：封面 + 播放量 + 悬浮播放按钮
import Icon from './Icon.vue'
import { formatCount } from '../utils/format'

const props = defineProps({
  playlist: { type: Object, required: true }
})

const emit = defineEmits(['open', 'play'])
</script>

<template>
  <div class="song-card" @click="emit('open')">
    <div class="card-cover">
      <img v-if="playlist.cover" :src="playlist.cover" :alt="playlist.name" loading="lazy" />
      <span v-else class="card-cover-ph">♪</span>
      <div class="card-mask">
        <button class="card-play" title="播放" @click.stop="emit('play')">
          <Icon name="play" :size="18" />
        </button>
      </div>
      <span v-if="playlist.playCount" class="card-count">
        <Icon name="play" :size="10" />
        {{ formatCount(playlist.playCount) }}
      </span>
    </div>
    <div class="card-name" :title="playlist.name">{{ playlist.name }}</div>
    <div v-if="playlist.description" class="card-desc">{{ playlist.description }}</div>
  </div>
</template>

<style scoped>
.song-card {
  cursor: pointer;
}

.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(124, 108, 240, 0.32), rgba(90, 167, 255, 0.18));
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.song-card:hover .card-cover img {
  transform: scale(1.06);
}

.card-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 22, 0.42);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.song-card:hover .card-mask {
  opacity: 1;
}

.card-play {
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding-left: 3px;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  box-shadow: 0 8px 22px rgba(124, 108, 240, 0.5);
  cursor: pointer;
  transform: translateY(6px);
  transition: transform 0.25s ease;
}

.song-card:hover .card-play {
  transform: translateY(0);
}

.card-count {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
}

.card-name {
  margin-top: 10px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  margin-top: 4px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
