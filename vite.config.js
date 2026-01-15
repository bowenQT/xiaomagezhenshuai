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
    },
    server: {
        proxy: {
            // 本地开发时代理 /api 请求到 Vercel CLI 或返回模拟数据
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                configure: (proxy, options) => {
                    proxy.on('error', (err) => {
                        console.log('[Proxy Error] API server not running, use `vercel dev` for full testing');
                    });
                }
            }
        }
    }
});
