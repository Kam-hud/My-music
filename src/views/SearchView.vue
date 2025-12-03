<script setup>
import { inject, watch } from 'vue'
import { useRoute } from 'vue-router'
import SearchResults from '@/components/SearchResults.vue'

const route = useRoute()

const searchQuery = inject('searchQuery')
const performSearch = inject('performSearch')
const clearSearch = inject('clearSearch')

watch(
    () => route.query.q,
    (newQuery) => {
        if (newQuery) {
            performSearch(newQuery)
        } else {
            clearSearch()
        }
    },
    { immediate: true }
)
</script>

<template>
    <div class="search-view">
        <SearchResults></SearchResults>
    </div>
</template>

<style lang="scss" scoped>
.search-view {
    padding: 20px;
    height: 100%;

}

@media screen and (max-width: 768px) {
    .search-view {
        padding: 12px;
    }
}
</style>