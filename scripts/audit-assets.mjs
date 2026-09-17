import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const missing = new Map();
for (const file of [...walk('src'), ...walk('public/start'), 'index.html']) {
  if (!/\.(jsx?|scss|css|html)$/.test(file)) continue;
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/['"`](\/(?:textures|fonts|sounds|models|videos|start)\/[^'"`\s]+)['"`]/g)) {
    const asset = match[1];
    if (asset.includes('$') || asset.includes('?') || asset.endsWith('/')) continue;
    if (!existsSync('public' + asset)) missing.set(asset, [...(missing.get(asset) || []), file]);
  }
}
console.log(JSON.stringify({ missing: [...missing] }, null, 2));
process.exitCode = missing.size ? 1 : 0;
