import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import Components from 'unplugin-vue-components/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
    base: '/Pathe-Tools/',
    plugins: [
        vue(),
        vueDevTools(),
        Components({ dts: true }),
        ViteImageOptimizer({
            webp: {
                lossless: false,
            }
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: 'dist'
    },
    optimizeDeps: {
        exclude: ['vue-demi']
    }
});
