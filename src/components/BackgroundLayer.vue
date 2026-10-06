<script setup>
/**
 * 背景层：默认渐变 + 自定义壁纸（可模糊）+ 动态粒子
 * 使用 canvas 绘制缓慢漂浮的光点，随窗口尺寸自适应。
 */
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { bgState } from '../composables/useBackground'

const canvasRef = ref(null)

let ctx = null
let raf = null
let particles = []
let width = 0
let height = 0

const wallpaperStyle = computed(() => {
  if (!bgState.wallpaper) return null
  return {
    backgroundImage: `url("${bgState.wallpaper}")`,
    filter: `blur(${bgState.blur}px) saturate(1.15) brightness(0.55)`,
    transform: `scale(${1 + bgState.blur / 60})`
  }
})

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = Math.max(1, Math.floor(width * dpr))
  canvas.height = Math.max(1, Math.floor(height * dpr))
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  createParticles()
}

function createParticles() {
  const count = Math.min(80, Math.max(26, Math.round(width / 20)))
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 2.1 + 0.6,
    vx: (Math.random() - 0.5) * 0.26,
    vy: (Math.random() - 0.5) * 0.26,
    alpha: Math.random() * 0.45 + 0.12,
    color: Math.random() > 0.5 ? '124,108,240' : '90,167,255'
  }))
}

function tick() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    if (p.x < -12) p.x = width + 12
    if (p.x > width + 12) p.x = -12
    if (p.y < -12) p.y = height + 12
    if (p.y > height + 12) p.y = -12
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${p.color},${p.alpha})`
    ctx.fill()
  }
  raf = requestAnimationFrame(tick)
}

function start() {
  if (raf) return
  raf = requestAnimationFrame(tick)
}

function stop() {
  if (raf) {
    cancelAnimationFrame(raf)
    raf = null
  }
  if (ctx) ctx.clearRect(0, 0, width, height)
}

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  if (bgState.particles) start()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  stop()
})

watch(
  () => bgState.particles,
  (on) => {
    if (on) {
      resize()
      start()
    } else {
      stop()
    }
  }
)
</script>

<template>
  <div class="bg-layer">
    <div class="bg-gradient" />
    <div v-if="wallpaperStyle" class="bg-wallpaper" :style="wallpaperStyle" />
    <canvas ref="canvasRef" class="bg-canvas" />
    <div class="bg-vignette" />
  </div>
</template>

<style scoped>
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--bg-1), var(--bg-2), var(--bg-3));
}

.bg-wallpaper {
  position: absolute;
  inset: -40px;
  background-size: cover;
  background-position: center;
  transition: filter 0.3s ease, transform 0.3s ease;
}

.bg-canvas {
  position: absolute;
  inset: 0;
}

.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(124, 108, 240, 0.12), transparent 62%);
}
</style>
