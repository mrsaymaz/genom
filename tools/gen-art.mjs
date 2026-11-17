// Generates the classic (non-module) art scripts from the approved concept pages, so the
// game always uses exactly the models shown in docs/concepts/. Each script defines one
// global factory: window.GenomArt.buildings(THREE) and window.GenomArt.townCenters(THREE).
import { readFileSync } from 'node:fs';

const START = 'var T3 = THREE, PI = Math.PI;';

function slice(file, endMarker) {
  const html = readFileSync(file, 'utf8');
  const a = html.indexOf(START);
  const b = html.indexOf(endMarker, a);
  if (a < 0 || b < 0) throw new Error(`Art markers not found in ${file}`);
  return html.slice(a + START.length, b);
}

// Every texture request with the same key and repeat shares one GPU texture.
const TEX_CACHE = `
  var __texCache = {}, __texMake = tex;
  tex = function (key, rx, ry) { var k = key + '|' + (rx || 1) + '|' + (ry || 1); return __texCache[k] || (__texCache[k] = __texMake(key, rx, ry)); };
`;

function wrap(name, code, exportsList) {
  const ret = exportsList.map(n => `${n}: typeof ${n} !== 'undefined' ? ${n} : null`).join(', ');
  return `(function () {
  var G = window.GenomArt = window.GenomArt || {};
  G.${name} = function (THREE) {
    var T3 = THREE, PI = Math.PI;
${code}
${TEX_CACHE}
    return { ${ret} };
  };
})();
`;
}

export function generateArt() {
  const buildings = slice('docs/concepts/celestial-age-buildings.html', '/* ---------- shared renderer, one canvas per card ---------- */');
  const towns = slice('docs/concepts/celestial-town-centers.html', '  var VIEW_H = ');
  return {
    'art-buildings.js': wrap('buildings', buildings, ['B', 'lin', 'TEX', 'DARK', 'NEWB', 'MYTH', 'MYTHB', 'ARC', 'ARCB', 'CELB']),
    'art-towncenters.js': wrap('townCenters', towns, ['B', 'lin', 'TEX', 'SCENES', 'DARKNEW', 'MYTHIC', 'MYTHNEW', 'ARCANE', 'ARCNEW', 'CELEST']),
  };
}
