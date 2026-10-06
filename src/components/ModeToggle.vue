<script setup>
// 播放模式切换：顺序 → 单曲 → 随机（循环）
import { computed } from 'vue'
import Icon from './Icon.vue'
import { usePlayer } from '../composables/usePlayer'

const player = usePlayer()
const { state } = player

const MAP = {
  order: { icon: 'repeat', label: '顺序播放' },
  single: { icon: 'repeat-one', label: '单曲循环' },
  random: { icon: 'shuffle', label: '随机播放' }
}

const current = computed(() => MAP[state.mode] || MAP.order)
</script>

<template>
  <button class="btn-icon mode-btn" :title="current.label" @click="player.toggleMode()">
    <Icon :name="current.icon" :size="17" />
  </button>
</template>

<style scoped>
.mode-btn {
  width: 30px;
  height: 30px;
  color: rgba(255, 255, 255, 0.62);
}

.mode-btn:hover {
  color: #35d6c8;
}
</style>
