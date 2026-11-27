import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { loadServerProducts } = require('../api/_bundled_seo.cjs');
const products = loadServerProducts().filter((product) => product.status === 'active' && product.imageUrl);

function dimensions(buffer) {
  if (buffer.length >= 24 && buffer.toString('ascii', 0, 8) === '\\x89PNG\\r\\n\\x1a\\n') return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  if (buffer.length >= 10 && buffer.toString('ascii', 0, 3) === 'GIF') return [buffer.readUInt16LE(6), buffer.readUInt16LE(8)];
  if (buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    if (buffer.toString('ascii', 12, 16) === 'VP8X') return [1 + buffer.readUIntLE(24, 3), 1 + buffer.readUIntLE(27, 3)];
  }
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return [buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5)];
      offset += 2 + length;
    }
  }
  return null;
}

const results = await Promise.all(products.map(async (product) => {
  try {
    const response = await fetch(product.imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return { product, issue: `HTTP ${response.status}` };
    const buffer = Buffer.from(await response.arrayBuffer());
    const size = dimensions(buffer);
    return { product, size, issue: size && (size[0] < 500 || size[1] < 500) ? `below 500x500 (${size[0]}x${size[1]})` : null };
  } catch (error) {
    return { product, issue: error.name || 'fetch failed' };
  }
}));
const issues = results.filter((result) => result.issue);
console.log(`Image audit: ${products.length - issues.length}/${products.length} passed, ${issues.length} need review.`);
for (const result of issues.slice(0, 20)) console.log(`- ${result.issue}: ${result.product.name} -> ${result.product.imageUrl}`);
assert.ok(issues.length <= 5, `Too many image issues: ${issues.length}`);
