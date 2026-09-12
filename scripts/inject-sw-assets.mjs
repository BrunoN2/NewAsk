import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist', import.meta.url));
const assetsDir = join(distDir, 'assets');
const swPath = join(distDir, 'sw.js');

function listAssetUrls() {
  const files = readdirSync(assetsDir);
  return files
    .filter((name) => !name.endsWith('.map'))
    .map((name) => JSON.stringify(posix.join('/assets', name)))
    .join(', ');
}

const assets = listAssetUrls();
const swSource = readFileSync(swPath, 'utf8');
const injected = swSource.replace('/* __ASSET_URLS_PLACEHOLDER__ */', assets);
writeFileSync(swPath, injected, 'utf8');

console.log(`Injected ${assets.split(', ').filter(Boolean).length} assets into sw.js`);
