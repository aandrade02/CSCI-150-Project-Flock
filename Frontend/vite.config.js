import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When React requests /api/..., forward that request to the Django server running on port 8000.
export default defineConfig({
  plugins: [react()],
  server: {
        port: 5173, 
        proxy: {
        '/api': {
            target: 'http://127.0.0.1:8000', // Replace with our backend server URL
            changeOrigin: true,
            },
        },
    },
});