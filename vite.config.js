import { defineConfig } from 'vite';

export default defineConfig({
    define: {
        // 某些 SDK 可能会检查 global
        'global': 'globalThis',
    },
    optimizeDeps: {
        exclude: ['@bowenqt/qiniu-ai-sdk']
    },
    resolve: {
        alias: {
            // 浏览器环境不需要 ws，提供空模块
            'ws': '/src/polyfills/ws.js'
        }
    }
});
