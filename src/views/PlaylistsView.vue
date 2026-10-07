<script setup>
// 歌单广场：展示全部推荐歌单
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SongCard from '../components/SongCard.vue'
import Icon from '../components/Icon.vue'
import { getToplist } from '../api'

const router = useRouter()
const playlists = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getToplist()
    playlists.value = (data && data.playlists) || []
  } catch (e) {
    error.value = e.message || '歌单加载失败'
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

onMounted(load)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="page-title">歌单广场</h1>
        <p class="page-sub">精选热门榜单，点击即可播放</p>
      </div>
      <button class="ghost-btn" @click="load">
        <Icon name="refresh" :size="14" />
        刷新
      </button>
    </header>

    <div v-if="error" class="alert">
      <Icon name="close" :size="16" />
      <span>{{ error }}</span>
      <button class="ghost-btn" @click="load">重试</button>
    </div>

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
      <p>暂无歌单数据</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1180px;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.page-sub {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.45);
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

/* ===== 移动端（≤768px）：卡片改为自适应小列宽，最多两列 ===== */
@media (max-width: 768px) {
  .page {
    gap: 14px;
  }

  .page-head {
    align-items: flex-start;
    gap: 10px;
  }

  .page-title {
    font-size: 19px;
  }

  .page-sub {
    margin-top: 4px;
    font-size: 12px;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .alert {
    flex-wrap: wrap;
    gap: 8px;
    padding: 11px 13px;
  }

  .empty {
    padding: 36px 0;
  }
}
</style>
