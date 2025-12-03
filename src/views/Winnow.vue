<script setup>
import { ref, inject } from 'vue';

const playSong = inject('playSong')
const likeSong = inject('likeSong')
const isLiked = inject('isLiked')

// 响应式数据
const userInput = ref('')
const isGenerating = ref(false)
const generatedSongs = ref([])
const chatHistory = ref([])

// 模拟AI生成歌曲
const generateSong = async () => {
    if (!userInput.value.trim()) return

    isGenerating.value = true

    // 添加用户信息到聊天历史
    chatHistory.value.push({
        type: 'user',
        content: userInput.value,
        timestamp: new Date()
    })

    try {
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 模拟生成歌曲数据
        const newSong = {
            id: Date.now(),
            title: generateTitle(userInput.value),
            artist: 'AI音乐助手',
            album: 'AI创作专辑',
            cover: generateCover(),
            duration: '03:45',
            url: generateDemoAudio(),
            lyrics: generateLyrics(userInput.value),
            description: `一首基于"${userInput.value}"生成的原创歌曲`,
            genre: '流行',
            bpm: 120,
            key: 'C',
        }

        // 添加AI回复到聊天历史
        chatHistory.value.push({
            type: 'ai',
            content: `我已经为您创作了一首歌曲《${newSong.title}》!`,
            song: newSong,
            timestamp: new Date()
        })

        // 添加到生成的歌曲列表
        generatedSongs.value.unshift(newSong)

        // 清空输入框
        userInput.value = ''
    } catch (error) {
        console.error('生成歌曲失败:', error)
        chatHistory.value.push({
            type: 'ai',
            content: '抱歉,歌曲生成失败,请稍后重试',
            timestamp: new Date()
        })
    } finally { 
        isGenerating.value = false
    }
}

// 生成歌曲标题
const generateTitle = (input) => { 
    const keywords = input.split(' ').filter(k => k.trim()).slice(0, 3)
    const titles = [
        `${keywords.join('')}的旋律`,
        `关于${keywords[0]}的故事`,
        `${keywords[0]}之心`,
        `记忆中的${keywords[0]}`,
        `${keywords[0]}时光`              
    ]
    return titles[Math.floor(Math.random() * titles.length)]
}

// 生成封面图片
const generateCover = () => { 
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
    const color = colors[Math.floor(Math.random() * colors.length)]
    return `https://via.placeholder.com/300x300/${color.slice(1)}/ffffff?text=AI+Music`
}

// 生成演示音频URL
const generateDemoAudio = () => {
  // 返回一个演示音频URL
  return 'https://example.com/ai-generated-song.mp3'
}

// 生成歌词
const generateLyrics = (input) => {
    const themes = {
        love: [
            "在这美好的时刻，我想对你说",
            "心中的旋律，为你而歌唱",
            "爱如潮水，涌向你的方向",
            "每一个音符，都是思念的形状"
        ],
        nature: [
            "风吹过山岗，带来远方的消息",
            "流水潺潺，诉说着古老的故事",
            "星空闪烁，照亮前行的道路",
            "大地回响，生命的节奏"
        ],
        life: [
            "时光匆匆，留下岁月的痕迹",
            "梦想的翅膀，带我们飞翔",
            "在平凡中寻找不平凡",
            "每一次相遇，都是命运的礼物"
        ]
    }
    const getRandomLines = (theme) => { 
        const lines = themes[theme] || themes.life
        const shuffled = [...lines].sort(() => Math.random() - 0.5)
        return shuffled.slice(0,4)
    }

    const theme = input.includes('爱')? 'love' : input.includes('自然') || input.includes('风景') ? 'nature' : 'life'
    return getRandomLines(theme).join('\n')
}

// 播放生成的歌曲
const playGeneratedSong = (song) => { 
    playSong(song)
}

// 处理键盘事件
const handleKeyPress = (event) => { 
    if (event.key === 'Enter' && !event.shiftKey) { 
        event.preventDefault()
        generateSong()
    }
}

// 清空聊天历史
const clearChat = () => { 
    chatHistory.value = []
}
</script>

