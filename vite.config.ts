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
        Components({
            dirs: ['src/components/ui'],
            dts: true
        }),
        ViteImageOptimizer({
            webp: {
                lossless: false,
            }
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@ui': fileURLToPath(new URL('./src/components/ui', import.meta.url)),
            '@features': fileURLToPath(new URL('./src/components/features', import.meta.url)),
            '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
        }
    },
    build: {
        outDir: 'dist'
    },
    optimizeDeps: {
        exclude: ['vue-demi']
    }
});
