import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import viteLegacyPlugin from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), viteLegacyPlugin({
        targets: ['chrome >= 78'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        polyfills: [
            'es.symbol',
            'es.promise',
            'es.promise.finally',
            'es/map',
            'es/set',
            'es.array.filter',
            'es.array.for-each',
            'es.array.flat-map',
            'es.object.define-properties',
            'es.object.define-property',
            'es.object.get-own-property-descriptor',
            'es.object.get-own-property-descriptors',
            'es.object.keys',
            'es.object.to-string',
            'web.dom-collections.for-each',
            'esnext.global-this',
            'esnext.string.match-all']
    },)],
    build: {
        target: ['es2015'],
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    resolve: {
        alias: {
            // 将 "vue" 解析为 Vue 3 的 ESM 版本
            'vue': 'vue/dist/vue.esm-bundler.js'
        }
    },
})
