import { build, createServer } from 'vite';
import { build as esbuild } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

// Old SEO output in public must never overwrite the current compiled pages.
const generated = new Set(['index.html', 'seo', 'san-pham', 'cam-nang', 'danh-muc', 'gioi-thieu-phuong-phap-danh-gia', 'quyen-rieng-tu']);
await build({ configLoader: 'runner', build: { copyPublicDir: false } });
for (const entry of fs.readdirSync('public')) {
  if (!generated.has(entry)) fs.cpSync(path.join('public', entry), path.join('dist', entry), { recursive: true });
}
// Vite's module runner executes the same TSX components used in the client.
// No listening server or browser globals are needed for static rendering.
const renderer = await createServer({
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, include: [] },
});
try {
  await renderer.ssrLoadModule('/scripts/generate-seo-files.ts');
  await renderer.ssrLoadModule('/scripts/verify-built-site.ts');
} finally {
  await renderer.close();
}

// Bundle server entry for production node dist/server.cjs
await esbuild({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: 'dist/server.cjs',
});
console.log('Production server bundle generated at dist/server.cjs');

