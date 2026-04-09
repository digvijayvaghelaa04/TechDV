import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    build: {
        // Agora WebRTC SDK is 1.5MB by design — suppress the warning
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split heavy vendor libs into separate cached chunks
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
                    'vendor-ui': ['framer-motion', 'lucide-react'],
                    'vendor-query': ['@tanstack/react-query'],
                }
            }
        }
    }
})

