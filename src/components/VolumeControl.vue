<script setup>
// 音量控制：滑块 + 静音切换（记住静音前音量）
import { ref } from 'vue'
import Icon from './Icon.vue'
import { usePlayer } from '../composables/usePlayer'

const player = usePlayer()
const { state } = player
const lastVolume = ref(state.volume > 0 ? state.volume : 0.8)

function onInput(e) {
  player.setVolume(Number(e.target.value))
  if (Number(e.target.value) > 0) lastVolume.value = Number(e.target.value)
}

function toggleMute() {
  if (state.volume > 0) {
    lastVolume.value = state.volume
    player.setVolume(0)
  } else {
    player.setVolume(lastVolume.value || 0.8)
  }
}
</script>

<template>
  <div class="volume">
    <button class="btn-icon volume-btn" :title="state.volume > 0 ? '静音' : '恢复音量'" @click="toggleMute">
      <Icon :name="state.volume > 0 ? 'volume' : 'volume-mute'" :size="17" />
    </button>
    <input
      class="range-slider volume-input"
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="state.volume"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.volume {
  display: flex;
  align-items: center;
  gap: 7px;
}

.volume-btn {
  width: 30px;
  height: 30px;
}

.volume-input {
  width: 78px;
}
</style>
