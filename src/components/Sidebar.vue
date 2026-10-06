<script setup>
/**
 * 左栏（重构版）：个人主页式导航
 * 从上到下：用户头像块（Kam + VIP + 在线）→ 搜索框 → 4 个导航项 → 统计数字区 → 歌单分类标签
 * 说明：
 *  - 4 个导航项分别指向 /、/search、/playlists、/liked，与原有路由完全一致，避免死链
 *  - 统计数字使用项目真实数据（收藏歌曲数来自 usePlayer.state.likedSongs，歌单数来自 /api/toplist）
 *  - 歌单分类标签根据真实歌单名自动归类，不使用参考图中的演示假数据
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { getToplist } from '../api'
import { usePlayer } from '../composables/usePlayer'

const router = useRouter()
const player = usePlayer()
const { state } = player

// 导航项：与参考图顺序一致（首页 / 发现 / 歌单 / 收藏），指向项目既有路由
const navItems = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/search', label: '发现', icon: 'sparkle' },
  { to: '/playlists', label: '歌单', icon: 'folder' },
  { to: '/liked', label: '收藏', icon: 'heart' }
]

const kw = ref('')
const playlists = ref([])

// 统计数字区：真实数据（收藏歌曲数 + 已加载的精选歌单数）
const likedCount = computed(() => state.likedSongs.length)
const playlistCount = computed(() => playlists.value.length)

// 歌单分类标签：按真实歌单名归类（首个命中的分类生效，避免重复计数），只展示真实存在的分类
const CATEGORIES = [
  { label: '私人收藏', icon: 'heart', re: /我喜欢的|喜欢的音乐|陌漓|收藏/ },
  { label: '二次元', icon: 'sparkle', re: /ACG|动漫|二次元|番剧/i },
  { label: '欧美', icon: 'globe', re: /欧美|英文|Western/i },
  { label: '国风', icon: 'moon', re: /国风|古风|古筝|戏腔/ },
  { label: '华语', icon: 'list', re: /华语|中文|粤语/ },
  { label: '轻音乐', icon: 'sparkle', re: /轻音乐|纯音|治愈|钢琴|器乐|纯音乐/ },
  { label: '原创', icon: 'chart', re: /原创|独立|indie/i },
  { label: '流行热歌', icon: 'music', re: /热歌|流行|新歌|飙升|榜/ }
]

const categories = computed(() => {
  const buckets = CATEGORIES.map((c) => ({ label: c.label, icon: c.icon, count: 0 }))
  playlists.value.forEach((pl) => {
    const name = pl.name || ''
    const idx = CATEGORIES.findIndex((c) => c.re.test(name))
    if (idx >= 0) buckets[idx].count += 1
  })
  return buckets.filter((b) => b.count > 0)
})

async function loadToplist() {
  try {
    const data = await getToplist()
    playlists.value = (data && data.playlists) || []
  } catch (e) {
    playlists.value = []
  }
}

function submitSearch() {
  const k = kw.value.trim()
  if (!k) {
    router.push('/search')
    return
  }
  router.push({ path: '/search', query: { kw: k } })
}

function goCategory(label) {
  // 分类标签 → 搜索页关键词，复用既有搜索能力
  router.push({ path: '/search', query: { kw: label } })
}

function addCategory() {
  player.showToast('分类管理请在「歌单」页操作', 'info')
}

onMounted(loadToplist)
</script>

<template>
  <aside class="sidebar">
    <!-- 顶部用户头像块：Kam + VIP + 在线状态 -->
    <router-link to="/liked" class="user">
      <div class="user-avatar">
        K
        <span class="user-online" title="在线" />
      </div>
      <div class="user-meta">
        <div class="user-name">
          Kam
          <span class="user-vip">VIP</span>
        </div>
        <div class="user-status">
          <span class="dot" />
          <span>在线</span>
        </div>
      </div>
      <Icon name="chevron-right" :size="14" class="user-chev" />
    </router-link>

    <!-- 搜索框：带放大镜图标，占满导航栏宽度 -->
    <div class="side-search">
      <Icon name="search" :size="15" class="side-search-icon" />
      <input
        v-model="kw"
        class="side-search-input"
        type="text"
        placeholder="搜索歌曲、歌手、专辑"
        @keyup.enter="submitSearch"
      />
      <button v-if="kw" class="side-search-clear" title="清空" @click="kw = ''">
        <Icon name="close" :size="13" />
      </button>
    </div>

    <!-- 导航项（4 个） -->
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

    <!-- 统计数字区：真实数据 -->
    <div class="stats">
      <router-link to="/playlists" class="stat" title="精选歌单数量">
        <Icon name="list" :size="14" class="stat-icon" />
        <span class="stat-label">歌单</span>
        <span class="stat-value tnum">{{ playlistCount }}</span>
      </router-link>
      <router-link to="/liked" class="stat" title="已收藏歌曲数量">
        <Icon name="heart" :size="14" class="stat-icon" />
        <span class="stat-label">收藏</span>
        <span class="stat-value tnum">{{ likedCount }}</span>
      </router-link>
    </div>

    <!-- 歌单分类标签：由真实歌单名归类 -->
    <div class="cats">
      <div class="cats-head">
        <span>歌单分类</span>
        <button class="cats-add" title="新增分类" @click="addCategory">
          <Icon name="plus" :size="12" />
        </button>
      </div>
      <div v-if="categories.length" class="cats-list">
        <button v-for="c in categories" :key="c.label" class="cat" @click="goCategory(c.label)">
          <Icon :name="c.icon" :size="14" />
          <span>{{ c.label }}</span>
        </button>
      </div>
      <p v-else class="cats-empty">连接服务后自动按歌单内容生成分类</p>
    </div>

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
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(13, 9, 26, 0.86);
  backdrop-filter: blur(18px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  overflow-y: auto;
}

/* ===== 用户头像块 ===== */
.user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  background: linear-gradient(135deg, rgba(124, 108, 240, 0.22), rgba(90, 167, 255, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.user:hover {
  border-color: rgba(124, 108, 240, 0.5);
}

.user-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  box-shadow: 0 6px 16px rgba(124, 108, 240, 0.38);
}

.user-online {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--online);
  border: 2px solid #120d24;
  box-shadow: 0 0 8px rgba(61, 220, 151, 0.8);
}

