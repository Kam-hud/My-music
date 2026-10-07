<script setup>
// 歌曲列表容器：表头 + 空状态 + 加载骨架
import Icon from './Icon.vue'
import SongRow from './SongRow.vue'
import { usePlayer } from '../composables/usePlayer'

const props = defineProps({
  songs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: '暂无歌曲' },
  showHeader: { type: Boolean, default: true },
  showAlbum: { type: Boolean, default: true },
  emptyIcon: { type: String, default: 'music' }
})

const emit = defineEmits(['play', 'add'])

const player = usePlayer()

function isActive(song) {
  const cur = player.state.currentSong
  return !!cur && cur.id === song.id && cur.source === song.source
}
</script>

<template>
  <div class="song-list">
    <div v-if="showHeader && songs.length" class="list-head" :class="{ 'list-head--noalbum': !showAlbum }">
      <div class="head-index">#</div>
      <div class="head-main">标题</div>
      <div v-if="showAlbum" class="head-album">专辑</div>
      <div class="head-source">音源</div>
      <div class="head-time">时长</div>
      <div class="head-actions">操作</div>
    </div>

    <template v-if="loading">
      <div v-for="n in 6" :key="`sk-${n}`" class="skeleton-row">
        <div class="skeleton skeleton-cover" />
        <div class="skeleton skeleton-line" />
      </div>
    </template>

    <template v-else-if="songs.length">
      <SongRow
        v-for="(song, idx) in songs"
        :key="`${song.source}-${song.id}-${idx}`"
        :song="song"
        :index="idx"
        :active="isActive(song)"
        :playing="player.state.isPlaying"
        @play="emit('play', idx)"
        @add="emit('add', idx)"
      />
    </template>

    <div v-else class="empty">
      <Icon :name="emptyIcon" :size="28" />
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>

<style scoped>
.song-list {
  display: flex;
  flex-direction: column;
}

.list-head {
  display: grid;
  grid-template-columns: 42px minmax(0, 2.4fr) minmax(0, 1.4fr) 66px 62px 108px;
  gap: 10px;
  padding: 6px 14px 10px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.35);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin-bottom: 6px;
}

.head-index {
  text-align: center;
}

.head-time,
.head-actions {
  text-align: right;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 56px 0;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}

.skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-cover {
  width: 38px;
  height: 38px;
}

.skeleton-line {
  flex: 1;
  height: 12px;
  max-width: 300px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ===== 移动端（≤768px）：表头列与 SongRow 移动端布局保持一致 ===== */
@media (max-width: 768px) {
  .list-head {
    grid-template-columns: 26px minmax(0, 1fr) 42px 92px;
    gap: 8px;
    padding: 6px 8px 8px;
  }

  .head-album,
  .head-source {
    display: none;
  }

  .empty {
    padding: 40px 0;
  }

  .skeleton-row {
    gap: 10px;
    padding: 10px 8px;
  }

  .skeleton-cover {
    width: 34px;
    height: 34px;
  }
}

@media (max-width: 480px) {
  .list-head {
    grid-template-columns: 22px minmax(0, 1fr) 38px 88px;
    gap: 6px;
    padding: 6px 6px 8px;
  }
}
</style>
