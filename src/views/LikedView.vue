<script setup>
// 我的收藏：本地持久化的歌曲列表，支持一键播放与二次确认清空
import { ref, computed } from 'vue'
import SongList from '../components/SongList.vue'
import Icon from '../components/Icon.vue'
import { usePlayer } from '../composables/usePlayer'
import { useLiked } from '../composables/useLiked'

const player = usePlayer()
const { likedSongs, count } = useLiked()

const confirming = ref(false)
let confirmTimer = null

const songs = computed(() => likedSongs.value)

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

function onClearClick() {
  if (!confirming.value) {
    confirming.value = true
    player.showToast('再次点击「确认清空」将移除全部收藏', 'info')
    clearTimeout(confirmTimer)
    confirmTimer = setTimeout(() => {
      confirming.value = false
    }, 4000)
    return
  }
  clearTimeout(confirmTimer)
  confirming.value = false
  const n = songs.value.length
  songs.value.slice().forEach((s) => player.toggleLike(s))
  player.showToast(`已清空 ${n} 首收藏`, 'success')
}
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="page-title">我的收藏</h1>
        <p class="page-sub">共 {{ count }} 首，数据保存在本机浏览器中</p>
      </div>
      <div class="head-actions">
        <button class="primary-btn" :disabled="!songs.length" @click="playAll">
          <Icon name="play-all" :size="16" />
          播放全部
        </button>
        <button
          class="ghost-btn"
          :class="{ 'ghost-btn--danger': confirming }"
          :disabled="!songs.length"
          @click="onClearClick"
        >
          <Icon name="trash" :size="14" />
          {{ confirming ? '确认清空' : '清空收藏' }}
        </button>
      </div>
    </header>

    <section class="list-wrap">
      <SongList
        :songs="songs"
        empty-text="还没有收藏歌曲，在列表里点一下爱心即可收藏"
        empty-icon="heart"
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
  gap: 18px;
  max-width: 1180px;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
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

.head-actions {
  display: flex;
  gap: 9px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 20px;
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
  opacity: 0.45;
  cursor: default;
  box-shadow: none;
}

.ghost-btn--danger {
  color: #ffc6cf !important;
  border-color: rgba(255, 107, 129, 0.5) !important;
  background: rgba(255, 107, 129, 0.14) !important;
}

.ghost-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.list-wrap {
  padding: 6px 4px 10px;
}

/* ===== 移动端（≤768px）：标题与操作按钮纵向堆叠，按钮等宽 ===== */
@media (max-width: 768px) {
  .page {
    gap: 14px;
  }

  .page-head {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .page-title {
    font-size: 19px;
  }

  .page-sub {
    margin-top: 4px;
    font-size: 12px;
  }

  .head-actions {
    gap: 8px;
  }

  .primary-btn,
  .ghost-btn {
    flex: 1 1 0;
    justify-content: center;
    height: 36px;
    padding: 0 12px;
    font-size: 12.5px;
  }

  .list-wrap {
    padding: 4px 0 8px;
  }
}
</style>