.user-meta {
  min-width: 0;
  flex: 1;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.2;
}

.user-vip {
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #3a2b00;
  background: linear-gradient(135deg, #ffd166, #ffb347);
}

.user-status {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.user-status .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--online);
  animation: pulse-soft 1.6s ease-in-out infinite;
}

.user-chev {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.38);
}

/* ===== 搜索框 ===== */
.side-search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.side-search:focus-within {
  border-color: rgba(124, 108, 240, 0.65);
  background: rgba(255, 255, 255, 0.09);
}

.side-search-icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.42);
}

.side-search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  font-size: 12.5px;
  font-family: inherit;
}

.side-search-input::placeholder {
  color: rgba(255, 255, 255, 0.32);
}

.side-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
}

.side-search-clear:hover {
  color: #fff;
}

/* ===== 导航 ===== */
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
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

/* ===== 统计数字区 ===== */
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.18s ease;
}

.stat:hover {
  color: #fff;
  border-color: rgba(124, 108, 240, 0.45);
  background: rgba(124, 108, 240, 0.14);
}

.stat-icon {
  flex-shrink: 0;
  color: var(--accent-2);
}

.stat-label {
  font-size: 11.5px;
}

.stat-value {
  margin-left: auto;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

/* ===== 歌单分类 ===== */
.cats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cats-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  font-size: 11.5px;
  letter-spacing: 0.6px;
  color: rgba(255, 255, 255, 0.35);
}

.cats-add {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.18s ease;
}

.cats-add:hover {
  color: #fff;
  border-color: rgba(124, 108, 240, 0.55);
}

.cats-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 32px;
  padding: 0 10px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12.5px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
}

.cat:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.07);
}

.cats-empty {
  margin: 0;
  padding: 0 4px;
  font-size: 11px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.3);
}

/* ===== 底部提示 ===== */
.tip {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 10px;
  border-radius: 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