<template>
    <div class="ai-music">
        <!-- 页面标题 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">AI音乐创作</h1>
                <p class="page-subtitle">描述您想要的音乐,AI为您创作</p>
            </div>
            <div class="header-actions">
                <button v-if="chatHistory.length > 0"  @click="clearChat" class="clear-btn" title="清空对话">
                    <font-awesome-icon icon="trash" />
                    <span>清空对话</span>
                </button>
            </div>
        </div>

        <div class="ai-container">
            <!-- 聊天区域 -->
            <div class="chat-section">
                <div class="chat-messages" ref="messagesContainer">
                    <div v-if="chatHistory.length === 0" class="welcome-message">
                        <div class="welcome-content">
                            <font-awesome-icon icon="robot" class="welcome-icon" />
                            <h3>欢迎使用AI音乐创作助手</h3>
                            <p>
                                请描述您想要的歌曲主题，风格或情感，我将为您创作独一无二的音乐!
                            </p>
                            <div class="example-prompts">
                                <div class="prompt-tages">
                                    <span class="prompt-tage" @click="userInput = '创作一首关于夏日恋情的流行歌曲'">夏日恋情</span>
                                    <span class="prompt-tage" @click="userInput = '写一首励志的摇滚歌曲'">励志摇滚</span>
                                    <span class="prompt-tage" @click="userInput = '创作宁静的钢琴曲，描述星空'">星空钢琴</span>
                                    <span class="prompt-tage" @click="userInput = '写一首思念故乡的民谣'">思乡民谣</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="message-list">
                        <div v-for="(message, index) in chatHistory" :key="index" :class="['message',message.type]">
                            <div class="message-avatar">
                                <font-awesome-icon v-if="message.type === 'user'" icon="user" />
                                <font-awesome-icon v-else icon="robot" />
                            </div>
                            <div class="message-content">
                                <div class="message-text">{{ message.content }}</div>

                                <!-- AI生成的歌曲 -->
                                <div v-if="message.song" class="ai-song">
                                    <div class="song-preview">
                                        <div class="song-cover">
                                            <img :src="message.song.cover" alt="歌曲封面" />
                                        </div>
                                        <div class="song-details">
                                            <h4>{{ message.song.title }}</h4>
                                            <p class="song-artist">{{ message.song.artist }} • {{ message.song.genre }}</p>
                                            <p class="song-desc">{{ message.song.description }}</p>
                                            <div class="song-actions">
                                                <button  @click="playGeneratedSong(message.song)" class="play-btn">
                                                    <font-awesome-icon icon="play" />
                                                    <span>播放</span>
                                                </button>
                                                <button @click="likeSong(message.song)" :class="['like-btn', {'active': isLiked(message.song.id)}]">
                                                    <font-awesome-icon icon="heart" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 歌词预览 -->
                                    <div class="lyrics-preview">
                                        <h5>歌词预览</h5>
                                        <pre class="lyrics-text">{{ message.song.lyrics }}</pre>
                                    </div>
                                </div>

                                <div v-if="message.timestamp" class="message-time">{{ message.timestamp.toLocaleTimeString() }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 生成指示器 -->
                    <div v-if="isGenerating" class="message-ai">
                        <div class="message-avatar">
                            <font-awesome-icon icon="robot" />
                        </div>
                        <div class="message-content">
                            <div class="generating">
                                <div class="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span>AI正在创作中...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 输入区域 -->
            <div class="input-section">
                <div class="input-container">
                    <textarea  
                        v-model="userInput"
                        @keypress="handleKeyPress" 
                        placeholder="描述你想要的音乐,例如:创作一首轻快的夏日流行歌曲,关于海滩和阳光" 
                        rows="3" 
                        :disabled="isGenerating"
                        class="message-input"
                    ></textarea>
                    <button @click="generateSong" :disabled="!userInput.trim() || isGenerating" class="send-btn">
                        <font-awesome-icon v-if="isGenerating" icon="spinner" spin />
                        <font-awesome-icon v-else icon="paper-plane" />
                    </button>
                </div>
                <div class="input-hint">
                    <font-awesome-icon icon="lightbulb" />
                    <span>提示:描述越详细，生成的音乐越符合您的期望</span>
                </div>
            </div>
        </div>

        <!-- 生成的歌曲列表 -->
        <div v-if="generatedSongs.length > 0"  class="songs-sidabar">
            <h3>最近创作</h3>
            <div class="songs-list">
                <div  v-for="song in generatedSongs" :key="song.id" class="song-item">
                    <div class="song-cover">
                        <img :src="song.cover"  alt="封面">
                    </div>
                    <div class="song-info">
                        <div class="song-title">{{ song.title }}</div>
                        <div class="song-artist">{{ song.artist }}</div>
                    </div>
                    <button @click="playGeneratedSong(song)" class="play-btn">
                        <font-awesome-icon icon="play" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.ai-music {
    padding: 20px;
    display: flex;
    flex-direction: column;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .header-content {
            .page-title {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .page-subtitle {
                font-size: 16px;
                opacity: 0.8;
                margin: 0;
            }
        }

        .clear-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: rgba(255, 107, 107, 0.1);
            color: #ff6b6b;
            border: 1px solid rgba(255, 107, 107, 0.2);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;

            &:hover {
                background: rgba(255, 107, 107, 0.2);
                transform: translateY(-2px);
            }
        }
    }

    .ai-container {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 20px;
        flex: 1;
        overflow: hidden;
    }

    .chat-section {
        display: flex;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        overflow: hidden;
    }

    .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;

        .welcome-message {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            text-align: center;

            .welcome-content {
                max-width: 400px;

                .welcome-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    color: #4ecdc4;
                    opacity: 0.8;
                }

                h3 {
                    margin-bottom: 12px;
                    font-size: 24px;
                }

                p {
                    margin-bottom: 24px;
                    opacity: 0.8;
                    line-height: 1.5;
                }

                .prompt-tages {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                }

                .prompt-tage {
                    padding: 8px 16px;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid rgba(78, 205, 196, 0.3);
                    border-radius: 20px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        background: rgba(78, 205, 196, 0.2);
                        transform: translateY(-2px);
                    }
                }
            }
        }

        .message-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .message {
            display: flex;
            gap: 12px;
            max-width: 80%;

            .message-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(78, 205, 196, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .message-content {
                padding: 16px;
                border-radius: 18px;
                flex: 1;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);

                .message-text {
                    margin-bottom: 12px;
                    line-height: 1.5;
                }

                .message-time {
                    font-size: 12px;
                    opacity: 0.6;
                    text-align: right;
                }
            }
        }

        .ai-song {
            margin-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 16px;

            .song-preview {
                display: flex;
                gap: 12px;
                margin-bottom: 16px;

                .song-cover {
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    overflow: hidden;
                    flex-shrink: 0;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .song-details {
                    flex: 1;

                    h4 {
                        margin: 0 0 4px 0;
                        font-size: 16px;
                    }

                    .song-artist,
                    .song-desc {
                        margin: 0 0 8px 0;
                        font-size: 14px;
                        opacity: 0.8;
                    }

                    .song-desc {
                        font-size: 12px;
                        margin-bottom: 12px;
                    }

                    .song-actions {
                        display: flex;
                        gap: 8px;

                        .play-btn {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 6px 12px;
                            background: rgba(78, 205, 196, 0.2);
                            color: #4ecdc4;
                            border: 1px solid rgba(78, 205, 196, 0.3);
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 12px;
                            transition: all 0.3s ease;

                            &:hover {
                                background: rgba(78, 205, 196, 0.3);
                            }
                        }

                        .like-btn {
                            padding: 6px;
                            background: none;
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            border-radius: 6px;
                            color: rgba(255, 255, 255, 0.5);
                            cursor: pointer;
                            transition: all 0.3s ease;

                            &:hover {
                                color: #ff6b6b;
                                border-color: rgba(255, 107, 107, 0.3);
                            }
                        }
                    }
                }
            }

            .lyrics-preview {
                h5 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    opacity: 0.8;
                }

                .lyrics-text {
                    font-size: 12px;
                    line-height: 1.4;
                    opacity: 0.7;
                    white-space: pre-wrap;
                    margin: 0;
                    font-family: inherit;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 12px;
                    border-radius: 6px;
                    max-height: 120px;
                    overflow-y: auto;
                }
            }
        }

        .message-ai {
            display: flex;
            gap: 12px;

            .message-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(78, 205, 196, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .message-content {
                padding: 16px;
                border-radius: 18px;
                flex: 1;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .generating {
                display: flex;
                align-items: center;
                gap: 8px;
                color: rgba(255, 255, 255, 0.7);
            }

            .typing-dots {
                display: flex;
                gap: 4px;

                span {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    animation: typing 1.4s infinite ease-in-out;

                    &:nth-child(1) {
                        animation-delay: -0.32s;
                    }

                    &:nth-child(2) {
                        animation-delay: -0.16s;
                    }
                }
            }
        }
    }

    .input-section {
        padding: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);

        .input-container {
            display: flex;
            gap: 12px;
            align-items: flex-end;

            .message-input {
                flex: 1;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                color: white;
                font-family: inherit;
                resize: none;
                outline: none;
                transition: all 0.3s ease;

                &:focus {
                    border-color: rgba(78, 205, 196, 0.5);
                }

                &::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }
            }

            .send-btn {
                padding: 12px 16px;
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                border: none;
                border-radius: 12px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                flex-shrink: 0;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
                }
            }
        }

        .input-hint {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
            font-size: 12px;
            opacity: 0.6;
        }
    }

    .songs-sidabar {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        overflow-y: auto;

        h3 {
            margin: 0 0 16px 0;
            font-size: 18px;
        }

        .song-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;

            &:hover {
                background: rgba(255, 255, 255, 0.08);
            }

            .song-cover {
                width: 40px;
                height: 40px;
                border-radius: 6px;
                overflow: hidden;
                flex-shrink: 0;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }

            .song-info {
                flex: 1;
                min-width: 0;

                .song-title {
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .song-artist {
                    font-size: 12px;
                    opacity: 0.7;
                }
            }

            .play-btn {
                padding: 6px;
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                transition: all 0.3s ease;
                flex-shrink: 0;

                &:hover {
                    color: #4ecdc4;
                    border-color: rgba(78, 205, 196, 0.3);
                }
            }
        }
    }
}

@keyframes typing {

    0%,
    60%,
    100% {
        transform: translateY(0);
        opacity: 0.6;
    }

    30% {
        transform: translateY(-4px);
        opacity: 1;
    }
}

// 移动端适配
@media (max-width: 768px) {
    .ai-music {
        padding: 16px;

        .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;

            .page-title {
                font-size: 24px;
            }
        }

        .ai-container {
            grid-template-columns: 1fr;
        }

        .songs-sidabar {
            display: none;
        }

        .chat-messages {
            padding: 16px;

            .message {
                max-width: 90%;
            }

            .ai-song .song-preview {
                flex-direction: column;

                .song-cover {
                    width: 100%;
                    height: 120px;
                }
            }
        }

        .input-section {
            padding: 16px;
        }
    }
}
</style>