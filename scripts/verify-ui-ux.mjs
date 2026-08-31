import { createServer } from 'vite';
const runner = await createServer({ configFile: false, server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true, include: [] } });
try {
  await runner.ssrLoadModule('/scripts/verify-ui-ux.tsx');
} finally {
  await runner.close();
}
