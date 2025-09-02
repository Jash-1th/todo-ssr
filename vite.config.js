import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode, ssrBuild }) => {
  const isSsr = Boolean(ssrBuild);
  return {
    plugins: [react()],
    build: isSsr
      ? {
          ssr: 'src/entry-server.jsx',
          outDir: 'dist/server',
          rollupOptions: {
            input: 'src/entry-server.jsx',
            output: {
              format: 'esm',
              entryFileNames: 'entry-server.mjs'
            }
          }
        }
      : {
          outDir: 'dist/client',
          rollupOptions: { input: 'index.html' }
        },
    server: {
      port: 5173
    },
    appType: 'custom'
  };
});


