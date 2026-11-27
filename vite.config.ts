import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': rootDir,
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) return 'charts';
              if (id.includes('react') || id.includes('react-dom') || id.includes('lucide-react') || id.includes('/motion/')) return 'vendor';
            }
            if (id.includes('/src/data/docaulkhoaSourceData') || id.includes('/src/data/shopeeVariantSnapshot')) return 'catalog-source';
            if (id.includes('/src/data/productGuides') || id.includes('/src/data/newGuidesWithImages') || id.includes('/src/data/affiliateReviews')) return 'guides-data';
          },
        },
      },
    },
  };
});
