import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from '@unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [UnoCSS(), react()],
    define: {
        'process.env': {
            NODE_ENV: process.env.NODE_ENV,
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8082',
                changeOrigin: true,
            },
        },
    },
})
