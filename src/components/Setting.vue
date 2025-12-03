<script setup>
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 本地搜索状态
const localSearchQuery = ref('')

// 搜索处理
const handleSearch = (e) => {
    const query = e.target.value
    localSearchQuery.value = query
    if (query.trim()) {
        router.push({ path: '/search', query: { q: query } })
    }
}

// 清除搜索
const handleClearSearch = () => {
    localSearchQuery.value = ''
    router.push('/search')
}

// 返回上一页和下一页
const goBack = () => {
    window.history.back()
}
const goForward = () => {
    window.history.forward()
}
</script>

<template>
    <div class="navbar">
        <div class="navbar-left">
            <p class="icon-left" @click="goBack">
                <font-awesome-icon icon="arrow-left" />
            </p>
            <p class="icon-left" @click="goForward">
                <font-awesome-icon icon="arrow-right" />
            </p>
            <div class="search-container">
                <font-awesome-icon icon="search" class="search-icon" />
                <input type="text" class="search-bar" placeholder="搜索音乐、歌手、专辑" :value="localSearchQuery"
                    @input="handleSearch" />
                <button v-if="localSearchQuery" class="clear-search" @click="handleClearSearch">
                    <font-awesome-icon icon="times" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    color: white;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);

    .navbar-left {
        display: flex;
        align-items: center;

        .icon-left {
            background: none;
            border: none;
            color: white;
            margin: 0 10px;
            cursor: pointer;
            font-size: 18px;
        }

        .search-container {
            position: relative;
            display: flex;
            align-items: center;
            border: none;
            background-color: rgba(255, 255, 255, 0.1);
            margin-left: 12px;
            border-radius: 25px;
            transition: all 0.3s ease;

            &:focus-within {
                background-color: rgba(255, 255, 255, 0.15);
                box-shadow: 0 0 0 2px rgba(232, 185, 170, 0.3);
            }

            .search-bar {
                padding: 8px 40px 8px 35px;
                font-size: 16px;
                border-radius: 24px;
                border: none;
                width: 300px;
                background: none;
                color: white;

                &::placeholder {
                    color: rgba(255, 255, 255, 0.6);
                }

                &:focus {
                    outline: none;
                }
            }

            .search-icon {
                position: absolute;
                left: 12px;
                color: rgba(255, 255, 255, 0.6);
                font-size: 16px;
                pointer-events: none;
            }

            .clear-search {
                position: absolute;
                right: 12px;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                transition: all 0.2s ease;

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .navbar {
        .navbar-left {
            .search-container {
                .search-bar {
                    width: 200px;
                    font-size: 14px;
                }
            }
        }
    }
}
</style>