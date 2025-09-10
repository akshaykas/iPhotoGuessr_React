import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 55408,
        proxy: {
            '/api': {
                target: 'https://localhost:7246',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
