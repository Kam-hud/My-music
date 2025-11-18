<script setup>
import BackgroundColor from '@/components/BackgroundColor.vue'
</script>

<template>
    <div class="bg-color-page-fullscreen">
        <BackgroundColor />
    </div>
</template>

<style lang="scss" scoped>
.bg-color-page-fullscreen {
    min-height: 100vh;
    width: 100%;
    background: transparent;
}
</style>