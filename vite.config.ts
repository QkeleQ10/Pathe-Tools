import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
    base: '/Pathe-Tools/',
    plugins: [
        vue(),
        vueDevTools(),
        Components({ dts: true })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: 'docs'
    },
    optimizeDeps: {
        exclude: ['vue-demi']
    }
});
