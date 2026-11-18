// Builds the static site into dist/ (what Vercel serves):
//   art-buildings.js, art-towncenters.js  generated from docs/concepts/ and minified
//   game.js                                the game, bundled with three.js
//   index.html, style.css                  copied from public/
// `node build.mjs --serve` also serves dist/ on http://localhost:5173 and rebuilds on request.
import { build, transform } from 'esbuild';
import { mkdirSync, rmSync, writeFileSync, readdirSync, copyFileSync, statSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
import { generateArt } from './tools/gen-art.mjs';
import { generateBank } from './tools/gen-bank.mjs';

const OUT = 'dist';
const BUDGET_KB = 2000; // everything a player downloads, before gzip

export async function buildAll({ quiet = false } = {}) {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  for (const f of readdirSync('public')) copyFileSync(join('public', f), join(OUT, f));
  // A new offline-cache name for every build, so installed apps pick up updates.
  writeFileSync(join(OUT, 'sw.js'), readFileSync(join(OUT, 'sw.js'), 'utf8').replace('__BUILD__', Date.now().toString(36)));
  for (const [name, code] of Object.entries(generateArt())) {
    const min = await transform(code, { minify: true, target: 'es2019', loader: 'js' });
    writeFileSync(join(OUT, name), min.code);
  }
  await build({
    entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020',
    outfile: join(OUT, 'game.js'), sourcemap: false, legalComments: 'none', logLevel: 'warning',
  });
  // The language bank and its pictures: fetched when a match starts, so outside the budget.
  const bank = generateBank(OUT);
  const sizes = readdirSync(OUT).filter(f => statSync(join(OUT, f)).isFile()).map(f => [f, statSync(join(OUT, f)).size]);
  const total = sizes.reduce((s, [, n]) => s + n, 0);
  if (!quiet) {
    for (const [f, n] of sizes) console.log(`  ${f.padEnd(22)} ${(n / 1024).toFixed(0).padStart(5)} KB`);
    console.log(`  ${'total'.padEnd(22)} ${(total / 1024).toFixed(0).padStart(5)} KB`);
    console.log(`  ${'bank + pictures'.padEnd(22)} ${(bank.bytes / 1024).toFixed(0).padStart(5)} KB (${bank.pictures} pictures, loaded per match)`);
  }
  if (total / 1024 > BUDGET_KB) throw new Error(`Build is ${(total / 1024).toFixed(0)} KB, over the ${BUDGET_KB} KB budget.`);
  return total;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' };

async function serve(port = 5173) {
  await buildAll();
  createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/') { path = '/index.html'; try { await buildAll({ quiet: true }); } catch (e) { console.error(e.message); } }
    try {
      const body = readFileSync(join(OUT, path.replace(/^\/+/, '').replace(/\.\.+/g, '')));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404); res.end('Not found'); }
  }).listen(port, () => console.log(`Serving http://localhost:${port}`));
}

if (process.argv.includes('--serve')) serve();
else buildAll().catch(e => { console.error(e.message); process.exit(1); });
