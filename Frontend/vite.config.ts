import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors the old CRA "baseUrl": "./src" setting so absolute
      // imports like `import config from "config"` keep working.
      config: path.resolve(__dirname, 'src/config.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
  // Keep old CRA-style env vars readable via import.meta.env as VITE_*
  envPrefix: 'VITE_',
});
