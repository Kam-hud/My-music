import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        historyApiFallback: true,
        proxy: {
            '/qqmusic': {
                target: 'https://c.y.qq.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/qqmusic/, ''),
                headers: {
                    Referer: 'https://y.qq.com/'
                }
            }
        }
    }
});
