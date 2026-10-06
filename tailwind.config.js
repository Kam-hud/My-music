/** @type {import('tailwindcss').Config} */
// Tailwind 配置：把设计文档中的视觉规范（配色 / 布局尺寸）沉淀为可复用的 token
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主强调色
        accent: {
          DEFAULT: '#7c6cf0',
          light: '#9c8ff5',
          deep: '#5b4bd0'
        },
        // 次级强调色（渐变另一端）
        sky: '#5aa7ff',
        // 播放态 / 进度条
        play: '#35d6c8',
        // 面板底色
        panel: 'rgba(255,255,255,0.05)',
        line: 'rgba(255,255,255,0.08)'
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      },
      backdropBlur: {
        xs: '2px'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite'
      }
    }
  },
  plugins: []
}
