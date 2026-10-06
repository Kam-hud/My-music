<script setup>
// 应用根组件：背景层（最底） → 外壳 → 歌词浮层 → 全局 toast
import BackgroundLayer from './components/BackgroundLayer.vue'
import AppShell from './components/AppShell.vue'
import LyricsPanel from './components/LyricsPanel.vue'
import ToastHost from './components/ToastHost.vue'
</script>

<template>
  <div class="app-root">
    <BackgroundLayer />
    <AppShell />
    <LyricsPanel />
    <ToastHost />
  </div>
</template>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}
</style>
