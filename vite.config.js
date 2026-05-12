import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        sentryVitePlugin({
            org: 'tugamer89',
            project: 'quiz-forge',
            authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'manifest.json', '*.png', '*.jpg'],
            manifest: false,
        }),
    ],
    base: '/quiz-forge/',
    build: {
        target: 'esnext',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'markdown-vendor': [
                        'react-markdown',
                        'remark-gfm',
                        'remark-math',
                        'rehype-katex',
                        'rehype-raw',
                        'rehype-sanitize',
                    ],
                },
            },
        },
    },
    test: {
        globals: true,
        clearMocks: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        css: true,
    },
});
