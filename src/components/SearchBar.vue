<script setup>
// 通用搜索框：v-model 双向绑定 + 回车触发
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索歌曲、歌手、专辑' },
  loading: { type: Boolean, default: false },
  autofocus: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'search'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

function onEnter() {
  emit('search', props.modelValue)
}

function clear() {
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<template>
  <div class="search-bar">
    <Icon name="search" :size="17" class="search-icon" />
    <input
      class="search-input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :autofocus="autofocus"
      @input="onInput"
      @keyup.enter="onEnter"
    />
    <button v-if="modelValue" class="btn-icon search-clear" title="清空" @click="clear">
      <Icon name="close" :size="15" />
    </button>
    <button class="search-btn" :disabled="loading" @click="onEnter">
      {{ loading ? '搜索中' : '搜索' }}
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 40px;
  padding: 0 6px 0 13px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.11);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.search-bar:focus-within {
  border-color: rgba(124, 108, 240, 0.6);
  background: rgba(255, 255, 255, 0.09);
}

.search-icon {
  color: rgba(255, 255, 255, 0.42);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.34);
}

.search-clear {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.4);
}

.search-btn {
  flex-shrink: 0;
  height: 30px;
  padding: 0 16px;
  border: none;
  border-radius: 999px;
  font-size: 12.5px;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(135deg, #7c6cf0, #5aa7ff);
  cursor: pointer;
  transition: opacity 0.18s ease;
}

.search-btn:disabled {
  opacity: 0.55;
  cursor: default;
}
</style>
