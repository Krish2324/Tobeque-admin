import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_URL || 'https://tobeque-backend.onrender.com';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false
        },
        '/uploads': {
          target: target,
          changeOrigin: true,
          secure: false
        },
        '/src/assets': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});

