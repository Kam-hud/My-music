<script setup>
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
                <font-awesome-icon icon="search" class="search-icon " />
                <input type="text" class="search-bar" placeholder="搜索音乐">
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
            background-color: #fff;
            margin-left: 12px;
            border-radius: 25px;


            .search-bar {
                padding: 8px 8px 8px 30px;
                font-size: 16px;
                border-radius: 24px;
                border: none;
                width: 240px;
                background: none;
            }

            .search-icon {
                position: absolute;
                left: 10px;
                color: grey;
                font-size: 16px;
                pointer-events: none;
            }
        }
    }
}
</style>