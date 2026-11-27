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
              // Keep the always-loaded runtime small. These libraries are used by
              // isolated routes/features and should not make the main vendor chunk
              // cross the browser's 500 kB warning threshold.
              if (id.includes('/lucide-react/')) return 'icons';
              if (id.includes('/motion/')) return 'motion';
              if (id.includes('/react-markdown/') || id.includes('/remark-') || id.includes('/mdast') || id.includes('/micromark')) return 'markdown';
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            }
            if (id.includes('/src/data/docaulkhoaSourceData') || id.includes('/src/data/shopeeVariantSnapshot')) return 'catalog-source';
            if (id.includes('/src/data/productGuides') || id.includes('/src/data/newGuidesWithImages') || id.includes('/src/data/affiliateReviews')) return 'guides-data';
          },
        },
      },
    },
  };
});
