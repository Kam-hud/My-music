<script setup>
// 歌词浮层：随播放进度高亮并自动滚动到当前行
import { ref, watch, nextTick, computed } from 'vue'
import Icon from './Icon.vue'
import { usePlayer } from '../composables/usePlayer'
import { useLyrics } from '../composables/useLyrics'

const player = usePlayer()
const { state } = player
const { lines, currentIndex, empty } = useLyrics()

const listRef = ref(null)

const songTitle = computed(() => (state.currentSong ? state.currentSong.name : '暂无播放'))
const artist = computed(() => (state.currentSong ? state.currentSong.artist : ''))

// 当前行变化时，把该行滚动到可视区中间
watch(currentIndex, async (idx) => {
  if (idx < 0) return
  await nextTick()
  const container = listRef.value
  if (!container) return
  const el = container.querySelector(`[data-line="${idx}"]`)
  if (!el) return
  const top = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2
  container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
})

function jumpTo(time) {
  player.seek(time)
}
</script>

<template>
  <transition name="lyric">
    <div v-if="state.showLyrics" class="lyric-mask" @click.self="player.toggleLyrics()">
      <div class="lyric-panel">
        <header class="lyric-head">
          <div>
            <div class="lyric-title">{{ songTitle }}</div>
            <div class="lyric-artist">{{ artist }}</div>
          </div>
          <button class="btn-icon" title="关闭歌词" @click="player.toggleLyrics()">
            <Icon name="close" :size="18" />
          </button>
        </header>

        <div v-if="empty" class="lyric-empty">
          <Icon name="lyrics" :size="26" />
          <p>暂无歌词</p>
        </div>

        <div v-else ref="listRef" class="lyric-body">
          <p
            v-for="(line, idx) in lines"
            :key="`${idx}-${line.time}`"
            :data-line="idx"
            class="lyric-line"
            :class="{ 'lyric-line--active': idx === currentIndex, 'lyric-line--near': Math.abs(idx - currentIndex) === 1 }"
            @click="jumpTo(line.time)"
          >
            {{ line.text || '♪' }}
            <span v-if="line.translation" class="lyric-trans">{{ line.translation }}</span>
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.lyric-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(6, 6, 16, 0.62);
  backdrop-filter: blur(10px);
}

.lyric-panel {
  width: min(620px, 100%);
  height: min(72vh, 620px);
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  background: rgba(18, 18, 34, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.lyric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.lyric-title {
  font-size: 15px;
  font-weight: 600;
}

.lyric-artist {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.lyric-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 13px;
}

.lyric-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 26px 45%;
  scroll-behavior: smooth;
}

.lyric-line {
  margin: 0;
  padding: 9px 0;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.42);
  text-align: center;
  cursor: pointer;
  transition: color 0.25s ease, transform 0.25s ease;
}

.lyric-line:hover {
  color: rgba(255, 255, 255, 0.75);
}

.lyric-line--near {
  color: rgba(255, 255, 255, 0.62);
}

.lyric-line--active {
  color: #35d6c8;
  font-size: 18px;
  font-weight: 600;
  transform: scale(1.02);
}

.lyric-trans {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
}

.lyric-line--active .lyric-trans {
  color: rgba(53, 214, 200, 0.8);
}

.lyric-enter-active,
.lyric-leave-active {
  transition: opacity 0.25s ease;
}

.lyric-enter-from,
.lyric-leave-to {
  opacity: 0;
}
</style>
