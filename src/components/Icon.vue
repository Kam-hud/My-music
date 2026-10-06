<script setup>
/**
 * 统一图标组件（内联 SVG，无外部图标库依赖）
 * 用法：<Icon name="play" :size="20" />
 */
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 }
})

const PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.2 9.9V21h13.6V9.9"/>',
  list: '<path d="M8.5 6h12M8.5 12h12M8.5 18h12"/><circle cx="4" cy="6" r="1.3"/><circle cx="4" cy="12" r="1.3"/><circle cx="4" cy="18" r="1.3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.2-4.2"/>',
  heart:
    '<path d="M12 20.4C12 20.4 3.6 15.1 3.6 8.9A4.3 4.3 0 0 1 12 6.7a4.3 4.3 0 0 1 8.4 2.2c0 6.2-8.4 11.5-8.4 11.5Z"/>',
  'heart-fill':
    '<path d="M12 20.4C12 20.4 3.6 15.1 3.6 8.9A4.3 4.3 0 0 1 12 6.7a4.3 4.3 0 0 1 8.4 2.2c0 6.2-8.4 11.5-8.4 11.5Z"/>',
  prev: '<polygon points="19 20 9 12 19 4"/><line x1="5" y1="19.5" x2="5" y2="4.5"/>',
  next: '<polygon points="5 4 15 12 5 20"/><line x1="19" y1="4.5" x2="19" y2="19.5"/>',
  play: '<polygon points="6.5 4 20 12 6.5 20"/>',
  pause: '<rect x="7" y="5" width="3.6" height="14" rx="1"/><rect x="13.4" y="5" width="3.6" height="14" rx="1"/>',
  volume:
    '<path d="M4 9.5h3l4.6-3.6v12.2L7 14.5H4z"/><path d="M16 9.2a4.4 4.4 0 0 1 0 5.6"/><path d="M18.8 6.6a8 8 0 0 1 0 10.8"/>',
  'volume-mute':
    '<path d="M4 9.5h3l4.6-3.6v12.2L7 14.5H4z"/><path d="m16.4 9.6 5 4.8M21.4 9.6l-5 4.8"/>',
  repeat:
    '<path d="M17 2.8 20.4 6.2 17 9.6"/><path d="M20.4 6.2H7.2A3.7 3.7 0 0 0 3.5 9.9v1.2"/><path d="M7 21.2 3.6 17.8 7 14.4"/><path d="M3.6 17.8h13.2a3.7 3.7 0 0 0 3.7-3.7v-1.2"/>',
  'repeat-one':
    '<path d="M17 2.8 20.4 6.2 17 9.6"/><path d="M20.4 6.2H7.2A3.7 3.7 0 0 0 3.5 9.9v1.2"/><path d="M7 21.2 3.6 17.8 7 14.4"/><path d="M3.6 17.8h13.2a3.7 3.7 0 0 0 3.7-3.7v-1.2"/><path d="M11.2 10.6h1.1v4.2"/><path d="M10.4 14.8h2.7"/>',
  shuffle:
    '<path d="M16 3.6 20.4 8 16 12.4"/><path d="M3.6 8h3.1c1.7 0 2.7.8 3.6 2.1"/><path d="M3.6 16h3.1c1.7 0 2.7-.8 3.6-2.1"/><path d="M16 11.6 20.4 16 16 20.4"/><path d="M13.3 13.9c.9 1.3 1.9 2.1 3.6 2.1h3.5"/>',
  lyrics: '<path d="M5 6h14M5 12h9.5M5 18h11.5"/>',
  close: '<path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8"/>',
  download: '<path d="M12 4v11"/><path d="m7.4 10.6 4.6 4.6 4.6-4.6"/><path d="M4.8 19.4h14.4"/>',
  refresh: '<path d="M20 11.6A8 8 0 1 0 12 20a8 8 0 0 0 6.6-3.5"/><path d="M20.2 4.8v6.4h-6.4"/>',
  music: '<path d="M9.5 18V5.6l10-1.8V16"/><circle cx="6.8" cy="18" r="2.7"/><circle cx="16.8" cy="16" r="2.7"/>',
  'play-all': '<circle cx="12" cy="12" r="9"/><polygon points="10.2 8.2 16 12 10.2 15.8"/>',
  plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
  sparkle:
    '<path d="M12 3.2l1.9 5.3 5.3 1.9-5.3 1.9L12 17.6l-1.9-5.3L4.8 10.4l5.3-1.9z"/><path d="M18.6 16.4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  queue: '<path d="M4 6.5h16M4 12h16M4 17.5h9"/>',
  trash: '<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l1 12.2h9L17.5 7"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m4.5 17.5 4.6-4.2 3.4 3 3-2.6 4 3.8"/>',
  link: '<path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l2.8-2.8a3.5 3.5 0 0 0-5-5l-1.4 1.4"/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-2.8 2.8a3.5 3.5 0 0 0 5 5l1.4-1.4"/>'
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="name.endsWith('-fill') ? 'currentColor' : 'none'"
    :stroke="name.endsWith('-fill') ? 'none' : 'currentColor'"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="PATHS[name] || ''"
  />
</template>
