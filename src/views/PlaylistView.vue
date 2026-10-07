<script setup>
// 歌单详情：头部信息 + 歌曲列表 + 全部播放
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import SongList from '../components/SongList.vue'
import Icon from '../components/Icon.vue'
import { getPlaylist } from '../api'
import { usePlayer } from '../composables/usePlayer'
import { formatCount } from '../utils/format'

const route = useRoute()
const player = usePlayer()

const playlist = ref(null)
const loading = ref(true)
const error = ref('')

const songs = computed(() => (playlist.value && playlist.value.songs) || [])
const headerCover = computed(() => (playlist.value && playlist.value.cover) || '')

async function load(id) {
  if (!id) return
  loading.value = true
  error.value = ''
  playlist.value = null
  try {
    const data = await getPlaylist(id)
    playlist.value = data
    // 从首页「播放」按钮进入时自动开播
    if (route.query.autoplay === '1' && data.songs && data.songs.length) {
      player.playQueue(data.songs, 0)
    }
  } catch (e) {
    error.value = e.message || '歌单加载失败'
  } finally {
    loading.value = false
  }
}

function playAll() {
  if (!songs.value.length) return
  player.playQueue(songs.value, 0)
}

function playAt(index) {
  player.playQueue(songs.value, index)
}

function addAt(index) {
  player.addToQueue(songs.value[index])
}

watch(
  () => route.params.id,
  (id) => load(id),
  { immediate: true }
)
</script>

<template>
  <div class="page">
    <div v-if="error" class="alert">
      <Icon name="close" :size="16" />
      <span>{{ error }}</span>
      <button class="ghost-btn" @click="load(route.params.id)">重试</button>
    </div>

    <section v-if="playlist" class="detail-head">
      <div class="head-cover">
        <img v-if="headerCover" :src="headerCover" :alt="playlist.name" />
        <span v-else class="head-cover-ph">♪</span>
      </div>
      <div class="head-info">
        <span class="head-tag">歌单</span>
        <h1 class="head-name">{{ playlist.name }}</h1>
        <p v-if="playlist.description" class="head-desc">{{ playlist.description }}</p>
        <div class="head-meta">
          <span>{{ songs.length }} 首</span>
          <span v-if="playlist.playCount">播放量 {{ formatCount(playlist.playCount) }}</span>
        </div>
        <div class="head-actions">
          <button class="primary-btn" :disabled="!songs.length" @click="playAll">
            <Icon name="play-all" :size="16" />
            播放全部
          </button>
        </div>
      </div>
    </section>

    <section v-else-if="loading" class="detail-head detail-head--skeleton">
      <div class="skeleton skeleton-cover" />
      <div class="skeleton-lines">
        <div class="skeleton skeleton-title" />
        <div class="skeleton skeleton-sub" />
        <div class="skeleton skeleton-sub skeleton-sub--short" />
      </div>
    </section>

    <section class="list-wrap">
      <SongList
        :songs="songs"
        :loading="loading"
        empty-text="这个歌单还没有可播放的歌曲"
        @play="playAt"
        @add="addAt"
      />
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1180px;
}

.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-radius: 12px;
  font-size: 12.5px;
  color: #ffc6cf;
  background: rgba(255, 107, 129, 0.12);
  border: 1px solid rgba(255, 107, 129, 0.32);
}

.alert span {
  flex: 1;
}

.detail-head {
  display: flex;
  gap: 22px;
  padding: 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.head-cover {
  width: 150px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(124, 108, 240, 0.35), rgba(90, 167, 255, 0.2));
  color: rgba(255, 255, 255, 0.4);
  font-size: 30px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.head-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.head-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.head-tag {
  align-self: flex-start;
  font-size: 10.5px;
  padding: 2px 9px;
  border-radius: 999px;
  color: #b9b0ff;
  background: rgba(124, 108, 240, 0.18);
  border: 1px solid rgba(124, 108, 240, 0.35);
}

.head-name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.head-desc {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.head-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.42);
}

.head-actions {
  margin-top: 6px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 22px;
  border: none;
  border-radius: 999px;
  font-size: 13px;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  box-shadow: 0 8px 22px rgba(124, 108, 240, 0.35);
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.list-wrap {
  padding: 6px 4px 10px;
}

.skeleton {
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.05));
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-cover {
  width: 150px;
  height: 150px;
  flex-shrink: 0;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.skeleton-title {
  height: 22px;
  max-width: 320px;
}

.skeleton-sub {
  height: 12px;
  max-width: 420px;
}

.skeleton-sub--short {
  max-width: 220px;
}

/* ===== 移动端（≤768px）：歌单头改为纵向排布 ===== */
@media (max-width: 768px) {
  .page {
    gap: 14px;
  }

  .alert {
    flex-wrap: wrap;
    gap: 8px;
    padding: 11px 13px;
  }

  .detail-head {
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    border-radius: 14px;
  }

  .head-cover {
    width: 96px;
    height: 96px;
    border-radius: 12px;
    font-size: 22px;
  }

  .head-info {
    gap: 6px;
  }

  .head-name {
    font-size: 18px;
  }

  .head-desc {
    font-size: 11.5px;
  }

  .head-meta {
    gap: 12px;
    font-size: 11.5px;
    flex-wrap: wrap;
  }

  .head-actions {
    margin-top: 4px;
  }

  .primary-btn {
    height: 36px;
    padding: 0 18px;
    font-size: 12.5px;
  }

  .list-wrap {
    padding: 4px 0 8px;
  }

  .skeleton-cover {
    width: 96px;
    height: 96px;
  }

  .skeleton-title {
    height: 18px;
  }
}
</style>
