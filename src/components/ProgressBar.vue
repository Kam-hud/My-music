<script setup>
// 进度条：点击 / 拖拽跳转，含已播放时长与总时长
import { computed } from 'vue'
import { formatTime } from '../utils/format'

const props = defineProps({
  current: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }
})

const emit = defineEmits(['seek'])

const max = computed(() => (props.duration > 0 ? props.duration : 0))
const percent = computed(() => {
  if (!max.value) return 0
  return Math.min(100, (props.current / max.value) * 100)
})

function onInput(e) {
  const value = Number(e.target.value)
  emit('seek', value)
}
</script>

<template>
  <div class="progress">
    <span class="progress-time tnum">{{ formatTime(current) }}</span>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${percent}%` }" />
      <input
        class="range-slider progress-input"
        type="range"
        min="0"
        :max="max || 1"
        step="0.1"
        :value="current"
        :disabled="!max"
        @input="onInput"
      />
    </div>
    <span class="progress-time tnum">{{ max ? formatTime(duration) : '--:--' }}</span>
  </div>
</template>

<style scoped>
.progress {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
}

.progress-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}

.progress-track {
  position: relative;
  flex: 1;
  height: 4px;
  display: flex;
  align-items: center;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #7c6cf0, #35d6c8);
  pointer-events: none;
}

.progress-input {
  position: absolute;
  left: 0;
  right: 0;
  background: transparent;
  z-index: 2;
}

.progress-input::-webkit-slider-thumb {
  opacity: 0;
  transition: opacity 0.18s ease;
}

.progress-track:hover .progress-input::-webkit-slider-thumb {
  opacity: 1;
}

.progress-input:disabled {
  cursor: default;
}
</style>
