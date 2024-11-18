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
    resolve: {
        alias: {
            process: 'process/browser',
            stream: 'stream-browserify',
            buffer: 'buffer',
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
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
    build: {
        // Add build logging
        reportCompressedSize: true,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false // Keep console logs during build
            }
        },
        rollupOptions: {
            onwarn(warning, warn) {
                console.log('Rollup warning:', warning);
                warn(warning);
            },
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ethers': ['ethers'],
                    'vendor-siwe': ['siwe'],
                    'vendor-ui': ['react-icons', 'react-toastify', 'classnames'],
                    'vendor-utils': ['axios', 'dayjs', 'zustand']
                }
            }
        }
    },
})