<script setup>
// 应用外壳：左侧个人主页式导航 + 中间路由内容 + 底部常驻播放条
// 重构点：左栏为约 20% 宽的功能导航区（--sidebar-w=240px），中区为内容展示区，底色统一走 #0F0B1E token
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
  background: transparent;
}

/* 中区：内容展示区，占剩余约 80% 宽度，独立滚动 */
.content {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 26px 32px 36px;
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
