<script setup>
// 全局提示：读取播放内核 state.toast
import Icon from './Icon.vue'
import { state } from '../composables/usePlayer'

const ICONS = { success: 'heart-fill', error: 'close', info: 'sparkle' }
</script>

<template>
  <transition name="toast">
    <div v-if="state.toast.visible" class="toast" :class="`toast--${state.toast.type}`">
      <Icon :name="ICONS[state.toast.type] || 'sparkle'" :size="15" />
      <span>{{ state.toast.message }}</span>
    </div>
  </transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 62vw;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 13px;
  color: #fff;
  background: rgba(24, 24, 42, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
}

.toast--success {
  border-color: rgba(53, 214, 200, 0.5);
  color: #b6f5ee;
}

.toast--error {
  border-color: rgba(255, 107, 129, 0.5);
  color: #ffc6cf;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
</style>
