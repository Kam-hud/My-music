<script setup>
// 搜索页：双音源切换（网易云 / QQ 音乐）+ 结果列表
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import SongList from '../components/SongList.vue'
import Icon from '../components/Icon.vue'
import { search } from '../api'
import { usePlayer } from '../composables/usePlayer'

const route = useRoute()
const router = useRouter()
const player = usePlayer()

const SOURCES = [
  { key: 'netease', label: '网易云音乐', tip: '曲库全，推荐首选' },
  { key: 'qq', label: 'QQ 音乐', tip: '独家版权，备选音源' }
]

const keyword = ref('')
const source = ref('netease')
const songs = ref([])
const loading = ref(false)
const error = ref('')
const searched = ref(false)

async function runSearch(kw, src) {
  const k = (kw || '').trim()
  keyword.value = k
  source.value = src || source.value
  if (!k) {
    songs.value = []
    searched.value = false
    return
  }
  loading.value = true
  error.value = ''
  searched.value = true
  try {
    const data = await search(k, source.value, 30)
    songs.value = (data && data.songs) || []
  } catch (e) {
    error.value = e.message || '搜索失败'
    songs.value = []
  } finally {
    loading.value = false
  }
}

function onSearch(kw) {
  router.replace({ path: '/search', query: kw ? { kw } : {} })
  runSearch(kw)
}

function switchSource(key) {
  if (source.value === key) return
  runSearch(keyword.value, key)
}

function playAt(index) {
  player.playQueue(songs.value, index)
}

function addAt(index) {
  player.addToQueue(songs.value[index])
}

watch(
  () => route.query.kw,
  (kw) => runSearch(kw || '', source.value),
  { immediate: true }
)
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title">搜索</h1>
      <p class="page-sub">一个关键词，两个音源一起找</p>
    </header>

    <div class="search-wrap">
      <SearchBar v-model="keyword" :loading="loading" autofocus @search="onSearch" />
    </div>

    <div class="source-tabs">
      <button
        v-for="s in SOURCES"
        :key="s.key"
        class="source-tab"
        :class="{ 'source-tab--active': source === s.key }"
        @click="switchSource(s.key)"
      >
        <span class="source-name">{{ s.label }}</span>
        <span class="source-tip">{{ s.tip }}</span>
      </button>
    </div>

    <div v-if="error" class="alert">
      <Icon name="close" :size="16" />
      <span>{{ error }}</span>
      <button class="ghost-btn" @click="runSearch(keyword, source)">重试</button>
    </div>

    <section class="result-wrap">
      <div v-if="searched && !loading && !error" class="result-count">
        找到 <strong>{{ songs.length }}</strong> 首与「{{ keyword }}」相关的歌曲
      </div>
      <SongList
        :songs="songs"
        :loading="loading"
        :empty-text="searched ? `没有找到「${keyword}」相关的歌曲，换个关键词或音源试试` : '输入关键词开始搜索'"
        empty-icon="search"
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
  gap: 16px;
  max-width: 1180px;
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

.search-wrap {
  max-width: 560px;
}

.source-tabs {
  display: flex;
  gap: 10px;
}

.source-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 10px 16px;
  border-radius: 12px;
  text-align: left;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.18s ease;
}

.source-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.source-tab--active {
  color: #fff;
  background: linear-gradient(135deg, rgba(124, 108, 240, 0.4), rgba(90, 167, 255, 0.22));
  border-color: rgba(124, 108, 240, 0.5);
}

.source-name {
  font-size: 13px;
  font-weight: 600;
}

.source-tip {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.4);
}

.source-tab--active .source-tip {
  color: rgba(255, 255, 255, 0.6);
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

.result-wrap {
  padding: 6px 4px 10px;
}

.result-count {
  padding: 0 14px 10px;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.45);
}

.result-count strong {
  color: #35d6c8;
}

/* ===== 移动端（≤768px）：搜索框与音源切换占满宽度 ===== */
@media (max-width: 768px) {
  .page {
    gap: 12px;
  }

  .page-title {
    font-size: 19px;
  }

  .page-sub {
    margin-top: 4px;
    font-size: 12px;
  }

  .search-wrap {
    max-width: none;
  }

  .source-tabs {
    gap: 8px;
  }

  .source-tab {
    flex: 1 1 0;
    min-width: 0;
    padding: 9px 12px;
    border-radius: 10px;
  }

  .source-name {
    font-size: 12.5px;
  }

  .source-tip {
    font-size: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .alert {
    flex-wrap: wrap;
    gap: 8px;
    padding: 11px 13px;
  }

  .result-wrap {
    padding: 4px 0 8px;
  }

  .result-count {
    padding: 0 8px 10px;
    font-size: 12px;
  }
}
</style>
