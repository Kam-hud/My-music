<script setup>
import { ref, inject, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import bgColor from '@/data/bgColor.json'

const backgroundColor = inject('backgroundColor')
const backgroundImage = inject('backgroundImage')
const backgroundType = inject('backgroundType')
const textColor = inject('textColor')
const changeBackgroundColor = inject('changeBackgroundColor')
const changeBackgroundImage = inject('changeBackgroundImage')
const clearBackground = inject('clearBackground')

// 选项卡状态
const activeTab = ref('color')

// 预设颜色
const presetColors = [
    '#0a0a1a',
    '#ffffff',
    '#1a1a2e',
    '#16213e',
    '#1E90FF',
    '#9370DB',
    '#FF69B4',
    '#FFA500',
    '#00CED1',
]

const presetImages = ref(bgColor.presetColors)

// const presetImages = [
//     {
//         id: 1,
//         url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
//         name: '音乐节'
//     },
//     {
//         id: 2,
//         url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
//         name: '演唱会'
//     },
//     {
//         id: 3,
//         url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
//         name: 'DJ'
//     },
//     {
//         id: 4,
//         url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
//         name: '乐器'
//     },
//     {
//         id: 5,
//         url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
//         name: '舞台'
//     },
//     {
//         id: 6,
//         url: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
//         name: '唱片'
//     }
// ]

// 当前选择的颜色或者图片
const selectedColor = ref(backgroundColor.value)
const selectedImage = ref(backgroundImage.value)

// 自定义图片上传
const customImageUrl = ref('')
const isCustomImageTab = ref(false)

// 更新背景颜色
const updateBackgroundColor = (color) => {
    selectedColor.value = color
    changeBackgroundColor(color)
}

// 更新背景图片
const updateBackgroundImage = (imageUrl) => {
    selectedImage.value = imageUrl
    changeBackgroundImage(imageUrl)
    isCustomImageTab.value = false
}

// 自定义图片
const useCustomImage = () => {
    if (customImageUrl.value.trim()) {
        updateBackgroundImage(customImageUrl.value)
    }
}

// 清除背景
const resetBackground = () => {
    clearBackground()
    selectedColor.value = backgroundColor.value
    selectedImage.value = ''
    customImageUrl.value = ''
    activeTab.value = 'color'
}

// 在组件挂载时检查是否有保存的颜色
onMounted(() => {
    if (backgroundType.value === 'image') {
        activeTab.value = 'image'
        selectedImage.value = backgroundImage.value
    }
})
</script>

<template>
    <div class="theme-settings-fullscreen">
        <!-- 标题区域 -->
        <div class="settings-header">
            <h1 class="settings-title">主题设置</h1>
            <p class="settings-subtitle">个性化你的音乐体验</p>
        </div>

        <!-- 选项卡 -->
        <div class="tabs-fullscreen">
            <button class="tab-button-fullscreen" :class="{ active: activeTab === 'color' }"
                @click="activeTab = 'color'">
                <font-awesome-icon icon="palette" />
                <span>颜色主题</span>
            </button>
            <button class="tab-button-fullscreen" :class="{ active: activeTab === 'image' }"
                @click="activeTab = 'image'">
                <font-awesome-icon icon="image" />
                <span>背景图片</span>
            </button>
        </div>

        <!-- 颜色选择 -->
        <div v-if="activeTab === 'color'" class="tab-content-fullscreen color-tab">
            <h2 class="section-title">选择背景颜色</h2>
            <div class="color-grid-fullscreen">
                <div v-for="color in presetColors" :key="color" class="color-option-fullscreen"
                    :style="{ backgroundColor: color }" :class="{
                        selected: selectedColor === color && backgroundType === 'color',
                        'light-color': color === '#ffffff' || color === '#f0f0f0'
                    }" @click="updateBackgroundColor(color)" :title="color">
                    <div v-if="selectedColor === color && backgroundType === 'color'"
                        class="selected-indicator-fullscreen">
                        <font-awesome-icon icon="check" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 图片选择 -->
        <div v-if="activeTab === 'image'" class="tab-content-fullscreen image-tab">
            <!-- 预设图片 -->
            <div class="image-section-fullscreen">
                <h2 class="section-title">预设背景图片</h2>
                <div class="image-grid-fullscreen">
                    <div v-for="image in presetImages" :key="image.id" class="image-option-fullscreen"
                        :class="{ selected: selectedImage === image.url && backgroundType === 'image' }"
                        @click="updateBackgroundImage(image.url)">
                        <img :src="image.url" :alt="image.name" />
                        <div class="image-overlay-fullscreen">
                            <span class="image-name-fullscreen">{{ image.name }}</span>
                            <div v-if="selectedImage === image.url && backgroundType === 'image'"
                                class="selected-badge-fullscreen">
                                <font-awesome-icon icon="check" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 自定义图片 -->
            <div class="custom-image-section-fullscreen">
                <h2 class="section-title">自定义图片</h2>
                <div class="custom-image-input-fullscreen">
                    <input v-model="customImageUrl" type="text" placeholder="输入图片URL地址" class="url-input-fullscreen" />
                    <button @click="useCustomImage" :disabled="!customImageUrl.trim()" class="apply-btn-fullscreen">
                        <font-awesome-icon icon="check" />
                        应用图片
                    </button>
                </div>
                <p class="help-text-fullscreen">提示：请输入完整的图片URL地址，确保图片可以公开访问</p>
            </div>
        </div>

        <!-- 当前设置显示 -->
        <div class="current-settings-fullscreen">
            <h2 class="section-title">当前设置预览</h2>
            <div class="current-preview-fullscreen">
                <div v-if="backgroundType === 'color'" class="color-preview-fullscreen"
                    :style="{ backgroundColor: selectedColor }">
                    <div class="preview-content">
                        <font-awesome-icon icon="palette" class="preview-icon" />
                        <span class="preview-text">颜色主题</span>
                        <div class="color-hex-fullscreen">{{ selectedColor }}</div>
                    </div>
                </div>
                <div v-else-if="backgroundType === 'image'" class="image-preview-fullscreen"
                    :style="{ backgroundImage: `url(${selectedImage})` }">
                    <div class="preview-content">
                        <font-awesome-icon icon="image" class="preview-icon" />
                        <span class="preview-text">背景图片</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons-fullscreen">
            <button @click="resetBackground" class="reset-btn-fullscreen">
                <font-awesome-icon icon="undo" />
                恢复默认设置
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.theme-settings-fullscreen {
    min-height: 100vh;
    padding: 40px 60px;
    display: flex;
    flex-direction: column;
    background: transparent;
    max-width: 100%;

    .settings-header {
        text-align: center;
        margin-bottom: 40px;

        .settings-title {
            font-size: 48px;
            margin-bottom: 12px;
            font-weight: 700;
            background: linear-gradient(135deg, #e8b9aa, #ff6b6b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .settings-subtitle {
            font-size: 20px;
            opacity: 0.8;
            margin: 0;
        }
    }

    .tabs-fullscreen {
        display: flex;
        gap: 16px;
        margin-bottom: 50px;
        justify-content: center;

        .tab-button-fullscreen {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 32px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.05);
            color: inherit;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 18px;
            font-weight: 500;
            backdrop-filter: blur(10px);

            &:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }

            &.active {
                background: rgba(232, 185, 170, 0.3);
                border-color: #e8b9aa;
                color: #e8b9aa;
                font-weight: 600;
                box-shadow: 0 8px 25px rgba(232, 185, 170, 0.3);
            }
        }
    }

    .tab-content-fullscreen {
        flex: 1;
        margin-bottom: 40px;
    }

    .section-title {
        font-size: 32px;
        margin-bottom: 30px;
        text-align: center;
        font-weight: 600;
        color: inherit;
    }

    .color-grid-fullscreen {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 20px;
        max-width: 900px;
        margin: 0 auto;

        .color-option-fullscreen {
            width: 80px;
            height: 80px;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 3px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

            &:hover {
                transform: scale(1.15);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
            }

            &.selected {
                transform: scale(1.2);
                box-shadow: 0 0 0 4px rgba(232, 185, 170, 0.8);
                border: 3px solid white;
            }

            &.light-color {
                border: 2px solid rgba(0, 0, 0, 0.2);
            }

            .selected-indicator-fullscreen {
                color: white;
                font-size: 20px;
                font-weight: bold;
                text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
            }
        }
    }

    .image-section-fullscreen {
        margin-bottom: 50px;
    }

    .image-grid-fullscreen {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 25px;
        max-width: 1200px;
        margin: 0 auto;

        .image-option-fullscreen {
            position: relative;
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;
            aspect-ratio: 16/9;
            border: 3px solid transparent;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);

            &:hover {
                transform: translateY(-8px);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
            }

            &.selected {
                border-color: #e8b9aa;
                box-shadow: 0 0 0 4px rgba(232, 185, 170, 0.4), 0 15px 35px rgba(0, 0, 0, 0.5);
            }

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .image-overlay-fullscreen {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
                padding: 20px 15px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .image-name-fullscreen {
                    font-size: 14px;
                    color: white;
                    font-weight: 600;
                }

                .selected-badge-fullscreen {
                    background: #e8b9aa;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    color: #333;
                }
            }
        }
    }

    .custom-image-section-fullscreen {
        .custom-image-input-fullscreen {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
            max-width: 600px;
            margin: 0 auto 20px;

            .url-input-fullscreen {
                flex: 1;
                padding: 16px 20px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.1);
                color: inherit;
                font-size: 16px;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;

                &::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                &:focus {
                    outline: none;
                    border-color: #e8b9aa;
                    background: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 0 0 3px rgba(232, 185, 170, 0.2);
                }
            }

            .apply-btn-fullscreen {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 16px 24px;
                background: #e8b9aa;
                color: #333;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s ease;
                white-space: nowrap;

                &:hover:not(:disabled) {
                    background: #d8a99a;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(232, 185, 170, 0.4);
                }

                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
            }
        }

        .help-text-fullscreen {
            font-size: 14px;
            opacity: 0.7;
            margin: 0;
            text-align: center;
        }
    }

    .current-settings-fullscreen {
        margin: 50px 0 30px;
        padding-top: 40px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);

        .current-preview-fullscreen {
            max-width: 500px;
            margin: 0 auto;

            .color-preview-fullscreen,
            .image-preview-fullscreen {
                height: 120px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
                background-size: cover;
                background-position: center;
                position: relative;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);

                &::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 20px;
                }

                .preview-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;

                    .preview-icon {
                        font-size: 24px;
                        margin-bottom: 8px;
                        display: block;
                    }

                    .preview-text {
                        display: block;
                        font-size: 18px;
                        margin-bottom: 4px;
                    }

                    .color-hex-fullscreen {
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        opacity: 0.9;
                    }
                }
            }
        }
    }

    .action-buttons-fullscreen {
        display: flex;
        justify-content: center;
        margin-top: 30px;

        .reset-btn-fullscreen {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 16px 32px;
            background: rgba(255, 255, 255, 0.1);
            color: inherit;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 16px;
            font-weight: 500;
            backdrop-filter: blur(10px);

            &:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .theme-settings-fullscreen {
        padding: 20px;

        .settings-header {
            .settings-title {
                font-size: 32px;
            }

            .settings-subtitle {
                font-size: 16px;
            }
        }

        .tabs-fullscreen {
            flex-direction: column;
            align-items: center;

            .tab-button-fullscreen {
                width: 200px;
                justify-content: center;
            }
        }

        .color-grid-fullscreen {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 15px;

            .color-option-fullscreen {
                width: 60px;
                height: 60px;
            }
        }

        .image-grid-fullscreen {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
        }

        .custom-image-input-fullscreen {
            flex-direction: column;
        }

        .section-title {
            font-size: 24px;
        }
    }
}
</style>