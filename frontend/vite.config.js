import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:5174';
  return {
    plugins: [tailwindcss()],
    server: { port: 5173, proxy: { '/api': apiTarget } },
  };
});
