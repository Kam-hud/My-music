<script setup>
// 左侧导航：首页 / 歌单 / 搜索 / 收藏
import Icon from './Icon.vue'

const navItems = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/playlists', label: '歌单', icon: 'list' },
  { to: '/search', label: '搜索', icon: 'search' },
  { to: '/liked', label: '收藏', icon: 'heart' }
]
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-logo">
        <Icon name="music" :size="18" />
      </div>
      <div class="brand-text">
        <div class="brand-name">My Music</div>
        <div class="brand-sub">在线音乐播放器</div>
      </div>
    </div>

    <nav class="nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'nav-item--active': $route.path === item.to }"
      >
        <Icon :name="item.icon" :size="17" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="tip">
      <Icon name="sparkle" :size="14" />
      <span>支持网易云 / QQ 双音源</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  height: 100%;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: rgba(15, 15, 30, 0.85);
  backdrop-filter: blur(18px);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 6px;
}

.brand-logo {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  box-shadow: 0 6px 16px rgba(124, 108, 240, 0.4);
}

.brand-name {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  line-height: 1.2;
}

.brand-sub {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.42);
  line-height: 1.4;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.18s ease;
  border: 1px solid transparent;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.nav-item--active {
  color: #fff;
  background: linear-gradient(135deg, rgba(124, 108, 240, 0.42), rgba(90, 167, 255, 0.22));
  border-color: rgba(124, 108, 240, 0.45);
}

.tip {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 10px;
  border-radius: 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
