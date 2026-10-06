<script setup>
// 应用外壳：左侧导航 + 中间路由内容 + 底部常驻播放条
import Sidebar from './Sidebar.vue'
import PlayerBar from './PlayerBar.vue'
</script>

<template>
  <div class="shell">
    <Sidebar />
    <main class="content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <PlayerBar />
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  height: 100vh;
  padding-bottom: var(--playerbar-h);
}

.content {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 26px 30px 34px;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
